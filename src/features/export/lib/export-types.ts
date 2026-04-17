// 导出功能相关类型定义

/** 适配模式 */
export type FitMode = 'cover' | 'contain' | 'fill';

/** 旋转角度（仅支持 90° 整数倍） */
export type RotateDeg = 0 | 90 | 180 | 270;

// ── 布局配置 ────────────────────────────────────────────────────────────────

export interface PageSize {
  width: number;   // pt
  height: number;  // pt
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Gutter {
  h: number;   // 水平间距
  v: number;   // 垂直间距
}

export interface GridDef {
  columns: number;
  rows: number;
  gutter: Gutter;
}

export interface GridConfig {
  pageSize: PageSize;
  margin: Margin;
  grid: GridDef;
  defaultFitMode: FitMode;
}

// ── 槽位 ────────────────────────────────────────────────────────────────────

/** 单个槽位的坐标与尺寸（以页面左上角为原点） */
export interface Slot {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── 图片适配结果 ─────────────────────────────────────────────────────────────

/**
 * calcFit 返回值：
 * - sx/sy/sW/sH: 源图裁剪区域（像素）
 * - dw/dh:       目标绘制尺寸（pt 或像素，与槽位同单位）
 */
export interface FitResult {
  sx: number;
  sy: number;
  sW: number;
  sH: number;
  dw: number;
  dh: number;
}

// ── 压缩后图片数据 ───────────────────────────────────────────────────────────

/** 经过压缩后存入状态的图片对象 */
export interface CompressedImage {
  id: string;
  file: File;
  blob: Blob;
  /** 用于 <img> 展示的 Object URL，组件卸载时需 revoke */
  blobUrl: string;
  /** 压缩后宽度（px） */
  w: number;
  /** 压缩后高度（px） */
  h: number;
  /** 原始文件大小 */
  origSize: number;
  /** 压缩后大小 */
  compSize: number;
}

// ── 压缩参数 ─────────────────────────────────────────────────────────────────

export interface CompressOptions {
  /** 最大边长，默认 1200 */
  maxDim?: number;
  /** 最大像素总数，默认 2_000_000 */
  maxPixels?: number;
  /** JPEG 质量 0-1，默认 0.85 */
  quality?: number;
}

export interface CompressResult {
  blob: Blob;
  w: number;
  h: number;
}

// ── 进度回调 ─────────────────────────────────────────────────────────────────

export interface ProgressInfo {
  /** 0 - 1 */
  progress: number;
  message: string;
}

export type OnProgress = (info: ProgressInfo) => void;

// ── PDF 导出选项 ─────────────────────────────────────────────────────────────

export interface AlbumExportOptions {
  /** 下载文件名，默认 album_YYYY-MM-DD.pdf */
  filename?: string;
  /** 图片嵌入 JPEG 质量 0-1，默认 0.88 */
  jpegQuality?: number;
}


