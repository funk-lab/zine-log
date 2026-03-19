export const ARTBOARD_WIDTH = 1200;
export const ARTBOARD_HEIGHT = 1600;
export const GRID_RING_WIDTH = 900;
export const GRID_RING_HEIGHT = 1000;

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
  weight = 400,
) {
  if (!lines.length) {
    return "";
  }

  const tspans = lines
    .map((line, index) => {
      const safeLine = escapeHtml(line || " ");
      return `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${safeLine}</tspan>`;
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
      <rect x="${x + 26}" y="${y + 26}" width="${width - 52}" height="${height - 52}" rx="${Math.max(
        radius - 8,
        0,
      )}" ry="${Math.max(radius - 8, 0)}" fill="none" stroke="${rgba(accent, 0.24)}" stroke-dasharray="18 14" />
      <text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="${placeholderSize}" fill="${rgba(
        accent,
        0.76,
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
}

export function gridSlotMarkup({ href, x, y, size, slotId }: GridSlotMarkupOptions) {
  if (!href) {
    return "";
  }

  const innerInset = Math.min(2.5, Math.max(1.5, size * 0.02));
  const imageX = x + innerInset;
  const imageY = y + innerInset;
  const imageSize = size - innerInset * 2;
  return `
    <clipPath id="${slotId}">
      <rect x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" />
    </clipPath>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#ffffff" />
    <image href="${href}" x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${slotId})" />
  `;
}

export function generateSpiralPositions(count: number, gap = 1) {
  if (count <= 0) {
    return [];
  }

  const positions: Array<[number, number]> = [[0, 0]];
  const directions: Array<[number, number]> = [
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 0],
  ];

  let x = 0;
  let y = 0;
  let directionIndex = 0;
  let segmentIndex = 0;

  while (positions.length < count) {
    const segmentLength = 1 + 2 * gap * Math.floor(segmentIndex / 2);
    const [dx, dy] = directions[directionIndex % directions.length];

    for (let step = 0; step < segmentLength && positions.length < count; step += 1) {
      x += dx;
      y += dy;
      positions.push([x, y]);
    }

    directionIndex += 1;
    segmentIndex += 1;
  }

  return positions;
}
