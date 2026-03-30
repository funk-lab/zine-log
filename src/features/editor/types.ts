export type TemplateId = "tight-ring" | "loose-ring";
export interface LibraryImage {
  id: number;
  src: string;
  name: string;
  selected: boolean;
}
/**
 * 图库图片项
 * 移除 selected 字段，改为通过所在数组区分状态
 */
export interface GalleryImage {
  id: string;
  src: string;
  name: string;
  /** 可选：占位渐变颜色（用于加载前显示） */
  color?: string;
  /** 可选：上传时间戳 */
  uploadedAt?: number;
  /** 可选：文件类型 */
  mimeType?: string;
  /** 可选：文件大小（字节） */
  size?: number;
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
  const assetModules = import.meta.glob<{ default: string }>("/asset/*.png", {
    eager: true,
    query: "?inline",
    import: "default",
  });

  const unselected: GalleryImage[] = Object.entries(assetModules).map(
    ([path, src], index) => ({
      id: generateImageId(index + 1),
      src: src as unknown as string,
      name: path.split("/").pop() ?? path,
      uploadedAt: Date.now(),
    })
  );

  return {
    template: "tight-ring",
    title: "",
    meta: "",
    body: "",
    accent: "#d7c3ab",
    ringScale: 1.5,
    padding: 2,
    unselected,
    selected: [],
    nextImageId: unselected.length + 1,
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
