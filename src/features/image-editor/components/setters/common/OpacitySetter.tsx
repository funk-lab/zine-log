import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function OpacitySetter() {
  const { object, editor } = useZineEditor();
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    if (object) {
      setOpacity(Math.round((object.opacity || 1) * 100));
    }
  }, [object]);

  const handleChange = (value: number) => {
    if (!object || !editor) return;
    
    setOpacity(value);
    object.set("opacity", value / 100);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">不透明度</div>
      <div className="zine-slider-row">
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
        <span className="zine-slider-val">{opacity}%</span>
      </div>
    </div>
  );
}
