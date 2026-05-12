import * as fabric from "fabric";
import { uuid } from "@/features/utils";
import { message } from "antd";
import { FImage } from "../custom-objects";

// Fabric.js v6: 使用fabric.Image
const FabricImage = fabric.FabricImage;

export const loadImageDom = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      message.error("加载图片失败");
      reject(new Error("加载图片失败"));
    };
    img.src = url;
  });
};

export const loadImage = async (imageSource) => {
  if (typeof imageSource === "string") {
    try {
      // 先加载图片DOM元素
      const imgEl = await loadImageDom(imageSource);
      // 使用FabricImage包装
      return new FabricImage(imgEl as any);
    } catch (error) {
      console.error("加载图片失败:", error);
      message.error("加载图片失败");
      throw error;
    }
  }
  // 如果传入的是HTMLImageElement，直接使用
  return Promise.resolve(new FabricImage(imageSource));
};

export const createClipRect = (object, options = {}) => {
  const width = object.getScaledWidth();
  const height = object.getScaledHeight();
  return new fabric.Rect({
    left: -width / 2,
    top: -height / 2,
    width,
    height,
    ...options,
  });
};

export const createImage = async (options) => {
  const { imageSource, canvas, ...rest } = options || {};

  // 参数校验
  if (!imageSource) {
    console.error("createImage: imageSource is required");
    return null;
  }

  if (!canvas) {
    console.error("createImage: canvas is required");
    return null;
  }

  let img: fabric.Image | null = null;

  try {
    img = await loadImage(imageSource);
  } catch (error) {
    console.error("createImage: failed to load image", error);
    return null;
  }

  // 加载失败处理
  if (!img) {
    console.error("createImage: image is null after loading");
    return null;
  }

  // 配置图片属性
  img.set({
    ...rest,
    paintFirst: "fill",
    id: uuid(),
  });

  // 添加到画布
  canvas.viewportCenterObject(img);
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();

  return img;
};

export const createFImage = async (options) => {
  const { imageSource, canvas } = options || {};

  let img!: fabric.Image;
  try {
    img = await loadImage(imageSource);
  } catch (e) {
    console.log(e);
  }

  if (!img) return;

  // 限制图片最大尺寸不超过画布的 90%
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const maxW = canvasWidth * 0.9;
  const maxH = canvasHeight * 0.9;
  if (img.width > maxW || img.height > maxH) {
    const scale = Math.min(maxW / img.width, maxH / img.height);
    img.scale(scale);
  }

  const fimg = new FImage({
    image: img,
    id: uuid(),
  });

  canvas.viewportCenterObject(fimg);
  canvas.add(fimg);
  canvas.setActiveObject(fimg);
  canvas.requestRenderAll();
};
