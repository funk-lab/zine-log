import { useState, useEffect } from "react";
import { useZineEditor } from "../../index";
import { createTextbox } from "@/editor/objects/textbox";
import { FONT_PRESET_FAMILY_LIST } from "@/utils/constants";
import { loadFont } from "@/utils";
import { FText } from "@/editor/custom-objects";

// 预设文字模板
const PRESET_TEXT_LIST = [
  {
    key: "title",
    label: "添加标题",
    style: { fontSize: 24, fontFamily: "SmileySans", fontWeight: "bold" },
    config: {
      fontFamily: "SmileySans",
      fontWeight: "bold",
      fontSize: 120,
      text: "添加标题",
      top: 100,
    },
  },
  {
    key: "subtitle",
    label: "添加副标题",
    style: { fontSize: 20, fontFamily: "AlibabaPuHuiTi", fontWeight: "bold" },
    config: {
      fontFamily: "AlibabaPuHuiTi",
      fontWeight: "bold",
      fontSize: 100,
      text: "添加副标题",
      top: 400,
    },
  },
  {
    key: "body",
    label: "添加正文",
    style: { fontSize: 14, fontFamily: "SourceHanSerif" },
    config: {
      fontFamily: "SourceHanSerif",
      fontSize: 80,
      text: "添加正文内容",
    },
  },
  {
    key: "border-text",
    label: "描边文字",
    style: {
      fontSize: 22,
      fontFamily: "霞鹜文楷",
      color: "#ffffff",
      WebkitTextStroke: "1px rgb(255, 87, 87)",
    },
    config: {
      fontFamily: "霞鹜文楷",
      fontSize: 100,
      text: "描边文字",
      fill: "#ffffff",
      stroke: "#ff5757",
      strokeWidth: 12,
    },
  },
];

const colors = [
  { color: "#1A1714", name: "黑色" },
  { color: "#FFFFFF", name: "白色", border: true },
  { color: "#C8773A", name: "品牌橙" },
  { color: "#2D6BE4", name: "蓝色" },
  { color: "#2DA861", name: "绿色" },
  { color: "#E04040", name: "红色" },
  { color: "#9B59B6", name: "紫色" },
];

const strokeColors = [
  { color: "#C8773A", name: "品牌橙" },
  { color: "#2D2D2D", name: "深灰" },
  { color: "#2D6BE4", name: "蓝色" },
];

