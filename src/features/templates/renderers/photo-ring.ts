import { type EditorState } from "@/features/editor/types";
import {
  GRID_RING_HEIGHT,
  GRID_RING_WIDTH,
  generateSpiralPositions,
  gridSlotMarkup,
} from "@/features/templates/lib/svg";

export function buildPhotoRingTemplate(state: EditorState, gap = 1) {
  const width = GRID_RING_WIDTH;
  const height = GRID_RING_HEIGHT;
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

      return gridSlotMarkup({
        href: selectedImages[index]?.src ?? "",
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        size: Math.round(scaledCell * 100) / 100,
        slotId: `photo-ring-slot-${index}`,
        padding: state.padding,
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
