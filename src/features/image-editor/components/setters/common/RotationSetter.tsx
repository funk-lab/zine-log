import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function RotationSetter() {
  const { object, editor } = useZineEditor();
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (object) {
      setAngle(Math.round(object.angle || 0));
    }
  }, [object]);

  const handleChange = (value: number) => {
    if (!object || !editor) return;
    
    setAngle(value);
    object.set("angle", value);
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">旋转</div>
      <div className="zine-slider-row">
        <input
          type="range"
          min={-180}
          max={180}
          value={angle}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="zine-num-input"
          style={{ width: 60 }}
          value={angle}
          min={-180}
          max={180}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
        <span>°</span>
      </div>
    </div>
  );
}
