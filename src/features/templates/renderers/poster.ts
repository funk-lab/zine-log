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

export function buildPosterTemplate(state: EditorState, selectedImages: LibraryImage[]) {
  const title = escapeHtml(state.title || "城市散步");
  const meta = escapeHtml(state.meta || "用一张图做成一页海报");
  const bodyLines = wrapText(state.body, 14);
  const bodyBlock = buildTextBlock(bodyLines, 128, 1250, 32, 54, "#f8efe7", 400);
  const accentSoft = rgba(state.accent, 0.22);
  const accentMedium = rgba(state.accent, 0.82);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ARTBOARD_WIDTH} ${ARTBOARD_HEIGHT}" role="img" aria-label="拼贴栏位设计">
      <defs>
        <linearGradient id="poster-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#241611" />
          <stop offset="100%" stop-color="#5a3723" />
        </linearGradient>
      </defs>
      <rect width="${ARTBOARD_WIDTH}" height="${ARTBOARD_HEIGHT}" fill="url(#poster-bg)" />
      <rect x="84" y="84" width="1032" height="1432" rx="34" fill="none" stroke="${accentSoft}" stroke-width="2" />
      <rect x="126" y="126" width="948" height="820" rx="34" fill="#e9dcc8" />
      ${imageMarkup({
        href: getImage(selectedImages, 0),
        x: 156,
        y: 156,
        width: 574,
        height: 760,
        clipId: "poster-image-main",
        accent: state.accent,
        radius: 28,
      })}
      ${imageMarkup({
        href: getImage(selectedImages, 1),
        x: 754,
        y: 156,
        width: 290,
        height: 360,
        clipId: "poster-image-side-top",
        accent: state.accent,
        radius: 24,
      })}
      ${imageMarkup({
        href: getImage(selectedImages, 2),
        x: 754,
        y: 556,
        width: 290,
        height: 360,
        clipId: "poster-image-side-bottom",
        accent: state.accent,
        radius: 24,
      })}
      <rect x="128" y="1018" width="944" height="362" rx="34" fill="${accentMedium}" opacity="0.88" />
      <text x="128" y="1000" font-family="'Noto Sans SC', 'Inter', sans-serif" font-size="28" letter-spacing="8" fill="${accentSoft}">${meta}</text>
      <text x="128" y="1154" font-family="'Inter', sans-serif" font-size="144" font-weight="700" fill="#fff7ef">${title}</text>
      ${bodyBlock}
      <text x="1068" y="1470" text-anchor="end" font-family="'Inter', sans-serif" font-size="34" font-weight="700" fill="${accentSoft}">poster cut</text>
    </svg>
  `;
}
