import hotkeys from "hotkeys-js";
import { Canvas } from "fabric";
import FabricHistory from "./history";
import { copyObject, pasteObject, removeObject } from "@/features/utils/helper";

export default function initHotKey(canvas: Canvas, fhistory: FabricHistory) {
  hotkeys("ctrl+c,command+c", () => {
    copyObject(canvas, null);
  });

  hotkeys("ctrl+v,command+v", () => {
    pasteObject(canvas);
  });

  hotkeys("delete,del,backspace", (event) => {
    event.preventDefault();
    removeObject(null, canvas);
  });

  hotkeys("ctrl+z,command+z", (event) => {
    event.preventDefault();
    fhistory.undo();
  });

  hotkeys("ctrl+shift+z,command+shift+z,ctrl+y,command+y", (event) => {
    event.preventDefault();
    if (event.key.includes("shift")) {
      fhistory.redo();
    } else {
      fhistory.redo();
    }
  });

  hotkeys("up, right, down, left", (event, handler) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (activeObject.type === "f-text" && (activeObject as any).isEditing)
      return;
    event.preventDefault();
    switch (handler.key) {
      case "up":
        activeObject.set("top", (activeObject.top ?? 0) - 1);
        break;
      case "right":
        activeObject.set("left", (activeObject.left ?? 0) + 1);
        break;
      case "down":
        activeObject.set("top", (activeObject.top ?? 0) + 1);
        break;
      case "left":
        activeObject.set("left", (activeObject.left ?? 0) - 1);
        break;
      default:
        break;
    }
    if ((activeObject as any).group) {
      (activeObject as any).addWithUpdate();
    }
    canvas.requestRenderAll();
  });
}
