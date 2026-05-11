import { GridConfig } from "./export-types";

// 布局常量：A4 横向 · 4 列 × 3 行
const GRID_CONFIG: GridConfig = {
  /** A4 横向 (pt)：1pt ≈ 0.353mm，297mm × 210mm */
  pageSize: { width: 842, height: 595 },

  /** 页边距 (pt) */
  margin: { top: 10, right: 10, bottom: 10, left: 10 },

  /** 网格：4 列 × 3 行，间距 12pt */
  grid: {
    columns: 4,
    rows: 3,
    gutter: { h: 0, v: 0 },
  },

  defaultFitMode: "cover",
} as const;

/** 每页图片数 = columns × rows = 12 */
const IMAGES_PER_PAGE = GRID_CONFIG.grid.columns * GRID_CONFIG.grid.rows;

/**
 * 单页布局规则类型
 */
export interface PageRule {
  i: number;
  angle: number;
}

/**
 * TIGHT 布局规则集合
 * 每页独立计数，图片索引 i 为 0-based（相对于当前页起始）
 */
export const TIGHT_RULES: PageRule[][] = [
  // 第 1 页规则
  [
    { i: 2, angle: 0 },
    { i: 3, angle: 0 },
    { i: 4, angle: 0 },
    { i: 5, angle: 0 },
    { i: 1, angle: 0 },
    { i: 0, angle: 0 },
    { i: 6, angle: -90 },
    { i: 7, angle: -90 },
    { i: 11, angle: 0 },
    { i: 10, angle: 0 },
    { i: 9, angle: 0 },
    { i: 8, angle: 0 },
  ],
  // 第 2 页规则（占位，后续修改）
  [
    { i: 7, angle: -90 },
    { i: 8, angle: 0 },
    { i: 9, angle: 0 },
    { i: 10, angle: 0 },
    { i: 6, angle: -90 },
    { i: 5, angle: -90 },
    { i: 4, angle: -90 },
    { i: 0, angle: -90 },
    { i: 11, angle: 0 },
    { i: 3, angle: -90 },
    { i: 2, angle: -90 },
    { i: 1, angle: -90 },
  ],
];

export { GRID_CONFIG, IMAGES_PER_PAGE };
