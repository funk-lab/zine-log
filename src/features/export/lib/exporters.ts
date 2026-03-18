import type { EditorState } from "@/features/editor/types";
import { base64ToBytes, createPdfBytes } from "@/features/export/lib/pdf";
import { currentDimensions, renderTemplateSvg } from "@/features/templates/render-template";

const EXPORT_SCALE = 4;
const MAX_EXPORT_PIXELS = 32000000;

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

async function renderCanvasFromSvg(svgMarkup: string, width: number, height: number) {
  const safeScale = Math.min(EXPORT_SCALE, Math.sqrt(MAX_EXPORT_PIXELS / (width * height)));
  const exportScale = Math.max(1, safeScale);
  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("SVG render failed"));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * exportScale);
  canvas.height = Math.round(height * exportScale);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  return canvas;
}

export function downloadSvg(state: EditorState) {
  const blob = new Blob([renderTemplateSvg(state)], {
    type: "image/svg+xml;charset=utf-8",
  });

  downloadBlob("zine-log-design.svg", blob);
}

export async function downloadPng(state: EditorState) {
  const { width, height } = currentDimensions(state.template);
  const canvas = await renderCanvasFromSvg(renderTemplateSvg(state), width, height);
  const dataUrl = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = "zine-log-design.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadPdf(state: EditorState) {
  const { width, height } = currentDimensions(state.template);
  const canvas = await renderCanvasFromSvg(renderTemplateSvg(state), width, height);
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

  downloadBlob("zine-log-design.pdf", new Blob([pdfBytes], { type: "application/pdf" }));
}
