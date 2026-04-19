import { type EditorState } from "@/features/editor/types";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from "@/features/editor/types";
import {
  generateSpiralPositions,
  gridSlotMarkup,
} from "@/features/templates/lib/svg";

export function buildPhotoRingTemplate(state: EditorState, gap = 1) {
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;
  const baseCell = 80;
  const selectedImages = state.selected;

  if (!selectedImages.length) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="螺纹设计">
       
      </svg>
    `;
  }

  const spiralPositions = generateSpiralPositions(selectedImages.length, gap);
  const gridXs = spiralPositions.map(([gridX]) => gridX);
  const gridYs = spiralPositions.map(([, gridY]) => gridY);
  const minGridX = Math.min(...gridXs, 0);
  const maxGridX = Math.max(...gridXs, 0);
  const minGridY = Math.min(...gridYs, 0);
  const maxGridY = Math.max(...gridYs, 0);
  const spanCols = maxGridX - minGridX + 1;
  const spanRows = maxGridY - minGridY + 1;
  const fitCell = Math.min((width - 48) / spanCols, (height - 48) / spanRows);
  const scaledCell = Math.min(fitCell, baseCell * state.ringScale);
  const offsetX = (width - spanCols * scaledCell) / 2;
  const offsetY = (height - spanRows * scaledCell) / 2;
  const slotMarkup = spiralPositions
    .map(([gridX, gridY], index) => {
      const x = offsetX + (gridX - minGridX) * scaledCell;
      const y = offsetY + (gridY - minGridY) * scaledCell;

      const image = selectedImages[index];
      // 优先使用 blobUrl，兼容旧数据使用 src
      const imageUrl = image?.blobUrl || image?.src || "";
      return gridSlotMarkup({
        href: imageUrl,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        size: Math.round(scaledCell * 100) / 100,
        slotId: `photo-ring-slot-${index}`,
        edit: image,
      });
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="螺纹设计">
      <rect width="${width}" height="${height}" fill="${state.accent}" />
      ${slotMarkup}
    </svg>
  `;
}
