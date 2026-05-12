import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FabricObject } from "fabric";
import { Spin } from "antd";
import Editor from "@/features/editor";
import { GlobalStateContext } from "@/features/context";
import { SKETCH_ID } from "@/features/utils/constants";
import { GalleryImage } from "@/features/components/PhotoGallery";

import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import Canvas from "./components/Canvas";
import RightPanel from "./components/RightPanel";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/panels.css";
import StatusBar from "./components/StatusBar";

export type ToolType =
  | "text"
  | "shape"
  | "brush"
  | "emoji"
  | "image"
  | "gallery"
  | "align"
  | "select";

export interface ZineEditorStateType {
  object: FabricObject | null | undefined;
  setActiveObject: (obj: FabricObject | null | undefined) => void;
  isReady: boolean;
  setReady: (ready: boolean) => void;
  editor: Editor | null;
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

// 创建 ZineEditorState Context
export const ZineEditorState = React.createContext<ZineEditorStateType>({
  object: null,
  setActiveObject: () => {},
  isReady: false,
  setReady: () => {},
  editor: null,
  currentTool: "image",
  setCurrentTool: () => {},
  zoom: 100,
  setZoom: () => {},
  canUndo: false,
  canRedo: false,
  handleUndo: () => {},
  handleRedo: () => {},
});

// Hook for using ZineEditorState
export const useZineEditor = () => {
  const context = React.useContext(ZineEditorState);
  if (!context) {
    throw new Error("useZineEditor must be used within ZineEditor");
  }
  return context;
};

export default function ZineEditor() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const workspaceEl = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeObject, setActiveObject] = useState<
    FabricObject | null | undefined
  >(null);
  const [isReady, setReady] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>("text");
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // 照片图库状态
  const [unselectedPhotos, setUnselectedPhotos] = useState<GalleryImage[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<GalleryImage[]>([]);

  const clickHandler = (opt: any) => {
    const { target } = opt;
    if (editor?.getIfPanEnable()) return;

    if (!target) {
      return;
    }

    if (opt.button === 3) {
      if (target.id !== SKETCH_ID) {
        editor?.canvas.setActiveObject(target);
      }
    }
  };

  const selectionHandler = (opt: any) => {
    const { selected, sketch } = opt;
    if (selected && selected.length) {
      const selection = editor?.canvas.getActiveObject();
      setActiveObject(selection);
    } else {
      setActiveObject(sketch as FabricObject);
    }
  };

  const initEvent = () => {
    if (!editor) return;
    editor.canvas.on("selection:created", selectionHandler);
    editor.canvas.on("selection:updated", selectionHandler);
    editor.canvas.on("selection:cleared", selectionHandler);
    editor.canvas.on("mouse:down", clickHandler);

    // 历史记录事件监听
    // @ts-ignore
    editor.canvas.on("fabritor:history:undo", () => {
      setCanUndo(editor.fhistory.canUndo());
      setCanRedo(editor.fhistory.canRedo());
    });

    // @ts-ignore
    editor.canvas.on("fabritor:history:redo", () => {
      setCanUndo(editor.fhistory.canUndo());
      setCanRedo(editor.fhistory.canRedo());
    });

    // @ts-ignore
    editor.canvas.on("fabritor:history:changed", () => {
      setCanUndo(editor.fhistory.canUndo());
      setCanRedo(editor.fhistory.canRedo());
    });
  };

  const handleUndo = () => {
    editor?.fhistory.undo();
  };

  const handleRedo = () => {
    editor?.fhistory.redo();
  };

  const initEditor = async () => {
    if (!canvasEl.current || !workspaceEl.current) {
      return;
    }
    const _editor = new Editor({
      canvasEl: canvasEl.current,
      workspaceEl: workspaceEl.current,
      sketchEventHandler: {
        groupHandler: () => {
          setActiveObject(_editor.canvas.getActiveObject());
        },
      },
      template: { width: 700, height: 700 },
    });

    await _editor.init();
    setEditor(_editor);
    setReady(true);
    setActiveObject(_editor.sketch);
    // Editor 初始化后立即初始化事件并设置历史状态
    initEvent();
    setCanUndo(_editor.fhistory.canUndo());
    setCanRedo(_editor.fhistory.canRedo());
  };

  // 确保 editor 挂载后事件已注册
  useEffect(() => {
    if (editor) {
      initEvent();
    }
  }, [editor]);

  useEffect(() => {
    initEditor();
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  // 根据工具类型获取状态栏显示文本
  const getToolStatusText = () => {
    const toolNames: Record<ToolType, string> = {
      text: "文字",
      shape: "形状",
      brush: "画笔",
      emoji: "表情",
      image: "图片",
      gallery: "图册",
      align: "对齐",
      select: "选择",
    };
    return toolNames[currentTool] || "选择";
  };

  return (
      <GlobalStateContext.Provider
        value={useMemo(
          () => ({
            object: activeObject,
            setActiveObject,
            isReady,
            setReady,
            editor,
            unselectedPhotos,
            selectedPhotos,
            setUnselectedPhotos,
            setSelectedPhotos,
          }),
          [activeObject, isReady, editor, unselectedPhotos, selectedPhotos]
        )}
      >
      <ZineEditorState.Provider
        value={{
          object: activeObject,
          setActiveObject,
          isReady,
          setReady,
          editor,
          currentTool,
          setCurrentTool,
          zoom,
          setZoom,
          canUndo,
          canRedo,
          handleUndo,
          handleRedo,
        }}
      >
        <div className="zine-editor">
          <Spin spinning={!isReady} fullscreen />
          <Header />

          <div className="zine-workspace">
            <LeftSidebar />
            <Canvas canvasEl={canvasEl} workspaceEl={workspaceEl} />

            <RightPanel />
          </div>

          <StatusBar toolText={getToolStatusText()} zoom={zoom} />
        </div>
      </ZineEditorState.Provider>
    </GlobalStateContext.Provider>
  );
}
