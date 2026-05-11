/**
 * 相册式 PDF 导出
 * 使用 Canvas 2D 绘制图片（保留所有编辑效果），然后绘制到 PDF
 */

import { PDFDocument } from "pdf-lib";
import type { GalleryImage } from "@/features/editor/types";
import type { OnProgress, AlbumExportOptions, Slot } from "./export-types";
import { calcSlots, calcPageRanges, toPdfLibY } from "./grid-layout";
import { rotateBlobByDeg } from "./image-compressor";
import {
  GRID_CONFIG,
  IMAGES_PER_PAGE,
  TIGHT_RULES,
  type PageRule,
} from "./constant";

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
      return { sx: (iw - sw / sc) / 2, sy: 0, sW: sw / sc, sH: ih, dw: sw, dh: sh };
    } else {
      // 图片更高 -> 裁剪上下，水平铺满
      const sc = sw / iw;
      return { sx: 0, sy: (ih - sh / sc) / 2, sW: iw, sH: sh / sc, dw: sw, dh: sh };
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
 * 创建空白的 OffscreenCanvas（用于填满没有图片的 slot）
 * @param slot 槽位
 * @param scaleFactor 放大倍数
 */
function createBlankCanvas(slot: Slot, scaleFactor: number = 2): OffscreenCanvas {
  const canvasW = slot.width * scaleFactor;
  const canvasH = slot.height * scaleFactor;
  const canvas = new OffscreenCanvas(canvasW, canvasH);
  const ctx2d = canvas.getContext("2d")!;

  // 白色背景
  ctx2d.fillStyle = "white";
  ctx2d.fillRect(0, 0, canvasW, canvasH);

  return canvas;
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
  extraRotate: number = 0,
  scaleFactor: number = 2
): OffscreenCanvas {
  const iw = img.width;
  const ih = img.height;
  console.log(padding);
  // 计算实际图片区域尺寸（扣除 padding，与预览保持一致）
  const contentWidth = slot.width - padding * 2;
  const contentHeight = slot.height - padding * 2;
  // 计算图片在 canvas 中的目标尺寸（基于 fitMode）
  const fit = calcFit(iw, ih, contentWidth, contentHeight, ctx.fitMode);

  // Canvas 尺寸按 scaleFactor 放大
  const canvasW = slot.width * scaleFactor;
  const canvasH = slot.height * scaleFactor;
  const canvas = new OffscreenCanvas(canvasW, canvasH);
  const ctx2d = canvas.getContext("2d")!;

  // 清除画布（白色背景）
  ctx2d.fillStyle = "white";
  ctx2d.fillRect(0, 0, canvasW, canvasH);

  // 计算裁剪区域（图片区域，相对于 slot，按 scaleFactor 缩放）
  const imageX = padding * scaleFactor;
  const imageY = padding * scaleFactor;
  const imageW = contentWidth * scaleFactor;
  const imageH = contentHeight * scaleFactor;

  // 计算图片绘制位置
  // cover/fill 模式：图片填满内容区域，从 imageX/imageY 开始绘制
  // contain 模式：需要居中绘制
  let imgDrawX: number;
  let imgDrawY: number;
  if (ctx.fitMode === "contain") {
    imgDrawX = imageX + (imageW - fit.dw * scaleFactor) / 2;
    imgDrawY = imageY + (imageH - fit.dh * scaleFactor) / 2;
  } else {
    // cover/fill: 图片尺寸 >= 内容区域，直接对齐左上角，靠 clip 裁剪
    imgDrawX = imageX;
    imgDrawY = imageY;
  }

  // 变换中心点（图片区域中心）
  const centerX = imageX + imageW / 2;
  const centerY = imageY + imageH / 2;

  // ========== 第 1 层：编辑效果（zoom、flip、offset）==========
  ctx2d.save();

  ctx2d.translate(centerX, centerY);

  // 翻转
  if (ctx.flipX) ctx2d.scale(-1, 1);
  if (ctx.flipY) ctx2d.scale(1, -1);

  // 缩放
  if (ctx.zoom !== 1) {
    ctx2d.scale(ctx.zoom, ctx.zoom);
  }

  // 偏移（转换为像素，按 scaleFactor 缩放）
  const offsetXPx = (ctx.offsetX / 100) * imageW * ctx.zoom;
  const offsetYPx = (ctx.offsetY / 100) * imageH * ctx.zoom;

  // 移回原位置并加上偏移
  ctx2d.translate(-centerX + offsetXPx, -centerY + offsetYPx);
  // 绘制图片（超出图片区域的部分会被 clip 裁剪）
  ctx2d.beginPath();
  ctx2d.rect(imageX, imageY, imageW, imageH);
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

  ctx2d.restore(); // 恢复编辑效果层

  // ========== 第 2 步：应用 TIGHT_RULE 额外旋转（以 slot 中心为旋转中心）==========
  if (extraRotate !== 0) {
    const slotCenterX = canvasW / 2;
    const slotCenterY = canvasH / 2;

    // 创建临时 canvas 保存当前内容
    const tempCanvas = new OffscreenCanvas(canvasW, canvasH);
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(canvas, 0, 0);

    // 清空主 canvas
    ctx2d.fillStyle = "white";
    ctx2d.fillRect(0, 0, canvasW, canvasH);

    // 旋转并绘制
    ctx2d.save();
    ctx2d.translate(slotCenterX, slotCenterY);
    ctx2d.rotate((extraRotate * Math.PI) / 180);
    ctx2d.translate(-slotCenterX, -slotCenterY);
    ctx2d.drawImage(tempCanvas, 0, 0);
    ctx2d.restore();
  }

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
  // TODO: 待添加为opts
  const padding = 0;

  const pageRanges = calcPageRanges(images.length, IMAGES_PER_PAGE);
  const total = images.length;
  let processed = 0;

  for (let pi = 0; pi < pageRanges.length; pi++) {
    const page = pdfDoc.addPage([ps.width, ps.height]);
    const { start } = pageRanges[pi];
    // 获取当前页的规则（如果超出定义范围，使用默认顺序）
    const pageRules = TIGHT_RULES[pi] ?? null;

    for (let si = 0; si < IMAGES_PER_PAGE; si++) {
      const slot = slots[si];
      // 使用当前页规则映射：获取当前 slot 位置对应的图片索引和额外旋转
      const rule: PageRule | undefined = pageRules?.[si];
      const imageIndex = rule ? rule.i : si;
      const extraRotate = rule ? rule.angle : 0;
      const image = images[start + imageIndex];

      // 如果没有图片，绘制空白 slot
      if (!image) {
        try {
          const blankCanvas = createBlankCanvas(slot, scaleFactor);
          const jpegBlob = await blankCanvas.convertToBlob({
            type: "image/jpeg",
            quality: jpegQuality,
          });
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
          const pdfImg = await pdfDoc.embedJpg(jpegBytes);
          const slotY = toPdfLibY(ps.height, slot.y, slot.height);
          page.drawImage(pdfImg, {
            x: slot.x,
            y: slotY,
            width: slot.width,
            height: slot.height,
          });
        } catch (err) {
          console.warn(`[exportAlbumPDF] 绘制空白 slot 失败:`, err);
        }
        continue;
      }

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

        // 3. 应用图片自身的编辑旋转（TIGHT_RULE 的额外旋转在 Canvas 绘制时通过 transform 实现）
        const rotatedBlob = await rotateBlobByDeg(imageBlob, ctx.rotate);

        // 4. 转为 ImageBitmap
        const img = await createImageBitmap(rotatedBlob);

        // 5. 在 Canvas 上绘制（带编辑效果、额外旋转和裁剪，按 scaleFactor 放大）
        const canvas = drawImageToCanvas(
          img,
          slot,
          padding,
          ctx,
          extraRotate,
          scaleFactor
        );
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
