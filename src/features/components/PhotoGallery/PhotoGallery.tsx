import React, { useRef, useCallback } from "react";
import "./PhotoGallery.css";

import { useGlobalState } from "@/features/context";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { usePhotoOperations } from "./hooks/usePhotoOperations";
import { useZoneResize } from "./hooks/useZoneResize";
import {
  PhotoItem,
  UploadArea,
  ZoneHeader,
  DragGhost,
  EmptyZone,
} from "./components";

export interface PhotoGalleryProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用自定义 hooks
  const {
    handleQuickMove,
    handleDeletePhoto,
    handleMoveAllToSelected,
    handleClearSelected,
    handleAddBlankImage,
    handleFileUpload,
  } = usePhotoOperations();

  const {
    draggingId,
    dragOverZone,
    sortInsertIndex,
    ghostPos,
    ghostImg,
    ghostColor,
    handleDragStart,
    handleDrag,
    clearDragState,
    handleZoneDragOver,
    handleZoneDragLeave,
    handleSortItemDragOver,
    handleSortItemDrop,
    handleZoneDrop,
  } = useDragAndDrop(handleFileUpload);

  const {
    zoneHeights,
    zoneUnselectedRef,
    zoneSelectedRef,
    dividerRef,
  } = useZoneResize(containerRef);

  // 使用全局状态获取照片数据
  const {
    unselectedPhotos: unselected = [],
    selectedPhotos: selected = [],
  } = useGlobalState();

  // 渲染照片列表
  const renderPhotos = useCallback(
    (photos: typeof unselected, zone: "unselected" | "selected") => {
      if (photos.length === 0) {
        return <EmptyZone zone={zone} />;
      }

      return (
        <div className="pg-zone-grid">
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              index={index}
              zone={zone}
              draggingId={draggingId}
              sortInsertIndex={sortInsertIndex}
              selectedLength={selected.length}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={clearDragState}
              onSortItemDragOver={zone === "selected" ? handleSortItemDragOver : undefined}
              onSortItemDrop={zone === "selected" ? handleSortItemDrop : undefined}
              onQuickMove={handleQuickMove}
              onDelete={handleDeletePhoto}
            />
          ))}
        </div>
      );
    },
    [draggingId, sortInsertIndex, selected.length, handleDragStart, handleDrag, clearDragState, handleSortItemDragOver, handleSortItemDrop, handleQuickMove, handleDeletePhoto]
  );

  return (
    <aside
      className={`pg-panel-left ${className}`}
      style={style}
      ref={containerRef}
    >
      {/* 面板标题 */}
      <div className="pg-panel-header">
        <div className="pg-panel-title">素材图库</div>
      </div>

      {/* 上传区 */}
      <UploadArea onUpload={handleFileUpload} />

      {/* 双区拖拽主体 */}
      <div className="pg-dual-zones">
        {/* 区域 A：未选中 */}
        <div
          ref={zoneUnselectedRef}
          className={`pg-photo-zone pg-zone-unselected ${
            dragOverZone === "unselected" ? "pg-drag-over" : ""
          }`}
          style={{ flex: `${zoneHeights.unselected} 1 0%` }}
          onDragOver={(e) => handleZoneDragOver(e, "unselected")}
          onDragLeave={handleZoneDragLeave}
          onDrop={(e) => handleZoneDrop(e, "unselected")}
        >
          <ZoneHeader
            zone="unselected"
            count={unselected.length}
            onAddBlank={handleAddBlankImage}
            onMoveAll={handleMoveAllToSelected}
            isMoveAllDisabled={unselected.length === 0}
          />
          <div className="pg-zone-grid-wrap">
            {renderPhotos(unselected, "unselected")}
          </div>
        </div>

        {/* 分隔手柄 */}
        <div className="pg-zone-divider" ref={dividerRef}>
          <div className="pg-zone-divider-handle" />
        </div>

        {/* 区域 B：已选中 */}
        <div
          ref={zoneSelectedRef}
          className={`pg-photo-zone pg-zone-selected ${
            dragOverZone === "selected" ? "pg-drag-over" : ""
          }`}
          style={{ flex: `${zoneHeights.selected} 1 0%` }}
          onDragOver={(e) => handleZoneDragOver(e, "selected")}
          onDragLeave={handleZoneDragLeave}
          onDrop={(e) => handleZoneDrop(e, "selected")}
        >
          <ZoneHeader
            zone="selected"
            count={selected.length}
            onClearAll={handleClearSelected}
            isClearAllDisabled={selected.length === 0}
          />
          <div className="pg-zone-grid-wrap">
            {renderPhotos(selected, "selected")}
          </div>
        </div>
      </div>

      {/* 拖拽幽灵 */}
      <DragGhost
        ghostPos={ghostPos}
        ghostImg={ghostImg}
        ghostColor={ghostColor}
        draggingId={draggingId}
      />
    </aside>
  );
};

export default PhotoGallery;
