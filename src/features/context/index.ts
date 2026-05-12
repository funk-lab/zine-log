import { createContext, useContext } from "react";
import * as fabric from "fabric";
import Editor from "@/features/editor";
import { GalleryImage } from "@/features/components/PhotoGallery";

type RoughSvgInstance = any;

export interface IGlobalStateContext {
  object?: fabric.Object | null;
  setActiveObject?: (o: fabric.Object | null) => void;
  isReady?: boolean;
  setReady?: (o: boolean) => void;
  editor?: Editor | null;
  roughSvg?: RoughSvgInstance;
  // 照片图库状态
  unselectedPhotos?: GalleryImage[];
  selectedPhotos?: GalleryImage[];
  setUnselectedPhotos?: (photos: GalleryImage[]) => void;
  setSelectedPhotos?: (photos: GalleryImage[]) => void;
}

export const GlobalStateContext = createContext<IGlobalStateContext>({});

/** Convenience hook with a non-null assertion – use inside components wrapped by GlobalStateContext.Provider */
export const useGlobalState = () => useContext(GlobalStateContext);
