import { useZineEditor, ToolType } from "../index";

const tools: { id: ToolType; label: string; tip: string; icon: React.ReactNode }[] = [
  {
    id: "text",
    label: "文字",
    tip: "插入文字 T",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7"/>
        <line x1="9" y1="20" x2="15" y2="20"/>
        <line x1="12" y1="4" x2="12" y2="20"/>
      </svg>
    ),
  },
  {
    id: "shape",
    label: "形状",
    tip: "形状 S",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
      </svg>
    ),
  },
  {
    id: "brush",
    label: "画笔",
    tip: "画笔 B",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17c0-1.1.9-2 2-2h.5c.3 0 .5-.2.5-.5v-1c0-.3.2-.5.5-.5.8 0 2.5.5 2.5 3.5 0 1.5-1 2.5-2.5 2.5C4.1 19 3 18.1 3 17z"/>
        <path d="M8 16l10.5-10.5a1.5 1.5 0 0 1 2.1 2.1L10 18"/>
      </svg>
    ),
  },
  {
    id: "emoji",
    label: "表情",
    tip: "表情包 E",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
];

export default function Toolbar() {
  const { currentTool, setCurrentTool, editor } = useZineEditor();

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
    <div className="zine-toolbar-left">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`zine-tool-btn ${currentTool === tool.id ? "active" : ""}`}
          data-tip={tool.tip}
          onClick={() => handleToolClick(tool.id)}
        >
          {tool.icon}
          <span>{tool.label}</span>
        </button>
      ))}

      <div className="zine-tool-divider"></div>

      {/* 对齐按钮 */}
      <button
        className={`zine-tool-btn ${currentTool === "align" ? "active" : ""}`}
        data-tip="对齐分布"
        onClick={() => handleToolClick("align")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>对齐</span>
      </button>
    </div>
  );
}

import * as React from "react";
