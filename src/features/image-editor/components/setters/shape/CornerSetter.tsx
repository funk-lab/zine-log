import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function CornerSetter() {
  const { object, editor } = useZineEditor();
  const [borderRadius, setBorderRadius] = useState(0);

  useEffect(() => {
    if (object && object.type === "rect") {
      const rect = object as any;
      setBorderRadius(rect.rx || rect.ry || 0);
    }
  }, [object]);

  const handleChange = (value: number) => {
    if (!object || !editor || object.type !== "rect") return;
    
    setBorderRadius(value);
    object.set({ rx: value, ry: value });
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  // 仅对矩形显示
  if (!object || object.type !== "rect") return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">圆角</div>
      <div className="zine-slider-row">
        <input
          type="range"
          min={0}
          max={100}
          value={borderRadius}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="zine-num-input"
          style={{ width: 60 }}
          value={borderRadius}
          min={0}
          max={100}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
