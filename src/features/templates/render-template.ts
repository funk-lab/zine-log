import type { EditorState } from "@/features/editor/types";
import {
  GRID_RING_HEIGHT,
  GRID_RING_WIDTH,
} from "@/features/templates/lib/svg";
import { buildPhotoRingTemplate } from "@/features/templates/renderers/photo-ring";

export function currentDimensions() {
  return {
    width: GRID_RING_WIDTH,
    height: GRID_RING_HEIGHT,
  };
}

export function renderTemplateSvg(state: EditorState) {
  switch (state.template) {
    case "tight-ring":
      return buildPhotoRingTemplate(state, 1);
    case "loose-ring":
      return buildPhotoRingTemplate(state, 2);
    default:
      return buildPhotoRingTemplate(state, 1);
  }
}
