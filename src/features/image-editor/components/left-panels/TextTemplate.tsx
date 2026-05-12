import { useZineEditor } from "../../index";
import { createTextbox } from "@/features/editor/objects/textbox";

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

export default function TextTemplate() {
  const { editor } = useZineEditor();

  const handleAddText = async (config = {}) => {
    if (!editor) return;
    await createTextbox({ ...config, canvas: editor.canvas });
    // 保持当前工具状态
  };

  return (
    <div className="zine-left-panel-content">
      <div className="zine-left-panel-header">
        <span>文字模板</span>
        <span style={{ fontSize: 11, color: "var(--zine-text-muted)" }}>
          点击插入
        </span>
      </div>

      <div className="zine-left-section">
        {/* 添加文本按钮 */}
        <button
          className="zine-btn-full zine-btn-primary-full"
          onClick={() => void handleAddText()}
          style={{ marginBottom: 16 }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: 6, verticalAlign: "middle" }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加文本框
        </button>

        {/* 预设文字模板 */}
        <div className="zine-left-section-title">快速模板</div>
        <div className="zine-preset-list">
          {PRESET_TEXT_LIST.map((item) => (
            <div
              key={item.key}
              className="zine-preset-card"
              onClick={() => void handleAddText(item.config)}
            >
              <div style={item.style}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
