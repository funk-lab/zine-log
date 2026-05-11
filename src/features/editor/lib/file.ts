import type { GalleryImage } from "@/features/editor/types";
import { compressFile } from "@/features/export/lib/image-compressor";
import type { CompressOptions } from "@/features/export/lib/export-types";
import { generateImageId } from "@/features/editor/types";

// TODO: 测试压缩配置开关
const ENABLE_COMPRESSION = true; // 🔧 设为 true 启用压缩，false 关闭压缩

// 默认压缩参数：适合 A4 纸放 12 张图的相册导出
const DEFAULT_COMPRESS_OPTS: CompressOptions = {
  maxDim: 1200, // 最大边长 1200px
  maxPixels: 2_000_000, // 最大像素数 200万
  quality: 0.85, // JPEG 质量 85%（平衡质量与大小）
};

/**
 * 将文件转为 Data URL（旧方法，保留兼容）
 * @deprecated 请使用 compressFile 替代
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unexpected file result"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * 处理单个文件：压缩并转换为 GalleryImage
 */
async function fileToGalleryImage(
  file: File,
  nextId: number,
  opts: CompressOptions = DEFAULT_COMPRESS_OPTS
): Promise<GalleryImage | null> {
  // 只处理图片文件
  if (!file.type.startsWith("image/")) {
    console.warn(`[fileToGalleryImage] 跳过非图片文件: ${file.name}`);
    return null;
  }

  try {
    // 根据配置决定是否压缩
    let blob: Blob;
    let w: number;
    let h: number;

    if (ENABLE_COMPRESSION) {
      // 压缩模式
      const result = await compressFile(file, opts);
      blob = result.blob;
      w = result.w;
      h = result.h;
    } else {
      // 不压缩：直接使用原文件
      blob = file;
      // 获取图片原始尺寸
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      URL.revokeObjectURL(url);
      w = img.naturalWidth;
      h = img.naturalHeight;
    }

    const blobUrl = URL.createObjectURL(blob);

    // 同时生成 data URL 用于兼容旧逻辑
    const dataUrl = await fileToDataUrl(file);

    return {
      id: generateImageId(nextId),
      src: dataUrl, // ⚠️ 保留兼容，后续移除
      blobUrl, // ✅ 新的 Blob URL
      name: file.name,
      uploadedAt: Date.now(),
      mimeType: file.type,
      size: file.size, // 原始大小
      compWidth: w, // 压缩后宽度（不压缩时为原始尺寸）
      compHeight: h, // 压缩后高度（不压缩时为原始尺寸）
      compSize: blob.size, // 压缩后大小（不压缩时为原始大小）
      // 默认编辑状态
      rotate: 0,
      fitMode: "cover",
      zoom: 1,
      flipX: false,
      flipY: false,
      offsetX: 0,
      offsetY: 0,
      brightness: 0,
      contrast: 0,
      saturate: 0,
      grayscale: false,
      borderRadius: 0,
    };
  } catch (err) {
    console.error(`[fileToGalleryImage] 处理失败: ${file.name}`, err);
    return null;
  }
}

/**
 * 将文件列表转换为 GalleryImage 数组
 * 上传时自动压缩图片，生成 Blob URL
 *
 * @param files 文件列表
 * @param startId 起始 ID 编号
 * @returns GalleryImage 数组（已压缩）
 */
export async function filesToGalleryImages(
  files: File[],
  startId: number = 1
): Promise<GalleryImage[]> {
  const images: GalleryImage[] = [];
  let currentId = startId;

  for (const file of files) {
    const image = await fileToGalleryImage(
      file,
      currentId,
      DEFAULT_COMPRESS_OPTS
    );
    if (image) {
      images.push(image);
      currentId++;
    }
  }

  console.log(
    `[filesToGalleryImages] 处理完成: ${images.length}/${files.length} 张图片`
  );
  return images;
}

/**
 * 释放 GalleryImage 的 Blob URL，防止内存泄漏
 * 在图片从列表移除时调用
 */
export function revokeGalleryImage(image: GalleryImage): void {
  if (image.blobUrl) {
    URL.revokeObjectURL(image.blobUrl);
  }
}

/**
 * 批量释放 GalleryImage 的 Blob URL
 */
export function revokeGalleryImages(images: GalleryImage[]): void {
  images.forEach(revokeGalleryImage);
}
