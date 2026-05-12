/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */

import * as fabric from "fabric";
const Point = fabric.Point;

export default function initCenteringGuidelines(canvas: fabric.Canvas) {
  const ctx = canvas.getSelectionContext();
  const canvasWidth = canvas.getWidth(),
    canvasHeight = canvas.getHeight(),
    canvasWidthCenter = canvasWidth / 2,
    canvasHeightCenter = canvasHeight / 2;
  const canvasWidthCenterMap: Record<number, boolean> = {};
  const canvasHeightCenterMap: Record<number, boolean> = {};
  const centerLineMargin = 4;
  const centerLineColor = "rgba(255,0,241,0.5)";
  const centerLineWidth = 1;
  let viewportTransform: number[] | undefined;

  for (
    let i = canvasWidthCenter - centerLineMargin,
      len = canvasWidthCenter + centerLineMargin;
    i <= len;
    i++
  ) {
    canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (
    let i = canvasHeightCenter - centerLineMargin,
      len = canvasHeightCenter + centerLineMargin;
    i <= len;
    i++
  ) {
    canvasHeightCenterMap[Math.round(i)] = true;
  }

  function showVerticalCenterLine() {
    showCenterLine(
      canvasWidthCenter + 0.5,
      0,
      canvasWidthCenter + 0.5,
      canvasHeight
    );
  }

  function showHorizontalCenterLine() {
    showCenterLine(
      0,
      canvasHeightCenter + 0.5,
      canvasWidth,
      canvasHeightCenter + 0.5
    );
  }

  function showCenterLine(x1: number, y1: number, x2: number, y2: number) {
    if (!viewportTransform) return;
    ctx.save();
    ctx.strokeStyle = centerLineColor;
    ctx.lineWidth = centerLineWidth;
    ctx.beginPath();
    ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
    ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
    ctx.stroke();
    ctx.restore();
  }

  let isInVerticalCenter: boolean | null = null,
    isInHorizontalCenter: boolean | null = null;

  canvas.on("mouse:down", () => {
    viewportTransform = canvas.viewportTransform;
  });

  canvas.on("object:moving", (e) => {
    const object = e.target;
    if (!object) return;

    const transform = canvas._currentTransform;
    if (!transform) return;

    const objectCenter = object.getCenterPoint();

    isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap;
    isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;

    if (isInHorizontalCenter || isInVerticalCenter) {
      object.setPositionByOrigin(
        new Point(
          isInVerticalCenter ? canvasWidthCenter : objectCenter.x,
          isInHorizontalCenter ? canvasHeightCenter : objectCenter.y
        ),
        "center",
        "center"
      );
    }
  });

  canvas.on("before:render", function () {
    const ct = canvas.contextTop;
    if (ct) canvas.clearContext(ct);
  });

  canvas.on("after:render", function () {
    if (isInVerticalCenter) {
      showVerticalCenterLine();
    }
    if (isInHorizontalCenter) {
      showHorizontalCenterLine();
    }
  });

  canvas.on("mouse:up", function () {
    // clear these values, to stop drawing guidelines once mouse is up
    isInVerticalCenter = isInHorizontalCenter = null;
    canvas.renderAll();
  });
}
