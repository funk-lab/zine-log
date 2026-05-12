import * as fabric from "fabric";

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

/**
 * FLine - 自定义线条类，继承自 fabric.Line
 * Fabric.js v6: 使用 ES6 class 语法替代 createClass
 */
export class FLine extends fabric.Line {
  static type = "f-line";

  // fabric v6: 通过重写 createControls 自定义 controls - 只保留端点拖拽控制
  static createControls() {
    return {
      controls: {
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
      },
    };
  }

  padding = 6;
  borderColor = "#00000000";

  constructor(
    points: [number, number, number, number],
    options?: Partial<fabric.FabricObjectProps>
  ) {
    super(points, options);
  }

  setStrokeWidth(w: number): void {
    this.set("strokeWidth", w);
  }

  setStrokeDashArray(dashArray: number[] | null): void {
    this.set("strokeDashArray", dashArray);
  }

  setStrokeLineCap(isRound: boolean): void {
    this.set("strokeLineCap", isRound ? "round" : "butt");
  }

  // @ts-ignore
  toObject(propertiesToInclude?: string[]): any {
    return {
      ...super.toObject(propertiesToInclude as any),
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    };
  }

  static fromObject(object: any): Promise<FLine> {
    // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
    const { type, version, ...rest } = object;
    const options = { ...rest };
    options.points = [object.x1, object.y1, object.x2, object.y2];
    const instance = new FLine(options);
    delete (instance as any).points;
    return Promise.resolve(instance);
  }
}
fabric.classRegistry.setClass(FLine);
