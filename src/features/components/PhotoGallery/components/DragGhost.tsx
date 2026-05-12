import React from "react";

interface DragGhostProps {
  ghostPos: { x: number; y: number } | null;
  ghostImg: string;
  ghostColor: string;
  draggingId: string | null;
}

export const DragGhost: React.FC<DragGhostProps> = ({
  ghostPos,
  ghostImg,
  ghostColor,
  draggingId,
}) => {
  if (!ghostPos || !draggingId) return null;

  return (
    <div
      className="pg-drag-ghost"
      style={{
        left: ghostPos.x,
        top: ghostPos.y,
        background: ghostImg ? undefined : ghostColor,
      }}
    >
      {ghostImg && (
        <img
          src={ghostImg}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable="false"
        />
      )}
    </div>
  );
};
