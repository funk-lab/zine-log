import * as fabric from "fabric";
import { message } from "antd";
import {
  calcCanvasZoomLevel,
  handleFLinePointsWhenMoving,
} from "@/features/utils/helper";
import initControl, {
  handleMouseOutCorner,
  handleMouseOverCorner,
} from "./controller";
import { initObjectPrototype } from "./objects/init";
import { throttle } from "lodash-es";
import { loadFont } from "@/features/utils";
import { initAligningGuidelines, initCenteringGuidelines } from "./guide-lines";
import initHotKey from "./extensions/hotkey";
import {
  SKETCH_ID,
  SCHEMA_VERSION,
  SCHEMA_VERSION_KEY,
} from "@/features/utils/constants";

import FabricHistory from "./extensions/history";
import AutoSave from "./extensions/autosave";
import { createGroup } from "./objects/group";
import {
  HOVER_OBJECT_CORNER,
  HOVER_OBJECT_CONTROL,
  CAPTURE_SUBTARGET_WHEN_DBLCLICK,
  LOAD_JSON_IGNORE_LOAD_FONT,
} from "./config";
import type { IEditorOptions } from "@/types/fabritor";

interface PanState {
  enable: boolean;
  isDragging: boolean;
  lastPosX: number;
  lastPosY: number;
}

export default class Editor {
  public canvas!: fabric.Canvas;
  private _options: Omit<IEditorOptions, "template">;
  private _template: IEditorOptions["template"];
  public sketch!: fabric.Rect;
  private _resizeObserver: ResizeObserver | null;
  private _pan: PanState;
  public fhistory!: FabricHistory;
  public autoSave!: AutoSave;

  constructor(options: IEditorOptions) {
    const { template, ...rest } = options;
    this._options = rest;
    this._template = template;
    this._resizeObserver = null;
    this._pan = {
      enable: false,
      isDragging: false,
      lastPosX: 0,
      lastPosY: 0,
    };
  }

  public async init() {
    this._initObject();
    this._initCanvas();
    this._initControls(); // fabric v6: 在 Canvas 初始化后设置 controls
    this._initEvents();
    this._initSketch();
    this._initGuidelines();

    this.autoSave = new AutoSave(this);
    await this.autoSave.loadFromLocal();

    this.fhistory = new FabricHistory(this);
    initHotKey(this.canvas, this.fhistory);

    this.autoSave.init();
  }

  private _initObject() {
    initObjectPrototype();
  }

  private _initControls() {
    // fabric v6: 在 Canvas 初始化后设置全局 controls
    initControl();
  }

  private _initCanvas() {
    const { canvasEl, workspaceEl } = this._options;
    this.canvas = new fabric.Canvas(canvasEl, {
      selection: true,
      containerClass: "fabritor-canvas",
      enableRetinaScaling: true,
      fireRightClick: true,
      controlsAboveOverlay: true,
      width: workspaceEl.offsetWidth,
      height: workspaceEl.offsetHeight,
      backgroundColor: "#dddddd",
      preserveObjectStacking: true,
      imageSmoothingEnabled: false,
    });
  }

  private _initGuidelines() {
    initAligningGuidelines(this.canvas);
    initCenteringGuidelines(this.canvas);
  }

  private _initSketch() {
    // default size: xiaohongshu
    const { width = 1200, height = 1600 } = this._template || {};
    const sketch = new fabric.Rect({
      fill: "#ffffff",
      left: 0,
      top: 0,
      width,
      height,
      selectable: false,
      hasControls: false,
      hoverCursor: "default",
    } as fabric.RectProps);
    sketch.set("id", SKETCH_ID);
    sketch.set("fabritor_desc", "header.fabritor_desc");
    this.canvas.add(sketch);
    this.canvas.requestRenderAll();
    this.sketch = sketch;

    this._initResizeObserver();
    this._adjustSketch2Canvas();
  }

  public setSketchSize(size: { width?: number; height?: number }) {
    this.sketch.set(size);

    const bgImage = this._getSketchBackgroundImage();
    if (bgImage instanceof fabric.FabricImage) {
      const originalSize = bgImage.getOriginalSize();
      bgImage.set({
        scaleX: (this.sketch.width || size.width || 520) / originalSize.width,
        scaleY:
          (this.sketch.height || size.height || 693) / originalSize.height,
      });
      bgImage.setCoords();
    }

    this.canvas.requestRenderAll();
    this._adjustSketch2Canvas();
    // @ts-ignore
    this.canvas.fire("fabritor:sketch:size:changed", { size });
    // 注意：不再自动更新 clipPath，由调用方自行控制
  }

  private _getSketchBackgroundImage(): fabric.Object | undefined {
    return this.canvas
      .getObjects()
      .find((obj) => obj.get("id") === "sketch-bg-image");
  }

