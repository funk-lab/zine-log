// cursor css https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor

import * as fabric from "fabric";
import {
  ROTATE_SVG,
  ROTATE_SVG_ACTIVE,
  ROTATE_CURSOR,
  COPY_SVG,
  DEL_SVG,
  COPY_SVG_ACTIVE,
  DEL_SVG_ACTIVE,
} from "@/assets/icon";
import {
  changeHeight,
  copyObject,
  pasteObject,
  removeObject,
} from "@/features/utils/helper";

const ROTATE_IMG = document.createElement("img");
ROTATE_IMG.src = ROTATE_SVG;
const ROTATE_IMG_ACTIVE = document.createElement("img");
ROTATE_IMG_ACTIVE.src = ROTATE_SVG_ACTIVE;

const COPY_IMG = document.createElement("img");
COPY_IMG.src = COPY_SVG;
const COPY_IMG_ACTIVE = document.createElement("img");
COPY_IMG_ACTIVE.src = COPY_SVG_ACTIVE;

const DEL_IMG = document.createElement("img");
DEL_IMG.src = DEL_SVG;
const DEL_IMG_ACTIVE = document.createElement("img");
DEL_IMG_ACTIVE.src = DEL_SVG_ACTIVE;

// 渲染中间调整点图标（上下）
const renderSizeIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  fabricObject: fabric.FabricObject,
  TBorLR: "TB" | "LR"
) => {
  const xSize = TBorLR === "TB" ? 20 : 6;
  const ySize = TBorLR === "TB" ? 6 : 20;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#bbbbbb";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "#dddddd";
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.beginPath();
  ctx.roundRect(-xSize / 2, -ySize / 2, xSize, ySize, 10);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

const renderLRIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  fabricObject: fabric.FabricObject
) => {
  renderSizeIcon(ctx, left, top, fabricObject, "LR");
};

const renderTBIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  fabricObject: fabric.FabricObject
) => {
  renderSizeIcon(ctx, left, top, fabricObject, "TB");
};

// 渲染顶点图标（圆角）
export const renderVertexIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number
  // fabricObject: fabric.FabricObject
) => {
  const size = 12;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#bbbbbb";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "#dddddd";
  ctx.beginPath();
  ctx.arc(left, top, size / 2, 0, 2 * Math.PI, false);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

// 渲染 SVG 图标
function renderSvgIcon(icon: HTMLImageElement) {
  return function renderIcon(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    fabricObject: fabric.FabricObject
  ) {
    const size = 28;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(icon, -size / 2, -size / 2, size, size);
    ctx.restore();
  };
}

// 复制对象
const handleCopyObject = async (
  _eventData: MouseEvent,
  transform: fabric.Transform
) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (!canvas) return false;
  await copyObject(canvas, target);
  pasteObject(canvas);
  return true;
};

// 删除对象
const handleDelObject = (
  _eventData: MouseEvent,
  transform: fabric.Transform
) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (!canvas) return false;
  removeObject(target, canvas);
  return true;
};

