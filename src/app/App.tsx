import { useReducer } from "react";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATE_META } from "@/features/editor/constants";
import { CanvasWorkspace } from "@/features/editor/components/canvas-workspace";
import { LibrarySidebar } from "@/features/editor/components/library-sidebar";
import { ToolsSidebar } from "@/features/editor/components/tools-sidebar";
import { editorReducer, initialEditorState } from "@/features/editor/editor-reducer";
import { filesToLibraryImages } from "@/features/editor/lib/file";
import { getSelectedImages, type TemplateId } from "@/features/editor/types";
import { downloadPdf, downloadPng, downloadSvg } from "@/features/export/lib/exporters";
import { currentDimensions, renderTemplateSvg } from "@/features/templates/render-template";

export function App() {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const selectedImages = getSelectedImages(state);
  const dimensions = currentDimensions(state.template);
  const templateMeta = TEMPLATE_META[state.template];
  const svgMarkup = renderTemplateSvg(state);

  async function handleUpload(files: FileList | null) {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) {
      return;
    }

    const images = await filesToLibraryImages(fileList, state.nextImageId);
    dispatch({ type: "append-images", images });
  }

  async function handleDownloadPng() {
    try {
      await downloadPng(state);
    } catch (error) {
      console.error(error);
      window.alert("PNG 导出失败，请换一张图片或改用 SVG 导出。");
    }
  }

  async function handleDownloadPdf() {
    try {
      await downloadPdf(state);
    } catch (error) {
      console.error(error);
      window.alert("PDF 导出失败，请刷新页面后重试。");
    }
  }

  function handleDownloadSvg() {
    downloadSvg(state);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-950">
            <div className="h-4 w-4 rotate-45 border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <strong className="text-base font-bold tracking-tight">Zine Log</strong>
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Photo Zine Editor
            </span>
          </div>
          <Badge className="ml-2" variant="secondary">
            Beta
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 md:block">
            Project: <strong className="font-medium text-slate-900">React Refactor</strong>
          </span>
          <Button className="gap-2" onClick={() => void handleDownloadPng()}>
            <Download className="h-4 w-4" />
            Export &amp; Download
          </Button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)_21.25rem]">
        <LibrarySidebar
          images={state.images}
          totalCount={state.images.length}
          selectedCount={selectedImages.length}
          onUpload={(files) => {
            void handleUpload(files);
          }}
          onSelectAll={() => dispatch({ type: "select-all-images" })}
          onClearSelection={() => dispatch({ type: "clear-selection" })}
          onToggleImage={(imageId) => dispatch({ type: "toggle-image", imageId })}
        />

        <CanvasWorkspace
          svgMarkup={svgMarkup}
          aspectRatio={`${dimensions.width} / ${dimensions.height}`}
          selectedCount={selectedImages.length}
          templateMeta={templateMeta}
          templateName={templateMeta.name}
          templateButtons={Object.entries(TEMPLATE_META).map(([template, meta]) => (
            <button
              key={template}
              type="button"
              className={[
                "rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                template === state.template
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-900",
              ].join(" ")}
              onClick={() => dispatch({ type: "set-template", template: template as TemplateId })}
            >
              {meta.name}
            </button>
          ))}
        />

        <ToolsSidebar
          state={state}
          onTemplateChange={(template) => dispatch({ type: "set-template", template })}
          onTitleChange={(title) => dispatch({ type: "set-title", title })}
          onMetaChange={(meta) => dispatch({ type: "set-meta", meta })}
          onBodyChange={(body) => dispatch({ type: "set-body", body })}
          onAccentChange={(accent) => dispatch({ type: "set-accent", accent })}
          onRingScaleChange={(ringScale) => dispatch({ type: "set-ring-scale", ringScale })}
          onFillExample={() => dispatch({ type: "fill-example" })}
          onDownloadPng={() => {
            void handleDownloadPng();
          }}
          onDownloadSvg={handleDownloadSvg}
          onDownloadPdf={() => {
            void handleDownloadPdf();
          }}
        />
      </main>
    </div>
  );
}
