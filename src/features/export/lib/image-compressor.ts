import type { CompressOptions, CompressResult, CompressedImage, OnProgress, ProgressInfo } from './export-types';

// 重新导出类型
export type { CompressOptions, CompressResult, CompressedImage, OnProgress, ProgressInfo };

// ─────────────────────────────────────────────────────────────────────────────
// 图片压缩工具
// 使用 OffscreenCanvas + createImageBitmap，在主线程异步执行。
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTS: Required<CompressOptions> = {
  maxDim: 1200,
  maxPixels: 2_000_000,
  quality: 0.85,
};

/**
 * 计算等比缩放后的目标尺寸。
 * 规则：
 *   1. 最长边不超过 maxDim
 *   2. 总像素不超过 maxPixels
 *   3. 宽高对齐偶数（JPEG 编码友好）
 */
export function calcTargetSize(
  origW: number,
  origH: number,
  opts: Required<CompressOptions>,
): { w: number; h: number } {
  let w = origW;
  let h = origH;

  const maxDim = Math.max(w, h);
  if (maxDim > opts.maxDim) {
    const s = opts.maxDim / maxDim;
    w = Math.floor(w * s);
    h = Math.floor(h * s);
  }

  if (w * h > opts.maxPixels) {
    const s = Math.sqrt(opts.maxPixels / (w * h));
    w = Math.floor(w * s);
    h = Math.floor(h * s);
  }

  // 偶数对齐
  w -= w % 2;
  h -= h % 2;

  return { w: Math.max(w, 2), h: Math.max(h, 2) };
}

/**
 * 压缩单张图片文件 → 返回压缩后的 Blob + 尺寸。
 */
export async function compressFile(
  file: File,
  opts: CompressOptions = {},
): Promise<CompressResult> {
  const merged = { ...DEFAULT_OPTS, ...opts };
  const bitmap = await createImageBitmap(file);
  const { w, h } = calcTargetSize(bitmap.width, bitmap.height, merged);

  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: merged.quality });
  return { blob, w, h };
}

/**
 * 批量压缩文件列表 → 返回 CompressedImage[]，带进度回调。
 *
 * @example
 * const items = await compressFiles(files, { maxDim: 1200 }, (p) => setProgress(p.progress));
 */
export async function compressFiles(
  files: File[],
  opts: CompressOptions = {},
  onProgress?: OnProgress,
): Promise<CompressedImage[]> {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'));
  const results: CompressedImage[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    onProgress?.({
      progress: i / imageFiles.length,
      message: `压缩图片 ${i + 1} / ${imageFiles.length}：${file.name}`,
    });

    try {
      const { blob, w, h } = await compressFile(file, opts);
      const blobUrl = URL.createObjectURL(blob);
      results.push({
        id: crypto.randomUUID(),
        file,
        blob,
        blobUrl,
        w,
        h,
        origSize: file.size,
        compSize: blob.size,
      });
    } catch (err) {
      console.warn(`[compressFiles] 跳过 ${file.name}:`, err);
    }
  }

  onProgress?.({ progress: 1, message: '压缩完成 ✅' });
  return results;
}

/**
 * 将 Blob 按角度旋转，返回新 Blob（90° 时宽高互换）。
 * 用于 PDF 导出前对图片应用旋转。
 */
export async function rotateBlobByDeg(blob: Blob, deg: number): Promise<Blob> {
  if (!deg) return blob;

  const bitmap = await createImageBitmap(blob);
  const swap = deg === 90 || deg === 270;
  const nw = swap ? bitmap.height : bitmap.width;
  const nh = swap ? bitmap.width : bitmap.height;

  const canvas = new OffscreenCanvas(nw, nh);
  const ctx = canvas.getContext('2d')!;
  ctx.translate(nw / 2, nh / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();

  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
}

/**
 * 释放 CompressedImage 的 Object URL，防止内存泄漏。
 * 在从列表移除或组件卸载时调用。
 */
export function revokeImageUrl(item: { blobUrl: string }): void {
  URL.revokeObjectURL(item.blobUrl);
}

/**
 * 批量释放 Object URL
 */
export function revokeImageUrls(items: { blobUrl: string }[]): void {
  items.forEach(revokeImageUrl);
}
