import type { EditorState, GalleryImage } from "@/features/editor/types";
import { base64ToBytes, createPdfBytes } from "@/features/export/lib/pdf";
import { rasterizeSvgToCanvas } from "@/features/rendering/lib/rasterize-svg";
import {
  currentDimensions,
  renderTemplateSvg,
} from "@/features/templates/render-template";
import { exportAlbumPDF } from "./album-pdf";
import type { AlbumExportOptions, OnProgress } from "./export-types";

const EXPORT_SCALE = 4;
const MAX_EXPORT_PIXELS = 32000000;
/** A4 横向 (pt)：1pt ≈ 0.353mm，297mm × 210mm */
const PAGE_SIZE = { width: 842, height: 595 };
function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(state: EditorState) {
  const blob = new Blob([renderTemplateSvg(state)], {
    type: "image/svg+xml;charset=utf-8",
  });

  downloadBlob("zine-log-design.svg", blob);
}

export async function downloadPng(state: EditorState) {
  const { width, height } = currentDimensions();
  const canvas = await rasterizeSvgToCanvas(
    renderTemplateSvg(state),
    width,
    height,
    {
      scale: EXPORT_SCALE,
      maxPixels: MAX_EXPORT_PIXELS,
      backgroundColor: "#ffffff",
    }
  );
  const dataUrl = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = "zine-log-design.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadPdf(state: EditorState) {
  const { width, height } = currentDimensions();
  const canvas = await rasterizeSvgToCanvas(
    renderTemplateSvg(state),
    width,
    height,
    {
      scale: EXPORT_SCALE,
      maxPixels: MAX_EXPORT_PIXELS,
      backgroundColor: "#ffffff",
    }
  );
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 1);
  const [, base64] = jpegDataUrl.split(",");
  const imageBytes = base64ToBytes(base64);
  const pageWidth = width > height ? 841.89 : 595.28;
  const pageHeight = width > height ? 595.28 : 841.89;
  const margin = 24;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const renderWidth = width * scale;
  const renderHeight = height * scale;
  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = (pageHeight - renderHeight) / 2;
  const pdfBytes = createPdfBytes({
    imageBytes,
    imageWidth: canvas.width,
    imageHeight: canvas.height,
    pageWidth,
    pageHeight,
    drawWidth: renderWidth,
    drawHeight: renderHeight,
    offsetX,
    offsetY,
  });

  downloadBlob(
    "zine-log-design.pdf",
    new Blob([pdfBytes], { type: "application/pdf" })
  );
}

/**
 * 导出相册式 PDF（多页网格布局）
 * 每页 4×3 = 12 张图片，A4 横向
 * 
 * @param images 要导出的图片列表
 * @param opts 导出选项
 * @param onProgress 进度回调
 * 
 * @example
 * await downloadAlbumPDF(state.selected, { filename: 'my-album.pdf' });
 */
export async function downloadAlbumPDF(
  images: GalleryImage[],
  opts: AlbumExportOptions = {},
  onProgress?: OnProgress
): Promise<Blob> {
  if (!images.length) {
    throw new Error("没有可导出的图片");
  }

  return exportAlbumPDF(images, opts, onProgress);
}
