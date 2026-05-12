import { useCallback } from "react";
import { GalleryImage } from "@/features/collage-editor/types";
import { useGlobalState } from "@/features/context";
import { filesToGalleryImages } from "@/features/collage-editor/lib/file";

interface UsePhotoOperationsReturn {
  handleQuickMove: (photoId: string, targetZone: "unselected" | "selected") => void;
  handleDeletePhoto: (isSelectedZone: boolean, photoId: string) => void;
  handleMoveAllToSelected: () => void;
  handleClearSelected: () => void;
  handleAddBlankImage: () => void;
  handleFileUpload: (files: FileList | null) => void;
}

export const usePhotoOperations = (): UsePhotoOperationsReturn => {
  const {
    unselectedPhotos: unselected = [],
    selectedPhotos: selected = [],
    setUnselectedPhotos,
    setSelectedPhotos,
  } = useGlobalState();

  const handleQuickMove = useCallback(
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

  const handleDeletePhoto = useCallback(
    (isSelectedZone: boolean, photoId: string) => {
      if (isSelectedZone) {
        setSelectedPhotos?.(selected.filter((p) => p.id !== photoId));
      } else {
        setUnselectedPhotos?.(unselected.filter((p) => p.id !== photoId));
      }
    },
    [setUnselectedPhotos, unselected, setSelectedPhotos, selected]
  );

  const handleMoveAllToSelected = useCallback(() => {
    if (unselected.length === 0) return;
    setSelectedPhotos?.([...selected, ...unselected]);
    setUnselectedPhotos?.([]);
  }, [unselected, selected, setSelectedPhotos, setUnselectedPhotos]);

  const handleClearSelected = useCallback(() => {
    if (selected.length === 0) return;
    setUnselectedPhotos?.([...unselected, ...selected]);
    setSelectedPhotos?.([]);
  }, [unselected, selected, setUnselectedPhotos, setSelectedPhotos]);

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
          name: `空白图片_${(unselected?.length || 0) + 1}.png`,
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
        setUnselectedPhotos?.([...(unselected || []), blankImage]);
      }
    }, "image/png");
  }, [unselected, setUnselectedPhotos]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      const fileArray = Array.from(files);
      const images = await filesToGalleryImages(fileArray);
      
      if (images.length > 0) {
        setUnselectedPhotos?.(prev => [...(prev || []), ...images]);
      }
    } catch (error) {
      console.error("上传失败:", error);
    }
  }, [setUnselectedPhotos]);

  return {
    handleQuickMove,
    handleDeletePhoto,
    handleMoveAllToSelected,
    handleClearSelected,
    handleAddBlankImage,
  };
};
