import { useState, useEffect, useCallback } from "react";
import * as fabric from "fabric";
import { Circle, Triangle, Polygon } from "fabric";
import { useZineEditor } from "../../index";
import {
  drawArrowLine,
  drawLine,
  drawTriArrowLine,
} from "@/editor/objects/line";
import createRect from "@/editor/objects/rect";
import createShape from "@/editor/objects/shape";
import { createPathFromSvg } from "@/editor/objects/path";
import { transformFill2Colors } from "@/utils";
import ColorSetter from "@/fabritor/UI/setter/ColorSetter";

const linePresets = [
  {
    id: "solid",
    type: "f-line",
    label: "直线",
    dashed: false,
    dotted: false,
    arrow: false,
  },
  {
    id: "dashed",
    type: "f-line",
    label: "虚线",
    dashed: true,
    dotted: false,
    arrow: false,
  },
  {
    id: "dotted",
    type: "f-line",
    label: "点线",
    dashed: false,
    dotted: true,
    arrow: false,
  },
  {
    id: "arrow",
    type: "f-arrow",
    label: "箭头",
    dashed: false,
    dotted: false,
    arrow: true,
  },
  {
    id: "tri-arrow",
    type: "f-tri-arrow",
    label: "三角箭头",
    dashed: false,
    dotted: false,
    arrow: true,
  },
];

// 星形和心形的 SVG 路径
const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

