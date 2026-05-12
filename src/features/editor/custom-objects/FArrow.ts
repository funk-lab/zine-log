import * as fabric from "fabric";
import type { IArrowInfo } from "@/types/fabritor";

const Point = fabric.Point;
const util = fabric.util;

// 改变线条起点
const changeLineStart = (
  _eventData: any,
  transform: fabric.Transform,
  x: number,
  y: number
) => {
  const { target } = transform;
  target.set({ x1: x, y1: y });
  return true;
};

// 改变线条终点
const changeLineEnd = (
  _eventData: any,
  transform: fabric.Transform,
  x: number,
  y: number
) => {
  const { target } = transform;
  target.set({ x2: x, y2: y });
  return true;
};

// 线条端点位置处理器
const linePositionHandler = (xKey: "x1" | "x2", yKey: "y1" | "y2") => {
  return (_dim: any, _finalMatrix: any, fabricObject: fabric.Line) => {
    if (fabricObject?.canvas) {
      const points = fabricObject.calcLinePoints();
      const localPoint = new Point(points[xKey], points[yKey]);
      // fabric v6: 使用 multiplyTransformMatrices 和 transformPoint
      const matrix = (util as any).multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix()
      );
      const point = (util as any).transformPoint(localPoint, matrix);
      return point;
    } else {
      return new Point(0, 0);
    }
  };
};

// 箭头类通用的 controls
const arrowControls = {
  l1: new fabric.Control({
    positionHandler: linePositionHandler("x1", "y1"),
    actionHandler: changeLineStart,
    cursorStyleHandler: () => "crosshair",
    actionName: "line-points-change",
  }),
  l2: new fabric.Control({
    positionHandler: linePositionHandler("x2", "y2"),
    actionHandler: changeLineEnd,
    cursorStyleHandler: () => "crosshair",
    actionName: "line-points-change",
  }),
};

/**
 * FArrow - 箭头线条类，继承自 fabric.Line
 * Fabric.js v6: 使用 ES6 class 语法替代 createClass
 */
export class FArrow extends fabric.Line {
  static type = "f-arrow";

  // fabric v6: 通过重写 createControls 自定义 controls - 端点拖拽控制
  static createControls() {
    return { controls: arrowControls };
  }

  borderColor = "#00000000";
  oldArrowInfo?: IArrowInfo;

  constructor(
    points: [number, number, number, number],
    options?: Partial<fabric.FabricObjectProps>
  ) {
    super(points, options);
  }

  _render(ctx: CanvasRenderingContext2D): void {
    super._render(ctx);

    ctx.save();

    if (!this.oldArrowInfo) {
      this.oldArrowInfo = {
        left: -28,
        top: -15,
        bottom: 15,
        strokeWidth: this.strokeWidth,
      };
    }
    const xDiff = (this as any).x2 - (this as any).x1;
    const yDiff = (this as any).y2 - (this as any).y1;
    const angle = Math.atan2(yDiff, xDiff);
    ctx.translate(
      ((this as any).x2 - (this as any).x1) / 2,
      ((this as any).y2 - (this as any).y1) / 2
    );
    ctx.rotate(angle);

    const delta = this.strokeWidth - (this.oldArrowInfo.strokeWidth || 0);
    ctx.lineJoin = this.strokeLineJoin || "miter";
    ctx.lineCap = this.strokeLineCap || "butt";
    // 当 stroke 是 Gradient 类型时，需要特殊处理
    // 这里只处理简单颜色字符串的情况
    const stroke = this.stroke;
    ctx.strokeStyle = (typeof stroke === "string" ? stroke : "") || "";
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(
      this.oldArrowInfo.left - delta,
      this.oldArrowInfo.bottom + delta
    );
    ctx.lineTo(this.oldArrowInfo.left - delta, this.oldArrowInfo.top - delta);
    ctx.closePath();
    ctx.fillStyle = (typeof stroke === "string" ? stroke : "") || "";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  setStrokeWidth(w: number): void {
    this.set("strokeWidth", w);
  }

  setStrokeDashArray(dashArray: number[] | null): void {
    this.set("strokeDashArray", dashArray);
  }

  setStrokeLineCap(isRound: boolean): void {
    this.set("strokeLineCap", isRound ? "round" : "butt");
    this.set("strokeLineJoin", isRound ? "round" : "miter");
  }
  // @ts-ignore - 方法签名与基类不完全兼容，但运行时行为正确
  toObject(propertiesToInclude?: string[]): any {
    return {
      ...super.toObject(propertiesToInclude as any),
      x1: (this as any).x1,
      y1: (this as any).y1,
      x2: (this as any).x2,
      y2: (this as any).y2,
    };
  }

  static fromObject(object: any): Promise<FArrow> {
    // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
    const { type, version, ...rest } = object;
    return Promise.resolve(
      new FArrow([object.x1, object.y1, object.x2, object.y2], rest)
    );
  }
}

/**
 * FTriArrow - 三角箭头类，继承自 fabric.Line
 */
export class FTriArrow extends fabric.Line {
  static type = "f-tri-arrow";

