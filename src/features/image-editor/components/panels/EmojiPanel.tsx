import { useState } from "react";
import * as fabric from "fabric";
import { useZineEditor } from "../../index";
import { createTextbox } from "@/editor/objects/textbox";

const EMOJI_DATA: Record<string, string[]> = {
  recent: [
    "🌸",
    "✨",
    "🎯",
    "💫",
    "🌈",
    "🎪",
    "🦋",
    "🍀",
    "🎉",
    "😊",
    "💕",
    "🌟",
    "🔥",
    "💯",
    "🎶",
    "🌺",
    "🏆",
    "🎭",
    "🦄",
    "🐉",
    "🎨",
    "🌙",
    "☀️",
    "🌊",
  ],
  smileys: [
    "😀",
    "😂",
    "🥲",
    "😊",
    "😍",
    "🤩",
    "😎",
    "🥳",
    "😜",
    "🤪",
    "😋",
    "😇",
    "🥰",
    "😘",
    "😏",
    "🤭",
    "🧐",
    "🤔",
    "😤",
    "🙄",
    "😴",
    "🤤",
    "😷",
    "🤒",
    "😈",
    "👻",
    "💀",
    "🤡",
    "👽",
    "💩",
    "🐱",
    "🙃",
    "😬",
    "😱",
    "😰",
    "😥",
    "😢",
    "😭",
    "🤯",
    "😳",
    "🥺",
  ],
  nature: [
    "🌸",
    "🌺",
    "🌹",
    "🌷",
    "🌼",
    "🌻",
    "🌞",
    "🌝",
    "🌛",
    "⭐",
    "🌟",
    "💫",
    "✨",
    "🌈",
    "☀️",
    "⛅",
    "🌤️",
    "🌧️",
    "⛈️",
    "❄️",
    "🌊",
    "🌴",
    "🌵",
    "🍁",
    "🍂",
    "🍃",
    "🌿",
    "🌱",
    "🌾",
    "🐾",
    "🦋",
    "🐝",
    "🐞",
    "🦊",
    "🐰",
    "🐻",
    "🐼",
    "🦁",
    "🐯",
    "🐸",
  ],
  food: [
    "🍎",
    "🍊",
    "🍋",
    "🍇",
    "🍓",
    "🫐",
    "🍑",
    "🍒",
    "🥭",
    "🍍",
    "🥥",
    "🍆",
    "🥑",
    "🥦",
    "🥕",
    "🌽",
    "🍔",
    "🍟",
    "🍕",
    "🌮",
    "🍜",
    "🍱",
    "🍣",
    "🍦",
    "🧁",
    "🎂",
    "🍰",
    "🍫",
    "🍬",
    "🍭",
    "☕",
    "🧋",
    "🍵",
    "🥤",
    "🍷",
    "🎉",
    "🎊",
    "🎁",
  ],
  travel: [
    "✈️",
    "🚀",
    "🛸",
    "🚁",
    "🛳️",
    "⛵",
    "🚂",
    "🏕️",
    "🗺️",
    "🧭",
    "🏔️",
    "🏖️",
    "🏜️",
    "🗼",
    "🗽",
    "🏰",
    "🎡",
    "⛩️",
    "🕌",
    "🏛️",
    "🌁",
    "🌃",
    "🌉",
    "🌆",
    "🌇",
    "🎠",
    "🎪",
    "🎭",
    "🗿",
    "🌏",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🎾",
    "🏐",
    "🏉",
    "🥊",
    "🏊",
    "🤸",
    "🧘",
    "🏋️",
    "🚴",
    "⛷️",
    "🏄",
    "🤽",
    "🏇",
    "🎯",
    "🎱",
    "🎮",
    "🎲",
    "♟️",
    "🎭",
    "🎨",
    "🖌️",
    "🎪",
    "🎡",
    "🎢",
    "🎠",
    "🎬",
    "🎤",
  ],
  objects: [
    "💡",
    "🔦",
    "🕯️",
    "📱",
    "💻",
    "⌨️",
    "🖥️",
    "📷",
    "📸",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "🔋",
    "💾",
    "💿",
    "📀",
    "🖨️",
    "⌚",
    "📡",
    "🔭",
    "🔬",
    "🩺",
    "💊",
    "🔑",
    "🗝️",
    "🔒",
    "🔓",
    "🪄",
    "🎩",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💔",
    "❣️",
    "♾️",
    "✅",
    "☑️",
    "✔️",
    "❌",
    "⭕",
    "🔴",
    "🟠",
    "🟡",
    "🟢",
    "🔵",
    "🟣",
    "⚫",
    "⚪",
    "🔶",
    "🔷",
    "🔸",
    "🔹",
  ],
};

const CATEGORIES = [
  { id: "recent", icon: "🕐", title: "最近使用" },
  { id: "smileys", icon: "😀", title: "表情" },
  { id: "nature", icon: "🌿", title: "自然" },
  { id: "food", icon: "🍎", title: "食物" },
  { id: "travel", icon: "✈️", title: "旅行" },
  { id: "activities", icon: "⚽", title: "活动" },
  { id: "objects", icon: "💡", title: "物品" },
  { id: "symbols", icon: "❤️", title: "符号" },
];

export default function EmojiPanel() {
  const { editor } = useZineEditor();
  const [currentCat, setCurrentCat] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
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

  const getFilteredEmojis = () => {
    if (searchQuery.trim()) {
      const allEmojis = Object.values(EMOJI_DATA).flat();
      return allEmojis.slice(0, 42); // 简化搜索
    }
    return EMOJI_DATA[currentCat] || [];
  };

  const getCategoryLabel = () => {
    const cat = CATEGORIES.find((c) => c.id === currentCat);
    return cat?.title || "表情";
  };

  return (
    <>
      {/* 搜索 */}
      <div className="zine-tool-section">
        <div className="zine-emoji-search">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--zine-text-muted)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索表情…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 分类 */}
      <div className="zine-tool-section">
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

      {/* 最近使用 */}
      {currentCat === "recent" && !searchQuery && (
        <div className="zine-tool-section">
          <div className="zine-section-label">最近使用</div>
          <div className="zine-recent-emojis">
            {recentEmojis.map((emoji, idx) => (
              <span
                key={`${emoji}-${idx}`}
                className="zine-recent-emoji"
                onClick={() => handleInsertEmoji(emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emoji 网格 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">{getCategoryLabel()}</div>
        <div className="zine-emoji-grid">
          {getFilteredEmojis().map((emoji, idx) => (
            <div
              key={`${emoji}-${idx}`}
              className="zine-emoji-item"
              onClick={() => handleInsertEmoji(emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* 插入大小 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">插入大小</div>
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

      {/* 底部按钮 */}
      <div className="zine-right-footer">
        <button className="zine-btn-full zine-btn-secondary-full">
          取消更改
        </button>
        <button className="zine-btn-full zine-btn-primary-full">应用</button>
      </div>
    </>
  );
}
