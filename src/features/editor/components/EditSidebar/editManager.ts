import type { FitMode, ImageEdit, RotateDeg } from "@/features/editor/types";
import { DEFAULT_IMAGE_EDIT } from "@/features/editor/types";

// ─────────────────────────────────────────────────────────────────────────────
// 图片编辑状态管理（非破坏性：只存参数，导出时才应用）
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_EDIT: Readonly<ImageEdit> = DEFAULT_IMAGE_EDIT;

/**
 * 管理所有图片的旋转 / 适配模式编辑状态。
 *
 * 在 React 中推荐配合 `useState` / `useReducer` 使用：
 * - 每次修改后调用 `editManager.set*()` 再触发 re-render 即可。
 * - 或者直接用 `useEditManager` hook（见下方工厂函数）。
 *
 * @example
 * const em = new EditManager();
 * em.setRotate('img-001', 90);
 * const edit = em.get('img-001'); // { rotate: 90, fitMode: 'cover' }
 */
export class EditManager {
  edits = new Map<string, ImageEdit>();

  /** 获取指定图片的编辑状态，无记录时返回默认值（不写入 Map）。 */
  get(id: string): ImageEdit {
    return this.edits.get(id) ?? { ...DEFAULT_EDIT };
  }

  /** 获取或创建（写入默认值）。 */
  private getOrCreate(id: string): ImageEdit {
    if (!this.edits.has(id)) {
      this.edits.set(id, { ...DEFAULT_EDIT });
    }
    return this.edits.get(id)!;
  }

  /** 设置旋转角度。 */
  setRotate(id: string, deg: RotateDeg): void {
    this.getOrCreate(id).rotate = deg;
  }

  /** 设置适配模式。 */
  setFitMode(id: string, fitMode: FitMode): void {
    this.getOrCreate(id).fitMode = fitMode;
  }

  /** 设置缩放比例。 */
  setZoom(id: string, zoom: number): void {
    this.getOrCreate(id).zoom = Math.max(0.5, Math.min(3, zoom));
  }

  /** 设置水平翻转。 */
  setFlipX(id: string, flip: boolean): void {
    this.getOrCreate(id).flipX = flip;
  }

  /** 设置垂直翻转。 */
  setFlipY(id: string, flip: boolean): void {
    this.getOrCreate(id).flipY = flip;
  }

  /** 设置水平偏移。 */
  setOffsetX(id: string, offset: number): void {
    this.getOrCreate(id).offsetX = offset;
  }

  /** 设置垂直偏移。 */
  setOffsetY(id: string, offset: number): void {
    this.getOrCreate(id).offsetY = offset;
  }

  /** 设置亮度。 */
  setBrightness(id: string, value: number): void {
    this.getOrCreate(id).brightness = Math.max(-100, Math.min(100, value));
  }

  /** 设置对比度。 */
  setContrast(id: string, value: number): void {
    this.getOrCreate(id).contrast = Math.max(-100, Math.min(100, value));
  }

  /** 设置饱和度。 */
  setSaturate(id: string, value: number): void {
    this.getOrCreate(id).saturate = Math.max(-100, Math.min(100, value));
  }

  /** 设置灰度模式。 */
  setGrayscale(id: string, grayscale: boolean): void {
    this.getOrCreate(id).grayscale = grayscale;
  }

  /** 设置圆角半径。 */
  setBorderRadius(id: string, radius: number): void {
    this.getOrCreate(id).borderRadius = Math.max(0, radius);
  }

  /** 重置指定图片的所有编辑。 */
  reset(id: string): void {
    this.edits.set(id, { ...DEFAULT_EDIT });
  }

  /** 删除指定图片的编辑记录（从列表移除时调用）。 */
  remove(id: string): void {
    this.edits.delete(id);
  }

  /** 清空所有编辑记录。 */
  clear(): void {
    this.edits.clear();
  }

