import React, { useState } from "react";

const themeColors = [
  { id: "sandstone", name: "砂岩", color: "#D4B896" },
  { id: "cream", name: "米白", color: "#F5F0E8" },
  { id: "sage", name: "莫兰迪绿", color: "#E8EDE8" },
  { id: "dark", name: "暗夜", color: "#2D2D2D" },
  { id: "sky", name: "天青", color: "#C5D5E8" },
  { id: "rose", name: "薄雾玫瑰", color: "#E8D8D0" },
  { id: "grass", name: "鼠尾草", color: "#D8E0D0" },
];

export type RightTab = "design";

interface RightPanelProps {
  accent?: string;
  onAccentChange?: (color: string) => void;
  /** TODO: 实现环形比例控制 */
  ringScale?: number;
  onRingScaleChange?: (scale: number) => void;
  padding?: number;
  onPaddingChange?: (padding: number) => void;
  onExport?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  accent = "#D4B896",
  onAccentChange,
  // TODO: ringScale 控制暂未实现
  // ringScale = 1.5,
  // onRingScaleChange,
  padding = 2,
  onPaddingChange,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<RightTab>("design");

  return (
    <aside className="panel-right">
      {/* 标签导航 */}
      <div className="right-tabs">
        <button
          className={`right-tab ${activeTab === "design" ? "active" : ""}`}
          onClick={() => setActiveTab("design")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="13.5" cy="6.5" r="1.5" />
            <circle cx="17.5" cy="10.5" r="1.5" />
            <circle cx="8.5" cy="7.5" r="1.5" />
            <circle cx="6.5" cy="12.5" r="1.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
          风格
        </button>
      </div>

      {/* 风格面板 */}
      {activeTab === "design" && (
        <div className="right-content">
          {/* 主题颜色 */}
          <div className="tool-section">
            <div className="section-label">背景色调</div>
            <div className="theme-colors">
              {themeColors.map((c) => (
                <div
                  key={c.id}
                  className={`color-swatch ${
                    accent === c.color ? "active" : ""
                  }`}
                  style={{ background: c.color }}
                  onClick={() => onAccentChange?.(c.color)}
                  title={c.name}
                />
              ))}
              {/* TODO: 实现自定义颜色选择器 */}
              {/* <div
                className="color-swatch color-swatch-custom"
                onClick={() => {
                  console.log("TODO: 打开颜色选择器");
                }}
                title="自定义"
              /> */}
            </div>
          </div>

          {/* TODO: padding UI 暂注释 */}
          {/* {/* 布局间距 */}
          {/* <div className="tool-section"> */}
          {/*   <div className="section-label">布局间距</div> */}
          {/*   <div className="slider-row"> */}
          {/*     <span className="slider-label">图片内边距</span> */}
          {/*     <input */}
          {/*       type="range" */}
          {/*       min="0" */}
          {/*       max="20" */}
          {/*       value={padding} */}
          {/*       onChange={(e) => onPaddingChange?.(+e.target.value)} */}
          {/*     /> */}
          {/*     <span className="slider-val">{padding}px</span> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      )}

      {/* 底部操作 */}
      <div className="right-footer">
        <button className="btn-full btn-primary-full" onClick={onExport}>
          生成作品
        </button>
      </div>
    </aside>
  );
};

export default RightPanel;
