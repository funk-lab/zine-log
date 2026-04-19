// CanvasPanel 组件 - 中间画布区
import { Preview3D } from "@/features/preview3d/components/preview-3d";
import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { TemplateId, GalleryImage } from "../types";
import { Minus, Plus } from "lucide-react";
import PhotoRing from "@/features/templates/components/PhotoRing";

// 模板定义
export interface Template {
  id: TemplateId;
  name: string;
  svg: React.ReactNode;
}

const templates: Template[] = [
  {
    id: "tight-ring",
    name: "紧密螺旋",
    svg: <svg className="tpl-svg" viewBox="0 0 40 40" fill="none" />,
  },
  {
    id: "loose-ring",
    name: "舒展螺旋",
    svg: <svg className="tpl-svg" viewBox="0 0 40 40" fill="none" />,
  },
];

interface CanvasPanelProps {
  template?: TemplateId;
  onTemplateChange?: (templateId: TemplateId) => void;
  svgMarkup: string;
  accent?: string;
  width: number;
  height: number;
  // DOM 渲染器需要的配置
  selected: GalleryImage[];
  ringScale: number;
  padding: number;
  // 双击 slot 回调
  onSlotDoubleClick?: (index: number) => void;
}

const STAGE_PADDING = 56;
const MIN_ZOOM = 0.2; // 20%
const MAX_ZOOM = 1.5; // 150%
const ZOOM_STEP = 0.1; // 每次 10%

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  template,
  onTemplateChange,
  svgMarkup,
  width,
  height,
  accent = "#D4B896",
  selected,
  ringScale,
  padding,
  onSlotDoubleClick,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  // 一级遮罩：首次进入显示模板选择，选完后隐藏
  const [showOverlay, setShowOverlay] = useState(true);

  // 计算画布的显示尺寸（基于容器初始尺寸，一次性计算）
  const displaySize = useMemo(() => {
    const container = viewportRef.current;
    if (!container) {
      return { displayWidth: width, displayHeight: height };
    }

    const containerWidth = container.clientWidth - STAGE_PADDING * 2;
    const containerHeight = container.clientHeight - STAGE_PADDING * 2;

    // 按宽度计算
    const byWidth = {
      displayWidth: containerWidth,
      displayHeight: (containerWidth * height) / width,
    };

    // 按高度计算
    const byHeight = {
      displayWidth: (containerHeight * width) / height,
      displayHeight: containerHeight,
    };

    // 选择不会超出容器的尺寸
    if (byWidth.displayHeight <= containerHeight) {
      return byWidth;
    }
    return byHeight;
  }, [width, height]); // 只在画布尺寸变化时重新计算

  // 适合窗口：重置缩放
  const fitToWindow = useCallback(() => {
    setZoom(1);
  }, []);

  const zoomLabel = `${Math.round(zoom * 100)}%`;

  // 缩放控制
  const handleZoom = useCallback((direction: 1 | -1) => {
    setZoom((prev) => {
      const next = Math.round((prev + direction * ZOOM_STEP) * 100) / 100;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  }, []);

  // 选择模板并关闭遮罩
  const handleSelectTemplate = useCallback(
    (id: TemplateId) => {
      onTemplateChange?.(id);
      setShowOverlay(false);
    },
    [onTemplateChange]
  );

  return (
    <main className="panel-center">
      {/* 画布视口 */}
      <div className="canvas-viewport">
        {/* ── 一级遮罩：模板选择页 ── */}
        {showOverlay && (
          <div className="tpl-overlay">
            <div className="tpl-overlay-inner">
              <p className="tpl-overlay-title">选择相册模板</p>
              <p className="tpl-overlay-sub">选定后可在右侧随时更换</p>
              <div className="tpl-overlay-grid">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`tpl-overlay-card${
                      template === t.id ? " active" : ""
                    }`}
                    onClick={() => handleSelectTemplate(t.id)}
                  >
                    <div className="tpl-overlay-thumb">{t.svg}</div>
                    <span className="tpl-overlay-name">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="canvas-guide" />
        {mode === "edit" && (
          <>
            {/* 缩放控制 */}
            <div className="pointer-events-none absolute right-4 top-4 z-10 sm:right-6 sm:top-6 xl:right-8 xl:top-8">
              <div className="pointer-events-auto flex items-center gap-1 rounded-xl border bg-white/92 p-1 shadow-sm backdrop-blur">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => handleZoom(-1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-8 min-w-14 items-center justify-center rounded-lg px-2 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={fitToWindow}
                >
                  {zoomLabel}
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => handleZoom(1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
        {/* 换模板按钮（遮罩关闭后显示） */}
        {!showOverlay && (
          <button
            type="button"
            className="tpl-back-btn"
            onClick={() => setShowOverlay(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            换模板
          </button>
        )}

        <div className="canvas-mode-switcher">
          <button
            className={`cv-mode-btn ${mode === "edit" ? "active" : ""}`}
            onClick={() => setMode("edit")}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑
          </button>
          <button
            className={`cv-mode-btn ${mode === "preview" ? "active" : ""}`}
            onClick={() => setMode("preview")}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            预览
          </button>
        </div>

        <div className="relative min-h-0 flex-1 flex flex-col">
          {mode === "edit" ? (
            <>
              {/* 画布区域 - DOM 渲染器 (PhotoRing) */}
              {/* 使用 overflow-auto 允许缩放后滚动查看 */}
              <div
                ref={viewportRef}
                className="h-full w-full overflow-auto scrollbar-thin"
              >
                {/* 内容区域：根据 zoom 缩放 */}
                <div className="min-h-full min-w-full flex items-center justify-center p-4">
                  <PhotoRing
                    count={selected.length || 1}
                    gap={template === "loose-ring" ? 2 : 1}
                    scale={ringScale}
                    displayZoom={zoom}
                    width={displaySize.displayWidth}
                    height={displaySize.displayHeight}
                    backgroundColor={accent}
                    images={selected}
                    padding={padding}
                    className="transition-all duration-150"
                    onSlotDoubleClick={onSlotDoubleClick}
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              ref={viewportRef}
              className="h-full w-full flex items-center justify-center"
            >
              <div
                style={{
                  width: displaySize.displayWidth,
                  height: displaySize.displayHeight,
                }}
              >
                <Suspense
                  fallback={
                    <div className="grid h-full place-items-center rounded-[28px] border border-slate-200 bg-white text-sm text-slate-500">
                      正在载入 3D 预览…
                    </div>
                  }
                >
                  <Preview3D
                    svgMarkup={svgMarkup}
                    width={width}
                    height={height}
                    accent={accent}
                    count={selected.length}
                    gap={template === "loose-ring" ? 2 : 1}
                    scale={ringScale}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CanvasPanel;
