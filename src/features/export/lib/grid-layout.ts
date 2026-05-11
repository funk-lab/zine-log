import { GRID_CONFIG } from "./constant";
import type { FitMode, FitResult, GridConfig, Slot } from "./export-types";

// ─────────────────────────────────────────────────────────────────────────────
// 网格布局计算：槽位坐标 + 图片适配
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 计算所有槽位在页面上的绝对坐标（以页面左上角为原点，单位 pt）。
 * 槽位为正方形，取最大可能尺寸，并在页面内容区域内居中排列。
 *
 * @param config 网格配置，默认 GRID_CONFIG（A4 横向 4×3）
 * @returns 长度 = columns × rows 的槽位数组，按行列顺序排列
 *
 * @example
 * const slots = calcSlots();
 * // slots[0] => { index:0, row:0, col:0, x:35, y:28, width:191.67, height:191.67 }
 */
export function calcSlots(config: GridConfig = GRID_CONFIG): Slot[] {
  const { pageSize: ps, margin: m, grid: g } = config;

  const cw = ps.width - m.left - m.right;
  const ch = ps.height - m.top - m.bottom;

  // 计算矩形槽位尺寸（原始）
  const rectSlotW = (cw - g.gutter.h * (g.columns - 1)) / g.columns;
  const rectSlotH = (ch - g.gutter.v * (g.rows - 1)) / g.rows;

  // 取较小边作为正方形槽位尺寸
  const squareSlotSize = Math.min(rectSlotW, rectSlotH);

  // 计算居中偏移（使网格在内容区域内居中）
  const totalGridW = g.columns * squareSlotSize + (g.columns - 1) * g.gutter.h;
  const totalGridH = g.rows * squareSlotSize + (g.rows - 1) * g.gutter.v;
  const offsetX = m.left + (cw - totalGridW) / 2;
  const offsetY = m.top + (ch - totalGridH) / 2;

  const slots: Slot[] = [];
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.columns; c++) {
      slots.push({
        index: r * g.columns + c,
        row: r,
        col: c,
        x: offsetX + c * (squareSlotSize + g.gutter.h),
        y: offsetY + r * (squareSlotSize + g.gutter.v),
        width: squareSlotSize,
        height: squareSlotSize,
      });
    }
  }
  return slots;
}

/**
 * 根据适配模式计算源图的裁剪区域与目标绘制尺寸。
 *
 * 坐标系与 Canvas drawImage 一致：
 *   drawImage(img, sx, sy, sW, sH, 0, 0, dw, dh)
 *
 * @param iw 源图宽度（px）
 * @param ih 源图高度（px）
 * @param sw 槽位宽度（pt，与 dw 同单位）
 * @param sh 槽位高度（pt，与 dh 同单位）
 * @param mode 适配模式
 *
 * @example
 * const fit = calcFit(1200, 800, 185, 164, 'cover');
 * ctx.drawImage(bitmap, fit.sx, fit.sy, fit.sW, fit.sH, 0, 0, fit.dw, fit.dh);
 */
export function calcFit(
  iw: number,
  ih: number,
  sw: number,
  sh: number,
  mode: FitMode
): FitResult {
  const ir = iw / ih;
  const sr = sw / sh;

  if (mode === "cover") {
    if (ir > sr) {
      // 图片更宽 → 裁剪左右，垂直铺满
      const sc = sh / ih;
      const dw = iw * sc;
      return { sx: (iw - sw / sc) / 2, sy: 0, sW: sw / sc, sH: ih, dw, dh: sh };
    } else {
      // 图片更高 → 裁剪上下，水平铺满
      const sc = sw / iw;
      const dh = ih * sc;
      return { sx: 0, sy: (ih - sh / sc) / 2, sW: iw, sH: sh / sc, dw: sw, dh };
    }
  }

  if (mode === "contain") {
    if (ir > sr) {
      const dw = sw;
      const dh = sw / ir;
      return { sx: 0, sy: 0, sW: iw, sH: ih, dw, dh };
    } else {
      const dh = sh;
      const dw = sh * ir;
      return { sx: 0, sy: 0, sW: iw, sH: ih, dw, dh };
    }
  }

  // fill：拉伸填满
  return { sx: 0, sy: 0, sW: iw, sH: ih, dw: sw, dh: sh };
}

/**
 * 将图片列表按每页 imagesPerPage 分页，返回每页的图片索引区间。
 *
 * @param totalImages 总图片数
 * @param imagesPerPage 每页图片数
 */
export function calcPageRanges(
  totalImages: number,
  imagesPerPage: number
): Array<{ start: number; end: number }> {
  const totalPages = Math.ceil(totalImages / imagesPerPage);
  return Array.from({ length: totalPages }, (_, i) => ({
    start: i * imagesPerPage,
    end: Math.min((i + 1) * imagesPerPage, totalImages),
  }));
}

/**
 * 获取 pdf-lib 坐标系下的 Y 值。
 * pdf-lib 以页面**左下角**为原点，而我们的槽位坐标以**左上角**为原点。
 *
 * @param pageHeight 页面高度（pt）
 * @param slotY      槽位左上角 Y（pt，从顶部算）
 * @param drawH      实际绘制高度（pt）
 */
export function toPdfLibY(
  pageHeight: number,
  slotY: number,
  drawH: number
): number {
  return pageHeight - slotY - drawH;
}
