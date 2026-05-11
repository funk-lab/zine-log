import React, { useReducer } from "react";
import {
  editorReducer,
  initialEditorState,
} from "@/features/collage-editor/editor-reducer";
import { EditorContext } from "./editor-context";

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
