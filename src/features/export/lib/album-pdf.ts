/**
 * 相册式 PDF 导出
 * 使用 pdf-lib 库将多张图片按 4×3 网格布局导出为多页 PDF
 */

import { PDFDocument } from "pdf-lib";
import type { GalleryImage } from "@/features/editor/types";
import type { OnProgress, AlbumExportOptions } from "./export-types";
import {
  calcSlots,
  calcFit,
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
}

// ─────────────────────────────────────────────────────────────────────────────
// 内部工具
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将 Blob 转为 JPEG bytes（如需要则转换格式）
 */
async function blobToJpegBytes(
  blob: Blob,
  quality: number
): Promise<Uint8Array> {
  if (blob.type === "image/jpeg") {
    return new Uint8Array(await blob.arrayBuffer());
  }

  // 其他格式：先用 OffscreenCanvas 转 JPEG
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();

  const jpegBlob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  return new Uint8Array(await jpegBlob.arrayBuffer());
}

/**
 * 从 GalleryImage 获取 Blob
 * 优先使用压缩后的 blobUrl，否则从 src 获取
 */
async function fetchImageBlob(image: GalleryImage): Promise<Blob | null> {
  // 如果有 blobUrl（压缩后的），直接使用
  if ((image as GalleryImage & { blobUrl?: string }).blobUrl) {
    const blobUrl = (image as GalleryImage & { blobUrl: string }).blobUrl;
    const response = await fetch(blobUrl);
    return response.blob();
  }

  // 否则从 src 获取（兼容旧数据）
  if (image.src) {
    const response = await fetch(image.src);
    return response.blob();
  }

  return null;
}

/**
 * 获取图片的导出上下文（旋转角度、适配模式）
 */
function getExportContext(image: GalleryImage): ExportContext {
  return {
    rotate: image.rotate || 0,
    fitMode: image.fitMode || "cover",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 主导出函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将图片列表导出为相册式 PDF 并触发浏览器下载。
 *
 * @param images     GalleryImage 数组
 * @param opts       导出选项
 * @param onProgress 进度回调（progress: 0-1）
 *
 * @returns 生成的 PDF Blob
 *
 * @example
 * const blob = await exportAlbumPDF(selectedImages, {}, (p) => {
 *   console.log(`${Math.round(p.progress * 100)}% - ${p.message}`);
 * });
 */
export async function exportAlbumPDF(
  images: GalleryImage[],
  opts: AlbumExportOptions = {},
  onProgress?: OnProgress
): Promise<Blob> {
  if (!images.length) {
    throw new Error("没有可导出的图片，请先选择图片。");
  }

  const { jpegQuality = 0.88 } = opts;
  const filename =
    opts.filename ?? `album_${new Date().toISOString().slice(0, 10)}.pdf`;

  const report = (progress: number, message: string) =>
    onProgress?.({ progress, message });

  report(0.02, "初始化 PDF…");

  const pdfDoc = await PDFDocument.create();
  const slots = calcSlots(GRID_CONFIG);
  const { pageSize: ps } = GRID_CONFIG;

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
        // 1. 获取图片 Blob
        const imageBlob = await fetchImageBlob(image);
        if (!imageBlob) {
          console.warn(`[exportAlbumPDF] 无法获取图片: ${image.name}`);
          continue;
        }

        // 2. 应用旋转（生成旋转后的 Blob）
        const rotatedBlob = await rotateBlobByDeg(imageBlob, ctx.rotate);

        // 3. 获取旋转后的尺寸
        const rotatedBitmap = await createImageBitmap(rotatedBlob);
        const iw = rotatedBitmap.width;
        const ih = rotatedBitmap.height;

        // 4. 计算裁剪 / 适配参数
        const fit = calcFit(iw, ih, slot.width, slot.height, ctx.fitMode);

        // 5. 裁剪 / 缩放到目标尺寸
        const targetW = Math.round(fit.dw);
        const targetH = Math.round(fit.dh);
        const canvas = new OffscreenCanvas(targetW, targetH);
        canvas
          .getContext("2d")!
          .drawImage(
            rotatedBitmap,
            fit.sx,
            fit.sy,
            fit.sW,
            fit.sH,
            0,
            0,
            targetW,
            targetH
          );
        rotatedBitmap.close();

        // 6. 转为 JPEG bytes
        const intermediateBlob = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: jpegQuality,
        });
        const jpegBytes = await blobToJpegBytes(intermediateBlob, jpegQuality);

        // 7. 嵌入 PDF
        const pdfImg = await pdfDoc.embedJpg(jpegBytes);

        // 8. 绘制到 PDF（注意 pdf-lib Y 轴翻转）
        page.drawImage(pdfImg, {
          x: slot.x,
          y: toPdfLibY(ps.height, slot.y, fit.dh),
          width: fit.dw,
          height: fit.dh,
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
