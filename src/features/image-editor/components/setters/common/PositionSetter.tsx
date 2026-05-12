import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function PositionSetter() {
  const { object, editor } = useZineEditor();
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (object) {
      setLeft(Math.round(object.left || 0));
      setTop(Math.round(object.top || 0));
    }
  }, [object]);

  const handleChange = (key: "left" | "top", value: number) => {
    if (!object || !editor) return;
    
    if (key === "left") setLeft(value);
    else setTop(value);
    
    object.set(key, value);
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">位置</div>
      <div className="zine-form-row">
        <div className="zine-form-group">
          <label className="zine-form-label">X</label>
          <input
            type="number"
            className="zine-num-input"
            value={left}
            onChange={(e) => handleChange("left", Number(e.target.value))}
          />
        </div>
        <div className="zine-form-group">
          <label className="zine-form-label">Y</label>
          <input
            type="number"
            className="zine-num-input"
            value={top}
            onChange={(e) => handleChange("top", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