const shapePresets = [
  {
    id: "rect",
    name: "矩形",
    shape: null,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="5" width="18" height="14" rx="1" />
      </svg>
    ),
  },
  {
    id: "circle",
    name: "圆形",
    shape: Circle,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: "roundedRect",
    name: "圆角矩形",
    shape: null,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="5" width="18" height="14" rx="4" />
      </svg>
    ),
  },
  {
    id: "triangle",
    name: "三角形",
    shape: Triangle,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 3 22 21 2 21" />
      </svg>
    ),
  },
  {
    id: "diamond",
    name: "菱形",
    shape: Polygon,
    points: [
      { x: 100, y: 0 },
      { x: 200, y: 100 },
      { x: 100, y: 200 },
      { x: 0, y: 100 },
    ],
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 22 12 12 22 2 12" />
      </svg>
    ),
  },
  {
    id: "hexagon",
    name: "六边形",
    shape: Polygon,
    points: [
      { x: 100, y: 0 },
      { x: 186.6, y: 50 },
      { x: 186.6, y: 150 },
      { x: 100, y: 200 },
      { x: 13.4, y: 150 },
      { x: 13.4, y: 50 },
    ],
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      </svg>
    ),
  },
  {
    id: "star",
    name: "五角星",
    shape: "path",
    svg: starSvg,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "heart",
    name: "心形",
    shape: "path",
    svg: heartSvg,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

const fillColors = [
  { color: "transparent", name: "无填充", transparent: true },
  { color: "#FFFFFF", name: "白色", border: true },
  { color: "rgba(200,119,58,.15)", name: "品牌橙透明", active: true },
  { color: "rgba(45,107,228,.15)", name: "蓝色透明", border: "#2D6BE4" },
  { color: "#F5E8DA", name: "浅米色" },
  { color: "#1A1714", name: "黑色" },
];

const borderColors = [
  { color: "#C8773A", name: "品牌橙" },
  { color: "#1A1714", name: "黑色" },
  { color: "#2D6BE4", name: "蓝色" },
  { color: "#2DA861", name: "绿色" },
];

export default function ShapePanel() {
  const { editor, object } = useZineEditor();
  const [fillColor, setFillColor] = useState("rgba(200,119,58,.15)");
  const [fillAlpha, setFillAlpha] = useState(15);
  const [borderColor, setBorderColor] = useState("#C8773A");
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderRadius, setBorderRadius] = useState(0);
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed" | "dotted">(
    "solid"
  );

  // 从 fabric 对象获取边框类型
  const getObjectBorderType = useCallback((obj: any) => {
    if (!obj) return "solid";
    const { stroke, strokeWidth, strokeDashArray } = obj;
    if (!stroke || strokeWidth === 0) return "solid";
    if (strokeDashArray?.length) {
      const [d1, d2] = strokeDashArray;
      // 简化判断：根据比例区分虚线和点线
      if (d1 > d2 * 2) return "dashed";
      return "dotted";
    }
    return "solid";
  }, []);

  // 获取 strokeDashArray
  const getStrokeDashArray = useCallback(
    (style?: "solid" | "dashed" | "dotted") => {
      const s = style || borderStyle;
      if (s === "dashed") return [6, 6];
      if (s === "dotted") return [2, 4];
      return undefined;
    },
    [borderStyle]
  );

  // 当选中对象变化时，同步对象属性到状态
  useEffect(() => {
    if (!object) return;

    // 同步填充颜色
    const fillColors = transformFill2Colors(object.fill);
    if (fillColors.type === "solid") {
      setFillColor(fillColors.color || "transparent");
    }

    // 同步边框属性
    setBorderColor((object.stroke as string) || "#C8773A");
    setBorderWidth(object.strokeWidth || 3);

    // 同步边框样式
    const borderType = getObjectBorderType(object);
    setBorderStyle(borderType);

    // 同步圆角（仅矩形）
    if (object.type === "rect") {
      const rect = object as fabric.Rect;
      setBorderRadius(rect.rx || rect.ry || 0);
    }
  }, [object, getObjectBorderType]);

  // 当填充颜色变化时，应用到选中对象
  const handleFillChange = (color: string) => {
    setFillColor(color);
    if (object && editor) {
      object.set("fill", color === "transparent" ? "" : color);
      object.setCoords();
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  // 当边框颜色变化时，应用到选中对象
  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    if (object && editor) {
      object.set("stroke", color);
      object.setCoords();
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  // 当边框宽度变化时，应用到选中对象
  const handleBorderWidthChange = (width: number) => {
    setBorderWidth(width);
    if (object && editor) {
      object.set("strokeWidth", width);
      object.setCoords();
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  // 当边框样式变化时，应用到选中对象
  const handleBorderStyleChange = (style: "solid" | "dashed" | "dotted") => {
    setBorderStyle(style);
    if (object && editor) {
      object.set("strokeDashArray", getStrokeDashArray(style));
      object.setCoords();
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  // 当圆角变化时，应用到选中对象
  const handleBorderRadiusChange = (radius: number) => {
    setBorderRadius(radius);
    if (object && editor && object.type === "rect") {
      object.set({ rx: radius, ry: radius });
      object.setCoords();
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  const addLine = async (preset: (typeof linePresets)[0]) => {
    if (!editor) return;
    const canvas = editor.canvas;
    const options = {
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: preset.dashed
        ? [6, 6]
        : preset.dotted
        ? [2, 4]
        : undefined,
    };

    switch (preset.type) {
      case "f-line":
        drawLine({ ...options, canvas });
        break;
      case "f-arrow":
        drawArrowLine({ ...options, canvas });
        break;
      case "f-tri-arrow":
        drawTriArrowLine({ ...options, canvas });
        break;
      default:
        break;
    }

    // 触发修改事件
    editor.fireCustomModifiedEvent?.();
  };

  const addShape = async (shape: (typeof shapePresets)[0]) => {
    if (!editor) return;
    const canvas = editor.canvas;
    const { id, points, svg } = shape;

    const baseOptions = {
      fill: fillColor === "transparent" ? "" : fillColor,
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: getStrokeDashArray(),
      rx: id === "roundedRect" ? borderRadius : undefined,
      ry: id === "roundedRect" ? borderRadius : undefined,
    };

    switch (id) {
      case "rect":
        createRect({
          ...baseOptions,
          width: 200,
          height: 200,
          canvas,
        });
        break;
      case "roundedRect":
        createRect({
          ...baseOptions,
          width: 200,
          height: 200,
          rx: borderRadius || 20,
          ry: borderRadius || 20,
          canvas,
        });
        break;
      // TODO: 还未实现 createPathFromSvg
      case "star":
      case "heart":
        if (svg) {
          await createPathFromSvg({
            svgString: svg,
            canvas,
            sub_type: id,
            strokeWidth: borderWidth,
            fill: baseOptions.fill,
            stroke: borderColor,
          });
        }
        break;
      case "circle":
        createShape(Circle, {
          ...baseOptions,
          radius: 100,
          canvas,
        });
        break;
      case "triangle":
        createShape(Triangle, {
          ...baseOptions,
          width: 200,
          height: 200,
          canvas,
        });
        break;
      case "diamond":
      case "hexagon":
        if (points) {
          createShape(Polygon, {
            ...baseOptions,
            points,
            canvas,
          });
        }
        break;
      default:
        break;
    }

    // 触发修改事件
    editor.fireCustomModifiedEvent?.();
  };

  return (
    <>
      {/* 线条预设 - 点击直接插入 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">线条预设</div>
        <div className="zine-line-presets">
          {linePresets.map((preset) => (
            <div
              key={preset.id}
              className="zine-line-preset-item"
              onClick={() => addLine(preset)}
              title={`插入${preset.label}`}
            >
              <span className="zine-line-label">{preset.label}</span>
              <div
                className={`zine-line-preview ${
                  preset.dotted
                    ? "zine-line-dotted"
                    : preset.dashed
                    ? "zine-line-dashed"
                    : "zine-line-solid"
                }`}
                style={{ color: "#1A1714" }}
              >
                {preset.arrow && (
                  <svg
                    style={{ position: "absolute", right: -2, top: -5 }}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    color="#1A1714"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 图形预设 - 点击直接插入 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">图形预设</div>
        <div className="zine-preset-grid">
          {shapePresets.map((shape) => (
            <div
              key={shape.id}
              className="zine-preset-item"
              title={`插入${shape.name}`}
              onClick={() => addShape(shape)}
            >
              {shape.icon}
            </div>
          ))}
        </div>
      </div>

      {/* 填充 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">填充</div>
        <div className="zine-color-row">
          {fillColors.map((c) => (
            <div
              key={c.name}
              className={`zine-color-dot ${
                fillColor === c.color ? "active" : ""
              }`}
              style={{
                background: c.color,
                border: c.border
                  ? typeof c.border === "string"
                    ? `1.5px solid ${c.border}`
                    : "1.5px solid var(--zine-border)"
                  : c.transparent
                  ? "2px dashed var(--zine-border)"
                  : undefined,
              }}
              title={c.name}
              onClick={() => handleFillChange(c.color)}
            >
              {c.transparent && (
                <svg
                  style={{ position: "absolute" }}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                >
                  <line
                    x1="3"
                    y1="3"
                    x2="21"
                    y2="21"
                    stroke="#D0CBC0"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          ))}
          <div className="zine-color-picker-btn" title="自定义填充色"></div>
          {/* TODO: 加上 */}
          <ColorSetter />
        </div>
        <div className="zine-slider-row">
          <span className="zine-slider-label">填充透明</span>
          <input
            type="range"
            min={0}
            max={100}
            value={fillAlpha}
            onChange={(e) => setFillAlpha(Number(e.target.value))}
          />
          <span className="zine-slider-val">{fillAlpha}%</span>
        </div>
      </div>

      {/* 边框 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">边框</div>
        <div className="zine-color-row" style={{ marginBottom: 8 }}>
          {borderColors.map((c) => (
            <div
              key={c.color}
              className={`zine-color-dot ${
                borderColor === c.color ? "active" : ""
              }`}
              style={{ background: c.color }}
              title={c.name}
              onClick={() => handleBorderColorChange(c.color)}
            />
          ))}
          <div className="zine-color-picker-btn" title="自定义边框色"></div>
          <div className="zine-color-input-wrap">
            <div
              className="zine-color-preview"
              style={{ background: borderColor }}
            ></div>
            <input
              className="zine-color-hex-input"
              value={borderColor}
              maxLength={7}
              onChange={(e) => handleBorderColorChange(e.target.value)}
            />
          </div>
        </div>
        <div className="zine-form-row">
          <div className="zine-form-group">
            <label className="zine-form-label">边框宽度</label>
            <input
              type="number"
              className="zine-num-input"
              value={borderWidth}
              min={0}
              max={20}
              onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
            />
          </div>
          <div className="zine-form-group">
            <label className="zine-form-label">圆角</label>
            <input
              type="number"
              className="zine-num-input"
              value={borderRadius}
              min={0}
              max={100}
              onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="zine-border-styles">
          <button
            className={`zine-border-style-btn ${
              borderStyle === "solid" ? "active" : ""
            }`}
            onClick={() => handleBorderStyleChange("solid")}
          >
            —— 实线
          </button>
          <button
            className={`zine-border-style-btn ${
              borderStyle === "dashed" ? "active" : ""
            }`}
            onClick={() => handleBorderStyleChange("dashed")}
          >
            - - 虚线
          </button>
          <button
            className={`zine-border-style-btn ${
              borderStyle === "dotted" ? "active" : ""
            }`}
            onClick={() => handleBorderStyleChange("dotted")}
          >
            ··· 点线
          </button>
        </div>
      </div>
    </>
  );
}
