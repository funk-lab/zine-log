import { useState, useEffect, useCallback } from "react";
import { useZineEditor } from "../../../index";

const borderColors = [
  { color: "#C8773A", name: "品牌橙" },
  { color: "#1A1714", name: "黑色" },
  { color: "#2D6BE4", name: "蓝色" },
  { color: "#2DA861", name: "绿色" },
];

const borderStyles = [
  { key: "solid", label: "实线" },
  { key: "dashed", label: "虚线" },
  { key: "dotted", label: "点线" },
];

export default function BorderSetter() {
  const { object, editor } = useZineEditor();
  const [borderColor, setBorderColor] = useState(borderColors[0].color);
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed" | "dotted">("solid");

  // 从 fabric 对象获取边框类型
  const getObjectBorderType = useCallback((obj: any) => {
    if (!obj) return "solid";
    const { strokeDashArray } = obj;
    if (!strokeDashArray?.length) return "solid";
    const [d1, d2] = strokeDashArray;
    if (d1 > d2 * 2) return "dashed";
    return "dotted";
  }, []);

  // 获取 strokeDashArray
  const getStrokeDashArray = (style: "solid" | "dashed" | "dotted") => {
    if (style === "dashed") return [6, 6];
    if (style === "dotted") return [2, 4];
    return undefined;
  };

  useEffect(() => {
    if (object) {
      setBorderColor((object.stroke as string) || borderColors[0].color);
      setBorderWidth(object.strokeWidth || 0);
      setBorderStyle(getObjectBorderType(object));
    }
  }, [object, getObjectBorderType]);

  const handleColorChange = (color: string) => {
    if (!object || !editor) return;
    setBorderColor(color);
    object.set("stroke", color);
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleWidthChange = (value: number) => {
    if (!object || !editor) return;
    setBorderWidth(value);
    object.set("strokeWidth", value);
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleStyleChange = (style: "solid" | "dashed" | "dotted") => {
    if (!object || !editor) return;
    setBorderStyle(style);
    object.set("strokeDashArray", getStrokeDashArray(style));
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">边框</div>
      
      {/* 边框颜色 */}
      <div className="zine-color-row">
        {borderColors.map((c) => (
          <div
            key={c.color}
            className={`zine-color-dot ${borderColor === c.color ? "active" : ""}`}
            style={{ background: c.color }}
            title={c.name}
            onClick={() => handleColorChange(c.color)}
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
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </div>
      </div>

      {/* 边框宽度 */}
      <div className="zine-form-row" style={{ marginTop: 12 }}>
        <div className="zine-form-group">
          <label className="zine-form-label">宽度</label>
          <input
            type="number"
            className="zine-num-input"
            value={borderWidth}
            min={0}
            max={20}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* 边框样式 */}
      <div className="zine-border-styles" style={{ marginTop: 12 }}>
        {borderStyles.map((s) => (
          <button
            key={s.key}
            className={`zine-border-style-btn ${borderStyle === s.key ? "active" : ""}`}
            onClick={() => handleStyleChange(s.key as "solid" | "dashed" | "dotted")}
          >
            {s.key === "solid" && "——"}
            {s.key === "dashed" && "- -"}
            {s.key === "dotted" && "···"}
            {" "}{s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
