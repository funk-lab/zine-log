import { util, loadSVGFromString, loadSVGFromURL, Path, FabricObject } from "fabric";
import { uuid } from "@/features/utils";

export const loadSvgFromString = async (string: string) => {
  try {
    // v6: loadSVGFromString 直接返回 Promise，不需要手动包装
    const loadedSVG = await loadSVGFromString(string);

    // v6: groupSVGElements 不再需要 options 参数
    const svg = util.groupSVGElements(loadedSVG.objects.filter(Boolean) as FabricObject[]);

    return svg;
  } catch (error) {
    console.error("SVG 加载失败:", error);
    throw error;
  }
};

export const loadSvgFromUrl = async (url: string) => {
  try {
    const loadedSVG = await loadSVGFromURL(url);
    const svg = util.groupSVGElements(loadedSVG.objects.filter(Boolean) as FabricObject[]);
    return svg;
  } catch (error) {
    console.error("SVG 加载失败:", error);
    throw error;
  }
};

export const createPathFromSvg = async (options) => {
  const { svgString, canvas, ...rest } = options || {};

  const svg = (await loadSvgFromString(svgString)) as Path;

  svg.set({
    ...rest,
    id: uuid(),
  });

  canvas.viewportCenterObject(svg);
  canvas.add(svg);
  canvas.setActiveObject(svg);
  canvas.requestRenderAll();

  return svg;
};
