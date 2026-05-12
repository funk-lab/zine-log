import { useZineEditor } from "../../index";
import { Circle, Triangle, Polygon } from "fabric";
import createRect from "@/features/editor/objects/rect";
import createShape from "@/features/editor/objects/shape";
import { createPathFromSvg } from "@/features/editor/objects/path";
import {
  drawArrowLine,
  drawLine,
  drawTriArrowLine,
} from "@/features/editor/objects/line";

// 星形和心形的 SVG 路径
const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

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

const shapePresets = [
  {
    id: "rect",
    name: "矩形",
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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
    icon: (
      <svg
        width="24"
        height="24"
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

// 默认样式
const defaultFill = "rgba(200,119,58,.15)";
const defaultStroke = "#C8773A";
const defaultStrokeWidth = 3;

export default function ShapePicker() {
  const { editor } = useZineEditor();

  const addLine = (preset: (typeof linePresets)[0]) => {
    if (!editor) return;
    const canvas = editor.canvas;
    const options = {
      stroke: defaultStroke,
      strokeWidth: defaultStrokeWidth,
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
    }
    editor.fireCustomModifiedEvent?.();
  };

  const addShape = async (shape: (typeof shapePresets)[0]) => {
    if (!editor) return;
    const canvas = editor.canvas;
    const { id } = shape;

    const baseOptions = {
      fill: defaultFill,
      stroke: defaultStroke,
      strokeWidth: defaultStrokeWidth,
    };

    switch (id) {
      case "rect":
        createRect({ ...baseOptions, width: 200, height: 200, canvas });
        break;
      case "roundedRect":
        createRect({
          ...baseOptions,
          width: 200,
          height: 200,
          rx: 20,
          ry: 20,
          canvas,
        });
        break;
      case "star":
      case "heart":
        await createPathFromSvg({
          svgString: id === "star" ? starSvg : heartSvg,
          canvas,
          sub_type: id,
          strokeWidth: defaultStrokeWidth,
          fill: defaultFill,
          stroke: defaultStroke,
        });
        break;
      case "circle":
        createShape(Circle, { ...baseOptions, radius: 100, canvas });
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
      case "hexagon": {
        const points =
          id === "diamond"
            ? [
                { x: 100, y: 0 },
                { x: 200, y: 100 },
                { x: 100, y: 200 },
                { x: 0, y: 100 },
              ]
            : [
                { x: 100, y: 0 },
                { x: 186.6, y: 50 },
                { x: 186.6, y: 150 },
                { x: 100, y: 200 },
                { x: 13.4, y: 150 },
                { x: 13.4, y: 50 },
              ];
        createShape(Polygon, { ...baseOptions, points, canvas });
        break;
      }
    }

    editor.fireCustomModifiedEvent?.();
  };

  return (
    <div className="zine-left-panel-content">
      <div className="zine-left-panel-header">
        <span>形状</span>
        <span style={{ fontSize: 11, color: "var(--zine-text-muted)" }}>
          点击插入
        </span>
      </div>

      {/* 线条预设 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">线条</div>
        <div className="zine-line-presets">
          {linePresets.map((preset) => (
            <div
              key={preset.id}
              className="zine-line-preset-item"
              onClick={() => addLine(preset)}
              title={preset.label}
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

      {/* 图形预设 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">图形</div>
        <div className="zine-preset-grid">
          {shapePresets.map((shape) => (
            <div
              key={shape.id}
              className="zine-preset-item"
              title={shape.name}
              onClick={() => void addShape(shape)}
            >
              {shape.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
