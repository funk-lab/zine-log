// TopBar 组件 - 顶部导航栏
import React from "react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onFullscreen?: () => void;
  onExport?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFullscreen, onExport }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <a className="logo" href="#">
        <div className="logo-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="logo-text">
          <div className="logo-title">Zine Log</div>
          <div className="logo-subtitle">图文排版工具</div>
        </div>
      </a>

      <div className="topbar-actions">
        <button
          className="btn-icon"
          title="图片编辑器"
          onClick={() => void navigate("/image-editor")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--clr-border)",
            margin: "0 4px",
          }}
        />
        <button className="btn-icon" title="全屏" onClick={onFullscreen}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--clr-border)",
            margin: "0 4px",
          }}
        />
        <button className="btn-export" onClick={onExport}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导出作品
        </button>
      </div>
    </header>
  );
};

export default TopBar;
