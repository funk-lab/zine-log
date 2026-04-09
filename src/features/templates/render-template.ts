import type { EditorState } from "@/features/editor/types";
import {
  ARTBOARD_HEIGHT,
  ARTBOARD_WIDTH,
  GRID_RING_HEIGHT,
  GRID_RING_WIDTH,
} from "@/features/templates/lib/svg";
import { buildPhotoRingTemplate } from "@/features/templates/renderers/photo-ring";

export function currentDimensions(template: EditorState["template"]) {
  return {
    width: GRID_RING_WIDTH,
    height: GRID_RING_HEIGHT,
  };
}

export function renderTemplateSvg(state: EditorState) {
  console.log(state.template);
  switch (state.template) {
    case "tight-ring":
      return buildPhotoRingTemplate(state, 1);
    case "loose-ring":
      return buildPhotoRingTemplate(state, 2);
    default:
      return buildPhotoRingTemplate(state, 1);
  }
}
