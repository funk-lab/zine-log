import { useState, useEffect } from "react";
import { useZineEditor } from "@/features/image-editor/index";
import { FONT_PRESET_FAMILY_LIST } from "@/features/utils/constants";
import { loadFont } from "@/features/utils";
import { isEmojiOnly } from "../utils";

const colors = [
  { color: "#1A1714", name: "黑色" },
  { color: "#FFFFFF", name: "白色", border: true },
  { color: "#C8773A", name: "品牌橙" },
  { color: "#2D6BE4", name: "蓝色" },
  { color: "#2DA861", name: "绿色" },
  { color: "#E04040", name: "红色" },
  { color: "#9B59B6", name: "紫色" },
];

export default function FontSetter() {
  const { object, editor } = useZineEditor();
  const [fontSize, setFontSize] = useState(22);
  const [fontFamily, setFontFamily] = useState(
    FONT_PRESET_FAMILY_LIST[0]?.value || ""
  );
  const [textColor, setTextColor] = useState(colors[0].color);

  // 将 object 断言为 fabric.Text 以访问文字属性
  const textObject = object as any;

  // 判断是否为纯 emoji 文本
  const isEmoji = textObject?.text ? isEmojiOnly(textObject.text) : false;

  useEffect(() => {
    if (textObject) {
      setFontSize(textObject.fontSize || 22);
      setFontFamily(textObject.fontFamily || FONT_PRESET_FAMILY_LIST[0]?.value);
      setTextColor((textObject.fill as string) || colors[0].color);
    }
  }, [textObject]);

  const handleFontSizeChange = (value: number) => {
    if (!textObject || !editor) return;
    setFontSize(value);
    textObject.set("fontSize", value);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleFontFamilyChange = async (value: string) => {
    if (!textObject || !editor) return;
    setFontFamily(value);
    try {
      await loadFont(value);
    } finally {
      textObject.set("fontFamily", value);
      editor.canvas.requestRenderAll();
      editor.fireCustomModifiedEvent?.();
    }
  };

  const handleColorChange = (color: string) => {
    if (!textObject || !editor) return;
    setTextColor(color);
    textObject.set("fill", color);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  if (!textObject) return null;

  return (
    <div className="zine-setter-section">
      {/* 纯 emoji 时显示不同标题 */}
      {isEmoji ? (
        <div className="zine-section-label">表情包</div>
      ) : (
        <>
          <div className="zine-section-label">字体</div>
          {/* 字体选择 */}
          <select
            className="zine-form-select"
            value={fontFamily}
            onChange={(e) => void handleFontFamilyChange(e.target.value)}
          >
            {FONT_PRESET_FAMILY_LIST.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label?.props?.children || font.value}
              </option>
            ))}
          </select>
        </>
      )}

      {/* 字号 - 始终显示 */}
      <div className="zine-form-row" style={{ marginTop: 12 }}>
        <div className="zine-form-group">
          <label className="zine-form-label">字号</label>
          <input
            type="number"
            className="zine-num-input"
            value={fontSize}
            min={6}
            max={200}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* 文字颜色 - 纯 emoji 时隐藏 */}
      {!isEmoji && (
        <>
          <div className="zine-section-label" style={{ marginTop: 12 }}>
            颜色
          </div>
          <div className="zine-color-row">
            {colors.map((c) => (
              <div
                key={c.color}
                className={`zine-color-dot ${
                  textColor === c.color ? "active" : ""
                }`}
                style={{
                  background: c.color,
                  border: c.border
                    ? "1.5px solid var(--zine-border)"
                    : undefined,
                }}
                title={c.name}
                onClick={() => handleColorChange(c.color)}
              />
            ))}
            <div className="zine-color-picker-btn" title="自定义颜色"></div>
          </div>
        </>
      )}
    </div>
  );
}
