import { useZineEditor } from "../../../index";

const alignItems = [
  { key: "left", label: "左对齐", icon: "⬅️" },
  { key: "centerH", label: "水平居中", icon: "↔️" },
  { key: "right", label: "右对齐", icon: "➡️" },
  { key: "top", label: "顶对齐", icon: "⬆️" },
  { key: "centerV", label: "垂直居中", icon: "↕️" },
  { key: "bottom", label: "底对齐", icon: "⬇️" },
  { key: "center", label: "中心对齐", icon: "⭕" },
];

export default function AlignSetter() {
  const { object, editor } = useZineEditor();

  const handleAlign = (type: string) => {
    if (!object || !editor) return;

    switch (type) {
      case "center":
        editor.canvas.viewportCenterObject(object);
        break;
      case "left":
        object.set("left", 0);
        break;
      case "centerH":
        editor.canvas.viewportCenterObjectH(object);
        break;
      case "right":
        // TODO: 需要获取画布宽度
        object.set("left", (editor.sketch?.width || 0) - object.getScaledWidth());
        break;
      case "top":
        object.set("top", 0);
        break;
      case "centerV":
        editor.canvas.viewportCenterObjectV(object);
        break;
      case "bottom":
        // TODO: 需要获取画布高度
        object.set("top", (editor.sketch?.height || 0) - object.getScaledHeight());
        break;
    }
    
    object.setCoords();
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!object) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">对齐画布</div>
      <div className="zine-align-grid">
        {alignItems.map((item) => (
          <button
            key={item.key}
            className="zine-align-btn"
            title={item.label}
            onClick={() => handleAlign(item.key)}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
