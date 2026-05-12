import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";
import SizeInput from "./SizeInput";

export default function SizeSetter() {
  const { object, editor } = useZineEditor();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (object) {
      setWidth(Math.round(object.getScaledWidth?.() || object.width || 0));
      setHeight(Math.round(object.getScaledHeight?.() || object.height || 0));
    }
  }, [object]);

  if (!object) return null;

  const applySize = (newW: number, newH: number) => {
    if (!object || !editor) return;
    const originalW = object.width || 1;
    const originalH = object.height || 1;
    object.set({
      scaleX: newW / originalW,
      scaleY: newH / originalH,
    });
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
    // 同步 state，确保输入框显示最新值
    setWidth(newW);
    setHeight(newH);
  };

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">尺寸</div>
      <SizeInput
        width={width}
        height={height}
        onApply={applySize}
        min={1}
        widthLabel="宽度"
        heightLabel="高度"
      />
    </div>
  );
}
