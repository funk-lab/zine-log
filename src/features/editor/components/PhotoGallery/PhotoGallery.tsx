import React, { useState, useRef, useCallback, useEffect } from "react";
import "./PhotoGallery.css";
import { GalleryImage } from "@/features/editor/types";

// ==================== 类型定义 ====================

export interface PhotoGalleryProps {
  /** 待选素材列表 */
  unselectedPhotos: GalleryImage[];
  /** 已选素材列表 */
  selectedPhotos: GalleryImage[];
  /** 待选素材变更回调 */
  onUnselectedChange?: (photos: GalleryImage[]) => void;
  /** 已选素材变更回调 */
  onSelectedChange?: (photos: GalleryImage[]) => void;
  /** 上传按钮点击回调 */
  // onUpload?: () => void;
  onUpload: (files: FileList | null) => void;
  /** 删除图片回调 */
  onPhotoDelete?: (photoId: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  unselectedPhotos: unselected = [],
  selectedPhotos: selected = [],
  onUnselectedChange,
  onSelectedChange,
  onUpload,
  className = "",
  style,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /** 拖拽来源区域 */
  const draggingFromZoneRef = useRef<"unselected" | "selected" | null>(null);
  const [dragOverZone, setDragOverZone] = useState<
    "unselected" | "selected" | null
  >(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [ghostImg, setGhostImg] = useState<string>("");
  const [ghostColor, setGhostColor] = useState<string>("");
  const [zoneHeights, setZoneHeights] = useState<{
    unselected: number;
    selected: number;
  }>({
    unselected: 50,
    selected: 50,
  });

  /**
   * 区域 B 内部排序用：记录当前拖拽悬停的目标 index 及插入方向
   * insertIndex: 插入到哪个 index 之前（-1 表示尾部追加）
   */
  const [sortInsertIndex, setSortInsertIndex] = useState<number | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const zoneUnselectedRef = useRef<HTMLDivElement>(null);
  const zoneSelectedRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // ==================== 拖拽逻辑 ====================

  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      photo: GalleryImage,
      fromZone: "unselected" | "selected"
    ) => {
      draggingFromZoneRef.current = fromZone;
      setDraggingId(photo.id);
      setGhostColor(photo.color || "#ccc");
      // 优先使用 blobUrl，兼容旧数据使用 src
      setGhostImg(photo.blobUrl || photo.src || "");

      // 使用空白图片隐藏默认拖影
      const blank = document.createElement("canvas");
      blank.width = blank.height = 1;
      e.dataTransfer.setDragImage(blank, 0, 0);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("photoId", photo.id);
      e.dataTransfer.setData("fromZone", fromZone);
    },
    []
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      if (draggingId && (e.clientX !== 0 || e.clientY !== 0)) {
        setGhostPos({ x: e.clientX, y: e.clientY });
      }
    },
    [draggingId]
  );

  const clearDragState = useCallback(() => {
    setDraggingId(null);
    setGhostPos(null);
    setDragOverZone(null);
    setSortInsertIndex(null);
    draggingFromZoneRef.current = null;
  }, []);

  /** 检查是否为外部文件拖入 */
  const isExternalFileDrag = useCallback((e: React.DragEvent) => {
    return e.dataTransfer.types.includes("Files");
  }, []);

  const handleZoneDragOver = useCallback(
    (e: React.DragEvent, zone: "unselected" | "selected") => {
      e.preventDefault();

      // 外部文件拖入
      if (isExternalFileDrag(e)) {
        e.dataTransfer.dropEffect = "copy";
        setDragOverZone(zone);
        return;
      }

      // 内部图片拖拽
      e.dataTransfer.dropEffect = "move";
      setDragOverZone(zone);
      // 离开已选区域时，清除排序指示器
      if (zone !== "selected") {
        setSortInsertIndex(null);
      }
    },
    [isExternalFileDrag]
  );

  const handleZoneDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!containerRef.current?.contains(relatedTarget)) {
      setDragOverZone(null);
      setSortInsertIndex(null);
    }
  }, []);

  const moveItem = useCallback(
    (photoId: string, targetZone: "unselected" | "selected") => {
      const photoInUnselected = unselected.find((p) => p.id === photoId);
      const photoInSelected = selected.find((p) => p.id === photoId);
      const photo = photoInUnselected || photoInSelected;
      const sourceZone = photoInUnselected ? "unselected" : "selected";

      if (!photo || sourceZone === targetZone) return;

      if (targetZone === "selected") {
        onUnselectedChange?.(unselected.filter((p) => p.id !== photoId));
        onSelectedChange?.([...selected, photo]);
      } else {
        onSelectedChange?.(selected.filter((p) => p.id !== photoId));
        onUnselectedChange?.([...unselected, photo]);
      }
    },
    [unselected, selected, onUnselectedChange, onSelectedChange]
  );

  /**
   * 区域 B 内部排序：item 级别 dragOver
   * 根据鼠标在 item 左半 / 右半决定插入到该 item 之前或之后
   */
  const handleSortItemDragOver = useCallback(
    (e: React.DragEvent, overIndex: number) => {
      // 只有拖拽目标是 selected 区时才触发排序（无论是区域内还是跨区域）
      if (
        draggingFromZoneRef.current !== "selected" &&
        draggingFromZoneRef.current !== "unselected"
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDragOverZone("selected");

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      // 鼠标在左半 → 插入到 overIndex 之前；右半 → 插入到 overIndex+1 之前
      const insertBefore = e.clientX < midX ? overIndex : overIndex + 1;
      setSortInsertIndex(insertBefore);
    },
    [setDragOverZone, setSortInsertIndex]
  );

  /**
   * 区域 B 内部排序：drop 时重排数组
   */
  const handleSortItemDrop = useCallback(
    (e: React.DragEvent, overIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const photoId = e.dataTransfer.getData("photoId");
      const fromZone = e.dataTransfer.getData("fromZone") as
        | "unselected"
        | "selected";

      if (!photoId) {
        clearDragState();
        return;
      }

      if (fromZone === "selected") {
        // ——— 区域内排序 ———
        const dragIndex = selected.findIndex((p) => p.id === photoId);
        if (dragIndex === -1) {
          clearDragState();
          return;
        }

        // 使用 sortInsertIndex（拖拽悬停时计算的位置），确保与视觉指示一致
        let insertBefore = sortInsertIndex ?? overIndex;

        // 移除被拖拽项后，调整插入位置
        const newSelected = [...selected];
        const [draggedItem] = newSelected.splice(dragIndex, 1);
        // 如果原本在 insertBefore 之前，索引需要修正
        if (dragIndex < insertBefore) insertBefore -= 1;
        insertBefore = Math.max(0, Math.min(insertBefore, newSelected.length));
        newSelected.splice(insertBefore, 0, draggedItem);
        onSelectedChange?.(newSelected);
      } else {
        // ——— 跨区域移动（A → B），插入到指定位置 ———
        const photo =
          unselected.find((p) => p.id === photoId) ||
          selected.find((p) => p.id === photoId);
        if (!photo) {
          clearDragState();
          return;
        }

        // 使用 sortInsertIndex（拖拽悬停时计算的位置），确保与视觉指示一致
        let insertBefore = sortInsertIndex ?? overIndex + 1;
        // 如果是从右侧拖入，默认插入到当前 item 之后
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (sortInsertIndex === null) {
          insertBefore = e.clientX < midX ? overIndex : overIndex + 1;
        }
        insertBefore = Math.max(0, Math.min(insertBefore, selected.length));

        const newSelected = [...selected];
        newSelected.splice(insertBefore, 0, photo);
        onSelectedChange?.(newSelected);
        onUnselectedChange?.(unselected.filter((p) => p.id !== photoId));
      }

      clearDragState();
    },
    [
      selected,
      unselected,
      onSelectedChange,
      onUnselectedChange,
      clearDragState,
      sortInsertIndex,
    ]
  );

  const handleZoneDrop = useCallback(
    (e: React.DragEvent, targetZone: "unselected" | "selected") => {
      e.preventDefault();

      // 处理外部文件拖入
      if (isExternalFileDrag(e)) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          onUpload(files);
        }
        setDragOverZone(null);
        return;
      }

      const photoId = e.dataTransfer.getData("photoId");
      const fromZone = e.dataTransfer.getData("fromZone") as
        | "unselected"
        | "selected";

      // 如果落到 selected 区域背景（非 item）且来自 selected，使用 sortInsertIndex 排序
      if (targetZone === "selected" && fromZone === "selected" && photoId) {
        const dragIndex = selected.findIndex((p) => p.id === photoId);
        if (dragIndex !== -1) {
          // 如果有 sortInsertIndex，使用它；否则追加到末尾
          if (sortInsertIndex !== null) {
            let insertBefore = sortInsertIndex;
            const newSelected = [...selected];
            const [draggedItem] = newSelected.splice(dragIndex, 1);
            if (dragIndex < insertBefore) insertBefore -= 1;
            insertBefore = Math.max(
              0,
              Math.min(insertBefore, newSelected.length)
            );
            newSelected.splice(insertBefore, 0, draggedItem);
            onSelectedChange?.(newSelected);
          } else {
            // 没有 sortInsertIndex，追加到末尾
            const newSelected = [...selected];
            const [draggedItem] = newSelected.splice(dragIndex, 1);
            newSelected.push(draggedItem);
            onSelectedChange?.(newSelected);
          }
          clearDragState();
          return;
        }
      }

      // 从区域 A 拖拽到区域 B 的空白处，且 sortInsertIndex 有值时，插入到指定位置
      if (
        targetZone === "selected" &&
        fromZone === "unselected" &&
        photoId &&
        sortInsertIndex !== null
      ) {
        const photo = unselected.find((p) => p.id === photoId);
        if (photo) {
          const insertBefore = Math.max(
            0,
            Math.min(sortInsertIndex, selected.length)
          );
          const newSelected = [...selected];
          newSelected.splice(insertBefore, 0, photo);
          onSelectedChange?.(newSelected);
          onUnselectedChange?.(unselected.filter((p) => p.id !== photoId));
          clearDragState();
          return;
        }
      }

      clearDragState();
      if (photoId) {
        moveItem(photoId, targetZone);
      }
    },
    [
      selected,
      unselected,
      moveItem,
      onSelectedChange,
      onUnselectedChange,
      clearDragState,
      isExternalFileDrag,
      onUpload,
      sortInsertIndex,
    ]
  );

  // ==================== 快捷操作 ====================

  const handleQuickMove = useCallback(
    (photoId: string, targetZone: "unselected" | "selected") => {
      moveItem(photoId, targetZone);
    },
    [moveItem]
  );

  const handleDeletePhoto = useCallback(
    (isSelectedZone: boolean, photoId: string) => {
      if (isSelectedZone) {
        onSelectedChange?.(selected.filter((p) => p.id !== photoId));
      } else {
        onUnselectedChange?.(unselected.filter((p) => p.id !== photoId));
      }
      // onPhotoDelete?.(photoId);
    },
    [onUnselectedChange, unselected, onSelectedChange, selected]
  );

  const handleMoveAllToSelected = useCallback(() => {
    if (unselected.length === 0) return;
    onSelectedChange?.([...selected, ...unselected]);
    onUnselectedChange?.([]);
  }, [unselected, selected, onSelectedChange, onUnselectedChange]);

  const handleClearSelected = useCallback(() => {
    if (selected.length === 0) return;
    onUnselectedChange?.([...unselected, ...selected]);
    onSelectedChange?.([]);
  }, [unselected, selected, onUnselectedChange, onSelectedChange]);

  /** 添加空白图片到待选素材 */
  const handleAddBlankImage = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const blankImage: GalleryImage = {
          id: `img_${Date.now()}_blank`,
          src: "",
          blobUrl: URL.createObjectURL(blob),
          name: `空白图片_${unselected.length + 1}.png`,
          uploadedAt: Date.now(),
          mimeType: "image/png",
          size: blob.size,
          color: "#ffffff",
          rotate: 0,
          fitMode: "cover",
          zoom: 1,
          flipX: false,
          flipY: false,
          offsetX: 0,
          offsetY: 0,
          brightness: 0,
          contrast: 0,
          saturate: 0,
          grayscale: false,
          borderRadius: 0,
          margin: 0,
        };
        onUnselectedChange?.([...unselected, blankImage]);
      }
    }, "image/png");
  }, [unselected, onUnselectedChange]);

  // ==================== 分隔线拖拽调整高度 ====================

  useEffect(() => {
    const divider = dividerRef.current;
    const container = containerRef.current;
    if (!divider || !container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isResizingRef.current = true;
      const startY = e.clientY;
      const containerHeight = container.getBoundingClientRect().height;
      const zoneUnselected = zoneUnselectedRef.current;
      const zoneSelected = zoneSelectedRef.current;

      if (!zoneUnselected || !zoneSelected) return;

      const startUnselectedHeight =
        zoneUnselected.getBoundingClientRect().height;
      const startSelectedHeight = zoneSelected.getBoundingClientRect().height;

      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (mv: MouseEvent) => {
        if (!isResizingRef.current) return;
        const dy = mv.clientY - startY;
        const minHeight = 80;

        const newUnselectedHeight = Math.max(
          minHeight,
          startUnselectedHeight + dy
        );
        const newSelectedHeight = Math.max(minHeight, startSelectedHeight - dy);

        const totalHeight = newUnselectedHeight + newSelectedHeight + 6; // 6px for divider

        if (totalHeight <= containerHeight) {
          const unselectedPercent =
            (newUnselectedHeight / (newUnselectedHeight + newSelectedHeight)) *
            100;
          setZoneHeights({
            unselected: unselectedPercent,
            selected: 100 - unselectedPercent,
          });
        }
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    divider.addEventListener("mousedown", handleMouseDown);
    return () => divider.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ==================== 渲染辅助 ====================

  const renderGalleryImage = (
    photo: GalleryImage,
    index: number,
    zone: "unselected" | "selected"
  ) => {
    const isSelectedZone = zone === "selected";
    const buttonText = isSelectedZone ? "移除 ↑" : "加入 ↓";
    const targetZone = isSelectedZone ? "unselected" : "selected";

    // 区域 B 的排序插入指示线
    // showInsertBefore: 在当前 item 左侧插入
    const showInsertBefore =
      isSelectedZone && sortInsertIndex === index && draggingId !== null;
    // showInsertAfter: 在最后一个 item 右侧（末尾）插入
    const showInsertAfter =
      isSelectedZone &&
      index === selected.length - 1 &&
      sortInsertIndex === selected.length &&
      draggingId !== null;

    const itemDragHandlers = isSelectedZone
      ? {
          onDragOver: (e: React.DragEvent) => handleSortItemDragOver(e, index),
          onDrop: (e: React.DragEvent) => handleSortItemDrop(e, index),
        }
      : {};

    return (
      <React.Fragment key={photo.id}>
        {/* 在 item 左侧插入指示线 */}
        {showInsertBefore && <div className="pg-sort-insert-indicator" />}
        <div
          className={`pg-photo-item ${
            draggingId === photo.id ? "pg-dragging" : ""
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, photo, zone)}
          onDrag={handleDrag}
          onDragEnd={clearDragState}
          {...itemDragHandlers}
        >
          {/* 优先使用 blobUrl，兼容旧数据使用 src */}
          <img
            src={photo.blobUrl || photo.src}
            alt="候选图片"
            draggable="false"
          />
          {isSelectedZone && (
            <div className="pg-photo-order-badge">{index + 1}</div>
          )}
          <div className="pg-photo-delete-btn-unselected">
            <span
              className="pg-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePhoto(isSelectedZone, photo.id);
              }}
              title="删除"
            >
              ×
            </span>
          </div>
          <div className="pg-photo-quick-add">
            <span
              className="pg-quick-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickMove(photo.id, targetZone);
              }}
            >
              {buttonText}
            </span>
          </div>
        </div>
        {/* 在最后一个 item 右侧插入指示线 */}
        {showInsertAfter && <div className="pg-sort-insert-indicator" />}
      </React.Fragment>
    );
  };

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
      <label className="flex pg-upload-area ">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => onUpload(event.target.files)}
        />
        <div className="pg-upload-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div>
          <div className="pg-upload-text">上传照片</div>
          <div className="pg-upload-hint">JPG / PNG </div>
        </div>
        <div className="pg-upload-action">点击上传</div>
      </label>

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
          <div className="pg-zone-header">
            <div className="pg-zone-title">
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
              待选素材
              <span className="pg-zone-badge">{unselected.length}</span>
            </div>
            <button
              className="pg-zone-action"
              onClick={handleAddBlankImage}
              title="添加空白图片"
            >
              + 空白页
            </button>
            <button
              className="pg-zone-action"
              onClick={handleMoveAllToSelected}
              disabled={unselected.length === 0}
            >
              全部加入 →
            </button>
          </div>
          <div className="pg-zone-grid-wrap">
            {unselected.length === 0 ? (
              <div className="pg-zone-empty">
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
              </div>
            ) : (
              <div className="pg-zone-grid">
                {unselected.map((photo, index) =>
                  renderGalleryImage(photo, index, "unselected")
                )}
              </div>
            )}
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
          <div className="pg-zone-header">
            <div className="pg-zone-title">
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
              已选入画
              <span className="pg-zone-badge pg-zone-badge-selected">
                {selected.length}
              </span>
            </div>
            <button
              className="pg-zone-action pg-zone-action-danger"
              onClick={handleClearSelected}
              disabled={selected.length === 0}
            >
              全部移除 ×
            </button>
          </div>
          <div className="pg-zone-grid-wrap">
            {selected.length === 0 ? (
              <div className="pg-zone-empty pg-zone-empty-selected">
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
              </div>
            ) : (
              <div className="pg-zone-grid">
                {selected.map((photo, index) =>
                  renderGalleryImage(photo, index, "selected")
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 拖拽幽灵 */}
      {ghostPos && draggingId && (
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
      )}
    </aside>
  );
};

export default PhotoGallery;
