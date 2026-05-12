import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

const fillColors = [
  { color: "transparent", name: "无填充", transparent: true },
  { color: "#FFFFFF", name: "白色", border: true },
  { color: "rgba(200,119,58,.15)", name: "品牌橙透明" },
  { color: "rgba(45,107,228,.15)", name: "蓝色透明", border: "#2D6BE4" },
  { color: "#F5E8DA", name: "浅米色" },
  { color: "#1A1714", name: "黑色" },
];

export default function FillSetter() {
  const { object, editor } = useZineEditor();
  const [fillColor, setFillColor] = useState(fillColors[2].color);
  const [fillAlpha, setFillAlpha] = useState(15);

  useEffect(() => {
    if (object) {
      const fill = object.fill as string;
      setFillColor(fill || "transparent");
      // TODO: 解析透明度值
    }
  }, [object]);

  const handleColorChange = (color: string) => {
    if (!object || !editor) return;
    setFillColor(color);
    object.set("fill", color === "transparent" ? "" : color);
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleAlphaChange = (value: number) => {
    if (!object || !editor) return;
    setFillAlpha(value);
    // TODO: 解析当前颜色并调整透明度
    // 需要将 rgba 的 alpha 值替换为 value/100
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">填充</div>
      <div className="zine-color-row">
        {fillColors.map((c) => (
          <div
            key={c.name}
            className={`zine-color-dot ${fillColor === c.color ? "active" : ""}`}
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
            onClick={() => handleColorChange(c.color)}
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
      </div>
      
      {/* 填充透明度 */}
      <div className="zine-slider-row" style={{ marginTop: 12 }}>
        <span className="zine-slider-label">透明</span>
        <input
          type="range"
          min={0}
          max={100}
          value={fillAlpha}
          onChange={(e) => handleAlphaChange(Number(e.target.value))}
        />
        <span className="zine-slider-val">{fillAlpha}%</span>
      </div>
    </div>
  );
}
