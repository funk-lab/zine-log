import { useZineEditor } from "../index";

export default function Header() {
  const { canUndo, canRedo, handleUndo, handleRedo, editor } = useZineEditor();

  const handleExport = () => {
    if (!editor) return;
    const dataURL = editor.export2Img();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `zine-export-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="zine-topbar">
      {/* Logo */}
      <a className="zine-logo" href="#">
        <div className="zine-logo-icon">
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
        <div className="zine-logo-text">
          <div className="zine-logo-title">Zine Log</div>
          <div className="zine-logo-subtitle">图像编辑器</div>
        </div>
      </a>

      <div className="zine-breadcrumb">
        <span className="zine-breadcrumb-cur">图像编辑</span>
      </div>

      <div className="zine-topbar-sep"></div>

      {/* 历史记录 */}
      <div className="zine-history-group">
        <button
          className={`zine-history-btn ${!canUndo ? 'zine-history-btn-disabled' : ''}`}
          title="撤销 Ctrl+Z"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 7v6h6" />
            <path d="M3 13c1.3-3.6 4.8-6 9-6a10 10 0 0 1 9 9" />
          </svg>
        </button>
        <button
          className={`zine-history-btn ${!canRedo ? 'zine-history-btn-disabled' : ''}`}
          title="重做 Ctrl+Y"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 7v6h-6" />
            <path d="M21 13c-1.3-3.6-4.8-6-9-6a10 10 0 0 0-9 9" />
          </svg>
        </button>
      </div>

      <div className="zine-topbar-actions">
        <button
          className="zine-btn-icon"
          title="全屏预览"
          onClick={handleFullscreen}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        <div className="zine-topbar-sep"></div>
        <button className="zine-btn-export" onClick={handleExport}>
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
}
