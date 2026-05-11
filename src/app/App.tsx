import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EditorProvider } from "./EditorContext";
import HomePage from "@/features/homepage";
import CollageEditor from "@/features/collage-editor/Editor";
import ImageEditor from "@/features/image-editor";

export function App() {
  return (
    <EditorProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collage" element={<CollageEditor />} />
          <Route path="/image-editor" element={<ImageEditor />} />
        </Routes>
      </BrowserRouter>
    </EditorProvider>
  );
}
