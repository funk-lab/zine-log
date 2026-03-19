export type TemplateId = "l-shape" | "editorial" | "poster" | "l-style";

export interface LibraryImage {
  id: number;
  src: string;
  name: string;
  selected: boolean;
}

export interface EditorState {
  template: TemplateId;
  title: string;
  meta: string;
  body: string;
  accent: string;
  ringScale: number;
  images: LibraryImage[];
  nextImageId: number;
}

export interface TemplateMeta {
  name: string;
  hint: string;
}

export function createInitialEditorState(): EditorState {
  return {
    template: "l-style",
    title: "",
    meta: "",
    body: "",
    accent: "#d7c3ab",
    ringScale: 1,
    images: [],
    nextImageId: 1,
  };
}

export function getSelectedImages(state: EditorState) {
  return state.images.filter((image) => image.selected);
}
