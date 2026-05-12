import { useZineEditor } from "../index";
import { SKETCH_ID } from "@/features/utils/constants";
import { useEffect } from "react";

interface CanvasProps {
  canvasEl?: React.RefObject<HTMLCanvasElement | null>;
  workspaceEl?: React.RefObject<HTMLDivElement | null>;
}

export default function Canvas({ canvasEl, workspaceEl }: CanvasProps) {
  const { object, zoom, setZoom, editor } = useZineEditor();

  // 同步 Fabric zoom 到 UI
  useEffect(() => {
    if (!editor?.canvas) return undefined;
    const handleZoomChanged = (opt: any) => {
      setZoom(opt.zoom);
    };
    // @ts-ignore
    editor.canvas.on("fabritor:zoom:changed", handleZoomChanged);
    return () => {
      // @ts-ignore
      editor.canvas.off("fabritor:zoom:changed", handleZoomChanged);
    };
  }, [editor, setZoom]);

  const handleZoomChange = (delta: number) => {
    const newZoom = Math.min(200, Math.max(30, zoom + delta));
    setZoom(newZoom);
    if (editor) {
      editor.setZoom(newZoom);
    }
  };

  const getSelectedInfo = () => {
    if (!object) return "未选择";
    const type = object.get?.("type") || "";
    const id = object.id;

    if (id === SKETCH_ID) return "画布";

    const typeNames: Record<string, string> = {
      textbox: "文字图层",
      "f-text": "文字图层",
      rect: "矩形",
      circle: "圆形",
      triangle: "三角形",
      polygon: "多边形",
      ellipse: "椭圆",
      "f-line": "线条",
      "f-arrow": "箭头",
      "f-tri-arrow": "三角箭头",
      "f-image": "图片",
      image: "图片",
      path: "路径",
      group: "组合",
      activeSelection: "多选",
    };

    return typeNames[type] || "对象";
  };

  return (
    <main className="zine-panel-center">
      {/* 画布控制栏 */}
      <div className="zine-canvas-topbar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--zine-text-muted)",
          }}
        >
          <span
            style={{ fontWeight: 500, color: "var(--zine-text-secondary)" }}
          >
            {getSelectedInfo()}{" "}
            {object && object.id !== SKETCH_ID ? "已选中" : ""}
          </span>
        </div>

        <div className="zine-zoom-ctrl">
          <button
            className="zine-zoom-btn"
            onClick={() => handleZoomChange(-10)}
          >
            −
          </button>
          <span
            className="zine-zoom-val"
            onClick={() => {
              setZoom(100);
            }}
            style={{ cursor: "pointer" }}
            title="点击重置为 100%"
          >
            {zoom}%
          </span>
          <button
            className="zine-zoom-btn"
            onClick={() => handleZoomChange(10)}
          >
            +
          </button>
        </div>
      </div>

      {/* 画布视口 */}
      <div className="zine-canvas-viewport">
        <div className="zine-canvas-guide"></div>
        <div className="zine-canvas-wrap" id="canvasWrap">
          <div className="zine-canvas-paper">
            <div ref={workspaceEl} className="zine-fabric-workspace">
              <canvas ref={canvasEl} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
