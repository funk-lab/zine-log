import React from "react";

interface EmptyZoneProps {
  zone: "unselected" | "selected";
}

export const EmptyZone: React.FC<EmptyZoneProps> = ({ zone }) => {
  const isSelectedZone = zone === "selected";

  return (
    <div className={`pg-zone-empty ${isSelectedZone ? "pg-zone-empty-selected" : ""}`}>
      {isSelectedZone ? (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="20 6 9 17 4 12" />
            <path d="M12 2a10 10 0 1 0 10 10" />
          </svg>
          <span>从上方拖拽图片到此处</span>
          <span className="pg-zone-empty-hint">或从文件夹拖入文件</span>
        </>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>拖拽图片到此处</span>
          <span className="pg-zone-empty-hint">或从文件夹拖入文件</span>
        </>
      )}
    </div>
  );
};
