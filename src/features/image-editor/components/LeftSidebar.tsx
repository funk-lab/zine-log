import { useState } from "react";
import { useZineEditor, ToolType } from "../index";
import ShapePicker from "./left-panels/ShapePicker";
import TextTemplate from "./left-panels/TextTemplate";
import EmojiPicker from "./left-panels/EmojiPicker";
import BrushSettings from "./left-panels/BrushSettings";
import ImagePicker from "./left-panels/ImagePicker";
import PhotoGallery from "@/features/components/PhotoGallery";

export default function LeftSidebar() {
  const { currentTool, setCurrentTool, editor } = useZineEditor();
  const [panEnable, setPanEnable] = useState(false);

  const enablePan = () => {
    if (editor) {
      const enable = editor.switchEnablePan();
      setPanEnable(enable);
    }
  };

  // 判断是否为"创建工具"（需要显示面板的工具）
  const isCreationTool = (tool: ToolType): boolean => {
    return ["text", "shape", "brush", "emoji", "image", "gallery"].includes(tool);
  };

  // 根据当前工具获取面板内容
  const getPanelContent = () => {
    switch (currentTool) {
      case "text":
        return <TextTemplate />;
      case "shape":
        return <ShapePicker />;
      case "brush":
        return <BrushSettings />;
      case "emoji":
        return <EmojiPicker />;
      case "image":
        return <ImagePicker />;
      case "gallery":
        return <PhotoGallery />;
      default:
        return null;
    }
  };

  const panelContent = getPanelContent();
  const showPanel = isCreationTool(currentTool);

  // 处理工具点击
  const handleToolClick = (toolId: ToolType) => {
    setCurrentTool(toolId);

    // 处理画笔模式的特殊逻辑
    if (editor?.canvas) {
      if (toolId === "brush") {
        editor.canvas.isDrawingMode = true;
      } else {
        editor.canvas.isDrawingMode = false;
      }
    }
  };

  return (
    <div className={`zine-left-sidebar ${showPanel ? "expanded" : ""}`}>
      {/* 工具栏（始终显示） */}
      <div className="zine-sidebar-tools">
        <button
          className={`zine-sidebar-tool ${!panEnable ? "active" : ""}`}
          onClick={() => {
            if (panEnable) enablePan();
          }}
          title="选择"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
        </button>

        <button
          className={`zine-sidebar-tool ${panEnable ? "active" : ""}`}
          onClick={() => {
            if (!panEnable) enablePan();
          }}
          title="平移"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </button>
        {/* 图册按钮 */}
        <button
          className={`zine-sidebar-tool ${
            currentTool === "gallery" ? "active" : ""
          }`}
          onClick={() => handleToolClick("gallery")}
          title="图册"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        {/* 分隔线 */}
        <div className="zine-sidebar-divider" />

        <button
          className={`zine-sidebar-tool ${
            currentTool === "image" ? "active" : ""
          }`}
          onClick={() => handleToolClick("image")}
          title="图片"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <button
          className={`zine-sidebar-tool ${
            currentTool === "text" ? "active" : ""
          }`}
          onClick={() => handleToolClick("text")}
          title="文字"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>

        <button
          className={`zine-sidebar-tool ${
            currentTool === "shape" ? "active" : ""
          }`}
          onClick={() => handleToolClick("shape")}
          title="形状"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          </svg>
        </button>

        <button
          className={`zine-sidebar-tool ${
            currentTool === "brush" ? "active" : ""
          }`}
          onClick={() => handleToolClick("brush")}
          title="画笔"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 17c0-1.1.9-2 2-2h.5c.3 0 .5-.2.5-.5v-1c0-.3.2-.5.5-.5.8 0 2.5.5 2.5 3.5 0 1.5-1 2.5-2.5 2.5C4.1 19 3 18.1 3 17z" />
            <path d="M8 16l10.5-10.5a1.5 1.5 0 0 1 2.1 2.1L10 18" />
          </svg>
        </button>

        <button
          className={`zine-sidebar-tool ${
            currentTool === "emoji" ? "active" : ""
          }`}
          onClick={() => handleToolClick("emoji")}
          title="表情包"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>
      </div>

      {/* 面板区域 - 始终显示 */}
      <div className="zine-sidebar-panel">
        {showPanel ? (
          panelContent
        ) : (
          <div className="zine-left-panel-empty">
            <span>选择工具</span>
          </div>
        )}
      </div>
    </div>
  );
}
