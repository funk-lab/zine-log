import { useZineEditor } from "../../index";

const alignOptions = [
  {
    id: "left",
    label: "左对齐",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="18" y2="18" />
      </svg>
    ),
  },
  {
    id: "center",
    label: "水平居中",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    id: "right",
    label: "右对齐",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    id: "top",
    label: "顶部对齐",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="6" y1="3" x2="6" y2="21" />
        <line x1="12" y1="3" x2="12" y2="15" />
        <line x1="18" y1="3" x2="18" y2="18" />
      </svg>
    ),
  },
  {
    id: "middle",
    label: "垂直居中",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="6" y1="3" x2="6" y2="21" />
        <line x1="12" y1="6" x2="12" y2="18" />
        <line x1="18" y1="3" x2="18" y2="21" />
      </svg>
    ),
  },
  {
    id: "bottom",
    label: "底部对齐",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="6" y1="3" x2="6" y2="21" />
        <line x1="12" y1="9" x2="12" y2="21" />
        <line x1="18" y1="6" x2="18" y2="21" />
      </svg>
    ),
  },
];

const distributeOptions = [
  {
    id: "h-space",
    label: "水平分布",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="3" y1="6" x2="3" y2="18" />
        <line x1="12" y1="6" x2="12" y2="18" />
        <line x1="21" y1="6" x2="21" y2="18" />
        <line x1="3" y1="12" x2="12" y2="12" strokeDasharray="2,2" />
        <line x1="12" y1="12" x2="21" y2="12" strokeDasharray="2,2" />
      </svg>
    ),
  },
  {
    id: "v-space",
    label: "垂直分布",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="6" y1="3" x2="18" y2="3" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="6" y1="21" x2="18" y2="21" />
        <line x1="12" y1="3" x2="12" y2="12" strokeDasharray="2,2" />
        <line x1="12" y1="12" x2="12" y2="21" strokeDasharray="2,2" />
      </svg>
    ),
  },
];

export default function AlignPanel() {
  const { editor, object } = useZineEditor();

  const handleAlign = (type: string) => {
    if (!editor || !object) return;
    // TODO: 实现对齐逻辑
    console.log("Align:", type);
  };

  const handleDistribute = (type: string) => {
    if (!editor) return;
    // TODO: 实现分布逻辑
    console.log("Distribute:", type);
  };

  return (
    <>
      {/* 对齐 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">对齐</div>
        <div className="zine-preset-grid">
          {alignOptions.map((opt) => (
            <button
              key={opt.id}
              className="zine-preset-item"
              title={opt.label}
              onClick={() => handleAlign(opt.id)}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>

      {/* 分布 */}
      <div className="zine-tool-section">
        <div className="zine-section-label">分布</div>
        <div className="zine-transform-group">
          {distributeOptions.map((opt) => (
            <button
              key={opt.id}
              className="zine-transform-btn"
              onClick={() => handleDistribute(opt.id)}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
