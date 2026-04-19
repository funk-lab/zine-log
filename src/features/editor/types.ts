// ── 模板常量 ──────────────────────────────────────────────────────────────

/** 画布默认宽度（px）- 导出时使用原始尺寸 */
export const CANVAS_WIDTH = 880;
/** 画布默认高度（px）- 导出时使用原始尺寸 */
export const CANVAS_HEIGHT = 760;
/** 画布显示时的最大宽度（响应式适配） */
export const CANVAS_MAX_WIDTH = "100%";

export type TemplateId = "tight-ring" | "loose-ring";

/** 适配模式 */
export type FitMode = "cover" | "contain" | "fill";

/** 旋转角度（仅支持 90° 整数倍） */
export type RotateDeg = 0 | 90 | 180 | 270;

// ── 基础图片属性 ────────────────────────────────────────────────────────────

/**
 * 基础图片接口
 * 
 * ⚠️ DEPRECATED: src 字段已弃用，请使用 GalleryImage.blobUrl
 * 保留 src 仅用于兼容旧数据，新上传的图片使用 blobUrl
 */
export interface BaseImage {
  id: string;
  /** @deprecated 请使用 GalleryImage.blobUrl */
  src: string;
  name: string;
}

// ── 图片编辑状态 ────────────────────────────────────────────────────────────

export interface ImageEdit {
  rotate: RotateDeg;
  fitMode: FitMode;
  /** 缩放比例 0.5 - 3.0，默认 1.0 */
  zoom: number;
  /** 水平翻转 */
  flipX: boolean;
  /** 垂直翻转 */
  flipY: boolean;
  /** 水平偏移（像素），默认 0 */
  offsetX: number;
  /** 垂直偏移（像素），默认 0 */
  offsetY: number;
  /** 亮度 -100 到 100，默认 0 */
  brightness: number;
  /** 对比度 -100 到 100，默认 0 */
  contrast: number;
  /** 饱和度 -100 到 100，默认 0 */
  saturate: number;
  /** 灰度模式 */
  grayscale: boolean;
  /** 圆角半径（像素），默认 0 */
  borderRadius: number;
  /** 图片边距（像素），默认 0 */
  margin: number;
}

/** 默认编辑状态 */
export const DEFAULT_IMAGE_EDIT: Readonly<ImageEdit> = {
  rotate: 0,
  fitMode: "cover",
  zoom: 1,
  flipX: false,
  flipY: false,
  offsetX: 0,
  offsetY: 0,
  brightness: 0,
  contrast: 0,
  saturate: 0,
  grayscale: false,
  borderRadius: 0,
  margin: 0,
};

// ── 图库图片项 ──────────────────────────────────────────────────────────────

/**
 * 图库图片项 - 统一的图片类型
 * 包含基础属性、编辑状态和元数据
 * 通过所在数组（unselected/selected）区分选中状态
 * 
 * ⚠️ 迁移提示：src 字段已弃用，请使用 blobUrl
 */
export interface GalleryImage extends BaseImage, ImageEdit {
  /** 可选：占位渐变颜色（用于加载前显示） */
  color?: string;
  /** 可选：上传时间戳 */
  uploadedAt?: number;
  /** 可选：文件类型 */
  mimeType?: string;
  /** 可选：文件大小（字节）- 原始文件大小 */
  size?: number;
  /** 可选：显示用的替代文本 */
  alt?: string;
  
  // ✅ 新增字段：压缩后的 Blob URL（推荐使用）
  /** 压缩后的图片 Blob URL，用于显示 */
  blobUrl?: string;
  /** 压缩后宽度（像素） */
  compWidth?: number;
  /** 压缩后高度（像素） */
  compHeight?: number;
  /** 压缩后文件大小（字节） */
  compSize?: number;
}

/**
 * 图库状态
 * 双区结构：待选区 + 已选区
 */
export interface GalleryState {
  /** 待选素材列表 */
  unselected: GalleryImage[];
  /** 已选入画列表 */
  selected: GalleryImage[];
  /** 下一个图片 ID */
  nextImageId: number;
}

export interface EditorState {
  template: TemplateId;
  title: string;
  meta: string;
  body: string;
  accent: string;
  ringScale: number;
  /** 图片内边距（px），传给 gridSlotMarkup */
  padding: number;
  /** 待选素材列表 */
  unselected: GalleryImage[];
  /** 已选入画列表 */
  selected: GalleryImage[];
  nextImageId: number;
}

export interface TemplateMeta {
  name: string;
  hint: string;
}

export function createInitialEditorState(): EditorState {
  // ?inline 告知 Vite 将图片以 base64 data URL 内联，而非输出文件路径
  // eager:true 保证同步可用，不会触发副作用，不受 StrictMode 双执行影响
  // const assetModules = import.meta.glob<{ default: string }>("/asset/*.png", {
  //   eager: true,
  //   query: "?inline",
  //   import: "default",
  // });

  // const unselected: GalleryImage[] = Object.entries(assetModules).map(
  //   ([path, src], index) => ({
  //     id: generateImageId(index + 1),
  //     src: src as unknown as string,
  //     name: path.split("/").pop() ?? path,
  //     uploadedAt: Date.now(),
  //   })
  // );

  return {
    template: "tight-ring",
    title: "",
    meta: "",
    body: "",
    accent: "#d7c3ab",
    ringScale: 1.5,
    padding: 2,
    unselected: [],
    selected: [],
    nextImageId: 1,
  };
}
/**
 * 生成唯一图片 ID
 */
export const generateImageId = (nextId: number): string =>
  `img_${Date.now()}_${nextId}`;

/**
 * 创建初始状态
 */
export const createInitialGalleryState = (): GalleryState => ({
  unselected: [],
  selected: [],
  nextImageId: 1,
});
