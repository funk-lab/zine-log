import { Rect } from "fabric";
import { uuid } from "@/features/utils";

export default function createRect(options) {
  const { canvas, ...rest } = options || {};
  const rect = new Rect({
    id: uuid(),
    width: 200,
    height: 200,
    ...rest,
  });

  canvas.viewportCenterObject(rect);
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.requestRenderAll();
  return rect;
}
