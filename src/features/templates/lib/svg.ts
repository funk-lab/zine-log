import type { ImageEdit } from "@/features/collage-editor/types";

export const GRID_RING_WIDTH = 880;
export const GRID_RING_HEIGHT = 760;

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const number = Number.parseInt(expanded, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

export function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function wrapText(text: string, maxChars: number) {
  if (!text.trim()) {
    return [];
  }

  return text
    .split("\n")
    .flatMap((paragraph) => {
      const chars = Array.from(paragraph.trim());
      if (!chars.length) {
        return [""];
      }

      const lines: string[] = [];
      for (let index = 0; index < chars.length; index += maxChars) {
        lines.push(chars.slice(index, index + maxChars).join(""));
      }
      return lines;
    })
    .slice(0, 8);
}

export function buildTextBlock(
  lines: string[],
  x: number,
  y: number,
  size: number,
  lineHeight: number,
  color: string,
  weight = 400
) {
  if (!lines.length) {
    return "";
  }

  const tspans = lines
    .map((line, index) => {
      const safeLine = escapeHtml(line || " ");
      return `<tspan x="${x}" dy="${
        index === 0 ? 0 : lineHeight
      }">${safeLine}</tspan>`;
    })
    .join("");

  return `<text x="${x}" y="${y}" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${tspans}</text>`;
}

interface ImageMarkupOptions {
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  clipId: string;
  accent: string;
  radius?: number;
  placeholderSize?: number;
  placeholderLabel?: string;
}

export function imageMarkup({
  href,
  x,
  y,
  width,
  height,
  clipId,
  accent,
  radius = 0,
  placeholderSize = 54,
  placeholderLabel = "上传图片",
}: ImageMarkupOptions) {
  if (href) {
    const clipDefinition = radius
      ? `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" /></clipPath>`
      : `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" /></clipPath>`;
    return `
      ${clipDefinition}
      <image href="${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
    `;
  }

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#f8fafc" />
      <rect x="${x + 26}" y="${y + 26}" width="${width - 52}" height="${
    height - 52
  }" rx="${Math.max(radius - 8, 0)}" ry="${Math.max(
    radius - 8,
    0
  )}" fill="none" stroke="${rgba(accent, 0.24)}" stroke-dasharray="18 14" />
      <text x="${x + width / 2}" y="${
    y + height / 2
  }" text-anchor="middle" font-family="'Inter', sans-serif" font-size="${placeholderSize}" fill="${rgba(
    accent,
    0.76
  )}">${placeholderLabel}</text>
    </g>
  `;
}

interface GridSlotMarkupOptions {
  href: string;
  x: number;
  y: number;
  size: number;
  slotId: string;
  /** 图片内边距（px），默认 2 */
  padding?: number;
  /** 图片编辑状态，用于生成 transform */
  edit?: Partial<ImageEdit>;
}

/**
 * 根据图片编辑状态生成 SVG transform 和 preserveAspectRatio 属性
 * 支持 rotate、zoom、flipX、offsetX/Y、fitMode
 */
function getSvgImageTransform(
  edit: Partial<ImageEdit> | undefined,
  cx: number,
  cy: number,
  size: number
): { transform: string; preserveAspectRatio: string } {
  if (!edit) {
    return { transform: "", preserveAspectRatio: "xMidYMid slice" };
  }

  const {
    rotate = 0,
    zoom = 1,
    flipX = false,
    flipY = false,
    offsetX = 0,
    offsetY = 0,
    fitMode = "cover",
  } = edit;

  // 根据 fitMode 设置 preserveAspectRatio
  // cover -> xMidYMid slice (裁剪填满)
  // contain -> xMidYMid meet (完整显示)
  // fill -> none (拉伸填满)
  const preserveAspectRatio =
    fitMode === "contain"
      ? "xMidYMid meet"
      : fitMode === "fill"
      ? "none"
      : "xMidYMid slice";

  // 如果没有变换，返回空 transform
  if (!rotate && zoom === 1 && !flipX && !flipY && !offsetX && !offsetY) {
    return { transform: "", preserveAspectRatio };
  }

  const transforms: string[] = [];

  // 1. 先移动到中心点（用于旋转和缩放）
  transforms.push(`translate(${cx}, ${cy})`);

  // 2. 旋转（围绕中心）
  if (rotate) {
    transforms.push(`rotate(${rotate})`);
  }

  // 3. 缩放 + 翻转
  let scaleX = zoom;
  let scaleY = zoom;
  if (flipX) scaleX = -scaleX;
  if (flipY) scaleY = -scaleY;
  if (scaleX !== 1 || scaleY !== 1) {
    transforms.push(`scale(${scaleX}, ${scaleY})`);
  }

  // 4. 偏移（像素值，在缩放后的坐标系中）
  if (offsetX || offsetY) {
    // offset 是像素值，需要除以 zoom 来抵消缩放影响
    const tx = offsetX / zoom;
    const ty = offsetY / zoom;
    transforms.push(`translate(${tx}, ${ty})`);
  }

  // 5. 移回原位置
  transforms.push(`translate(${-cx}, ${-cy})`);

  return { transform: transforms.join(" "), preserveAspectRatio };
}

export function gridSlotMarkup({
  href,
  x,
  y,
  size,
  slotId,
  padding = 2,
  edit,
}: GridSlotMarkupOptions) {
  if (!href) {
    return "";
  }

  const imageX = x + padding;
  const imageY = y + padding;
  const imageSize = size - padding * 2;
  const centerX = imageX + imageSize / 2;
  const centerY = imageY + imageSize / 2;

  // 生成 transform 和 preserveAspectRatio
  const { transform, preserveAspectRatio } = getSvgImageTransform(
    edit,
    centerX,
    centerY,
    imageSize
  );
  const transformAttr = transform ? ` transform="${transform}"` : "";

  // 使用嵌套 <g> 确保 transform 后的内容被 clipPath 正确裁剪
  // 避免偏移后的图片内容显示到其他卡片上
  // 注意：clipPathUnits="userSpaceOnUse" 确保裁剪在绝对坐标系中生效，不受 transform 影响
  return `
    <clipPath id="${slotId}" clipPathUnits="userSpaceOnUse">
      <rect x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" />
    </clipPath>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#ffffff" data-slot="${slotId}" />
    <g clip-path="url(#${slotId})">
      <image href="${href}" x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="${preserveAspectRatio}"${transformAttr} />
    </g>
  `;
}

/**
 * 生成方形螺旋坐标
 * @param count 需要生成的坐标数量
 * @param gap 螺旋的紧密程度（步长增长系数），默认为 1（最紧密）
 */
export function generateSpiralPositions(
  count: number,
  gap = 1
): [number, number][] {
  if (count <= 0) return [];

  const directions: [number, number][] = [
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 0],
  ];

  const positions: [number, number][] = [[0, 0]];

  let x = 0;
  let y = 0;
  let directionIndex = 0;

  let currentSegmentLength = gap;

  while (positions.length < count) {
    const [dx, dy] = directions[directionIndex % 4];

    const stepsToTake = Math.min(
      currentSegmentLength,
      count - positions.length
    );

    for (let i = 0; i < stepsToTake; i++) {
      x += dx;
      y += dy;
      positions.push([x, y]);
    }

    directionIndex++;

    if (directionIndex % 2 === 0) {
      currentSegmentLength += gap;
    }
  }

  return positions;
}
