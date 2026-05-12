import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

const strokeColors = [
  { color: "#C8773A", name: "品牌橙" },
  { color: "#2D2D2D", name: "深灰" },
  { color: "#2D6BE4", name: "蓝色" },
];

export default function TextEffectSetter() {
  const { object, editor } = useZineEditor();
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [strokeColor, setStrokeColor] = useState(strokeColors[1].color);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(2);
  const [shadowY, setShadowY] = useState(2);
  const [shadowBlur, setShadowBlur] = useState(8);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (object) {
      setStrokeWidth(object.strokeWidth || 0);
      setStrokeColor((object.stroke as string) || strokeColors[1].color);
      
      // 解析阴影
      const shadowVal = object.shadow as unknown;
      if (shadowVal && typeof shadowVal === "string") {
        setShadowEnabled(true);
        const match = shadowVal.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
        if (match) {
          setShadowX(parseInt(match[1]));
          setShadowY(parseInt(match[2]));
          setShadowBlur(parseInt(match[3]));
        }
      } else {
        setShadowEnabled(false);
      }
    }
  }, [object]);

  const handleStrokeWidthChange = (value: number) => {
    if (!object || !editor) return;
    setStrokeWidth(value);
    object.set({
      strokeWidth: value,
      stroke: value > 0 ? strokeColor : undefined,
    });
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleStrokeColorChange = (color: string) => {
    if (!object || !editor) return;
    setStrokeColor(color);
    if (strokeWidth > 0) {
      object.set("stroke", color);
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  const handleShadowToggle = (enabled: boolean) => {
    if (!object || !editor) return;
    setShadowEnabled(enabled);
    const shadow = enabled
      ? `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.5)`
      : undefined;
    object.set("shadow", shadow);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleShadowChange = (key: "x" | "y" | "blur", value: number) => {
    if (!object || !editor) return;
    
    if (key === "x") setShadowX(value);
    if (key === "y") setShadowY(value);
    if (key === "blur") setShadowBlur(value);
    
    if (!shadowEnabled) return;
    
    const newX = key === "x" ? value : shadowX;
    const newY = key === "y" ? value : shadowY;
    const newBlur = key === "blur" ? value : shadowBlur;
    
    object.set("shadow", `${newX}px ${newY}px ${newBlur}px rgba(0,0,0,0.5)`);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div 
        className="zine-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="zine-section-label">文字效果</span>
        <span>{expanded ? "▼" : "▶"}</span>
      </div>
      
      {expanded && (
        <>
          {/* 描边 */}
          <div className="zine-effect-subsection">
            <div className="zine-effect-label">描边</div>
            <div className="zine-form-row">
              <div className="zine-form-group">
                <label className="zine-form-label">宽度</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={strokeWidth}
                  min={0}
                  max={20}
                  onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                />
              </div>
            </div>
            {strokeWidth > 0 && (
              <div className="zine-color-row" style={{ marginTop: 8 }}>
                {strokeColors.map((c) => (
                  <div
                    key={c.color}
                    className={`zine-color-dot ${strokeColor === c.color ? "active" : ""}`}
                    style={{ background: c.color, width: 20, height: 20 }}
                    title={c.name}
                    onClick={() => handleStrokeColorChange(c.color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 阴影 */}
          <div className="zine-effect-subsection" style={{ marginTop: 12 }}>
            <div className="zine-effect-label">
              <span>阴影</span>
              <label className="zine-toggle">
                <input
                  type="checkbox"
                  checked={shadowEnabled}
                  onChange={(e) => handleShadowToggle(e.target.checked)}
                />
                <span className="zine-toggle-slider"></span>
              </label>
            </div>
            {shadowEnabled && (
              <div className="zine-form-row">
                <div className="zine-form-group">
                  <label className="zine-form-label">X</label>
                  <input
                    type="number"
                    className="zine-num-input"
                    value={shadowX}
                    onChange={(e) => handleShadowChange("x", Number(e.target.value))}
                  />
                </div>
                <div className="zine-form-group">
                  <label className="zine-form-label">Y</label>
                  <input
                    type="number"
                    className="zine-num-input"
                    value={shadowY}
                    onChange={(e) => handleShadowChange("y", Number(e.target.value))}
                  />
                </div>
                <div className="zine-form-group">
                  <label className="zine-form-label">模糊</label>
                  <input
                    type="number"
                    className="zine-num-input"
                    value={shadowBlur}
                    onChange={(e) => handleShadowChange("blur", Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
