const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export interface ImagePreviewRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImagePreviewLayout {
  svgMarkup: string;
  regions: ImagePreviewRegion[];
}

function extractClipPathId(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/url\(#([^)]+)\)/);
  return match?.[1] ?? null;
}

function parseNumericAttribute(element: Element, attributeName: string) {
  const rawValue = element.getAttribute(attributeName);
  return rawValue ? Number.parseFloat(rawValue) : 0;
}

function resolveRegion(image: SVGImageElement, sourceSvg: SVGSVGElement): ImagePreviewRegion {
  const clipPathId = extractClipPathId(image.getAttribute("clip-path"));

  if (clipPathId) {
    // 优先读带 data-slot 标记的白色背景 rect——它包含完整的格子尺寸（含 padding 白边）
    const slotRect = sourceSvg.querySelector(`rect[data-slot="${clipPathId}"]`);
    if (slotRect) {
      return {
        x: parseNumericAttribute(slotRect, "x"),
        y: parseNumericAttribute(slotRect, "y"),
        width: parseNumericAttribute(slotRect, "width"),
        height: parseNumericAttribute(slotRect, "height"),
      };
    }

    // 回退：clipPath 内的 rect（不含 padding 白边，兼容旧格式）
    const clipRect = sourceSvg.querySelector(`clipPath[id="${clipPathId}"] rect`);
    if (clipRect) {
      return {
        x: parseNumericAttribute(clipRect, "x"),
        y: parseNumericAttribute(clipRect, "y"),
        width: parseNumericAttribute(clipRect, "width"),
        height: parseNumericAttribute(clipRect, "height"),
      };
    }
  }

  return {
    x: parseNumericAttribute(image, "x"),
    y: parseNumericAttribute(image, "y"),
    width: parseNumericAttribute(image, "width"),
    height: parseNumericAttribute(image, "height"),
  };
}

export function extractImagePreviewLayout(svgMarkup: string): ImagePreviewLayout {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return {
      svgMarkup,
      regions: [],
    };
  }

  const parser = new DOMParser();
  const sourceDocument = parser.parseFromString(svgMarkup, "image/svg+xml");
  const sourceSvg = sourceDocument.documentElement;
  if (!(sourceSvg instanceof SVGSVGElement)) {
    return {
      svgMarkup,
      regions: [],
    };
  }
  const targetDocument = document.implementation.createDocument(SVG_NAMESPACE, "svg", null);
  const targetSvg = targetDocument.documentElement;

  Array.from(sourceSvg.attributes).forEach((attribute) => {
    targetSvg.setAttribute(attribute.name, attribute.value);
  });

  const images = Array.from(sourceSvg.querySelectorAll("image"));
  const clipPathIds = new Set(
    images
      .map((image) => extractClipPathId(image.getAttribute("clip-path")))
      .filter((clipPathId): clipPathId is string => clipPathId !== null),
  );

  if (clipPathIds.size) {
    const defs = targetDocument.createElementNS(SVG_NAMESPACE, "defs");

    clipPathIds.forEach((clipPathId) => {
      const clipPath = sourceSvg.querySelector(`clipPath[id="${clipPathId}"]`);
      if (clipPath) {
        defs.appendChild(targetDocument.importNode(clipPath, true));
      }
    });

    if (defs.childNodes.length) {
      targetSvg.appendChild(defs);
    }
  }

  const regions = images.map((imageNode) => resolveRegion(imageNode, sourceSvg));

  // 先插入白色背景 rect（data-slot），保证白边在图片下层渲染
  const slotRects = Array.from(sourceSvg.querySelectorAll("rect[data-slot]"));
  slotRects.forEach((rect) => {
    targetSvg.appendChild(targetDocument.importNode(rect, true));
  });

  images.forEach((image) => {
    targetSvg.appendChild(targetDocument.importNode(image, true));
  });

  return {
    svgMarkup: new XMLSerializer().serializeToString(targetDocument),
    regions,
  };
}