  public setSketchTransparent(transparent: boolean) {
    if (transparent) {
      this.sketch.set({
        fill: "transparent",
        stroke: null,
        strokeWidth: 0,
        strokeDashArray: null,
      });
    } else {
      this.sketch.set({
        fill: "#ffffff",
        stroke: null,
        strokeWidth: 0,
        strokeDashArray: null,
      });
    }
    this.canvas.requestRenderAll();
  }

  public setSketchBgColor(color: string) {
    this.canvas.backgroundColor = color;
    this.canvas.requestRenderAll();
  }

  public setSketchBackgroundImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.sketch) {
        reject(new Error("Sketch not initialized"));
        return;
      }

      fabric.util
        .loadImage(imageUrl, { crossOrigin: "anonymous" })
        .then((img) => {
          if (!img) {
            reject(new Error("Failed to load image"));
            return;
          }

          const imgElement = img;
          const imgWidth = imgElement.naturalWidth || imgElement.width;
          const imgHeight = imgElement.naturalHeight || imgElement.height;

          const MAX_SIZE = 2000;
          let targetW = imgWidth;
          let targetH = imgHeight;
          if (targetW > MAX_SIZE || targetH > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / targetW, MAX_SIZE / targetH);
            targetW = Math.round(targetW * ratio);
            targetH = Math.round(targetH * ratio);
          }
          this.setSketchSize({ width: targetW, height: targetH });

          this.removeSketchBackgroundImage();

          const fabricImg = new fabric.FabricImage(imgElement, {
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
          });
          fabricImg.set("id", "sketch-bg-image");
          // 确保显示尺寸严格等于 sketch 尺寸
          fabricImg.set({
            scaleX: targetW / (fabricImg.width || imgWidth),
            scaleY: targetH / (fabricImg.height || imgHeight),
          });
          fabricImg.setCoords();

          this.canvas.add(fabricImg);
          this.canvas.sendObjectToBack(fabricImg);
          this.sketch.set("fill", "transparent");
          this.canvas.requestRenderAll();
          resolve();
        })
        .catch(reject);
    });
  }

  private removeSketchBackgroundImage() {
    const bgImage = this._getSketchBackgroundImage();
    if (bgImage) {
      this.canvas.remove(bgImage);
    }
  }

  public clearSketchBackgroundImage() {
    if (!this.sketch) return;
    this.removeSketchBackgroundImage();
    this.sketch.set("fill", "#ffffff");
    this.canvas.requestRenderAll();
  }

  private _initResizeObserver() {
    const { workspaceEl } = this._options;
    this._resizeObserver = new ResizeObserver(
      throttle(() => {
        // Fabric.js v6: 使用 setDimensions 方法设置画布尺寸
        this.canvas.setDimensions({
          width: workspaceEl.offsetWidth,
          height: workspaceEl.offsetHeight,
        });
        this._adjustSketch2Canvas();
      }, 50)
    );
    this._resizeObserver.observe(workspaceEl);
  }

  private _adjustSketch2Canvas() {
    const zoomLevel = calcCanvasZoomLevel(
      {
        width: this.canvas.width,
        height: this.canvas.height,
      },
      {
        width: this.sketch.width,
        height: this.sketch.height,
      }
    );

    const finalZoom = zoomLevel;
    const center = this.canvas.getCenterPoint();
    this.canvas.zoomToPoint(center, finalZoom);

    // sketch 移至画布中心
    const sketchCenter = this.sketch.getCenterPoint();
    const viewportTransform = this.canvas.viewportTransform;
    viewportTransform[4] =
      this.canvas.width / 2 - sketchCenter.x * viewportTransform[0];
    viewportTransform[5] =
      this.canvas.height / 2 - sketchCenter.y * viewportTransform[3];
    this.canvas.setViewportTransform(viewportTransform);
    this.canvas.requestRenderAll();

    // 同步 zoom 百分比到 UI
    // @ts-ignore
    this.canvas.fire("fabritor:zoom:changed", {
      zoom: Math.round(finalZoom * 100),
    });
  }

  private _initEvents() {
    this.canvas.on("mouse:down", (opt) => {
      const evt = opt.e;
      if (this._pan.enable) {
        this._pan = {
          enable: true,
          isDragging: true,
          lastPosX: (evt as MouseEvent).clientX,
          lastPosY: (evt as MouseEvent).clientY,
        };
      }
    });
    this.canvas.on("mouse:move", (opt) => {
      if (this._pan.enable && this._pan.isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = this.canvas.viewportTransform as number[];
        vpt[4] += e.clientX - this._pan.lastPosX;
        vpt[5] += e.clientY - this._pan.lastPosY;
        this.canvas.requestRenderAll();
        this._pan.lastPosX = e.clientX;
        this._pan.lastPosY = e.clientY;
      }
    });
    this.canvas.on("mouse:over", (opt) => {
      const { target } = opt;
      if (this._pan.enable) return;

      if (HOVER_OBJECT_CORNER) {
        const corner = target?.__corner;
        if (corner) {
          handleMouseOverCorner(corner, opt.target as any);
        }
      }

      if (HOVER_OBJECT_CONTROL) {
        if (
          target &&
          target.id !== SKETCH_ID &&
          target !== this.canvas.getActiveObject() &&
          this.canvas.contextTop != null
        ) {
          target._renderControls(this.canvas.contextTop, {
            hasControls: false,
          });
        }
      }
    });
    this.canvas.on("mouse:out", (opt) => {
      const { target } = opt;
      if (HOVER_OBJECT_CORNER) {
        if (target && target.id !== SKETCH_ID) {
          handleMouseOutCorner(target);
          this.canvas.requestRenderAll();
        }
      }
    });
    this.canvas.on("mouse:up", () => {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      if (this._pan.enable) {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this._pan.isDragging = false;
      }
    });
    this.canvas.on("mouse:wheel", this._scrollSketch.bind(this));

    this.canvas.on("mouse:dblclick", (opt) => {
      const { target, subTargets } = opt;
      const subTarget = subTargets?.[0];
      if (target?.type === "group" && subTarget) {
        if (subTarget.type === "f-text") {
          this._editTextInGroup(target as fabric.Group, subTarget);
        } else {
          if (CAPTURE_SUBTARGET_WHEN_DBLCLICK) {
            subTarget.set("hasControls", false);
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(subTarget);
            this.canvas.requestRenderAll();
          }
        }
      }
    });

    this.canvas.on("object:modified", (opt) => {
      const { target } = opt;
      if (!target || target.id === SKETCH_ID) return;
      const scaledWidth = target.getScaledWidth();
      const scaledHeight = target.getScaledHeight();
      if (target.type !== "f-line" && target.type !== "f-image") {
        if (target.type !== "f-text") {
          target.setControlVisible("mt", scaledWidth >= 100);
          target.setControlVisible("mb", scaledWidth >= 100);
        }
        target.setControlVisible("ml", scaledHeight >= 40);
        target.setControlVisible("mr", scaledHeight >= 40);
        this.canvas.requestRenderAll();
      }

      if (
        target.type === "f-line" ||
        target.type === "f-arrow" ||
        target.type === "f-tri-arrow"
      ) {
        // fabric Line doesnot change points when moving
        // but change left/top when change points ....
        handleFLinePointsWhenMoving(opt as any);
      }
    });
  }

  private _editTextInGroup(group: fabric.Group, textbox: fabric.FabricObject) {
    const items = group.getObjects();

    // @ts-ignore - Fabric.js v6 中 'editing:exited' 是有效的文本编辑事件，但类型定义中未包含
    textbox.on("editing:exited", () => {
      for (let i = 0; i < items.length; i++) {
        this.canvas.remove(items[i]);
      }
      const grp = createGroup({
        items,
        canvas: this.canvas,
      });
      this.canvas.renderAll();
      this.canvas.setActiveObject(grp);
      // @ts-ignore
      this.canvas.fire("fabritor:group", {
        target: this.canvas.getActiveObject(),
      });

      // @ts-ignore - Fabric.js v6 中 'editing:exited' 是有效的文本编辑事件
      textbox.off("editing:exited");
    });

    this.canvas.add(...group.removeAll());
    this.canvas.renderAll();
    for (let i = 0; i < items.length; i++) {
      items[i].selectable = false;
      items[i].set("hasControls", false);
      this.canvas.add(items[i]);
    }
    this.canvas.renderAll();

    this.canvas.setActiveObject(textbox);
    (textbox as fabric.IText).enterEditing();
    (textbox as fabric.IText).selectAll();
  }

  public switchEnablePan() {
    this._pan.enable = !this._pan.enable;
    this.canvas.discardActiveObject();
    this.canvas.hoverCursor = this._pan.enable ? "grab" : "move";
    this.canvas.getObjects().forEach((obj) => {
      if (obj.id !== SKETCH_ID) {
        obj.set("selectable", !this._pan.enable);
      }
    });
    this.canvas.selection = !this._pan.enable;
    this.canvas.requestRenderAll();
    return this._pan.enable;
  }

  public getIfPanEnable() {
    return this._pan.enable;
  }

  public fireCustomModifiedEvent(data: any = null) {
    // @ts-ignore
    this.canvas.fire("fabritor:object:modified", data);
  }

  private _scrollSketch(opt: fabric.TEvent<WheelEvent>) {
    const delta = opt.e.deltaY;
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    this._applyZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  private _applyZoom(zoom: number) {
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    const center = this.canvas.getCenterPoint();
    this.canvas.zoomToPoint(center, zoom);
    // @ts-ignore
    this.canvas.fire("fabritor:zoom:changed", { zoom: Math.round(zoom * 100) });
  }

  public getZoom(): number {
    return this.canvas.getZoom();
  }

  public adjustSketch2Canvas() {
    this._adjustSketch2Canvas();
  }

  public setZoom(zoomPercent: number) {
    const zoom = zoomPercent / 100;
    this._applyZoom(zoom);
  }

  public destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      (this.canvas as unknown as null) = null;
    }
    if (this.fhistory) {
      this.fhistory.dispose();
    }
    if (this.autoSave) {
      this.autoSave.dispose();
    }
    const { workspaceEl } = this._options;
    if (this._resizeObserver) {
      this._resizeObserver.unobserve(workspaceEl);
      this._resizeObserver = null;
    }
  }

  public export2Img(options?: fabric.TDataUrlOptions) {
    const transform = this.canvas.viewportTransform;
    const clipPath = this.canvas.clipPath;
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.backgroundColor = "#ffffff";
    this.canvas.clipPath = undefined;

    const { left, top, width, height } = this.sketch;
    const dataURL = this.canvas.toDataURL({
      left,
      top,
      width,
      height,
      format: "png",
      ...options,
    } as any);

    this.canvas.setViewportTransform(transform);
    this.canvas.clipPath = clipPath;
    this.canvas.backgroundColor = "#dddddd";
    this.canvas.requestRenderAll();
    return dataURL;
  }

  public export2Svg() {
    const { left, top, width, height } = this.sketch;
    const svg = this.canvas.toSVG({
      width: String(width),
      height: String(height),
      viewBox: {
        x: left ?? 0,
        y: top ?? 0,
        width: width ?? 0,
        height: height ?? 0,
      },
    } as any);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  public canvas2Json() {
    // const json = this.canvas.toJSON(FABRITOR_CUSTOM_PROPS);
    const json = this.canvas.toJSON();
    json[SCHEMA_VERSION_KEY] = SCHEMA_VERSION;
    return json;
  }

  public async loadFromJSON(
    json: string | Record<string, any>,
    errorToast = false
  ) {
    if (!json) return false;
    if (typeof json === "string") {
      try {
        json = JSON.parse(json);
      } catch (e) {
        console.log(e);
        errorToast && message.error("加载本地模板失败，请重试");
        return false;
      }
    }
    if ((json as Record<string, any>)[SCHEMA_VERSION_KEY] !== SCHEMA_VERSION) {
      console.warn("此模板已经无法与当前版本兼容，请更换模板");
      return false;
    }

    if (LOAD_JSON_IGNORE_LOAD_FONT) {
      const { objects } = json as Record<string, any>;
      for (const item of objects) {
        if (item.type === "f-text") {
          await loadFont(item.fontFamily);
        }
      }
    }

    const lastActiveObject = this.canvas.getActiveObject();
    let nowActiveObject: fabric.Object | undefined;

    // disabled auto save when load json
    this.autoSave.setCanSave(false);

    // v6: loadFromJSON 返回 Promise<Canvas>，reviver 是第2个参数
    // @ts-ignore - reviver 函数签名与类型定义不完全匹配，但运行时行为正确
    await this.canvas.loadFromJSON(json, (_serializedObj, obj) => {
      if (obj instanceof fabric.FabricObject) {
        if (obj.id === SKETCH_ID) {
          this.sketch = obj as fabric.Rect;
          this.setSketchSize({
            width: (obj as fabric.Rect).width,
            height: (obj as fabric.Rect).height,
          });
        }
        // after undo/redo record last active object
        if (obj.id === lastActiveObject?.id) {
          nowActiveObject = obj;
        }
      }
    });

    this.canvas.requestRenderAll();
    this.autoSave.setCanSave(true);
    // @ts-ignore - 自定义事件不在 CanvasEvents 类型定义中
    this.canvas.fire("fabritor:load:json", {
      lastActiveObject: nowActiveObject,
    });

    return true;
  }

  public async clearCanvas() {
    const { width, height, fabritor_desc } = this.sketch;
    const originalJson = `{"fabritor_schema_version":3,"version":"5.3.0","objects":[{"type":"rect","version":"5.3.0","originX":"left","originY":"top","left":0,"top":0,"width":${width},"height":${height},"fill":"#ffffff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":true,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"stroke","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"id":"fabritor-sketch","fabritor_desc":"${fabritor_desc}","selectable":false,"hasControls":false}],"clipPath":{"type":"rect","version":"5.3.0","originX":"left","originY":"top","left":0,"top":0,"width":${width},"height":${height},"fill":"#ffffff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":true,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"stroke","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"selectable":true,"hasControls":true},"backgroundColor":"#dddddd"}`;
    await this.loadFromJSON(originalJson);
    this.fhistory.reset();
  }
}
