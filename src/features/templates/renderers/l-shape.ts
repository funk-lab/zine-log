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

export function buildLShapeTemplate(state: EditorState, selectedImages: LibraryImage[]) {
  const title = escapeHtml(state.title || "今天的画面");
  const meta = escapeHtml(state.meta || "留一点空间，给图像和情绪呼吸");
  const bodyLines = wrapText(state.body, 16);
  const accentSoft = rgba(state.accent, 0.18);
  const accentMedium = rgba(state.accent, 0.46);
  const bodyBlock = buildTextBlock(bodyLines, 150, 1230, 34, 56, "#4f3c31", 400);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ARTBOARD_WIDTH} ${ARTBOARD_HEIGHT}" role="img" aria-label="L 型回纹设计">
      <defs>
        <pattern id="meander" width="88" height="88" patternUnits="userSpaceOnUse">
          <path d="M8 8h72v20H28v24h32v20H8V8zm32 44H20V28h20v24zm20 20H40V52h20v20z" fill="${accentMedium}" />
        </pattern>
        <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffaf3" />
          <stop offset="100%" stop-color="#f2e7d7" />
        </linearGradient>
      </defs>
      <rect width="${ARTBOARD_WIDTH}" height="${ARTBOARD_HEIGHT}" fill="url(#paper)" />
      <rect x="60" y="60" width="1080" height="1480" rx="38" fill="none" stroke="${accentSoft}" stroke-width="2" />
      <rect x="92" y="92" width="316" height="1026" rx="26" fill="url(#meander)" opacity="0.92" />
      <rect x="92" y="1122" width="644" height="318" rx="26" fill="url(#meander)" opacity="0.92" />
      <rect x="432" y="118" width="648" height="828" rx="28" fill="#fdf8f1" />
      ${imageMarkup({
        href: getImage(selectedImages, 0),
        x: 472,
        y: 158,
        width: 458,
        height: 748,
        clipId: "l-template-image-main",
        accent: state.accent,
        radius: 20,
      })}
      ${imageMarkup({
        href: getImage(selectedImages, 1),
        x: 950,
        y: 158,
        width: 90,
        height: 356,
        clipId: "l-template-image-side-top",
        accent: state.accent,
        radius: 16,
      })}
      ${imageMarkup({
        href: getImage(selectedImages, 2),
        x: 950,
        y: 550,
        width: 90,
        height: 356,
        clipId: "l-template-image-side-bottom",
        accent: state.accent,
        radius: 16,
      })}
      <rect x="128" y="1180" width="540" height="228" rx="20" fill="#fff9f1" opacity="0.82" />
      <text x="150" y="1098" font-family="'Inter', sans-serif" font-size="96" font-weight="700" fill="#2c1b12">${title}</text>
      <text x="152" y="1160" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="28" letter-spacing="4" fill="${accentMedium}">${meta}</text>
      ${bodyBlock}
      <text x="1064" y="1492" text-anchor="end" font-family="'Inter', sans-serif" font-size="36" font-weight="700" fill="${accentMedium}">ZINE LOG</text>
    </svg>
  `;
}
