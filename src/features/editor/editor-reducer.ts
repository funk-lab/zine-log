import { createInitialEditorState, type EditorState, type LibraryImage, type TemplateId } from "@/features/editor/types";

export type EditorAction =
  | { type: "set-template"; template: TemplateId }
  | { type: "set-title"; title: string }
  | { type: "set-meta"; meta: string }
  | { type: "set-body"; body: string }
  | { type: "set-accent"; accent: string }
  | { type: "set-ring-scale"; ringScale: number }
  | { type: "append-images"; images: LibraryImage[] }
  | { type: "toggle-image"; imageId: number }
  | { type: "select-all-images" }
  | { type: "clear-selection" }
  | { type: "fill-example" };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
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
    case "append-images":
      return {
        ...state,
        images: [...state.images, ...action.images],
        nextImageId: state.nextImageId + action.images.length,
      };
    case "toggle-image":
      return {
        ...state,
        images: state.images.map((image) =>
          image.id === action.imageId ? { ...image, selected: !image.selected } : image,
        ),
      };
    case "select-all-images":
      return {
        ...state,
        images: state.images.map((image) => ({ ...image, selected: true })),
      };
    case "clear-selection":
      return {
        ...state,
        images: state.images.map((image) => ({ ...image, selected: false })),
      };
    case "fill-example":
      return {
        ...state,
        template: "l-shape",
        title: "春日河岸慢走",
        meta: "2026.03.17 · 傍晚五点半",
        body: "风有点凉，树影被拉得很长。\n今天没有发生特别大的事，但光线很好，适合把照片留成一页。",
        accent: "#a55d35",
        ringScale: 1,
      };
    default:
      return state;
  }
}

export const initialEditorState = createInitialEditorState();
