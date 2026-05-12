import { Polygon } from "fabric";
import { uuid } from "@/features/utils";

export default function createShape(ShapeClass, options) {
  const { points, canvas, ...rest } = options || {};
  let object;
  if (ShapeClass === Polygon) {
    object = new Polygon(points, {
      id: uuid(),
      ...rest,
    });
  } else {
    object = new ShapeClass({
      id: uuid(),
      ...rest,
    });
  }

  canvas.viewportCenterObject(object);
  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
  return object;
}
