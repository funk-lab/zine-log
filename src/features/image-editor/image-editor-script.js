/* ============================================================
   Emoji 数据
============================================================ */
const EMOJI_DATA = {
  smileys: ['😀','😂','🥲','😊','😍','🤩','😎','🥳','😜','🤪','😋','😇','🥰','😘','😏','🤭','🧐','🤔','😤','🙄','😴','🤤','😷','🤒','😈','👻','💀','🤡','👽','💩','🐱','🙃','😬','😱','😰','😥','😢','😭','🤯','😳','🥺'],
  nature: ['🌸','🌺','🌹','🌷','🌼','🌻','🌞','🌝','🌛','⭐','🌟','💫','✨','🌈','☀️','⛅','🌤️','🌧️','⛈️','❄️','🌊','🌴','🌵','🍁','🍂','🍃','🌿','🌱','🌾','🐾','🦋','🐝','🐞','🦊','🐰','🐻','🐼','🦁','🐯','🐸'],
  food: ['🍎','🍊','🍋','🍇','🍓','🫐','🍑','🍒','🥭','🍍','🥥','🍆','🥑','🥦','🥕','🌽','🍔','🍟','🍕','🌮','🍜','🍱','🍣','🍦','🧁','🎂','🍰','🍫','🍬','🍭','☕','🧋','🍵','🥤','🍷','🎉','🎊','🎁'],
  travel: ['✈️','🚀','🛸','🚁','🛳️','⛵','🚂','🏕️','🗺️','🧭','🏔️','🏖️','🏜️','🗼','🗽','🏰','🎡','⛩️','🕌','🏛️','🌁','🌃','🌉','🌆','🌇','🎠','🎪','🎭','🗿','🌏'],
  activities: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥊','🏊','🤸','🧘','🏋️','🚴','⛷️','🏄','🤽','🏇','🎯','🎱','🎮','🎲','♟️','🎭','🎨','🖌️','🎪','🎡','🎢','🎠','🎬','🎤'],
  objects: ['💡','🔦','🕯️','📱','💻','⌨️','🖥️','📷','📸','🎥','📽️','🎞️','📞','☎️','📟','🔋','💾','💿','📀','🖨️','⌚','📡','🔭','🔬','🩺','💊','🔑','🗝️','🔒','🔓','🪄','🎩'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💓','💗','💖','💘','💝','💔','❣️','♾️','✅','☑️','✔️','❌','⭕','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🔶','🔷','🔸','🔹'],
};

let currentCat = 'recent';
let allEmojis = Object.values(EMOJI_DATA).flat();

function renderEmojiGrid(emojis) {
  const grid = document.getElementById('emojiGrid');
  grid.innerHTML = emojis.map(e =>
    `<div class="emoji-item" onclick="insertEmoji('${e}')">${e}</div>`
  ).join('');
}

function setEmojiCat(btn, cat) {
  document.querySelectorAll('.emoji-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = cat;
  const labels = {
    recent:'最近使用', smileys:'表情与颜文字', nature:'自然与动物',
    food:'食物与饮品', travel:'旅行与地点', activities:'运动与活动',
    objects:'物品与工具', symbols:'符号与爱心'
  };
  document.getElementById('emojiCatLabel').textContent = labels[cat] || cat;
  document.getElementById('recentSection').style.display = cat === 'recent' ? 'flex' : 'none';

  if (cat === 'recent') {
    renderEmojiGrid(['🌸','✨','🎯','💫','🌈','🎪','🦋','🍀','🎉','😊','💕','🌟','🔥','💯','🎶','🌺','🏆','🎭','🌸','🦄','🐉','🎨','🌙','☀️','🌊','🍀','🌈','💫']);
  } else {
    renderEmojiGrid(EMOJI_DATA[cat] || []);
  }
}

function filterEmoji(val) {
  if (!val.trim()) {
    setEmojiCat(document.querySelector('.emoji-cat-btn.active'), currentCat);
    return;
  }
  const filtered = allEmojis.filter(() => true).slice(0, 42);
  renderEmojiGrid(filtered);
}

function insertEmoji(e) {
  console.log('Insert emoji:', e);
  const grid = document.getElementById('emojiGrid');
  const items = grid.querySelectorAll('.emoji-item');
  items.forEach(item => {
    if (item.textContent === e) {
      item.style.background = 'var(--clr-brand-light)';
      setTimeout(() => item.style.background = '', 400);
    }
  });
}

// 初始化：文字工具默认激活，文字面板默认显示
showPanel('text');
renderEmojiGrid(['🌸','✨','🎯','💫','🌈','🎪','🦋','🍀','🎉','😊','💕','🌟','🔥','💯','🎶','🌺','🏆','🎭','🌸','🦄','🐉','🎨','🌙','☀️','🌊','🍀','🌈','💫','😍','🥳']);

/* ============================================================
   工具栏切换（直接控制面板显示，替代右侧 tab 条）
============================================================ */
const ALL_TABS = ['canvas','text','shape','brush','emoji'];

function showPanel(id) {
  ALL_TABS.forEach(name => {
    const el = document.getElementById('tab-' + name);
    if (el) {
      el.style.display = (name === id) ? 'flex' : 'none';
    }
  });
}

function setTool(tool, btn) {
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // 'select' 和 '对齐' 保持当前面板不变
  const panelMap = {
    canvas: 'canvas',
    text:   'text',
    shape:  'shape',
    brush:  'brush',
    emoji:  'emoji',
    select: null,
    '对齐':  null,
  };

  const panelId = panelMap[tool];
  if (panelId) {
    showPanel(panelId);
  }

  // 同步更新状态栏
  const toolNames = { canvas:'画布', text:'文字', shape:'形状', brush:'画笔', emoji:'表情', select:'选择' };
  const name = toolNames[tool] || '选择';
  const el = document.getElementById('statusTool');
  if (el) el.textContent = '当前工具：' + name;
}

/* ============================================================
   缩放
============================================================ */
let zoom = 100;
function changeZoom(delta) {
  zoom = Math.min(200, Math.max(30, zoom + delta));
  document.getElementById('zoomVal').textContent = zoom + '%';
  document.getElementById('canvasWrap').style.transform = `scale(${zoom/100})`;
  document.getElementById('canvasWrap').style.transformOrigin = 'top center';
}

/* ============================================================
   颜色点选择
============================================================ */
function setColorDot(el, targetId, color) {
  const parent = el.closest('.color-row');
  if (parent) parent.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  const preview = document.getElementById(targetId);
  if (preview) preview.style.background = color;
}

/* ============================================================
   对齐
============================================================ */
function setAlign(btn) {
  btn.closest('.align-group').querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ============================================================
   形状预设
============================================================ */
function selectPreset(el) {
  el.closest('.preset-grid').querySelectorAll('.preset-item').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}
function selectLinePreset(el) {
  el.closest('.line-presets').querySelectorAll('.line-preset-item').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}
function setBorderStyle(el) {
  el.closest('.border-styles').querySelectorAll('.border-style-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ============================================================
   画笔类型
============================================================ */
function selectBrush(el) {
  el.closest('.brush-type-row').querySelectorAll('.brush-type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const isMarker = !!el.querySelector('[stroke-width="5"]');
  const path = document.getElementById('brushPreviewPath');
  if (isMarker) { path.setAttribute('stroke-width','10'); path.style.opacity='.45'; }
  else { path.setAttribute('stroke-width','2'); path.style.opacity='1'; }
}
function setBrushColor(el, color) {
  el.closest('.color-row').querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('brushColor').style.background = color;
  document.getElementById('brushColorHex').value = color;
  document.getElementById('brushPreviewPath').setAttribute('stroke', color);
}
function updateBrushPreview(val) {
  document.getElementById('brushPreviewPath').setAttribute('stroke-width', val);
}

/* ============================================================
   描边/阴影 展开
============================================================ */
function toggleAdvanced(rowId, panelId) {
  const row = document.getElementById(rowId);
  const panel = document.getElementById(panelId);
  const arrowId = rowId === 'strokeRow' ? 'strokeArrow' : 'shadowArrow';
  const arrow = document.getElementById(arrowId);
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'flex';
  panel.style.flexDirection = 'column';
  row.classList.toggle('expanded', !isOpen);
  if (arrow) { arrow.style.transform = isOpen ? '' : 'rotate(180deg)'; arrow.style.transition='transform .2s ease'; }
}

/* ============================================================
   画布面板：预设比例
============================================================ */
let canvasRatio = 3/4;

function selectRatio(el, label, w, h) {
  document.querySelectorAll('.ratio-item').forEach(r => r.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('canvasW').value = w;
  document.getElementById('canvasH').value = h;
  canvasRatio = w / h;
  const paper = document.querySelector('.canvas-paper');
  const scale = Math.min(1, 520 / Math.max(w, h));
  paper.style.width = (w * scale) + 'px';
  paper.style.minHeight = (h * scale) + 'px';
}

/* 锁定比例开关 */
let sizeLinked = true;
function toggleSizeLink(btn) {
  sizeLinked = !sizeLinked;
  btn.classList.toggle('linked', sizeLinked);
}

function syncLinkedSize(changed) {
  if (!sizeLinked) return;
  const wEl = document.getElementById('canvasW');
  const hEl = document.getElementById('canvasH');
  if (changed === 'w') hEl.value = Math.round(+wEl.value / canvasRatio);
  else wEl.value = Math.round(+hEl.value * canvasRatio);
}

function applyCanvasSize() {
  const w = +document.getElementById('canvasW').value;
  const h = +document.getElementById('canvasH').value;
  const paper = document.querySelector('.canvas-paper');
  const scale = Math.min(1, 520 / Math.max(w, h));
  paper.style.width = (w * scale) + 'px';
  paper.style.minHeight = (h * scale) + 'px';
  document.querySelectorAll('.ratio-item').forEach(r => r.classList.remove('active'));
}

/* ============================================================
   画布面板：裁切模式
============================================================ */
function selectCropMode(el, mode) {
  document.querySelectorAll('.crop-mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const overlay = document.getElementById('cropOverlay');
  if (mode === 'circle') {
    overlay.style.borderRadius = '50%';
  } else {
    overlay.style.borderRadius = '4px';
  }
}

function selectCropRatio(el, ratio) {
  document.querySelectorAll('.crop-ratio-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function applyCrop() {
  console.log('Apply crop');
}
function cancelCrop() {
  document.querySelectorAll('.crop-mode-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  document.getElementById('cropOverlay').style.borderRadius = '4px';
}

function rotateCanvas(deg) { console.log('Rotate', deg); }
function flipCanvas(dir) { console.log('Flip', dir); }
