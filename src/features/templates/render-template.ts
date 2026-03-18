import type { EditorState } from "@/features/editor/types";
import { getSelectedImages } from "@/features/editor/types";
import {
  ARTBOARD_HEIGHT,
  ARTBOARD_WIDTH,
  GRID_RING_HEIGHT,
  GRID_RING_WIDTH,
} from "@/features/templates/lib/svg";
import { buildEditorialTemplate } from "@/features/templates/renderers/editorial";
import { buildLShapeTemplate } from "@/features/templates/renderers/l-shape";
import { buildPhotoRingTemplate } from "@/features/templates/renderers/photo-ring";
import { buildPosterTemplate } from "@/features/templates/renderers/poster";

export function currentDimensions(template: EditorState["template"]) {
  if (template === "l-style") {
    return {
      width: GRID_RING_WIDTH,
      height: GRID_RING_HEIGHT,
    };
  }

  return {
    width: ARTBOARD_WIDTH,
    height: ARTBOARD_HEIGHT,
  };
}

export function renderTemplateSvg(state: EditorState) {
  const selectedImages = getSelectedImages(state);

  switch (state.template) {
    case "editorial":
      return buildEditorialTemplate(state, selectedImages);
    case "poster":
      return buildPosterTemplate(state, selectedImages);
    case "l-style":
      return buildPhotoRingTemplate(state);
    case "l-shape":
    default:
      return buildLShapeTemplate(state, selectedImages);
  }
}
