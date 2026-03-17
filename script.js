const artboard = document.querySelector("#artboard");
const imageUpload = document.querySelector("#image-upload");
const imageCount = document.querySelector("#image-count");
const thumbStrip = document.querySelector("#thumb-strip");
const titleInput = document.querySelector("#title-input");
const metaInput = document.querySelector("#meta-input");
const bodyInput = document.querySelector("#body-input");
const accentInput = document.querySelector("#accent-input");
const templateSelect = document.querySelector("#template-select");
const templateButtons = document.querySelectorAll(".template-pill");
const downloadPngButton = document.querySelector("#download-png");
const downloadSvgButton = document.querySelector("#download-svg");
const printPdfButton = document.querySelector("#print-pdf");
const randomFillButton = document.querySelector("#random-fill");

const state = {
  template: "l-shape",
  title: "",
  meta: "",
  body: "",
  accent: "#b36a3c",
  imageDataUrls: [],
};

const ARTBOARD_WIDTH = 1200;
const ARTBOARD_HEIGHT = 1600;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hexToRgb(hex) {
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

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function wrapText(text, maxChars) {
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

      const lines = [];
      for (let index = 0; index < chars.length; index += maxChars) {
        lines.push(chars.slice(index, index + maxChars).join(""));
      }
      return lines;
    })
    .slice(0, 8);
}

function buildTextBlock(lines, x, y, size, lineHeight, color, weight = 400) {
  if (!lines.length) {
    return "";
  }

  const tspans = lines
    .map((line, index) => {
      const safeLine = escapeHtml(line || " ");
      return `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${safeLine}</tspan>`;
    })
    .join("");

  return `<text x="${x}" y="${y}" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${tspans}</text>`;
}

function imageMarkup({ href, x, y, width, height, clipId, radius = 0 }) {
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
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#f2e6d4" />
      <rect x="${x + 26}" y="${y + 26}" width="${width - 52}" height="${height - 52}" rx="${Math.max(
        radius - 8,
        0,
      )}" ry="${Math.max(radius - 8, 0)}" fill="none" stroke="${rgba(state.accent, 0.32)}" stroke-dasharray="18 14" />
      <text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="54" fill="${rgba(
        state.accent,
        0.84,
      )}">Upload Photo</text>
    </g>
  `;
}

function getImage(index) {
  if (!state.imageDataUrls.length) {
    return "";
  }

  return state.imageDataUrls[index] || state.imageDataUrls[index % state.imageDataUrls.length];
}

function renderThumbs() {
  imageCount.textContent = `${state.imageDataUrls.length} 张`;

  if (!state.imageDataUrls.length) {
    thumbStrip.innerHTML = `<div class="thumb-card empty">上传多张图片后会按顺序排版</div>`;
    return;
  }

  thumbStrip.innerHTML = state.imageDataUrls
    .map(
      (src, index) => `
        <div class="thumb-card" title="第 ${index + 1} 张">
          <img src="${src}" alt="已上传图片 ${index + 1}" />
        </div>
      `,
    )
    .join("");
}

function buildLTemplate() {
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
        href: getImage(0),
        x: 472,
        y: 158,
        width: 458,
        height: 748,
        clipId: "l-template-image-main",
        radius: 20,
      })}
      ${imageMarkup({
        href: getImage(1),
        x: 950,
        y: 158,
        width: 90,
        height: 356,
        clipId: "l-template-image-side-top",
        radius: 16,
      })}
      ${imageMarkup({
        href: getImage(2),
        x: 950,
        y: 550,
        width: 90,
        height: 356,
        clipId: "l-template-image-side-bottom",
        radius: 16,
      })}
      <rect x="128" y="1180" width="540" height="228" rx="20" fill="#fff9f1" opacity="0.82" />
      <text x="150" y="1098" font-family="'Cormorant Garamond', serif" font-size="104" fill="#2c1b12">${title}</text>
      <text x="152" y="1160" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="28" letter-spacing="4" fill="${accentMedium}">${meta}</text>
      ${bodyBlock}
      <text x="1064" y="1492" text-anchor="end" font-family="'Cormorant Garamond', serif" font-size="38" fill="${accentMedium}">ZINE LOG</text>
    </svg>
  `;
}

