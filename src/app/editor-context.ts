import { createContext } from "react";
import { EditorState, EditorAction } from "@/features/collage-editor/types";

export interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

export const EditorContext = createContext<EditorContextValue | null>(null);
