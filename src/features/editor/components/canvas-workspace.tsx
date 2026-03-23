import { Suspense, lazy, memo, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface CanvasWorkspaceProps {
  svgMarkup: string;
  width: number;
  height: number;
  accent: string;
}

const STAGE_PADDING = 48;
type ActiveTab = "canvas" | "preview";
const Preview3D = lazy(async () =>
  import("@/features/preview3d/components/preview-3d").then((module) => ({
    default: module.Preview3D,
  })),
);

function CanvasWorkspaceComponent({
  svgMarkup,
  width,
  height,
  accent,
}: CanvasWorkspaceProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("canvas");
  const [fitScale, setFitScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (activeTab !== "canvas") {
      return;
    }

    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const updateFitScale = () => {
      const availableWidth = Math.max(element.clientWidth - STAGE_PADDING, 240);
      const availableHeight = Math.max(element.clientHeight - STAGE_PADDING, 240);
      const nextFitScale = Math.min(availableWidth / width, availableHeight / height);
      setFitScale(Math.max(0.2, nextFitScale));
    };

    updateFitScale();
    const frameId = window.requestAnimationFrame(() => {
      updateFitScale();
    });

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateFitScale);
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", updateFitScale);
      };
    }

    const observer = new ResizeObserver(() => {
      updateFitScale();
    });

    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [activeTab, height, width]);

  const currentScale = fitScale * zoomLevel;
  const zoomLabel = `${Math.round(zoomLevel * 100)}%`;
  const scaledCanvasStyle = useMemo(
    () => ({
      width: `${width * currentScale}px`,
      height: `${height * currentScale}px`,
    }),
    [currentScale, height, width],
  );

  const zoomOut = () => {
    setZoomLevel((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))));
  };

  const zoomIn = () => {
    setZoomLevel((value) => Math.min(2.5, Number((value + 0.1).toFixed(2))));
  };

  return (
    <section className="flex min-w-0 flex-col bg-slate-50 xl:min-h-0">
      <div className="flex h-12 items-center justify-between gap-4 border-b bg-white/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={[
              "inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition",
              activeTab === "canvas"
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
            ].join(" ")}
            onClick={() => setActiveTab("canvas")}
          >
            画布
          </button>
          <button
            type="button"
            className={[
              "inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition",
              activeTab === "preview"
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
            ].join(" ")}
            onClick={() => setActiveTab("preview")}
          >
            预览
          </button>
        </div>
      </div>

      <div className="relative p-4 sm:p-6 xl:min-h-0 xl:flex-1">
        {activeTab === "canvas" ? (
          <>
            <div className="pointer-events-none absolute right-4 top-4 z-10 sm:right-6 sm:top-6 xl:right-8 xl:top-8">
              <div className="pointer-events-auto flex items-center gap-1 rounded-xl border bg-white/92 p-1 shadow-sm backdrop-blur">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={zoomOut}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 min-w-14 items-center justify-center rounded-lg px-2 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setZoomLevel(1)}
                >
                  {zoomLabel}
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={zoomIn}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="h-full overflow-auto scrollbar-thin"
            >
              <div className="mx-auto flex min-h-full min-w-fit items-center justify-center">
                <div
                  className="overflow-hidden bg-white shadow-canvas transition-[width,height] duration-150"
                  style={scaledCanvasStyle}
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              </div>
            </div>
          </>
        ) : (
          <Suspense fallback={<div className="grid h-full place-items-center rounded-[28px] border border-slate-200 bg-white text-sm text-slate-500">正在载入 3D 预览…</div>}>
            <Preview3D svgMarkup={svgMarkup} width={width} height={height} accent={accent} />
          </Suspense>
        )}
      </div>
    </section>
  );
}

export const CanvasWorkspace = memo(CanvasWorkspaceComponent);
