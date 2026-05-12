import React, { useCallback } from "react";
import { GalleryImage } from "@/features/collage-editor/types";

interface PhotoItemProps {
  photo: GalleryImage;
  index: number;
  zone: "unselected" | "selected";
  draggingId: string | null;
  sortInsertIndex: number | null;
  selectedLength: number;
  onDragStart: (e: React.DragEvent, photo: GalleryImage, fromZone: "unselected" | "selected") => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onSortItemDragOver?: (e: React.DragEvent, index: number) => void;
  onSortItemDrop?: (e: React.DragEvent, index: number) => void;
  onQuickMove: (photoId: string, targetZone: "unselected" | "selected") => void;
  onDelete: (isSelectedZone: boolean, photoId: string) => void;
}

export const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  index,
  zone,
  draggingId,
  sortInsertIndex,
  selectedLength,
  onDragStart,
  onDrag,
  onDragEnd,
  onSortItemDragOver,
  onSortItemDrop,
  onQuickMove,
  onDelete,
}) => {
  const isSelectedZone = zone === "selected";
  const buttonText = isSelectedZone ? "移除 ↑" : "加入 ↓";
  const targetZone = isSelectedZone ? "unselected" : "selected";

  const showInsertBefore =
    isSelectedZone && sortInsertIndex === index && draggingId !== null;

  const showInsertAfter =
    isSelectedZone &&
    index === selectedLength - 1 &&
    sortInsertIndex === selectedLength &&
    draggingId !== null;

  const handleQuickMove = useCallback(() => {
    onQuickMove(photo.id, targetZone);
  }, [photo.id, targetZone, onQuickMove]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(isSelectedZone, photo.id);
    },
    [isSelectedZone, photo.id, onDelete]
  );

  const itemDragHandlers = isSelectedZone
    ? {
        onDragOver: onSortItemDragOver ? (e: React.DragEvent) => onSortItemDragOver(e, index) : undefined,
        onDrop: onSortItemDrop ? (e: React.DragEvent) => onSortItemDrop(e, index) : undefined,
      }
    : {};

  return (
    <React.Fragment key={photo.id}>
      {showInsertBefore && <div className="pg-sort-insert-indicator" />}
      <div
        className={`pg-photo-item ${draggingId === photo.id ? "pg-dragging" : ""}`}
        draggable
        onDragStart={(e) => onDragStart(e, photo, zone)}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        {...itemDragHandlers}
      >
        <img src={photo.blobUrl || photo.src} alt="候选图片" draggable="false" />
        {isSelectedZone && (
          <div className="pg-photo-order-badge">{index + 1}</div>
        )}
        <div className="pg-photo-delete-btn-unselected">
          <span className="pg-delete-btn" onClick={handleDelete} title="删除">
            ×
          </span>
        </div>
        <div className="pg-photo-quick-add">
          <span className="pg-quick-btn" onClick={handleQuickMove}>
            {buttonText}
          </span>
        </div>
      </div>
      {showInsertAfter && <div className="pg-sort-insert-indicator" />}
    </React.Fragment>
  );
};
