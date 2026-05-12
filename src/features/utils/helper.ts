import * as fabric from "fabric";
import { FABRITOR_CUSTOM_PROPS } from "./constants";
import { createTextbox } from "@/features/editor/objects/textbox";
import { getSystemClipboard } from "./index";
import { createFImage } from "@/features/editor/objects/image";
import { handleMouseOutCorner } from "@/features/editor/controller";
import type Editor from "@/features/editor";

// controlsUtils is defined in src/types/fabric.d.ts
const controlsUtils = fabric.controlsUtils;

interface Size {
  width: number;
  height: number;
}

export const calcCanvasZoomLevel = (containerSize: Size, sketchSize: Size) => {
  if (
    sketchSize.width < containerSize.width &&
    sketchSize.height <= containerSize.height
  ) {
    return 1;
  }

  let level = 1;
  if (
    containerSize.width / containerSize.height <
    sketchSize.width / sketchSize.height
  ) {
    level = containerSize.width / sketchSize.width;
  } else {
    level = containerSize.height / sketchSize.height;
  }

  level = Number(level.toFixed(2));
  return level;
};

let _clipboard: fabric.Object | undefined;

export const copyObject = async (
  canvas: fabric.Canvas,
  target: fabric.Object | null
) => {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  if (!target) {
    target = canvas.getActiveObject() || null;
  }
  if (!target) return false;

  // 清空系统剪贴板
  navigator.clipboard.writeText("");
  // fabric v6: clone 返回 Promise
  const cloned = await target.clone(FABRITOR_CUSTOM_PROPS);
  _clipboard = cloned;
  return true;
};

export const pasteObject = async (canvas: fabric.Canvas) => {
  // 先尝试读取系统剪贴板
  try {
    const clipboard = (await getSystemClipboard()) as any;
    if (clipboard?.result) {
      if (clipboard.type === "text") {
        createTextbox({ text: clipboard.result, canvas });
      } else if (clipboard.type === "image") {
        createFImage({ imageSource: clipboard.result, canvas });
      }
      return;
    }
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }

  if (!_clipboard) return;

  // clone again, so you can do multiple copies.
  // fabric v6: clone 返回 Promise
  const cloned = await _clipboard.clone(FABRITOR_CUSTOM_PROPS);
  canvas.discardActiveObject();
  cloned.set({
    left: (cloned.left || 0) + 50,
    top: (cloned.top || 0) + 50,
    evented: true,
  });

  if (
    cloned.type === "f-line" ||
    cloned.type === "f-arrow" ||
    cloned.type === "f-tri-arrow"
  ) {
    handleFLinePointsWhenMoving({
      target: cloned,
      transform: {
        original: {
          left: (cloned.left || 0) - 50,
          top: (cloned.top || 0) - 50,
        },
      },
    });
  }

  if (cloned.type === "activeSelection") {
    (cloned as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
      canvas.add(obj);
    });
    // this should solve the unselectability
    cloned.setCoords();
  } else {
    canvas.add(cloned);
  }

  canvas.setActiveObject(cloned);
  canvas.requestRenderAll();
  // @ts-ignore - 自定义事件
  canvas.fire("fabritor:clone", { target: cloned });
};

export const removeObject = (
  target: fabric.Object | null,
  canvas: fabric.Canvas
) => {
  if (!target) {
    target = canvas.getActiveObject() || null;
  }
  if (!target) return false;
  if (target.type === "activeSelection") {
    (target as fabric.ActiveSelection).getObjects().forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
  } else {
    canvas.remove(target);
  }
  handleMouseOutCorner(target);
  canvas.requestRenderAll();
  // @ts-ignore - 自定义事件
  canvas.fire("fabritor:del", { target: null });
  return true;
};

export const groupSelection = (
  canvas: fabric.Canvas,
  target: fabric.Object | null
) => {
  if (!target) {
    target = canvas.getActiveObject() || null;
  }
  if (!target || target.type !== "activeSelection") {
    return;
  }

  canvas.getActiveObjects().forEach((o) => {
    if (o.type === "f-image") {
      (o as any).img.clipPath = null;
    }
  });
  // 1. 先从画布移除原对象
  canvas.remove(target);

  // 2. 创建包含该对象的 Group
  const group = new fabric.Group([target], {
    left: target.left,
    top: target.top,
    originX: target.originX,
    originY: target.originY,
  });

  // 3. 将 Group 添加到画布
  target.parent?.add(group);
  canvas.renderAll();
  // canvas.requestRenderAll();
  // @ts-ignore - 自定义事件
  canvas.fire("fabritor:group");
};

