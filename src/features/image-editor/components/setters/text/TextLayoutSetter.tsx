import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

const alignOptions = [
  { key: "left", label: "左对齐", icon: "⬅️" },
  { key: "center", label: "居中", icon: "↔️" },
  { key: "right", label: "右对齐", icon: "➡️" },
  { key: "justify", label: "两端对齐", icon: "↔️" },
];

export default function TextLayoutSetter() {
  const { object, editor } = useZineEditor();
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [charSpacing, setCharSpacing] = useState(0);

  useEffect(() => {
    if (object) {
      setAlign(((object as any).textAlign as "left" | "center" | "right" | "justify") || "left");
      setLineHeight((object as any).lineHeight || 1.6);
      setCharSpacing(((object as any).charSpacing || 0) / 10);
    }
  }, [object]);

  const handleAlignChange = (value: "left" | "center" | "right" | "justify") => {
    if (!object || !editor) return;
    setAlign(value);
    object.set("textAlign", value);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleLineHeightChange = (value: number) => {
    if (!object || !editor) return;
    setLineHeight(value);
    object.set("lineHeight", value);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleCharSpacingChange = (value: number) => {
    if (!object || !editor) return;
    setCharSpacing(value);
    object.set("charSpacing", value * 10);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">段落布局</div>
      
      {/* 对齐方式 */}
      <div className="zine-align-group">
        {alignOptions.map((item) => (
          <button
            key={item.key}
            className={`zine-align-btn ${align === item.key ? "active" : ""}`}
            title={item.label}
            onClick={() => handleAlignChange(item.key as "left" | "center" | "right" | "justify")}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* 行高和字间距 */}
      <div className="zine-form-row" style={{ marginTop: 12 }}>
        <div className="zine-form-group">
          <label className="zine-form-label">行高</label>
          <input
            type="number"
            className="zine-num-input"
            value={lineHeight}
            step={0.1}
            min={0.5}
            max={3}
            onChange={(e) => handleLineHeightChange(Number(e.target.value))}
          />
        </div>
        <div className="zine-form-group">
          <label className="zine-form-label">字间距</label>
          <input
            type="number"
            className="zine-num-input"
            value={charSpacing}
            min={-10}
            max={50}
            onChange={(e) => handleCharSpacingChange(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
