import type { EditorState, LibraryImage } from "@/features/editor/types";
import {
  ARTBOARD_HEIGHT,
  ARTBOARD_WIDTH,
  buildTextBlock,
  escapeHtml,
  imageMarkup,
  rgba,
  wrapText,
} from "@/features/templates/lib/svg";

function getImage(images: LibraryImage[], index: number) {
  return images[index]?.src ?? "";
}

export function buildEditorialTemplate(state: EditorState, selectedImages: LibraryImage[]) {
  const title = escapeHtml(state.title || "日常剪影");
  const meta = escapeHtml(state.meta || "一页留白，也是一种编排");
  const bodyLines = wrapText(state.body, 18);
  const bodyBlock = buildTextBlock(bodyLines, 760, 720, 36, 58, "#46352c", 400);
  const accentSoft = rgba(state.accent, 0.16);
  const accentMedium = rgba(state.accent, 0.6);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ARTBOARD_WIDTH} ${ARTBOARD_HEIGHT}" role="img" aria-label="留白日记设计">
      <defs>
        <linearGradient id="editorial-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fcf7f1" />
          <stop offset="100%" stop-color="#f0e5d4" />
        </linearGradient>
      </defs>
      <rect width="${ARTBOARD_WIDTH}" height="${ARTBOARD_HEIGHT}" fill="url(#editorial-bg)" />
      <rect x="96" y="96" width="1008" height="1408" fill="none" stroke="${accentSoft}" stroke-width="2" />
      <rect x="124" y="160" width="560" height="780" rx="30" fill="#f8ecdd" />
      ${imageMarkup({
        href: getImage(selectedImages, 0),
        x: 154,
        y: 190,
        width: 500,
        height: 720,
        clipId: "editorial-image-main",
        accent: state.accent,
        radius: 24,
      })}
      ${imageMarkup({
        href: getImage(selectedImages, 1),
        x: 816,
        y: 838,
        width: 220,
        height: 252,
        clipId: "editorial-image-detail",
        accent: state.accent,
        radius: 20,
      })}
      <line x1="742" y1="182" x2="1034" y2="182" stroke="${accentMedium}" stroke-width="4" />
      <text x="742" y="300" font-family="'Inter', sans-serif" font-size="100" font-weight="700" fill="#28180f">${title}</text>
      <text x="742" y="364" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="28" letter-spacing="6" fill="${accentMedium}">${meta}</text>
      ${bodyBlock}
      <rect x="742" y="1140" width="292" height="220" rx="26" fill="${accentSoft}" />
      <text x="780" y="1228" font-family="'Inter', sans-serif" font-size="40" font-weight="700" fill="#2c1b12">记忆</text>
      <text x="780" y="1290" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="26" fill="#5e483c">照片、短句、地点</text>
      <text x="780" y="1338" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="26" fill="#5e483c">把日常排成一页</text>
      <text x="1042" y="1454" text-anchor="end" font-family="'Inter', sans-serif" font-size="32" font-weight="700" fill="${accentMedium}">No. 01</text>
    </svg>
  `;
}
