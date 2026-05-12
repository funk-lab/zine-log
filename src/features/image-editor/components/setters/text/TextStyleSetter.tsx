import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function TextStyleSetter() {
  const { object, editor } = useZineEditor();
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);

  useEffect(() => {
    if (object) {
      setBold((object as any).fontWeight === "bold");
      setItalic((object as any).fontStyle === "italic");
      setUnderline(!!(object as any).underline);
      setStrike(!!(object as any).linethrough);
    }
  }, [object]);

  const toggleStyle = (key: string, value: boolean) => {
    if (!object || !editor) return;
    
    switch (key) {
      case "bold":
        setBold(value);
        object.set("fontWeight", value ? "bold" : "normal");
        break;
      case "italic":
        setItalic(value);
        object.set("fontStyle", value ? "italic" : "normal");
        break;
      case "underline":
        setUnderline(value);
        object.set("underline", value);
        break;
      case "strike":
        setStrike(value);
        object.set("linethrough", value);
        break;
    }
    
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">文字样式</div>
      <div className="zine-style-group">
        <button
          className={`zine-style-btn ${bold ? "active" : ""}`}
          title="加粗"
          onClick={() => toggleStyle("bold", !bold)}
        >
          B
        </button>
        <button
          className={`zine-style-btn ${italic ? "active" : ""}`}
          title="斜体"
          onClick={() => toggleStyle("italic", !italic)}
        >
          I
        </button>
        <button
          className={`zine-style-btn ${underline ? "active" : ""}`}
          title="下划线"
          onClick={() => toggleStyle("underline", !underline)}
        >
          U
        </button>
        <button
          className={`zine-style-btn ${strike ? "active" : ""}`}
          title="删除线"
          onClick={() => toggleStyle("strike", !strike)}
        >
          S
        </button>
      </div>
    </div>
  );
}
