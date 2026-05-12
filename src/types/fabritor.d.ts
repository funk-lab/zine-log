/**
 * Fabritor 自定义类型定义
 * - 编辑器配置接口
 * - 自定义属性扩展 (挂载到 fabric.Object 等)
 * 
 * 注意: fabric.js v6 已有官方 TypeScript 类型支持，
 * 此文件仅保留 fabritor 特有的类型定义
 */

import { fabric } from 'fabric';

// ─── Editor Options ──────────────────────────────────────────────────────────

export interface IEditorOptions {
  canvasEl: HTMLCanvasElement;
  workspaceEl: HTMLDivElement;
  template?: {
    width?: number;
    height?: number;
  };
  sketchEventHandler?: {
    groupHandler?: () => void;
  };
}

// ─── Arrow Info ───────────────────────────────────────────────────────────────

export interface IArrowInfo {
  left: number;
  top: number;
  bottom: number;
  strokeWidth: number;
}

// ─── Image Border ─────────────────────────────────────────────────────────────

export interface IImageBorder {
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  strokeDashArray?: number[] | null;
}

// ─── Fabric Object Custom Properties ───────────────────────────────────────────

declare module 'fabric' {
  // 扩展 fabric.Object 添加 fabritor 自定义属性
  interface Object {
    /** Unique identifier – used to identify the sketch rect (SKETCH_ID) and custom objects */
    id?: string;
    /** Human-readable description, stored in JSON  */
    fabritor_desc?: string;
    /** Sub-type for shapes (e.g. 'triangle', 'ellipse') */
    sub_type?: string;
    /** Original image source URL for FImage objects */
    imageSource?: string;
    /** Border config for FImage objects */
    imageBorder?: IImageBorder;
    /** Arrow geometry cache for FArrow/FTriArrow */
    oldArrowInfo?: IArrowInfo;
  }

  // 扩展 fabric.Line 添加自定义坐标属性
  interface Line {
    /** Custom line start/end coordinates used by FLine/FArrow/FTriArrow */
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  // 扩展 fabric 命名空间添加 controlsUtils（运行时存在但类型未导出）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsUtils: any;

  // 扩展 fabric.Canvas 添加内部属性 (用于 guide-lines)
  interface Canvas {
    /**
     * Upper canvas context for selection rendering.
     * May be null if the upper canvas hasn't been initialized yet.
     */
    contextTop: CanvasRenderingContext2D | null;
    /** Get the upper canvas context, creates one if needed */
    getSelectionContext(): CanvasRenderingContext2D;
    /** Clear the given canvas context */
    clearContext(ctx: CanvasRenderingContext2D): void;
    /**
     * Internal transform state during object manipulation.
     * Not part of public API but used by guide-lines for snap detection.
     */
    _currentTransform: fabric.Transform | null;
  }
}