export const ungroup = (
  canvas: fabric.Canvas,
  target: fabric.Object | null
) => {
  if (!target) {
    target = canvas.getActiveObject() || null;
  }
  if (!target || target.type !== "group") {
    return;
  }
  const group = target as fabric.Group;
  group.getObjects().forEach((obj) => {
    obj.set({
      lockMovementX: false,
      lockMovementY: false,
      hasControls: true,
      selectable: true,
    });
  });
  const activeObject = new fabric.ActiveSelection(group.getObjects(), {
    canvas,
  });
  group.parent?.add(activeObject);
  canvas.remove(group);
  canvas.requestRenderAll();
  // @ts-ignore - 自定义事件
  canvas.fire("fabritor:ungroup");
};

export const changeLayerLevel = (
  level: string,
  editor: Editor,
  target: fabric.Object | null
) => {
  if (!target) {
    target = editor.canvas.getActiveObject() || null;
  }
  if (!target || target.type === "activeSelection") {
    return;
  }
  switch (level) {
    case "layer-up":
      editor.canvas.bringObjectForward(target);
      break;
    case "layer-top":
      editor.canvas.bringObjectToFront(target);
      break;
    case "layer-down":
      editor.canvas.sendObjectBackwards(target);
      break;
    case "layer-bottom":
      editor.canvas.sendObjectToBack(target);
      break;
    default:
      break;
  }
  editor.canvas.sendObjectToBack(editor.sketch);
  editor.canvas.requestRenderAll();
  editor.fireCustomModifiedEvent();
};

/**
 * Transforms a point described by x and y in a distance from the top left corner of the object
 * bounding box.
 * @param {Object} transform
 * @param {String} originX
 * @param {String} originY
 * @param {number} x
 * @param {number} y
 * @return {Fabric.Point} the normalized point
 */
// export const getLocalPoint = (
//   transform: fabric.Transform,
//   originX: string,
//   originY: string,
//   x: number,
//   y: number
// ) => {
//   const target = transform.target as fabric.FabricObject;
//   const corner = transform.corner as string;
//   const control = target.controls?.[corner];
//   const zoom = target.canvas?.getZoom() || 1;
//   const padding = (target.padding || 0) / zoom;
//   const localPoint = target.toLocalPoint(new Point(x, y), originX, originY);
//   if (localPoint.x >= padding) {
//     localPoint.x -= padding;
//   }
//   if (localPoint.x <= -padding) {
//     localPoint.x += padding;
//   }
//   if (localPoint.y >= padding) {
//     localPoint.y -= padding;
//   }
//   if (localPoint.y <= padding) {
//     localPoint.y += padding;
//   }
//   localPoint.x -= control?.offsetX || 0;
//   localPoint.y -= control?.offsetY || 0;
//   return localPoint;
// };

function isTransformCentered(transform: fabric.Transform) {
  return (
    (transform as any).originX === "center" &&
    (transform as any).originY === "center"
  );
}

const _changeHeight = (
  _eventData: MouseEvent,
  transform: fabric.Transform,
  x: number,
  y: number
) => {
  const target = transform.target,
    localPoint = fabric.controlsUtils.getLocalPoint(
      transform,
      transform.originX,
      transform.originY,
      x,
      y
    ),
    strokePadding =
      target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
    multiplier = isTransformCentered(transform) ? 2 : 1,
    oldHeight = target.height,
    newHeight =
      Math.abs((localPoint.y * multiplier) / target.scaleY) - strokePadding;
  target.set("height", Math.max(newHeight, 0));
  return oldHeight !== newHeight;
};

// @ts-ignore - controlsUtils 类型定义不完整，但运行时存在
export const changeHeight =
  controlsUtils?.wrapWithFireEvent?.(
    "resizing",
    // @ts-ignore
    controlsUtils?.wrapWithFixedAnchor?.(_changeHeight)
  ) || _changeHeight;

export const handleFLinePointsWhenMoving = (opt: {
  target: fabric.Object;
  transform: { original: { left: number; top: number } };
  action?: string;
}) => {
  const { target, transform, action } = opt;
  if (action === "line-points-change") return;
  const { original } = transform;
  const deltaLeft = target.left - original.left;
  const deltaTop = target.top - original.top;
  const lineTarget = target as fabric.Line;
  (target as any).set({
    x1: lineTarget.x1 + deltaLeft,
    y1: lineTarget.y1 + deltaTop,
    x2: lineTarget.x2 + deltaLeft,
    y2: lineTarget.y2 + deltaTop,
  });
};