  // fabric v6: 通过重写 createControls 自定义 controls - 端点拖拽控制
  static createControls() {
    return { controls: arrowControls };
  }

  borderColor = "#00000000";
  oldArrowInfo?: IArrowInfo;

  constructor(
    points: [number, number, number, number],
    options?: Partial<fabric.FabricObjectProps>
  ) {
    super(points, options);
  }

  _render(ctx: CanvasRenderingContext2D): void {
    super._render(ctx);

    ctx.save();

    if (!this.oldArrowInfo) {
      this.oldArrowInfo = {
        left: -24,
        top: -16,
        bottom: 16,
        strokeWidth: this.strokeWidth,
      };
    }
    const xDiff = (this as any).x2 - (this as any).x1;
    const yDiff = (this as any).y2 - (this as any).y1;
    const angle = Math.atan2(yDiff, xDiff);
    ctx.translate(
      ((this as any).x2 - (this as any).x1) / 2,
      ((this as any).y2 - (this as any).y1) / 2
    );
    ctx.rotate(angle);

    const delta = this.strokeWidth - (this.oldArrowInfo.strokeWidth || 0);
    ctx.lineJoin = this.strokeLineJoin || "miter";
    ctx.lineCap = this.strokeLineCap || "butt";
    // 当 stroke 是 Gradient 类型时，需要特殊处理
    const stroke = this.stroke;
    ctx.strokeStyle = (typeof stroke === "string" ? stroke : "") || "";
    ctx.beginPath();

    ctx.moveTo(
      this.oldArrowInfo.left - delta,
      this.oldArrowInfo.bottom + delta
    );
    ctx.lineTo(0, 0);
    ctx.lineTo(this.oldArrowInfo.left - delta, this.oldArrowInfo.top - delta);
    ctx.fillStyle = "#00000000";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  setStrokeWidth(w: number): void {
    this.set("strokeWidth", w);
  }

  setStrokeDashArray(dashArray: number[] | null): void {
    this.set("strokeDashArray", dashArray);
  }

  setStrokeLineCap(isRound: boolean): void {
    this.set("strokeLineCap", isRound ? "round" : "butt");
    this.set("strokeLineJoin", isRound ? "round" : "miter");
  }

  // @ts-ignore - 方法签名与基类不完全兼容，但运行时行为正确
  toObject(propertiesToInclude?: string[]): any {
    return {
      ...super.toObject(propertiesToInclude as any),
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    };
  }

  static fromObject(object: any): Promise<FTriArrow> {
    // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
    const { type, version, ...rest } = object;
    return Promise.resolve(
      new FTriArrow([object.x1, object.y1, object.x2, object.y2], rest)
    );
  }
}

// 注册到 fabric classRegistry
fabric.classRegistry.setClass(FArrow);
fabric.classRegistry.setClass(FTriArrow);
