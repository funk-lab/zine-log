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

async function loadSvgImage(svgMarkup: string) {
  const blob = new Blob([svgMarkup], {
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
