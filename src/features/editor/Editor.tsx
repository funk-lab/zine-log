import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useReducer,
  useRef,
} from "react";
import "./Editor.css";

import { downloadPdf, downloadPng } from "../export/lib/exporters";
import {
  currentDimensions,
  renderTemplateSvg,
} from "../templates/render-template";
import { editorReducer, initialEditorState } from "./editor-reducer";
import { filesToGalleryImages } from "./lib/file";
import { GalleryImage, TemplateId } from "./types";
import CanvasPanel from "./components/CanvasPanel";
import PhotoGallery from "./components/PhotoGallery";
import RightPanel from "./components/RightPanel";
import StatusBar from "./components/StatusBar";
import TopBar from "./components/TopBar";

export const Editor: React.FC = () => {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const deferredState = useDeferredValue(state);
  const appRef = useRef<HTMLDivElement>(null);

  const dimensions = useMemo(
    () => currentDimensions(deferredState.template),
    [deferredState.template],
  );
  const svgMarkup = useMemo(
    () => renderTemplateSvg(deferredState),
    [deferredState],
  );

  const handleUpload = useCallback(async (files: FileList | null) => {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) return;
    const images = await filesToGalleryImages(fileList);
    dispatch({ type: "append-images", images });
  }, []);

  const handleDownloadPng = useCallback(() => {
    downloadPng(state).catch((error) => {
      console.error(error);
      window.alert("PNG 导出失败，请换一张图片或改用 SVG 导出。");
    });
  }, [state]);

  const handleDownloadPdf = useCallback(() => {
    downloadPdf(state).catch((error) => {
      console.error(error);
      window.alert("PDF 导出失败，请刷新页面后重试。");
    });
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

  // TODO: ringScale 控制在 UI 中未实现，暂保留 reducer 支持
  // const handleRingScaleChange = useCallback((ringScale: number) => {
  //   dispatch({ type: "set-ring-scale", ringScale });
  // }, []);

  const handlePaddingChange = useCallback((padding: number) => {
    dispatch({ type: "set-padding", padding });
  }, []);

  const handleUploadChange = useCallback(
    (files: FileList | null) => {
      void handleUpload(files);
    },
    [handleUpload],
  );

  const handleFullscreen = useCallback(() => {
    try {
      const elem = appRef.current;
      if (!elem) return;

      if (!document.fullscreenElement) {
        void elem.requestFullscreen().catch((err: Error) => {
          console.error("全屏请求失败:", err);
          window.alert("无法进入全屏模式，请检查浏览器权限");
        });
      } else {
        void document.exitFullscreen().catch((err: Error) => {
          console.error("退出全屏失败:", err);
        });
      }
    } catch (error) {
      console.error("全屏操作出错:", error);
    }
  }, []);

  const handlePhotoDelete = useCallback((photoId: string) => {
    // 可选：在这里添加额外的删除后处理逻辑
    console.log("图片已删除:", photoId);
  }, []);

  return (
    <div id="app" ref={appRef}>
      {/* 顶部导航 */}
      <TopBar onFullscreen={handleFullscreen} onExport={handleDownloadPdf} />

      {/* 三栏主体 */}
      <div className="workspace">
        {/* 左侧：图库面板 */}
        <PhotoGallery
          unselectedPhotos={state.unselected}
          selectedPhotos={state.selected}
          onUnselectedChange={handleUnSelectChange}
          onSelectedChange={handleSelectChange}
          onUpload={handleUploadChange}
          onPhotoDelete={handlePhotoDelete}
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
          padding={state.padding}
          onAccentChange={handleAccentChange}
          onPaddingChange={handlePaddingChange}
          onExport={handleDownloadPng}
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
