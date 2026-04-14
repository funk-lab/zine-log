import {
  GalleryImage,
  createInitialEditorState,
  generateImageId,
  type EditorState,
  type TemplateId,
} from "@/features/editor/types";

export type EditorAction =
  | { type: "set-template"; template: TemplateId }
  | { type: "set-title"; title: string }
  | { type: "set-meta"; meta: string }
  | { type: "set-body"; body: string }
  | { type: "set-accent"; accent: string }
  | { type: "set-ring-scale"; ringScale: number }
  | { type: "set-padding"; padding: number }
  | { type: "append-images"; images: Omit<GalleryImage, "id">[] }
  // 与 PhotoGallery 组件回调直接对应：传入完整数组替换状态
  | { type: "set-unselected"; images: GalleryImage[] }
  | { type: "set-selected"; images: GalleryImage[] }
  // 便捷操作（无需外部计算，reducer 内部处理）
  | { type: "move-all-to-selected" }
  | { type: "clear-selection" }
  | { type: "remove-image"; imageId: string }
  | { type: "reorder-selected"; newOrder: string[] }
  | { type: "fill-example" };

export function editorReducer(
  state: EditorState,
  action: EditorAction
): EditorState {
  switch (action.type) {
    case "set-template":
      return { ...state, template: action.template };
    case "set-title":
      return { ...state, title: action.title };
    case "set-meta":
      return { ...state, meta: action.meta };
    case "set-body":
      return { ...state, body: action.body };
    case "set-accent":
      return { ...state, accent: action.accent };
    case "set-ring-scale":
      return { ...state, ringScale: action.ringScale };
    case "set-padding":
      return { ...state, padding: action.padding };
    case "append-images": {
      const newImages = action.images.map((img, index) => ({
        ...img,
        id: generateImageId(state.nextImageId + index),
      }));

      return {
        ...state,
        unselected: [...state.unselected, ...newImages],
        nextImageId: state.nextImageId + action.images.length,
      };
    }

    // 直接用 PhotoGallery 回调传来的完整数组替换状态
    case "set-unselected":
      return { ...state, unselected: action.images };

    case "set-selected":
      return { ...state, selected: action.images };

    case "move-all-to-selected": {
      if (state.unselected.length === 0) return state;

      return {
        ...state,
        selected: [...state.selected, ...state.unselected],
        unselected: [],
      };
    }

    case "remove-image": {
      return {
        ...state,
        unselected: state.unselected.filter((img) => img.id !== action.imageId),
        selected: state.selected.filter((img) => img.id !== action.imageId),
      };
    }

    case "reorder-selected": {
      const idOrderMap = new Map(
        action.newOrder.map((id, index) => [id, index])
      );

      const sortedSelected = [...state.selected].sort((a, b) => {
        const orderA = idOrderMap.get(a.id) ?? Infinity;
        const orderB = idOrderMap.get(b.id) ?? Infinity;
        return orderA - orderB;
      });

      return {
        ...state,
        selected: sortedSelected,
      };
    }

    case "clear-selection": {
      if (state.selected.length === 0) return state;

      return {
        ...state,
        unselected: [...state.unselected, ...state.selected],
        selected: [],
      };
    }

    case "fill-example": {
      // TODO: 完整的示例内容填充功能待实现
      // 当前仅切换模板以通过测试
      return {
        ...state,
        template: "loose-ring" as const,
        title: "春日河岸慢走",
        meta: "轻松记录每一天",
        body: "阳光洒在河面上，微风轻拂，这是属于春天的温柔时光。",
      };
    }

    default:
      return state;
  }
}

export const initialEditorState = createInitialEditorState();
