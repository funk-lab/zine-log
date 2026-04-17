interface RasterizeSvgOptions {
  scale?: number;
  maxPixels?: number;
  backgroundColor?: string | null;
}

const DEFAULT_MAX_PIXELS = 32000000;

function resolveScale(
  width: number,
  height: number,
  scale: number,
  maxPixels: number,
) {
  const safeScale = Math.min(scale, Math.sqrt(maxPixels / (width * height)));
  return Math.max(1, safeScale);
}

/**
 * 将 blob URL 转换为 data URL
 * Blob URL 无法在序列化后的 SVG 中跨 context 访问
 */
async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return blobUrl; // 转换失败时返回原 URL
  }
}

/**
 * 提取 SVG 中的所有 image href
 */
function extractImageHrefs(svgMarkup: string): string[] {
  const hrefs: string[] = [];
  const regex = /<image[^>]+href="([^"]+)"/g;
  let match;
  while ((match = regex.exec(svgMarkup)) !== null) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

/**
 * 将 SVG 中的 blob URL 替换为 data URL
 */
async function resolveSvgBlobUrls(svgMarkup: string): Promise<string> {
  const hrefs = extractImageHrefs(svgMarkup);
  const blobHrefs = hrefs.filter(href => href.startsWith('blob:'));
  
  if (blobHrefs.length === 0) {
    return svgMarkup;
  }

  let resolvedSvg = svgMarkup;
  for (const blobUrl of blobHrefs) {
    try {
      const dataUrl = await blobUrlToDataUrl(blobUrl);
      resolvedSvg = resolvedSvg.replaceAll(blobUrl, dataUrl);
    } catch {
      // 转换失败时保留原 URL
    }
  }
  return resolvedSvg;
}

async function loadSvgImage(svgMarkup: string) {
  // 先将 blob URL 转换为 data URL，确保跨 context 可访问
  const resolvedMarkup = await resolveSvgBlobUrls(svgMarkup);
  
  const blob = new Blob([resolvedMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("SVG render failed"));
    image.src = url;
  });

  URL.revokeObjectURL(url);
  return image;
}

export async function rasterizeSvgToCanvas(
  svgMarkup: string,
  width: number,
  height: number,
  options: RasterizeSvgOptions = {},
) {
  const {
    scale = 1,
    maxPixels = DEFAULT_MAX_PIXELS,
    backgroundColor = null,
  } = options;

  const exportScale = resolveScale(width, height, scale, maxPixels);
  const image = await loadSvgImage(svgMarkup);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * exportScale);
  canvas.height = Math.round(height * exportScale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
}
