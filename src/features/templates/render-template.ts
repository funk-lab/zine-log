import type { EditorState } from "@/features/collage-editor/types";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/features/collage-editor/types";
import { buildPhotoRingTemplate } from "@/features/templates/renderers/photo-ring";

export function currentDimensions() {
  return {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
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
