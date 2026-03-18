import { getSelectedImages, type EditorState } from "@/features/editor/types";
import {
  GRID_RING_HEIGHT,
  GRID_RING_WIDTH,
  generateSpiralPositions,
  gridSlotMarkup,
  rgba,
} from "@/features/templates/lib/svg";

export function buildPhotoRingTemplate(state: EditorState) {
  const width = GRID_RING_WIDTH;
  const height = GRID_RING_HEIGHT;
  const frameInset = 28;
  const baseCell = 80;
  const accentStroke = rgba(state.accent, 0.38);
  const selectedImages = getSelectedImages(state);

  if (!selectedImages.length) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="照片环设计">
        <defs>
          <linearGradient id="photo-ring-empty" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f1f5f9" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#photo-ring-empty)" />
        <rect x="${frameInset}" y="${frameInset}" width="${width - frameInset * 2}" height="${height - frameInset * 2}" fill="none" stroke="${accentStroke}" stroke-width="2" />
        <text x="${width / 2}" y="${height / 2 - 8}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="58" font-weight="700" fill="#0f172a">Photo Ring</text>
        <text x="${width / 2}" y="${height / 2 + 36}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="22" fill="#64748b">从左侧图库选择照片后，这里会生成回环排布。</text>
      </svg>
    `;
  }

  const spiralPositions = generateSpiralPositions(selectedImages.length, 1);
  const gridXs = spiralPositions.map(([gridX]) => gridX);
  const gridYs = spiralPositions.map(([, gridY]) => gridY);
  const minGridX = Math.min(...gridXs, 0);
  const maxGridX = Math.max(...gridXs, 0);
  const minGridY = Math.min(...gridYs, 0);
  const maxGridY = Math.max(...gridYs, 0);
  const spanCols = maxGridX - minGridX + 1;
  const spanRows = maxGridY - minGridY + 1;
  const fitCell = Math.min(
    (width - frameInset * 2) / spanCols,
    (height - frameInset * 2) / spanRows,
  );
  const scaledCell = Math.min(fitCell, baseCell * state.ringScale);
  const offsetX = (width - spanCols * scaledCell) / 2;
  const offsetY = (height - spanRows * scaledCell) / 2;
  const slotMarkup = spiralPositions
    .map(([gridX, gridY], index) => {
      const x = offsetX + (gridX - minGridX) * scaledCell;
      const y = offsetY + (gridY - minGridY) * scaledCell;

      return gridSlotMarkup({
        href: selectedImages[index]?.src ?? "",
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        size: Math.round(scaledCell * 100) / 100,
        slotId: `photo-ring-slot-${index}`,
      });
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="照片环设计">
      <defs>
        <linearGradient id="photo-ring-paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#photo-ring-paper)" />
      <rect x="${frameInset}" y="${frameInset}" width="${width - frameInset * 2}" height="${height - frameInset * 2}" fill="none" stroke="${accentStroke}" stroke-width="2" />
      ${slotMarkup}
    </svg>
  `;
}
