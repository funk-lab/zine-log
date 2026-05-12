import { useState, useEffect } from "react";
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

export default function BrushPanel() {
  const { editor } = useZineEditor();
  const [brushType, setBrushType] = useState<"pencil" | "marker">("pencil");
  const [brushColor, setBrushColor] = useState("#C8773A");
  const [brushSize, setBrushSize] = useState(4);
  const [brushAlpha, setBrushAlpha] = useState(100);
  const [brushSmooth, setBrushSmooth] = useState(60);
  const [isEraser, setIsEraser] = useState(false);

  // 初始化画笔
  useEffect(() => {
    if (!editor?.canvas) return undefined;

    // 启用绘制模式
    editor.canvas.isDrawingMode = true;

    // 创建画笔
    const freeDrawingBrush = new fabric.PencilBrush(editor.canvas);
    editor.canvas.freeDrawingBrush = freeDrawingBrush;

    // 设置画笔初始属性
    updateBrushSettings();

    return () => {
      // 清理：退出画笔工具时关闭绘制模式
      if (editor?.canvas) {
        editor.canvas.isDrawingMode = false;
      }
    };
  }, [editor]);

  // 当任何画笔属性改变时更新到 fabric brush
  useEffect(() => {
    if (!editor?.canvas?.freeDrawingBrush) return;
    updateBrushSettings();
  }, [brushType, brushColor, brushSize, brushAlpha, brushSmooth, isEraser]);

  // 更新画笔设置的辅助函数
  const updateBrushSettings = () => {
    const brush = editor?.canvas?.freeDrawingBrush as fabric.PencilBrush;
    if (!brush) return;

    // 设置颜色（考虑透明度）
    const alphaHex = Math.round((brushAlpha / 100) * 255)
      .toString(16)
      .padStart(2, "0");
    brush.color = isEraser ? "#ffffff" : brushColor + alphaHex;

    // 设置笔触宽度（马克笔加粗）
    brush.width = brushType === "marker" ? brushSize * 2 : brushSize;

    // 设置笔触端点样式
    brush.strokeLineCap = brushType === "marker" ? "square" : "round";

    // 设置平滑度（通过 decimate 控制）
    // decimate 值越小越平滑，将 0-100 映射到 0.1-1
    const decimateValue = Math.max(0.1, 1 - brushSmooth / 100);
    brush.decimate = decimateValue;
  };

  const handleClearCanvas = () => {
    if (!editor?.canvas) return;

    // 获取所有 path 对象并移除
    const objects = editor.canvas.getObjects();
    const paths = objects.filter((obj) => obj.type === "path");
    paths.forEach((path) => editor.canvas.remove(path));
    editor.canvas.requestRenderAll();
  };

  return (
    <>
      {/* 笔型 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">笔型</div>
        <div className="zine-brush-type-row">
          <div
            className={`zine-brush-type-btn ${
              brushType === "pencil" ? "active" : ""
            }`}
            onClick={() => setBrushType("pencil")}
          >
            <div className="zine-brush-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M6 22 L20 8"
                  stroke="#C8773A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M20 8 L22 6 C23 5 23 7 22 8 L20 10 Z" fill="#C8773A" />
                <circle cx="6" cy="22" r="2" fill="#C8773A" />
              </svg>
            </div>
            <span className="zine-brush-label">铅笔</span>
          </div>
          <div
            className={`zine-brush-type-btn ${
              brushType === "marker" ? "active" : ""
            }`}
            onClick={() => setBrushType("marker")}
          >
            <div className="zine-brush-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 22 Q12 12 22 8"
                  stroke="#2D6BE4"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity=".55"
                />
                <path
                  d="M5 22 Q12 12 22 8"
                  stroke="#2D6BE4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity=".9"
                />
              </svg>
            </div>
            <span className="zine-brush-label">马克笔</span>
          </div>
        </div>
        <div className="zine-brush-preview">
          <svg viewBox="0 0 240 56" preserveAspectRatio="none" fill="none">
            <path
              d="M20 40 Q50 15 80 28 Q110 42 140 18 Q170 5 210 30"
              stroke={brushColor}
              strokeWidth={brushType === "marker" ? brushSize * 2 : brushSize}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={brushAlpha / 100}
            />
          </svg>
        </div>
      </div>

      {/* 笔迹颜色 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">笔迹颜色</div>
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
          <div className="zine-color-picker-btn" title="自定义颜色"></div>
          <div className="zine-color-input-wrap">
            <div
              className="zine-color-preview"
              style={{ background: brushColor }}
            ></div>
            <input
              className="zine-color-hex-input"
              value={brushColor}
              maxLength={7}
              onChange={(e) => setBrushColor(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 笔迹大小 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">笔迹大小</div>
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
        <div className="zine-slider-row">
          <span className="zine-slider-label">透明度</span>
          <input
            type="range"
            min={10}
            max={100}
            value={brushAlpha}
            onChange={(e) => setBrushAlpha(Number(e.target.value))}
          />
          <span className="zine-slider-val">{brushAlpha}%</span>
        </div>
        <div className="zine-slider-row">
          <span className="zine-slider-label">平滑度</span>
          <input
            type="range"
            min={0}
            max={100}
            value={brushSmooth}
            onChange={(e) => setBrushSmooth(Number(e.target.value))}
          />
          <span className="zine-slider-val">{brushSmooth}%</span>
        </div>
      </div>

      {/* 橡皮擦 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">橡皮擦</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="zine-btn-secondary-full"
            style={{
              flex: 1,
              padding: "8px",
              fontSize: 12,
              fontWeight: 600,
              background: isEraser
                ? "var(--zine-brand-light)"
                : "var(--zine-surface-2)",
              border: `1px solid ${
                isEraser ? "var(--zine-brand)" : "var(--zine-border)"
              }`,
              color: isEraser
                ? "var(--zine-brand)"
                : "var(--zine-text-secondary)",
            }}
            onClick={() => setIsEraser(!isEraser)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            >
              <path d="M20 20H7L3 16l9.5-9.5 7.5 7.5L16 18" />
              <path d="M6.5 17.5l5-5" />
            </svg>
            {isEraser ? "退出橡皮擦" : "切换橡皮擦"}
          </button>
          <button
            className="zine-btn-secondary-full"
            style={{ padding: "8px", fontSize: 12, fontWeight: 600 }}
            onClick={handleClearCanvas}
          >
            清空
          </button>
        </div>
      </div>
    </>
  );
}
