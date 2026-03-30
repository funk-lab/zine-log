import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useReducer,
} from "react";
import "./Editor.css";

import { downloadPng, downloadPdf, downloadSvg } from "../export/lib/exporters";
import {
  currentDimensions,
  renderTemplateSvg,
} from "../templates/render-template";
import { editorReducer, initialEditorState } from "./editor-reducer";
import { filesToLibraryImages } from "./lib/file";
import { GalleryImage, TemplateId } from "./types";
import CanvasPanel from "./components/CanvasPanel";
import PhotoGallery from "./components/PhotoGallery";
import RightPanel from "./components/RightPanel";
import StatusBar from "./components/StatusBar";
import TopBar from "./components/TopBar";

interface EditorProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onFullscreen?: () => void;
  onExport?: () => void;
  onSaveDraft?: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  onUndo,
  onRedo,
  onFullscreen,
  onExport,
  onSaveDraft,
}) => {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const deferredState = useDeferredValue(state);

  const dimensions = useMemo(
    () => currentDimensions(deferredState.template),
    [deferredState.template]
  );
  const svgMarkup = useMemo(
    () => renderTemplateSvg(deferredState),
    [deferredState]
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      const fileList = Array.from(files ?? []);
      if (!fileList.length) return;
      const images = await filesToLibraryImages(fileList, state.nextImageId);
      dispatch({ type: "append-images", images });
    },
    [state.nextImageId]
  );

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

  const handleSelectChange = useCallback((images: GalleryImage[]) => {
    dispatch({ type: "set-selected", images });
  }, []);

  const handleUnSelectChange = useCallback((images: GalleryImage[]) => {
    dispatch({ type: "set-unselected", images });
  }, []);

  const handleTemplateChange = useCallback((template: TemplateId) => {
    dispatch({ type: "set-template", template });
  }, []);

  const handleAccentChange = useCallback((accent: string) => {
    dispatch({ type: "set-accent", accent });
  }, []);

  const handleRingScaleChange = useCallback((ringScale: number) => {
    dispatch({ type: "set-ring-scale", ringScale });
  }, []);

  const handlePaddingChange = useCallback((padding: number) => {
    dispatch({ type: "set-padding", padding });
  }, []);

  const handleUploadChange = useCallback(
    (files: FileList | null) => {
      void handleUpload(files);
    },
    [handleUpload]
  );

  return (
    <div id="app">
      {/* 顶部导航 */}
      <TopBar
        onUndo={onUndo}
        onRedo={onRedo}
        onFullscreen={onFullscreen}
        onExport={onExport}
      />

      {/* 三栏主体 */}
      <div className="workspace">
        {/* 左侧：图库面板 */}
        <PhotoGallery
          unselectedPhotos={state.unselected}
          selectedPhotos={state.selected}
          onUnselectedChange={handleUnSelectChange}
          onSelectedChange={handleSelectChange}
          onUpload={handleUploadChange}
        />

        {/* 中间：画布 */}
        <CanvasPanel
          template={state.template}
          onTemplateChange={handleTemplateChange}
          accent={state.accent}
          svgMarkup={svgMarkup}
          width={dimensions.width}
          height={dimensions.height}
        />

        {/* 右侧：工具栏 */}
        <RightPanel
          accent={state.accent}
          ringScale={state.ringScale}
          padding={state.padding}
          onAccentChange={handleAccentChange}
          onRingScaleChange={handleRingScaleChange}
          onPaddingChange={handlePaddingChange}
          onSaveDraft={onSaveDraft}
          onExport={onExport}
        />
      </div>

      {/* 底部状态栏 */}
      <StatusBar
        totalImages={state.unselected.length + state.selected.length}
        selectedCount={state.selected.length}
        canvasRatio="3:4"
        templateName={state.template}
        autoSaved={true}
      />
    </div>
  );
};

export default Editor;
