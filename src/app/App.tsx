import { useCallback, useDeferredValue, useMemo, useReducer } from "react";
import { ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CanvasWorkspace } from "@/features/editor/components/canvas-workspace";
import { LibrarySidebar } from "@/features/editor/components/library-sidebar";
import { ToolsSidebar } from "@/features/editor/components/tools-sidebar";
import { editorReducer, initialEditorState } from "@/features/editor/editor-reducer";
import { filesToLibraryImages } from "@/features/editor/lib/file";
import { type TemplateId } from "@/features/editor/types";
import { downloadPdf, downloadPng, downloadSvg } from "@/features/export/lib/exporters";
import { currentDimensions, renderTemplateSvg } from "@/features/templates/render-template";

export function App() {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const deferredState = useDeferredValue(state);
  const selectedCount = useMemo(
    () => state.images.reduce((count, image) => count + Number(image.selected), 0),
    [state.images],
  );
  const dimensions = useMemo(() => currentDimensions(deferredState.template), [deferredState.template]);
  const svgMarkup = useMemo(() => renderTemplateSvg(deferredState), [deferredState]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) {
      return;
    }

    const images = await filesToLibraryImages(fileList, state.nextImageId);
    dispatch({ type: "append-images", images });
  }, [state.nextImageId]);

  const handleDownloadPng = useCallback(async () => {
    try {
      await downloadPng(state);
    } catch (error) {
      console.error(error);
      window.alert("PNG 导出失败，请换一张图片或改用 SVG 导出。");
    }
  }, [state]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      await downloadPdf(state);
    } catch (error) {
      console.error(error);
      window.alert("PDF 导出失败，请刷新页面后重试。");
    }
  }, [state]);

  const handleDownloadSvg = useCallback(() => {
    downloadSvg(state);
  }, [state]);

  const handleSelectAll = useCallback(() => {
    dispatch({ type: "select-all-images" });
  }, []);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: "clear-selection" });
  }, []);

  const handleToggleImage = useCallback((imageId: number) => {
    dispatch({ type: "toggle-image", imageId });
  }, []);

  const handleTemplateChange = useCallback((template: TemplateId) => {
    dispatch({ type: "set-template", template });
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    dispatch({ type: "set-title", title });
  }, []);

  const handleMetaChange = useCallback((meta: string) => {
    dispatch({ type: "set-meta", meta });
  }, []);

  const handleBodyChange = useCallback((body: string) => {
    dispatch({ type: "set-body", body });
  }, []);

  const handleAccentChange = useCallback((accent: string) => {
    dispatch({ type: "set-accent", accent });
  }, []);

  const handleUploadChange = useCallback((files: FileList | null) => {
    void handleUpload(files);
  }, [handleUpload]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground xl:h-screen xl:overflow-hidden">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-950">
            <div className="h-4 w-4 rotate-45 border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <strong className="text-base font-bold tracking-tight">Zine Log</strong>
            <span className="text-xs text-slate-500">
              图文排版工具
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2" size="sm">
                <Download className="h-4 w-4" />
                导出
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
            >
              <DropdownMenuItem onClick={() => void handleDownloadPng()}>
                下载PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadSvg}>下载SVG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleDownloadPdf()}>
                下载PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 overflow-y-auto xl:min-h-0 xl:grid-cols-[18rem_minmax(0,1fr)_21.25rem] xl:overflow-hidden">
        <LibrarySidebar
          images={state.images}
          totalCount={state.images.length}
          selectedCount={selectedCount}
          onUpload={handleUploadChange}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onToggleImage={handleToggleImage}
        />

        <CanvasWorkspace
          svgMarkup={svgMarkup}
          width={dimensions.width}
          height={dimensions.height}
          accent={state.accent}
        />

        <ToolsSidebar
          template={state.template}
          title={state.title}
          meta={state.meta}
          body={state.body}
          accent={state.accent}
          onTemplateChange={handleTemplateChange}
          onTitleChange={handleTitleChange}
          onMetaChange={handleMetaChange}
          onBodyChange={handleBodyChange}
          onAccentChange={handleAccentChange}
        />
      </main>
    </div>
  );
}
