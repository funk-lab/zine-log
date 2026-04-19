/**
 * 方形螺旋布局算法库
 *
 * 核心特性：
 * - 逆时针方形螺旋坐标生成
 * - 自适应缩放计算
 * - 自动居中布局
 */

import { GalleryImage } from "@/features/editor/types";

// ==================== 类型定义 ====================

export interface SpiralPosition {
  /** 网格 X 坐标 */
  gridX: number;
  /** 网格 Y 坐标 */
  gridY: number;
  /** 渲染用的像素 X 坐标 */
  x: number;
  /** 渲染用的像素 Y 坐标 */
  y: number;
  /** 槽位尺寸 */
  size: number;
  /** 序号索引 */
  index: number;
}

export interface SpiralLayoutResult {
  /** 所有槽位的位置信息 */
  positions: SpiralPosition[];
  /** 列跨度 */
  spanCols: number;
  /** 行跨度 */
  spanRows: number;
  /** 实际单元格大小 */
  scaledCell: number;
}

// ==================== 核心算法 ====================

/**
 * 生成方形螺旋坐标
 * @param count 需要生成的坐标数量
 * @param gap 螺旋的紧密程度（步长增长系数），默认为 1（最紧密）
 * @returns [x, y] 坐标数组
 *
 * 算法说明：
 * - 方向顺序：上 → 左 → 下 → 右（逆时针向外扩展）
 * - 起始点：[0, 0]
 * - 每完成2个方向，步长 += gap
 *
 * @example
 * generateSpiralPositions(8)
 * // 返回: [[0,0], [0,1], [-1,1], [-1,0], [-1,-1], [-1,-2], [0,-2], [1,-2]]
 */
export function generateSpiralPositions(
  count: number,
  gap = 1
): [number, number][] {
  if (count <= 0) return [];

  // 方向向量：上、左、下、右
  const directions: [number, number][] = [
    [0, 1], // 上
    [-1, 0], // 左
    [0, -1], // 下
    [1, 0], // 右
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
    // 每完成2个方向，步长增加
    if (directionIndex % 2 === 0) {
      currentSegmentLength += gap;
    }
  }

  return positions;
}

/**
 * 计算螺旋布局参数
 * @param count 图片数量
 * @param gap 间隙系数
 * @param scale 缩放系数
 * @param width 画板宽度
 * @param height 画板高度
 * @param baseCell 基础单元格大小
 * @returns 布局结果
 */
export function calculateSpiralLayout(
  count: number,
  gap: number,
  scale: number,
  width: number,
  height: number,
  baseCell: number
): SpiralLayoutResult {
  // 1. 生成螺旋网格坐标
  const spiralPositions = generateSpiralPositions(count, gap);

  // 2. 计算边界框
  const gridXs = spiralPositions.map(([x]) => x);
  const gridYs = spiralPositions.map(([, y]) => y);
  const minGridX = Math.min(...gridXs, 0);
  const maxGridX = Math.max(...gridXs, 0);
  const minGridY = Math.min(...gridYs, 0);
  const maxGridY = Math.max(...gridYs, 0);

  const spanCols = maxGridX - minGridX + 1;
  const spanRows = maxGridY - minGridY + 1;

  // 3. 固定槽位大小 = baseCell * scale
  // 无论图片数量多少，槽位尺寸保持一致
  const scaledCell = baseCell * scale;

  // 4. 居中偏移
  const offsetX = (width - spanCols * scaledCell) / 2;
  const offsetY = (height - spanRows * scaledCell) / 2;

  // 5. 计算最终位置
  const positions: SpiralPosition[] = spiralPositions.map(
    ([gridX, gridY], index) => ({
      gridX,
      gridY,
      x: offsetX + (gridX - minGridX) * scaledCell,
      y: offsetY + (gridY - minGridY) * scaledCell,
      size: scaledCell,
      index,
    })
  );

  return { positions, spanCols, spanRows, scaledCell };
}

/**
 * 生成 Photo Ring 的 SVG 字符串（用于导出）
 */
export function generatePhotoRingSVG(
  count: number,
  gap: number,
  scale: number,
  width: number,
  height: number,
  baseCell: number,
  backgroundColor: string,
  images: GalleryImage[] = [],
  padding = 2
): string {
  const { positions } = calculateSpiralLayout(
    count,
    gap,
    scale,
    width,
    height,
    baseCell
  );

  const slots = positions
    .map(({ x, y, size, index }) => {
      const image = images[index];
      const paddingPx = Math.max(0, Math.min(padding, size / 4));
      const innerSize = size - paddingPx * 2;
      const innerX = x + paddingPx;
      const innerY = y + paddingPx;

      // 优先使用 blobUrl，兼容旧数据使用 src
      const imageUrl =
        (image as GalleryImage & { blobUrl?: string })?.blobUrl || image?.src;
      if (imageUrl) {
        return `
          <image
            x="${innerX}"
            y="${innerY}"
            width="${innerSize}"
            height="${innerSize}"
            href="${imageUrl}"
            preserveAspectRatio="xMidYMid slice"
          />
        `;
      }

      return `
        <rect
          x="${innerX}"
          y="${innerY}"
          width="${innerSize}"
          height="${innerSize}"
          fill="#1e293b"
          rx="4"
        />
        <text
          x="${innerX + innerSize / 2}"
          y="${innerY + innerSize / 2}"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#475569"
          font-size="${innerSize * 0.4}"
          font-weight="bold"
        >${index + 1}</text>
      `;
    })
    .join("");

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width="${width}"
      height="${height}"
    >
      <rect width="${width}" height="${height}" fill="${backgroundColor}" />
      ${slots}
    </svg>
  `;
}
