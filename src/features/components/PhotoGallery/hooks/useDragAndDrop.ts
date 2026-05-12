import { useState, useCallback, useRef } from "react";
import { GalleryImage } from "@/features/collage-editor/types";
import { useGlobalState } from "@/features/context";

interface UseDragAndDropReturn {
  draggingId: string | null;
  draggingFromZoneRef: React.MutableRefObject<"unselected" | "selected" | null>;
  dragOverZone: "unselected" | "selected" | null;
  setDragOverZone: React.Dispatch<React.SetStateAction<"unselected" | "selected" | null>>;
  sortInsertIndex: number | null;
  setSortInsertIndex: React.Dispatch<React.SetStateAction<number | null>>;
  ghostPos: { x: number; y: number } | null;
  ghostImg: string;
  ghostColor: string;
  handleDragStart: (
    e: React.DragEvent,
    photo: GalleryImage,
    fromZone: "unselected" | "selected"
  ) => void;
  handleDrag: (e: React.DragEvent) => void;
  clearDragState: () => void;
  handleZoneDragOver: (e: React.DragEvent, zone: "unselected" | "selected") => void;
  handleZoneDragLeave: (e: React.DragEvent) => void;
  handleSortItemDragOver: (e: React.DragEvent, overIndex: number) => void;
  handleSortItemDrop: (e: React.DragEvent, overIndex: number) => void;
  handleZoneDrop: (e: React.DragEvent, targetZone: "unselected" | "selected") => void;
  moveItem: (photoId: string, targetZone: "unselected" | "selected") => void;
}

export const useDragAndDrop = (onUpload?: (files: FileList | null) => void): UseDragAndDropReturn => {
  const {
    unselectedPhotos: unselected = [],
    selectedPhotos: selected = [],
    setUnselectedPhotos,
    setSelectedPhotos,
  } = useGlobalState();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingFromZoneRef = useRef<"unselected" | "selected" | null>(null);
  const [dragOverZone, setDragOverZone] = useState<"unselected" | "selected" | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [ghostImg, setGhostImg] = useState<string>("");
  const [ghostColor, setGhostColor] = useState<string>("");

  const [sortInsertIndex, setSortInsertIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      photo: GalleryImage,
      fromZone: "unselected" | "selected"
    ) => {
      draggingFromZoneRef.current = fromZone;
      setDraggingId(photo.id);
      setGhostColor(photo.color || "#ccc");
      setGhostImg(photo.blobUrl || photo.src || "");

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

  const isExternalFileDrag = useCallback((e: React.DragEvent) => {
    return e.dataTransfer.types.includes("Files");
  }, []);

  const handleZoneDragOver = useCallback(
    (e: React.DragEvent, zone: "unselected" | "selected") => {
      e.preventDefault();

      if (isExternalFileDrag(e)) {
        e.dataTransfer.dropEffect = "copy";
        setDragOverZone(zone);
        return;
      }

      e.dataTransfer.dropEffect = "move";
      setDragOverZone(zone);
      if (zone !== "selected") {
        setSortInsertIndex(null);
      }
    },
    [isExternalFileDrag]
  );

  const handleZoneDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
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
        setUnselectedPhotos?.(unselected.filter((p) => p.id !== photoId));
        setSelectedPhotos?.([...selected, photo]);
      } else {
        setSelectedPhotos?.(selected.filter((p) => p.id !== photoId));
        setUnselectedPhotos?.([...unselected, photo]);
      }
    },
    [unselected, selected, setUnselectedPhotos, setSelectedPhotos]
  );

  const handleSortItemDragOver = useCallback(
    (e: React.DragEvent, overIndex: number) => {
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
      const insertBefore = e.clientX < midX ? overIndex : overIndex + 1;
      setSortInsertIndex(insertBefore);
    },
    []
  );

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
        const dragIndex = selected.findIndex((p) => p.id === photoId);
        if (dragIndex === -1) {
          clearDragState();
          return;
        }

        let insertBefore = sortInsertIndex ?? overIndex;
        const newSelected = [...selected];
        const [draggedItem] = newSelected.splice(dragIndex, 1);
        if (dragIndex < insertBefore) insertBefore -= 1;
        insertBefore = Math.max(0, Math.min(insertBefore, newSelected.length));
        newSelected.splice(insertBefore, 0, draggedItem);
        setSelectedPhotos?.(newSelected);
      } else {
        const photo =
          unselected.find((p) => p.id === photoId) ||
          selected.find((p) => p.id === photoId);
        if (!photo) {
          clearDragState();
          return;
        }

        let insertBefore = sortInsertIndex ?? overIndex + 1;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (sortInsertIndex === null) {
          insertBefore = e.clientX < midX ? overIndex : overIndex + 1;
        }
        insertBefore = Math.max(0, Math.min(insertBefore, selected.length));

        const newSelected = [...selected];
        newSelected.splice(insertBefore, 0, photo);
        setSelectedPhotos?.(newSelected);
        setUnselectedPhotos?.(unselected.filter((p) => p.id !== photoId));
      }

      clearDragState();
    },
    [selected, unselected, setSelectedPhotos, setUnselectedPhotos, clearDragState, sortInsertIndex]
  );

  const handleZoneDrop = useCallback(
    (e: React.DragEvent, targetZone: "unselected" | "selected") => {
      e.preventDefault();

      if (isExternalFileDrag(e)) {
        const files = e.dataTransfer.files;
        if (files.length > 0 && onUpload) {
          onUpload(files);
        }
        setDragOverZone(null);
        return;
      }

      const photoId = e.dataTransfer.getData("photoId");
      const fromZone = e.dataTransfer.getData("fromZone") as
        | "unselected"
        | "selected";

      if (targetZone === "selected" && fromZone === "selected" && photoId) {
        const dragIndex = selected.findIndex((p) => p.id === photoId);
        if (dragIndex !== -1) {
          if (sortInsertIndex !== null) {
            let insertBefore = sortInsertIndex;
            const newSelected = [...selected];
            const [draggedItem] = newSelected.splice(dragIndex, 1);
            if (dragIndex < insertBefore) insertBefore -= 1;
            insertBefore = Math.max(0, Math.min(insertBefore, newSelected.length));
            newSelected.splice(insertBefore, 0, draggedItem);
            setSelectedPhotos?.(newSelected);
          } else {
            const newSelected = [...selected];
            const [draggedItem] = newSelected.splice(dragIndex, 1);
            newSelected.push(draggedItem);
            setSelectedPhotos?.(newSelected);
          }
          clearDragState();
          return;
        }
      }

      if (
        targetZone === "selected" &&
        fromZone === "unselected" &&
        photoId &&
        sortInsertIndex !== null
      ) {
        const photo = unselected.find((p) => p.id === photoId);
        if (photo) {
          const insertBefore = Math.max(0, Math.min(sortInsertIndex, selected.length));
          const newSelected = [...selected];
          newSelected.splice(insertBefore, 0, photo);
          setSelectedPhotos?.(newSelected);
          setUnselectedPhotos?.(unselected.filter((p) => p.id !== photoId));
          clearDragState();
          return;
        }
      }

      clearDragState();
      if (photoId) {
        moveItem(photoId, targetZone);
      }
    },
    [selected, unselected, moveItem, setSelectedPhotos, setUnselectedPhotos, clearDragState, isExternalFileDrag, onUpload, sortInsertIndex]
  );

  return {
    draggingId,
    draggingFromZoneRef,
    dragOverZone,
    setDragOverZone,
    sortInsertIndex,
    setSortInsertIndex,
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
    moveItem,
  };
};
