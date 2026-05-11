// TopBar 组件 - 顶部导航栏
import React from "react";

interface TopBarProps {
  /** TODO: 实现撤销功能 */
  onUndo?: () => void;
  /** TODO: 实现重做功能 */
  onRedo?: () => void;
  onFullscreen?: () => void;
  onExport?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFullscreen, onExport }) => {
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
        {/* <button className="btn-icon" title="撤销" onClick={onUndo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/><path d="M3 13c1.3-3.6 4.8-6 9-6a10 10 0 0 1 9 9"/>
          </svg>
        </button>
        <button className="btn-icon" title="重做" onClick={onRedo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/><path d="M21 13c-1.3-3.6-4.8-6-9-6a10 10 0 0 0-9 9"/>
          </svg>
        </button> */}
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
