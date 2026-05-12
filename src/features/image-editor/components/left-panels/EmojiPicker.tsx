import { useState } from "react";
import * as fabric from "fabric";
import { useZineEditor } from "../../index";
import { createTextbox } from "@/features/editor/objects/textbox";
import { EMOJI_DATA, CATEGORIES } from "./emojiData";

export default function EmojiPicker() {
  const { editor } = useZineEditor();
  const [currentCat, setCurrentCat] = useState("recent");
  const [emojiSize, setEmojiSize] = useState(64);
  const [recentEmojis, setRecentEmojis] = useState(EMOJI_DATA.recent);

  const handleInsertEmoji = async (emoji: string) => {
    if (!editor) return;

    const object = editor.canvas.getActiveObject() as fabric.Textbox;
    if (object && object.type === "textbox") {
      // 如果当前选中的是文本框，在文本后追加 emoji
      object.set("text", `${object.text}${emoji}`);
      editor.canvas.requestRenderAll();
    } else {
      // 否则创建一个新的文本框插入 emoji
      await createTextbox({
        text: emoji,
        fontSize: emojiSize,
        width: 100,
        canvas: editor.canvas,
      });
    }

    // 添加到最近使用
    if (!recentEmojis.includes(emoji)) {
      setRecentEmojis([emoji, ...recentEmojis.slice(0, 7)]);
    }
  };

  const getCategoryLabel = () => {
    const cat = CATEGORIES.find((c) => c.id === currentCat);
    return cat?.title || "表情";
  };

  const handleClickEmoji = (emoji: string) => {
    handleInsertEmoji(emoji);
  };

  return (
    <div className="zine-left-panel-content">
      <div className="zine-left-panel-header">
        <span>表情 & 贴纸</span>
        <span style={{ fontSize: 11, color: "var(--zine-text-muted)" }}>
          点击插入
        </span>
      </div>

      {/* 分类 */}
      <div className="zine-left-section">
        <div className="zine-emoji-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`zine-emoji-cat-btn ${
                currentCat === cat.id ? "active" : ""
              }`}
              title={cat.title}
              onClick={() => setCurrentCat(cat.id)}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji 网格 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">{getCategoryLabel()}</div>
        <div className="zine-emoji-grid">
          {EMOJI_DATA[currentCat].map((emoji, idx) => (
            <div
              key={`${emoji}-${idx}`}
              className="zine-emoji-item"
              onClick={() => handleClickEmoji(emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* 插入大小 */}
      <div className="zine-left-section">
        <div className="zine-left-section-title">插入大小</div>
        <div className="zine-slider-row">
          <span className="zine-slider-label">尺寸</span>
          <input
            type="range"
            min={16}
            max={240}
            value={emojiSize}
            onChange={(e) => setEmojiSize(Number(e.target.value))}
          />
          <span className="zine-slider-val">{emojiSize}px</span>
        </div>
      </div>
    </div>
  );
}
