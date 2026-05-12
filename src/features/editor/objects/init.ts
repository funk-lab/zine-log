import {
  FabricImage,
  FabricObject,
  Group,
  ActiveSelection,
  config,
} from "fabric";
import { OBJECT_DEFAULT_CONFIG } from "@/features/utils/constants";
import { IMAGE_CLIPPATH_QUALITY } from "../config";

export const initObjectPrototype = () => {
  if (IMAGE_CLIPPATH_QUALITY) {
    FabricImage.prototype.needsItsOwnCache = () => false;
    config.perfLimitSizeTotal = 16777216; // allows for up to 4096x4096 cache
  }

  // Text global config
  Object.keys(OBJECT_DEFAULT_CONFIG).forEach((key) => {
    (FabricObject.prototype as any)[key] = (OBJECT_DEFAULT_CONFIG as any)[key];
  });

  // Selection/Group global config
  const asConfig = {
    borderColor: "#cccddd",
    borderDashArray: [7, 10],
    borderScaleFactor: 3,
    padding: 10,
  };
  Object.keys(asConfig).forEach((key) => {
    (ActiveSelection.prototype as any)[key] = (asConfig as any)[key];
    (Group.prototype as any)[key] = (asConfig as any)[key];
  });
  Group.prototype.subTargetCheck = true;
};