  /** 判断指定图片是否有非默认编辑（用于在缩略图上显示标记）。 */
  hasEdit(id: string): boolean {
    const e = this.edits.get(id);
    if (!e) return false;
    return (
      e.rotate !== DEFAULT_EDIT.rotate ||
      e.fitMode !== DEFAULT_EDIT.fitMode ||
      e.zoom !== DEFAULT_EDIT.zoom ||
      e.flipX !== DEFAULT_EDIT.flipX ||
      e.flipY !== DEFAULT_EDIT.flipY ||
      e.offsetX !== DEFAULT_EDIT.offsetX ||
      e.offsetY !== DEFAULT_EDIT.offsetY ||
      e.brightness !== DEFAULT_EDIT.brightness ||
      e.contrast !== DEFAULT_EDIT.contrast ||
      e.saturate !== DEFAULT_EDIT.saturate ||
      e.grayscale !== DEFAULT_EDIT.grayscale ||
      e.borderRadius !== DEFAULT_EDIT.borderRadius
    );
  }

  // ── 持久化（可选） ──────────────────────────────────────────────────────────

  /** 序列化为 JSON 字符串，用于持久化或传递。 */
  serialize(): string {
    return JSON.stringify(Array.from(this.edits.entries()));
  }

  /** 从 JSON 字符串恢复状态。 */
  deserialize(json: string): void {
    try {
      const entries = JSON.parse(json) as [string, ImageEdit][];
      this.edits = new Map(entries);
    } catch {
      console.warn("[EditManager] deserialize failed");
    }
  }

  /** 保存到 localStorage。 */
  saveToStorage(key = "pdf_album_edits"): void {
    localStorage.setItem(key, this.serialize());
  }

  /** 从 localStorage 恢复。 */
  loadFromStorage(key = "pdf_album_edits"): void {
    const raw = localStorage.getItem(key);
    if (raw) this.deserialize(raw);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// React Hook 封装（可选，需要 React 17+）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 在 React 组件中使用 EditManager 的推荐方式。
 *
 * 每次修改都会返回一个新的 EditManager 实例（浅克隆），
 * 确保 React 能感知状态变化触发重渲染。
 *
 * @example
 * const { manager, setRotate, setFitMode, reset } = useEditManager();
 * setRotate('img-001', 90); // 触发 re-render
 */
export function createEditManagerActions(
  manager: EditManager,
  onUpdate: (newManager: EditManager) => void
) {
  /** 返回一个 clone 后的新 manager，保证 React state 变化 */
  function mutate(fn: (m: EditManager) => void): void {
    fn(manager);
    // 浅克隆触发引用变化
    const next = new EditManager();
    next.edits = new Map(manager.edits);
    onUpdate(next);
  }

  return {
    setRotate: (id: string, deg: RotateDeg) =>
      mutate((m) => m.setRotate(id, deg)),

    setFitMode: (id: string, fitMode: FitMode) =>
      mutate((m) => m.setFitMode(id, fitMode)),

    setZoom: (id: string, zoom: number) => mutate((m) => m.setZoom(id, zoom)),

    setFlipX: (id: string, flip: boolean) => mutate((m) => m.setFlipX(id, flip)),

    setFlipY: (id: string, flip: boolean) => mutate((m) => m.setFlipY(id, flip)),

    setOffsetX: (id: string, offset: number) =>
      mutate((m) => m.setOffsetX(id, offset)),

    setOffsetY: (id: string, offset: number) =>
      mutate((m) => m.setOffsetY(id, offset)),

    setBrightness: (id: string, value: number) =>
      mutate((m) => m.setBrightness(id, value)),

    setContrast: (id: string, value: number) =>
      mutate((m) => m.setContrast(id, value)),

    setSaturate: (id: string, value: number) =>
      mutate((m) => m.setSaturate(id, value)),

    setGrayscale: (id: string, grayscale: boolean) =>
      mutate((m) => m.setGrayscale(id, grayscale)),

    setBorderRadius: (id: string, radius: number) =>
      mutate((m) => m.setBorderRadius(id, radius)),

    reset: (id: string) => mutate((m) => m.reset(id)),

    remove: (id: string) => mutate((m) => m.remove(id)),

    clear: () => mutate((m) => m.clear()),
  };
}
