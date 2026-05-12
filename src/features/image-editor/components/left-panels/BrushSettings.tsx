import { useState, useEffect, useCallback } from "react";
import { useZineEditor } from "../../index";
import * as fabric from "fabric";

const brushColors = [
  { color: "#C8773A", name: "品牌橙" },
  { color: "#1A1714", name: "黑色" },
  { color: "#2D6BE4", name: "蓝色" },
  { color: "#2DA861", name: "绿色" },
  { color: "#E04040", name: "红色" },
  { color: "#9B59B6", name: "紫色" },
  { color: "#F5F0E8", name: "米色", border: true },
];

export default function BrushSettings() {
  const { editor } = useZineEditor();
  const [brushType, setBrushType] = useState<"pencil" | "marker">("pencil");
  const [brushColor, setBrushColor] = useState("#C8773A");
  const [brushSize, setBrushSize] = useState(4);
  const [brushAlpha, setBrushAlpha] = useState(100);
  const [isDrawingMode, setIsDrawingMode] = useState(true);

  const updateBrushSettings = useCallback(() => {
    const brush = editor?.canvas?.freeDrawingBrush as fabric.PencilBrush;
    if (!brush) return;

    const alphaHex = Math.round((brushAlpha / 100) * 255)
      .toString(16)
      .padStart(2, "0");
    brush.color = brushColor + alphaHex;
    brush.width = brushType === "marker" ? brushSize * 2 : brushSize;
    brush.strokeLineCap = brushType === "marker" ? "square" : "round";
  }, [
    editor?.canvas?.freeDrawingBrush,
    brushAlpha,
    brushColor,
    brushType,
    brushSize,
  ]);

  // 初始化画笔
  useEffect(() => {
    if (!editor?.canvas) return undefined;
    editor.canvas.isDrawingMode = true;

    const freeDrawingBrush = new fabric.PencilBrush(editor.canvas);
    editor.canvas.freeDrawingBrush = freeDrawingBrush;
    updateBrushSettings();

    return () => {
      if (editor?.canvas) {
        editor.canvas.isDrawingMode = false;
      }
    };
  }, [editor]);

  // 更新画笔设置
  useEffect(() => {
    if (!editor?.canvas?.freeDrawingBrush) return;
    updateBrushSettings();
  }, [
    brushType,
    brushColor,
    brushSize,
    brushAlpha,
    editor?.canvas?.freeDrawingBrush,
    updateBrushSettings,
  ]);

  const stopFreeDrawMode = () => {
    if (!editor?.canvas) return;
    editor.canvas.isDrawingMode = !editor.canvas.isDrawingMode;
    setIsDrawingMode(!isDrawingMode);
  };

  return (
    <div className="zine-left-panel-content">
      <div className="zine-left-panel-header">
        <span>画笔设置</span>
        <span style={{ fontSize: 11, color: "var(--zine-text-muted)" }}>
          直接在画布绘制
        </span>
      </div>

      {/* 笔型 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">笔型</div>
        <div className="zine-brush-type-row">
          <div
            className={`zine-brush-type-btn ${
              brushType === "pencil" ? "active" : ""
            }`}
            onClick={() => setBrushType("pencil")}
          >
            <div className="zine-brush-icon">✏️</div>
            <span className="zine-brush-label">铅笔</span>
          </div>
          <div
            className={`zine-brush-type-btn ${
              brushType === "marker" ? "active" : ""
            }`}
            onClick={() => setBrushType("marker")}
          >
            <div className="zine-brush-icon">🖍️</div>
            <span className="zine-brush-label">马克笔</span>
          </div>
        </div>
      </div>

      {/* 笔迹颜色 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">颜色</div>
        <div className="zine-color-row">
          {brushColors.map((c) => (
            <div
              key={c.color}
              className={`zine-color-dot ${
                brushColor === c.color ? "active" : ""
              }`}
              style={{
                background: c.color,
                border: c.border ? "1.5px solid var(--zine-border)" : undefined,
              }}
              title={c.name}
              onClick={() => setBrushColor(c.color)}
            />
          ))}
        </div>
      </div>

      {/* 笔迹大小 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">大小</div>
        <div className="zine-slider-row">
          <span className="zine-slider-label">粗细</span>
          <input
            type="range"
            min={1}
            max={40}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <span className="zine-slider-val">{brushSize}px</span>
        </div>
        <div className="zine-slider-row" style={{ marginTop: 8 }}>
          <span className="zine-slider-label">透明</span>
          <input
            type="range"
            min={10}
            max={100}
            value={brushAlpha}
            onChange={(e) => setBrushAlpha(Number(e.target.value))}
          />
          <span className="zine-slider-val">{brushAlpha}%</span>
        </div>
      </div>

      {/* 操作 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">操作</div>
        <div
          className="zine-btn-row"
          style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
        >
          <button
            className={`zine-btn-full ${
              isDrawingMode
                ? "zine-btn-secondary-full"
                : "zine-btn-primary-full"
            }`}
            onClick={stopFreeDrawMode}
            title={isDrawingMode ? "停止绘制" : "开始绘制"}
            style={{ flex: 1 }}
          >
            {isDrawingMode ? "✋ 停止绘制" : "✏️ 开始绘制"}
          </button>
        </div>
        {/* <button className="zine-btn-secondary-full" onClick={handleClearCanvas} style={{ width: '100%' }}>
          清空画笔痕迹
        </button> */}
      </div>
    </div>
  );
}
