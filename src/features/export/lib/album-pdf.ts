/**
 * 相册式 PDF 导出
 * 使用 Canvas 2D 绘制图片（保留所有编辑效果），然后绘制到 PDF
 */

import {
  PDFDocument,
} from "pdf-lib";
import type { GalleryImage } from "@/features/editor/types";
import type { OnProgress, AlbumExportOptions, Slot } from "./export-types";
import {
  calcSlots,
  calcPageRanges,
  toPdfLibY,
  GRID_CONFIG,
  IMAGES_PER_PAGE,
} from "./grid-layout";
import { rotateBlobByDeg } from "./image-compressor";

// 重新导出类型供外部使用
export type { AlbumExportOptions, OnProgress };

// ─────────────────────────────────────────────────────────────────────────────
// 导出选项
// ─────────────────────────────────────────────────────────────────────────────

interface ExportContext {
  rotate: number;
  fitMode: "cover" | "contain" | "fill";
  zoom: number;
  flipX: boolean;
  flipY: boolean;
  offsetX: number;
  offsetY: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 内部工具
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取图片的导出上下文
 */
function getExportContext(image: GalleryImage): ExportContext {
  return {
    rotate: image.rotate || 0,
    fitMode: image.fitMode || "cover",
    zoom: image.zoom ?? 1,
    flipX: image.flipX || false,
    flipY: image.flipY || false,
    offsetX: image.offsetX || 0,
    offsetY: image.offsetY || 0,
  };
}

/**
 * 计算 fitMode 适配参数（与 grid-layout.ts 的 calcFit 一致）
 */
function calcFit(
  iw: number,
  ih: number,
  sw: number,
  sh: number,
  mode: "cover" | "contain" | "fill"
) {
  const ir = iw / ih;
  const sr = sw / sh;

  if (mode === "cover") {
    if (ir > sr) {
      // 图片更宽 -> 裁剪左右，垂直铺满
      const sc = sh / ih;
      const dw = iw * sc;
      return { sx: (iw - sw / sc) / 2, sy: 0, sW: sw / sc, sH: ih, dw, dh: sh };
    } else {
      // 图片更高 -> 裁剪上下，水平铺满
      const sc = sw / iw;
      const dh = ih * sc;
      return { sx: 0, sy: (ih - sh / sc) / 2, sW: iw, sH: sh / sc, dw: sw, dh };
    }
  }

  if (mode === "contain") {
    if (ir > sr) {
      const dw = sw;
      const dh = sw / ir;
      return { sx: 0, sy: 0, sW: iw, sH: ih, dw, dh };
    } else {
      const dh = sh;
      const dw = sh * ir;
      return { sx: 0, sy: 0, sW: iw, sH: ih, dw, dh };
    }
  }

  // fill: 拉伸填满
  return { sx: 0, sy: 0, sW: iw, sH: ih, dw: sw, dh: sh };
}

/**
 * 在 Canvas 上绘制带编辑效果的图片
 * @param img 图片
 * @param slot 槽位
 * @param padding 内边距
 * @param ctx 编辑上下文
 * @param scaleFactor 放大倍数，用于提高导出清晰度
 */
function drawImageToCanvas(
  img: ImageBitmap,
  slot: Slot,
  padding: number,
  ctx: ExportContext,
  scaleFactor: number = 2
): OffscreenCanvas {
  const iw = img.width;
  const ih = img.height;

  // 计算图片在 canvas 中的目标尺寸（基于 fitMode）
  const fit = calcFit(iw, ih, slot.width, slot.height, ctx.fitMode);

  // Canvas 尺寸按 scaleFactor 放大
  const canvasW = slot.width * scaleFactor;
  const canvasH = slot.height * scaleFactor;
  const canvas = new OffscreenCanvas(canvasW, canvasH);
  const ctx2d = canvas.getContext("2d")!;

  // 清除画布（白色背景）
  ctx2d.fillStyle = "white";
  ctx2d.fillRect(0, 0, canvasW, canvasH);

  // 保存状态
  ctx2d.save();

  // 计算裁剪区域（图片区域，相对于 slot，按 scaleFactor 缩放）
  const imageX = padding * scaleFactor;
  const imageY = padding * scaleFactor;
  const imageSize = (slot.width - padding * 2) * scaleFactor;

  // 计算图片居中位置（按 scaleFactor 缩放）
  const imgDrawX = imageX + (imageSize - fit.dw * scaleFactor) / 2;
  const imgDrawY = imageY + (imageSize - fit.dh * scaleFactor) / 2;

  // 变换中心点（图片区域中心）
  const centerX = imageX + imageSize / 2;
  const centerY = imageY + imageSize / 2;

  ctx2d.translate(centerX, centerY);

  // 翻转
  if (ctx.flipX) ctx2d.scale(-1, 1);
  if (ctx.flipY) ctx2d.scale(1, -1);

  // 缩放
  if (ctx.zoom !== 1) {
    ctx2d.scale(ctx.zoom, ctx.zoom);
  }

  // 偏移（转换为像素，按 scaleFactor 缩放）
  const offsetXPx = (ctx.offsetX / 100) * imageSize * ctx.zoom;
  const offsetYPx = (ctx.offsetY / 100) * imageSize * ctx.zoom;

  // 移回原位置并加上偏移
  ctx2d.translate(-centerX + offsetXPx, -centerY + offsetYPx);

  // 绘制图片（超出 imageX/imageY/imageSize/imageSize 的部分会被 clip 裁剪）
  ctx2d.beginPath();
  ctx2d.rect(imageX, imageY, imageSize, imageSize);
  ctx2d.clip();

  // 绘制图片（所有尺寸和位置按 scaleFactor 缩放）
  ctx2d.drawImage(
    img,
    fit.sx,
    fit.sy,
    fit.sW,
    fit.sH,
    imgDrawX,
    imgDrawY,
    fit.dw * scaleFactor,
    fit.dh * scaleFactor
  );

  ctx2d.restore();

  return canvas;
}

// ─────────────────────────────────────────────────────────────────────────────
// 主导出函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将图片列表导出为相册式 PDF 并触发浏览器下载。
 */
export async function exportAlbumPDF(
  images: GalleryImage[],
  opts: AlbumExportOptions = {},
  onProgress?: OnProgress
): Promise<Blob> {
  if (!images.length) {
    throw new Error("没有可导出的图片，请先选择图片。");
  }

  const { jpegQuality = 0.88, scaleFactor = 2 } = opts;
  const filename =
    opts.filename ?? `album_${new Date().toISOString().slice(0, 10)}.pdf`;

  const report = (progress: number, message: string) =>
    onProgress?.({ progress, message });

  report(0.02, "初始化 PDF…");

  const pdfDoc = await PDFDocument.create();
  const slots = calcSlots(GRID_CONFIG);
  const { pageSize: ps } = GRID_CONFIG;
  const padding = 2; // 与 preview 保持一致

  const pageRanges = calcPageRanges(images.length, IMAGES_PER_PAGE);
  const total = images.length;
  let processed = 0;

  for (let pi = 0; pi < pageRanges.length; pi++) {
    const page = pdfDoc.addPage([ps.width, ps.height]);
    const { start, end } = pageRanges[pi];

    for (let si = 0; si < end - start; si++) {
      const image = images[start + si];
      const slot = slots[si];
      const ctx = getExportContext(image);

      report(
        0.05 + 0.9 * (processed / total),
        `导出图片 ${processed + 1} / ${total}（第 ${pi + 1} 页）`
      );

      try {
        // 1. 获取图片 URL
        const imageUrl = image.blobUrl ?? image.src;
        if (!imageUrl) {
          console.warn(`[exportAlbumPDF] 无法获取图片 URL: ${image.name}`);
          continue;
        }

        // 2. 获取图片 Blob（复用 blobUrl 避免重复 fetch）
        let imageBlob: Blob;
        if (image.blobUrl) {
          const response = await fetch(image.blobUrl);
          imageBlob = await response.blob();
        } else {
          const response = await fetch(imageUrl);
          imageBlob = await response.blob();
        }

        // 3. 应用旋转
        const rotatedBlob = await rotateBlobByDeg(imageBlob, ctx.rotate);

        // 4. 转为 ImageBitmap
        const img = await createImageBitmap(rotatedBlob);

        // 5. 在 Canvas 上绘制（带编辑效果和裁剪，按 scaleFactor 放大）
        const canvas = drawImageToCanvas(img, slot, padding, ctx, scaleFactor);
        img.close();

        // 6. 转为 JPEG
        const jpegBlob = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: jpegQuality,
        });
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

        // 7. 嵌入 PDF
        const pdfImg = await pdfDoc.embedJpg(jpegBytes);

        // 8. 绘制到 PDF
        const slotY = toPdfLibY(ps.height, slot.y, slot.height);
        page.drawImage(pdfImg, {
          x: slot.x,
          y: slotY,
          width: slot.width,
          height: slot.height,
        });
      } catch (err) {
        console.warn(`[exportAlbumPDF] 处理图片失败: ${image.name}`, err);
      }

      processed++;
    }
  }

  report(0.97, "生成 PDF 文件…");

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  // 触发浏览器下载
  downloadBlob(blob, filename);

  report(1, `导出完成！共 ${pageRanges.length} 页，${total} 张图片`);

  return blob;
}

// ─────────────────────────────────────────────────────────────────────────────
// 辅助：触发下载
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 触发浏览器文件下载。
 * 仅在浏览器环境有效（SSR 环境下会跳过）。
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
