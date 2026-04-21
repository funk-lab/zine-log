import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./Editor.css";

import {
  currentDimensions,
  renderTemplateSvg,
} from "../templates/render-template";
import { editorReducer, initialEditorState } from "./editor-reducer";
import { filesToGalleryImages } from "./lib/file";
import {
  GalleryImage,
  TemplateId,
  type ImageEdit,
  DEFAULT_IMAGE_EDIT,
} from "./types";
import CanvasPanel from "./components/CanvasPanel";
import PhotoGallery from "./components/PhotoGallery";
import RightPanel from "./components/RightPanel";
import StatusBar from "./components/StatusBar";
import TopBar from "./components/TopBar";
import { EditSidebar } from "./components/EditSidebar";

import { DownloadDialog } from "../export/lib/components/DownloadDialog";
import { downloadAlbumPDF, downloadPdf } from "@/features/export/lib/exporters";

export const Editor: React.FC = () => {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const deferredState = useDeferredValue(state);
  const appRef = useRef<HTMLDivElement>(null);

  // EditSidebar 状态
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  );
  const [editState, setEditState] = useState<ImageEdit>(DEFAULT_IMAGE_EDIT);
  const [editsMap, setEditsMap] = useState<Map<number, ImageEdit>>(new Map());

  // 下载弹窗状态
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const dimensions = useMemo(() => currentDimensions(), []);
  const svgMarkup = useMemo(
    () => renderTemplateSvg(deferredState),
    [deferredState]
  );

  const handleUpload = useCallback(async (files: FileList | null) => {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) return;
    const images = await filesToGalleryImages(fileList);
    dispatch({ type: "append-images", images });
  }, []);

  const handleDownloadAlbum = useCallback(() => {
    downloadAlbumPDF(state.selected, {
      filename: "my-album.pdf",
      jpegQuality: 1,
      scaleFactor: 3,
    }).catch((error) => {
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
    [handleUpload]
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

  // EditSidebar 回调：双击 slot 打开侧边栏
  const handleSlotDoubleClick = useCallback(
    (index: number) => {
      setSelectedSlotIndex(index);
      const savedEdit = editsMap.get(index);
      setEditState(savedEdit ?? DEFAULT_IMAGE_EDIT);
    },
    [editsMap]
  );

  // 关闭侧边栏
  const handleCloseSidebar = useCallback(() => {
    setSelectedSlotIndex(null);
  }, []);

  // 应用编辑 - 更新本地状态并通过 reducer 更新全局
  const handleApplyEdit = useCallback(
    (newEdit: ImageEdit) => {
      if (selectedSlotIndex === null) return;

      // 更新本地编辑状态
      setEditState(newEdit);

      // 更新 editsMap
      setEditsMap((prev) => {
        const next = new Map(prev);
        next.set(selectedSlotIndex, newEdit);
        return next;
      });

      // 更新全局 selected 中的图片编辑状态
      const imageId = state.selected[selectedSlotIndex]?.id;
      if (imageId) {
        dispatch({ type: "update-image-edit", imageId, edit: newEdit });
      }
    },
    [selectedSlotIndex, state.selected]
  );

  // 重置当前编辑
  const handleReset = useCallback(() => {
    setEditState(DEFAULT_IMAGE_EDIT);
    if (selectedSlotIndex !== null) {
      setEditsMap((prev) => {
        const next = new Map(prev);
        next.set(selectedSlotIndex, DEFAULT_IMAGE_EDIT);
        return next;
      });
      // 同时重置全局状态
      const imageId = state.selected[selectedSlotIndex]?.id;
      if (imageId) {
        dispatch({
          type: "update-image-edit",
          imageId,
          edit: DEFAULT_IMAGE_EDIT,
        });
      }
    }
  }, [selectedSlotIndex, state.selected]);

  const selectedImage: GalleryImage | null = useMemo(() => {
    if (
      selectedSlotIndex === null ||
      selectedSlotIndex >= state.selected.length
    ) {
      return null;
    }
    return state.selected[selectedSlotIndex] ?? null;
  }, [selectedSlotIndex, state.selected]);

  return (
    <div id="app" ref={appRef}>
      {/* 顶部导航 */}
      <TopBar
        onFullscreen={handleFullscreen}
        onExport={() => setIsDownloadDialogOpen(true)}
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
          selected={state.selected}
          ringScale={state.ringScale}
          padding={state.padding}
          onSlotDoubleClick={handleSlotDoubleClick}
        />

        {/* 右侧：工具栏 */}
        <RightPanel
          accent={state.accent}
          padding={state.padding}
          onAccentChange={handleAccentChange}
          onPaddingChange={handlePaddingChange}
          onExport={() => setIsDownloadDialogOpen(true)}
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

      {/* 图片编辑侧边栏 */}
      <EditSidebar
        image={selectedImage}
        edit={editState}
        onClose={handleCloseSidebar}
        onApply={handleApplyEdit}
        onReset={handleReset}
      />

      {/* 下载弹窗 */}
      <DownloadDialog
        isOpen={isDownloadDialogOpen}
        onClose={() => setIsDownloadDialogOpen(false)}
        onDownload={handleDownloadAlbum}
      />
    </div>
  );
};

export default Editor;
