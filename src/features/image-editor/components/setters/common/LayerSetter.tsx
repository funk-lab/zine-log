import { useState, useEffect } from "react";
import { useZineEditor } from "../../../index";

export default function LayerSetter() {
  const { object, editor } = useZineEditor();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (object) {
      setIsLocked(object.lockMovementX || false);
    }
  }, [object]);

  const handleLock = () => {
    if (!object || !editor) return;
    
    const newLock = !isLocked;
    setIsLocked(newLock);
    
    object.set({
      lockMovementX: newLock,
      lockMovementY: newLock,
      hasControls: !newLock,
    });
    
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleBringToFront = () => {
    if (!object || !editor) return;
    editor.canvas.bringObjectToFront(object);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleSendToBack = () => {
    if (!object || !editor) return;
    editor.canvas.sendObjectToBack(object);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleDelete = () => {
    if (!object || !editor) return;
    editor.canvas.remove(object);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">图层操作</div>
      <div className="zine-layer-actions">
        <button
          className={`zine-layer-btn ${isLocked ? "active" : ""}`}
          onClick={handleLock}
          title={isLocked ? "解锁" : "锁定"}
        >
          {isLocked ? "🔒" : "🔓"}
        </button>
        <button
          className="zine-layer-btn"
          onClick={handleBringToFront}
          title="置于顶层"
        >
          ⬆️
        </button>
        <button
          className="zine-layer-btn"
          onClick={handleSendToBack}
          title="置于底层"
        >
          ⬇️
        </button>
        <button
          className="zine-layer-btn zine-delete-btn"
          onClick={handleDelete}
          title="删除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