function buildEditorialTemplate() {
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
        href: getImage(0),
        x: 154,
        y: 190,
        width: 500,
        height: 720,
        clipId: "editorial-image-main",
        radius: 24,
      })}
      ${imageMarkup({
        href: getImage(1),
        x: 816,
        y: 838,
        width: 220,
        height: 252,
        clipId: "editorial-image-detail",
        radius: 20,
      })}
      <line x1="742" y1="182" x2="1034" y2="182" stroke="${accentMedium}" stroke-width="4" />
      <text x="742" y="300" font-family="'Cormorant Garamond', serif" font-size="116" fill="#28180f">${title}</text>
      <text x="742" y="364" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="28" letter-spacing="6" fill="${accentMedium}">${meta}</text>
      ${bodyBlock}
      <rect x="742" y="1140" width="292" height="220" rx="26" fill="${accentSoft}" />
      <text x="780" y="1228" font-family="'Cormorant Garamond', serif" font-size="42" fill="#2c1b12">memory</text>
      <text x="780" y="1290" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="26" fill="#5e483c">照片、短句、地点</text>
      <text x="780" y="1338" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="26" fill="#5e483c">先做出一本小小的生活志</text>
      <text x="1042" y="1454" text-anchor="end" font-family="'Cormorant Garamond', serif" font-size="34" fill="${accentMedium}">No. 01</text>
    </svg>
  `;
}

function buildPosterTemplate() {
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
        href: getImage(0),
        x: 156,
        y: 156,
        width: 574,
        height: 760,
        clipId: "poster-image-main",
        radius: 28,
      })}
      ${imageMarkup({
        href: getImage(1),
        x: 754,
        y: 156,
        width: 290,
        height: 360,
        clipId: "poster-image-side-top",
        radius: 24,
      })}
      ${imageMarkup({
        href: getImage(2),
        x: 754,
        y: 556,
        width: 290,
        height: 360,
        clipId: "poster-image-side-bottom",
        radius: 24,
      })}
      <rect x="128" y="1018" width="944" height="362" rx="34" fill="${accentMedium}" opacity="0.88" />
      <text x="128" y="1000" font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="28" letter-spacing="8" fill="${accentSoft}">${meta}</text>
      <text x="128" y="1154" font-family="'Cormorant Garamond', serif" font-size="156" fill="#fff7ef">${title}</text>
      ${bodyBlock}
      <text x="1068" y="1470" text-anchor="end" font-family="'Cormorant Garamond', serif" font-size="36" fill="${accentSoft}">poster cut</text>
    </svg>
  `;
}

function currentSvgMarkup() {
  if (state.template === "editorial") {
    return buildEditorialTemplate();
  }

  if (state.template === "poster") {
    return buildPosterTemplate();
  }

  return buildLTemplate();
}

function render() {
  document.documentElement.style.setProperty("--accent", state.accent);
  artboard.innerHTML = currentSvgMarkup();
  renderThumbs();

  templateButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.template === state.template);
  });
}

function syncStateFromInputs() {
  state.title = titleInput.value.trim();
  state.meta = metaInput.value.trim();
  state.body = bodyInput.value.trim();
  state.accent = accentInput.value;
  state.template = templateSelect.value;
  render();
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function svgBlob() {
  return new Blob([currentSvgMarkup()], {
    type: "image/svg+xml;charset=utf-8",
  });
}

async function downloadPng() {
  const svgText = currentSvgMarkup();
  const blob = new Blob([svgText], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = ARTBOARD_WIDTH;
  canvas.height = ARTBOARD_HEIGHT;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, ARTBOARD_WIDTH, ARTBOARD_HEIGHT);
  context.drawImage(image, 0, 0, ARTBOARD_WIDTH, ARTBOARD_HEIGHT);

  URL.revokeObjectURL(url);

  const dataUrl = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = "zine-log-design.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

function printDesign() {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=1280");
  if (!printWindow) {
    window.alert("浏览器拦截了打印窗口，请允许弹窗后重试。");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>Zine Log PDF</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            display: grid;
            place-items: center;
            min-height: 100vh;
            background: white;
          }
          .sheet {
            width: min(100%, 180mm);
          }
          svg {
            width: 100%;
            height: auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="sheet">${currentSvgMarkup()}</div>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function applyTemplate(template) {
  state.template = template;
  templateSelect.value = template;
  render();
}

function fillExample() {
  titleInput.value = "春日河岸慢走";
  metaInput.value = "2026.03.17 · 傍晚五点半";
  bodyInput.value =
    "风有点凉，树影被拉得很长。\n今天没有发生特别大的事，但光线很好，适合把照片留成一页。";
  accentInput.value = "#a55d35";
  templateSelect.value = "l-shape";
  syncStateFromInputs();
}

titleInput.addEventListener("input", syncStateFromInputs);
metaInput.addEventListener("input", syncStateFromInputs);
bodyInput.addEventListener("input", syncStateFromInputs);
accentInput.addEventListener("input", syncStateFromInputs);
templateSelect.addEventListener("change", syncStateFromInputs);

templateButtons.forEach((button) => {
  button.addEventListener("click", () => applyTemplate(button.dataset.template));
});

imageUpload.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    return;
  }

  const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));
  state.imageDataUrls = dataUrls;
  render();
});

downloadSvgButton.addEventListener("click", () => {
  downloadBlob("zine-log-design.svg", svgBlob());
});

downloadPngButton.addEventListener("click", async () => {
  try {
    await downloadPng();
  } catch (error) {
    console.error(error);
    window.alert("PNG 导出失败，请换一张图片或改用 SVG 导出。");
  }
});

printPdfButton.addEventListener("click", printDesign);
randomFillButton.addEventListener("click", fillExample);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

fillExample();