// 获取全局 controls 配置（用于设置到 FabricObject.prototype）
export const getGlobalControls = (): Record<string, fabric.Control> => {
  const controlsUtils = fabric.controlsUtils;
  return {
    // 中间上下 - 调整高度
    mt: new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -1,
      render: renderTBIcon,
      actionHandler: changeHeight,
      actionName: "resizing",
    }),
    mb: new fabric.Control({
      x: 0,
      y: 0.5,
      offsetY: 1,
      render: renderTBIcon,
      actionHandler: changeHeight,
      actionName: "resizing",
    }),
    // 中间左右 - 调整宽度
    ml: new fabric.Control({
      x: -0.5,
      y: 0,
      offsetX: -1,
      render: renderLRIcon,
      actionHandler: controlsUtils?.changeWidth,
      actionName: "resizing",
    }),
    mr: new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 1,
      render: renderLRIcon,
      actionHandler: controlsUtils?.changeWidth,
      actionName: "resizing",
    }),
    // 四个角 - 等比缩放
    tl: new fabric.Control({
      x: -0.5,
      y: -0.5,
      render: renderVertexIcon,
      actionHandler: controlsUtils?.scalingEqually,
      actionName: "scaling",
    }),
    tr: new fabric.Control({
      x: 0.5,
      y: -0.5,
      render: renderVertexIcon,
      actionHandler: controlsUtils?.scalingEqually,
      actionName: "scaling",
    }),
    bl: new fabric.Control({
      x: -0.5,
      y: 0.5,
      render: renderVertexIcon,
      actionHandler: controlsUtils?.scalingEqually,
      actionName: "scaling",
    }),
    br: new fabric.Control({
      x: 0.5,
      y: 0.5,
      render: renderVertexIcon,
      actionHandler: controlsUtils?.scalingEqually,
      actionName: "scaling",
    }),
    // 旋转控制点
    mtr: new fabric.Control({
      x: 0,
      y: 0.5,
      offsetY: 38,
      cursorStyleHandler: () =>
        `url("data:image/svg+xml;charset=utf-8,${ROTATE_CURSOR}") 12 12, crosshair`,
      render: renderSvgIcon(ROTATE_IMG),
      actionHandler: controlsUtils?.rotationWithSnapping,
      actionName: "rotating",
      withConnection: false,
    }),
    // 复制按钮
    copy: new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: -24,
      offsetY: -26,
      cursorStyle: "pointer",
      mouseUpHandler: handleCopyObject as any,
      render: renderSvgIcon(COPY_IMG),
    }),
    // 删除按钮
    del: new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 24,
      offsetY: -26,
      cursorStyle: "pointer",
      mouseUpHandler: handleDelObject as any,
      render: renderSvgIcon(DEL_IMG),
    }),
  };
};

// 鼠标悬停控制点效果
export const handleMouseOverCorner = (
  corner: string,
  target: fabric.FabricObject
) => {
  if (corner === "mtr") {
    target.controls[corner].render = renderSvgIcon(ROTATE_IMG_ACTIVE);
  }
  if (corner === "copy") {
    target.controls[corner].render = renderSvgIcon(COPY_IMG_ACTIVE);
  }
  if (corner === "del") {
    target.controls[corner].render = renderSvgIcon(DEL_IMG_ACTIVE);
  }
  target.canvas?.requestRenderAll();
};

// 鼠标离开控制点效果
export const handleMouseOutCorner = (target: fabric.FabricObject | null) => {
  if (!target) return;
  if (target.controls?.mtr) {
    target.controls.mtr.render = renderSvgIcon(ROTATE_IMG);
  }
  if (target.controls?.copy) {
    target.controls.copy.render = renderSvgIcon(COPY_IMG);
  }
  if (target.controls?.del) {
    target.controls.del.render = renderSvgIcon(DEL_IMG);
  }
};

// 初始化全局 controls（在 Canvas 创建后调用）
export default function initControl() {
  // fabric v6: controls 是通过静态方法 createControls() 为每个实例创建的
  // 需要重写 InteractiveFabricObject.createControls 方法来注入全局自定义 controls
  const InteractiveFabricObject = (fabric as any).InteractiveFabricObject;
  if (!InteractiveFabricObject) {
    console.warn("InteractiveFabricObject not found");
    return;
  }

  // 保存原始 createControls 方法
  const originalCreateControls = InteractiveFabricObject.createControls;
  const globalControls = getGlobalControls();

  // 重写 createControls 方法
  InteractiveFabricObject.createControls = function () {
    // 调用原始方法获取默认 controls
    const result = originalCreateControls.call(this);
    // 合并全局自定义 controls（复制/删除按钮和自定义样式的控制点）
    Object.assign(result.controls, globalControls);
    return result;
  };
}
