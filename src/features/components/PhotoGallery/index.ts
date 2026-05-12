export { PhotoGallery, type PhotoGalleryProps } from "./PhotoGallery";
export { default } from "./PhotoGallery";
export type { GalleryImage } from "@/features/collage-editor/types";

// 导出 hooks
export { useDragAndDrop } from "./hooks/useDragAndDrop";
export { usePhotoOperations } from "./hooks/usePhotoOperations";
export { useZoneResize } from "./hooks/useZoneResize";

// 导出组件
export { PhotoItem } from "./components/PhotoItem";
export { UploadArea } from "./components/UploadArea";
export { ZoneHeader } from "./components/ZoneHeader";
export { DragGhost } from "./components/DragGhost";
export { EmptyZone } from "./components/EmptyZone";
