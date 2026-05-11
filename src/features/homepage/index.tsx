import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-stone-50 p-6">
      <h1 className="text-3xl font-bold text-stone-800">Zine Log</h1>
      <p className="text-stone-500">图文排版设计工具</p>
      <button
        type="button"
        className="rounded-lg bg-stone-800 px-6 py-3 text-white transition hover:bg-stone-700"
        onClick={() => {
          void navigate("/collage");
        }}
      >
        进入编辑器
      </button>
    </div>
  );
}
