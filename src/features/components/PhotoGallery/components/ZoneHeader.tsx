import React from "react";

interface ZoneHeaderProps {
  zone: "unselected" | "selected";
  count: number;
  onAddBlank?: () => void;
  onMoveAll?: () => void;
  onClearAll?: () => void;
  isMoveAllDisabled?: boolean;
  isClearAllDisabled?: boolean;
}

export const ZoneHeader: React.FC<ZoneHeaderProps> = ({
  zone,
  count,
  onAddBlank,
  onMoveAll,
  onClearAll,
  isMoveAllDisabled,
  isClearAllDisabled,
}) => {
  const isSelectedZone = zone === "selected";

  return (
    <div className="pg-zone-header">
      <div className="pg-zone-title">
        {isSelectedZone ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
        {isSelectedZone ? "已选入画" : "待选素材"}
        <span className={`pg-zone-badge ${isSelectedZone ? "pg-zone-badge-selected" : ""}`}>
          {count}
        </span>
      </div>
      {isSelectedZone ? (
        <button
          className="pg-zone-action pg-zone-action-danger"
          onClick={onClearAll}
          disabled={isClearAllDisabled}
        >
          全部移除 ×
        </button>
      ) : (
        <>
          <button className="pg-zone-action" onClick={onAddBlank} title="添加空白图片">
            + 空白页
          </button>
          <button
            className="pg-zone-action"
            onClick={onMoveAll}
            disabled={isMoveAllDisabled}
          >
            全部加入 →
          </button>
        </>
      )}
    </div>
  );
};
