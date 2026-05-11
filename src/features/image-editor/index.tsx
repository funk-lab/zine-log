import React from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "@/app/useEditor";

export default function ImageEditor() {
  const navigate = useNavigate();
  const { state } = useEditor();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 p-6">
      <h2 className="text-2xl font-semibold text-stone-800">图片编辑页</h2>
      <p className="text-stone-500">
        当前已选图片: {state.selected.length} 张
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-lg bg-stone-800 px-5 py-2 text-white transition hover:bg-stone-700"
        onClick={() => {
          void navigate("/collage");
        }}
        >
          返回编辑器
        </button>
      </div>
    </div>
  );
}