export default function TextPanel() {
  const { editor, object } = useZineEditor();
  const text = object as FText;
  
  // 本地状态
  const [fontSize, setFontSize] = useState(22);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [paragraphSpacing, setParagraphSpacing] = useState(0);
  const [fontFamily, setFontFamily] = useState(FONT_PRESET_FAMILY_LIST[0].value);
  const [textColor, setTextColor] = useState(colors[0].color);
  const [strokeColor, setStrokeColor] = useState(strokeColors[1].color);
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(2);
  const [shadowY, setShadowY] = useState(2);
  const [shadowBlur, setShadowBlur] = useState(8);
  const [shadowColor] = useState("#1A1714");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [strokeExpanded, setStrokeExpanded] = useState(false);
  const [shadowExpanded, setShadowExpanded] = useState(false);

  // 从 fabric 对象同步状态到本地状态
  useEffect(() => {
    if (!text) return;
    
    setFontSize(text.fontSize || 22);
    setLineHeight(text.lineHeight || 1.6);
    setLetterSpacing((text.charSpacing || 0) / 10);
    setFontFamily(text.fontFamily || FONT_PRESET_FAMILY_LIST[0].value);
    setTextColor((text.fill as string) || colors[0].color);
    setBold(text.fontWeight === "bold");
    setItalic(text.fontStyle === "italic");
    setUnderline(!!text.underline);
    setStrike(!!text.linethrough);
    setAlign((text.textAlign as "left" | "center" | "right" | "justify") || "left");
    setStrokeWidth(text.strokeWidth || 0);
    setStrokeColor((text.stroke as string) || strokeColors[1].color);
    
    // 解析阴影
    const shadowVal = text.shadow as unknown;
    if (shadowVal && typeof shadowVal === "string") {
      setShadowEnabled(true);
      const match = shadowVal.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
      if (match) {
        setShadowX(parseInt(match[1]));
        setShadowY(parseInt(match[2]));
        setShadowBlur(parseInt(match[3]));
      }
    } else {
      setShadowEnabled(false);
    }
  }, [text]);

  // 添加文本框
  const handleAddText = async (options = {}) => {
    if (!editor) return;
    await createTextbox({ ...options, canvas: editor.canvas });
  };

  // 更新 fabric 对象并重新渲染
  const updateTextProperty = (key: string, value: any) => {
    if (!text || !editor) return;
    text.set(key, value);
    editor.canvas.requestRenderAll();
  };

  // 字体变化处理
  const handleFontChange = async (value: string) => {
    setFontFamily(value);
    if (!text || !editor) return;
    try {
      await loadFont(value);
    } finally {
      text.set("fontFamily", value);
      editor.canvas.requestRenderAll();
    }
  };

  // 字号变化
  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    updateTextProperty("fontSize", value);
  };

  // 行高变化
  const handleLineHeightChange = (value: number) => {
    setLineHeight(value);
    updateTextProperty("lineHeight", value);
  };

  // 字间距变化
  const handleLetterSpacingChange = (value: number) => {
    setLetterSpacing(value);
    updateTextProperty("charSpacing", value * 10);
  };

  // 文字颜色变化
  const handleTextColorChange = (value: string) => {
    setTextColor(value);
    updateTextProperty("fill", value);
  };

  // 加粗变化
  const handleBoldChange = (value: boolean) => {
    setBold(value);
    updateTextProperty("fontWeight", value ? "bold" : "normal");
  };

  // 斜体变化
  const handleItalicChange = (value: boolean) => {
    setItalic(value);
    updateTextProperty("fontStyle", value ? "italic" : "normal");
  };

  // 下划线变化
  const handleUnderlineChange = (value: boolean) => {
    setUnderline(value);
    updateTextProperty("underline", value);
  };

  // 删除线变化
  const handleStrikeChange = (value: boolean) => {
    setStrike(value);
    updateTextProperty("linethrough", value);
  };

  // 对齐方式变化
  const handleAlignChange = (value: "left" | "center" | "right" | "justify") => {
    setAlign(value);
    updateTextProperty("textAlign", value);
  };

  // 描边宽度变化
  const handleStrokeWidthChange = (value: number) => {
    setStrokeWidth(value);
    if (!text || !editor) return;
    text.set({
      strokeWidth: value,
      stroke: value > 0 ? strokeColor : undefined,
    });
    editor.canvas.requestRenderAll();
  };

  // 描边颜色变化
  const handleStrokeColorChange = (value: string) => {
    setStrokeColor(value);
    if (!text || !editor) return;
    if (strokeWidth > 0) {
      text.set("stroke", value);
      editor.canvas.requestRenderAll();
    }
  };

  // 阴影开关
  const handleShadowToggle = (enabled: boolean) => {
    setShadowEnabled(enabled);
    if (!text || !editor) return;
    const shadow = enabled
      ? `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.5)`
      : undefined;
    text.set("shadow", shadow);
    editor.canvas.requestRenderAll();
  };

  // 阴影参数变化
  const handleShadowParamChange = (key: "x" | "y" | "blur", value: number) => {
    if (key === "x") setShadowX(value);
    if (key === "y") setShadowY(value);
    if (key === "blur") setShadowBlur(value);
    
    if (!text || !editor || !shadowEnabled) return;
    const newX = key === "x" ? value : shadowX;
    const newY = key === "y" ? value : shadowY;
    const newBlur = key === "blur" ? value : shadowBlur;
    text.set(
      "shadow",
      `${newX}px ${newY}px ${newBlur}px rgba(0,0,0,0.5)`
    );
    editor.canvas.requestRenderAll();
  };

  return (
    <>
      {/* 添加文本按钮 */}
      <div className="zine-tool-section">
        <button
          className="zine-btn-full zine-btn-primary-full"
          onClick={() => handleAddText()}
          style={{ marginBottom: 12 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加文本框
        </button>
      </div>

      {/* 预设文字模板 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">预设文字</div>
        <div className="zine-preset-list">
          {PRESET_TEXT_LIST.map((item) => (
            <div
              key={item.key}
              className="zine-preset-card"
              onClick={() => handleAddText(item.config)}
            >
              <div style={item.style}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 字体 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">字体</div>
        <select
          className="zine-form-select"
          value={fontFamily}
          onChange={(e) => handleFontChange(e.target.value)}
          disabled={!text}
        >
          {FONT_PRESET_FAMILY_LIST.map((font) => (
            <option key={font.value} value={font.value}>{font.label.props.children}</option>
          ))}
        </select>
      </div>

      {/* 大小 + 行距 + 字间距 + 段间距 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">尺寸</div>
        <div className="zine-form-row">
          <div className="zine-form-group">
            <label className="zine-form-label">字号</label>
            <input
              type="number"
              className="zine-num-input"
              value={fontSize}
              min={6}
              max={200}
              disabled={!text}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            />
          </div>
          <div className="zine-form-group">
            <label className="zine-form-label">行距</label>
            <input
              type="number"
              className="zine-num-input"
              value={lineHeight}
              step={0.1}
              min={1}
              max={4}
              disabled={!text}
              onChange={(e) => handleLineHeightChange(Number(e.target.value))}
            />
          </div>
          <div className="zine-form-group">
            <label className="zine-form-label">字间距</label>
            <input
              type="number"
              className="zine-num-input"
              value={letterSpacing}
              min={-10}
              max={50}
              disabled={!text}
              onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
            />
          </div>
          <div className="zine-form-group">
            <label className="zine-form-label">段间距</label>
            <input
              type="number"
              className="zine-num-input"
              value={paragraphSpacing}
              min={0}
              max={100}
              disabled={!text}
              onChange={(e) => setParagraphSpacing(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 样式 BIUS + 对齐 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">样式与对齐</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="zine-style-group">
            <button
              className={`zine-style-btn zine-bold-btn ${bold ? "active" : ""}`}
              title="加粗"
              disabled={!text}
              onClick={() => handleBoldChange(!bold)}
            >B</button>
            <button
              className={`zine-style-btn zine-italic-btn ${italic ? "active" : ""}`}
              title="斜体"
              disabled={!text}
              onClick={() => handleItalicChange(!italic)}
            >I</button>
            <button
              className={`zine-style-btn zine-underline-btn ${underline ? "active" : ""}`}
              title="下划线"
              disabled={!text}
              onClick={() => handleUnderlineChange(!underline)}
            >U</button>
            <button
              className={`zine-style-btn zine-strike-btn ${strike ? "active" : ""}`}
              title="删除线"
              disabled={!text}
              onClick={() => handleStrikeChange(!strike)}
            >S</button>
          </div>
          <div style={{ width: 1, height: 28, background: "var(--zine-border)" }}></div>
          <div className="zine-align-group">
            <button
              className={`zine-align-btn ${align === "left" ? "active" : ""}`}
              title="左对齐"
              disabled={!text}
              onClick={() => handleAlignChange("left")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
            </button>
            <button
              className={`zine-align-btn ${align === "center" ? "active" : ""}`}
              title="居中"
              disabled={!text}
              onClick={() => handleAlignChange("center")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="10" x2="6" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="18" y1="18" x2="6" y2="18"/>
              </svg>
            </button>
            <button
              className={`zine-align-btn ${align === "right" ? "active" : ""}`}
              title="右对齐"
              disabled={!text}
              onClick={() => handleAlignChange("right")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="10" x2="7" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="21" y1="18" x2="7" y2="18"/>
              </svg>
            </button>
            <button
              className={`zine-align-btn ${align === "justify" ? "active" : ""}`}
              title="两端对齐"
              disabled={!text}
              onClick={() => handleAlignChange("justify")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="21" y1="18" x2="3" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 颜色 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">文字颜色</div>
        <div className="zine-color-row">
          {colors.map((c) => (
            <div
              key={c.color}
              className={`zine-color-dot ${textColor === c.color ? "active" : ""}`}
              style={{
                background: c.color,
                border: c.border ? "1.5px solid var(--zine-border)" : undefined
              }}
              title={c.name}
              onClick={() => handleTextColorChange(c.color)}
            />
          ))}
          <div className="zine-color-picker-btn" title="自定义颜色"></div>
          <div className="zine-color-input-wrap">
            <div className="zine-color-preview" style={{ background: textColor }}></div>
            <input
              className="zine-color-hex-input"
              value={textColor}
              maxLength={7}
              spellCheck={false}
              disabled={!text}
              onChange={(e) => handleTextColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 描边 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">描边</div>
        <div
          className={`zine-advanced-row ${strokeExpanded ? "expanded" : ""}`}
          onClick={() => text && setStrokeExpanded(!strokeExpanded)}
          style={{ opacity: text ? 1 : 0.5, cursor: text ? "pointer" : "not-allowed" }}
        >
          <span className="zine-advanced-row-label">描边设置</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 3, background: strokeColor, borderRadius: 2, border: `2px solid ${strokeWidth > 0 ? textColor : "transparent"}` }}></div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: strokeExpanded ? "rotate(180deg)" : undefined, transition: "transform .2s ease" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        {strokeExpanded && (
          <div className="zine-advanced-panel">
            <div className="zine-form-row">
              <div className="zine-form-group">
                <label className="zine-form-label">描边颜色</label>
                <div className="zine-color-row" style={{ gap: 4, flexWrap: "nowrap" }}>
                  {strokeColors.map((c) => (
                    <div
                      key={c.color}
                      className={`zine-color-dot ${strokeColor === c.color ? "active" : ""}`}
                      style={{ background: c.color, width: 20, height: 20 }}
                      onClick={() => handleStrokeColorChange(c.color)}
                    />
                  ))}
                  <div className="zine-color-picker-btn" style={{ width: 20, height: 20 }} title="自定义"></div>
                </div>
              </div>
              <div className="zine-form-group">
                <label className="zine-form-label">描边宽度</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={strokeWidth}
                  min={0}
                  max={20}
                  disabled={!text}
                  onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 阴影 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">阴影</div>
        <div
          className={`zine-advanced-row ${shadowExpanded ? "expanded" : ""}`}
          onClick={() => text && setShadowExpanded(!shadowExpanded)}
          style={{ opacity: text ? 1 : 0.5, cursor: text ? "pointer" : "not-allowed" }}
        >
          <span className="zine-advanced-row-label">阴影设置</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              className="zine-shadow-preview"
              style={{
                width: 40,
                height: 18,
                fontSize: 10,
                boxShadow: shadowEnabled ? `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.5)` : "none"
              }}
            >Aa</div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: shadowExpanded ? "rotate(180deg)" : undefined, transition: "transform .2s ease" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        {shadowExpanded && (
          <div className="zine-advanced-panel">
            <div className="zine-toggle-row">
              <span className="zine-toggle-label-text">启用阴影</span>
              <div
                className={`zine-toggle ${shadowEnabled ? "on" : ""}`}
                onClick={() => handleShadowToggle(!shadowEnabled)}
              ></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="zine-form-group">
                <label className="zine-form-label">X 偏移</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={shadowX}
                  disabled={!text}
                  onChange={(e) => handleShadowParamChange("x", Number(e.target.value))}
                />
              </div>
              <div className="zine-form-group">
                <label className="zine-form-label">Y 偏移</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={shadowY}
                  disabled={!text}
                  onChange={(e) => handleShadowParamChange("y", Number(e.target.value))}
                />
              </div>
              <div className="zine-form-group">
                <label className="zine-form-label">模糊半径</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={shadowBlur}
                  disabled={!text}
                  onChange={(e) => handleShadowParamChange("blur", Number(e.target.value))}
                />
              </div>
            </div>
            <div
              className="zine-shadow-preview"
              style={{
                fontSize: 18,
                fontWeight: 700,
                height: 44,
                textShadow: shadowEnabled ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}` : "none"
              }}
            >Aa 春天</div>
          </div>
        )}
      </div>
    </>
  );
}
