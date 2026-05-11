import type {
  FoldAxis,
  PanelEdge,
  PreviewHinge,
  PreviewPanel,
  PreviewStripModel,
} from "@/features/preview3d/model/types";
import { generateSpiralPositions } from "@/features/templates/lib/spiral";

const WORLD_SCALE = 0.007; // 世界坐标缩放系数
const BASE_CELL_SIZE = 80; // 基础单元格大小（像素）

interface SpiralCell {
  gridX: number;
  gridY: number;
  index: number;
}

/**
 * 计算螺旋布局的边界框
 */
function calculateSpiralBounds(positions: [number, number][]) {
  const xs = positions.map(([x]) => x);
  const ys = positions.map(([, y]) => y);
  return {
    minX: Math.min(...xs, 0),
    maxX: Math.max(...xs, 0),
    minY: Math.min(...ys, 0),
    maxY: Math.max(...ys, 0),
  };
}

/**
 * 计算单元格大小（自适应）
 */
function calculateCellSize(
  spanCols: number,
  spanRows: number,
  canvasWidth: number,
  canvasHeight: number,
  scale: number
): number {
  const padding = 48;
  const fitCell = Math.min(
    (canvasWidth - padding) / spanCols,
    (canvasHeight - padding) / spanRows
  );
  return Math.min(fitCell, BASE_CELL_SIZE * scale);
}

/**
 * 将网格坐标转换为行列（用于 resolveEdgeLink）
 * 
 * 注意：这里将 gridX 映射为 col，gridY 映射为 row
 * 但方向可能需要调整以匹配折叠逻辑
 */
function gridToRowCol(gridX: number, gridY: number, minX: number, minY: number) {
  return {
    row: minY - gridY, // Y 轴翻转，因为 3D 中 Y 向上，但网格向下增长
    col: gridX - minX,
  };
}

/**
 * 根据相邻关系确定边缘连接
 */
function resolveEdgeLink(
  from: { row: number; col: number },
  to: { row: number; col: number }
): {
  fromEdge: PanelEdge;
  toEdge: PanelEdge;
  axis: FoldAxis;
} {
  const dCol = to.col - from.col;
  const dRow = to.row - from.row;

  if (dCol === 1 && dRow === 0) {
    return { fromEdge: "right", toEdge: "left", axis: "y" };
  }
  if (dCol === -1 && dRow === 0) {
    return { fromEdge: "left", toEdge: "right", axis: "y" };
  }
  if (dCol === 0 && dRow === 1) {
    return { fromEdge: "bottom", toEdge: "top", axis: "x" };
  }
  if (dCol === 0 && dRow === -1) {
    return { fromEdge: "top", toEdge: "bottom", axis: "x" };
  }

  throw new Error(
    `Spiral path produced non-adjacent cells: (${from.row},${from.col}) -> (${to.row},${to.col})`
  );
}

/**
 * 有状态折叠角度计算器
 */
function createFoldSolver(baseAngles = { x: 0.18, y: 0.2 }) {
  let accX = 0;
  let accY = 0;
  let segIndex = 0;

  return function solve(axis: FoldAxis, isLast = false): number {
    const sign = segIndex % 2 === 0 ? 1 : -1.6;
    const θ = sign * (axis === "x" ? baseAngles.x : baseAngles.y);

    if (isLast) {
      const prevAcc = axis === "x" ? accX : accY;
      const angle = -prevAcc;
      accX = 0;
      accY = 0;
      segIndex = 0;
      return angle;
    }

    if (axis === "x") {
      accX += θ;
    } else {
      accY += θ;
    }
    segIndex += 1;

    return θ;
  };
}

/**
 * 使用 generateSpiralPositions 构建螺旋模型
 * 
 * 这是与 DOM/SVG 共享核心算法的 3D 模型构建器
 * 
 * @param count 面板数量（图片数量）
 * @param gap 螺旋间隙系数
 * @param scale 缩放系数
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @returns PreviewStripModel
 */
export function buildSpiralModel(
  count: number,
  gap: number = 1,
  scale: number = 1.5,
  canvasWidth: number = 900,
  canvasHeight: number = 1000
): PreviewStripModel {
  if (count <= 0) {
    return {
      rows: 0,
      cols: 0,
      pageWidth: canvasWidth,
      pageHeight: canvasHeight,
      panels: [],
      hinges: [],
    };
  }

  // 1. 使用核心算法生成螺旋坐标
  const spiralPositions = generateSpiralPositions(count, gap);

  // 2. 计算边界框
  const bounds = calculateSpiralBounds(spiralPositions);
  const spanCols = bounds.maxX - bounds.minX + 1;
  const spanRows = bounds.maxY - bounds.minY + 1;

  // 3. 计算单元格大小和偏移（与 DOM 逻辑一致）
  const cellSize = calculateCellSize(
    spanCols,
    spanRows,
    canvasWidth,
    canvasHeight,
    scale
  );
  const offsetX = (canvasWidth - spanCols * cellSize) / 2;
  const offsetY = (canvasHeight - spanRows * cellSize) / 2;

  // 4. 转换为世界坐标
  const worldCellSize = cellSize * WORLD_SCALE;

  // 5. 构建面板
  const cells: SpiralCell[] = spiralPositions.map(([gridX, gridY], index) => ({
    gridX,
    gridY,
    index,
  }));

  const panels: PreviewPanel[] = cells.map((cell) => {
    const { row, col } = gridToRowCol(
      cell.gridX,
      cell.gridY,
      bounds.minX,
      bounds.minY
    );

    // 计算像素坐标
    const pixelX = offsetX + (cell.gridX - bounds.minX) * cellSize;
    const pixelY = offsetY + (cell.gridY - bounds.minY) * cellSize;

    // 注意：实际世界坐标通过折叠链计算，这里主要记录像素坐标用于 UV 映射
    return {
      id: `panel-${cell.index}`,
      index: cell.index,
      row,
      col,
      width: worldCellSize,
      height: worldCellSize,
      sourceRect: {
        x: pixelX,
        y: pixelY,
        width: cellSize,
        height: cellSize,
      },
      uvRect: {
        u0: pixelX / canvasWidth,
        v0: 1 - (pixelY + cellSize) / canvasHeight,
        u1: (pixelX + cellSize) / canvasWidth,
        v1: 1 - pixelY / canvasHeight,
      },
    };
  });

  // 6. 构建铰链（折叠连接）
  const foldSolver = createFoldSolver();
  const hinges: PreviewHinge[] = [];

  for (let i = 0; i < cells.length - 1; i++) {
    const current = cells[i];
    const next = cells[i + 1];

    const fromCell = gridToRowCol(
      current.gridX,
      current.gridY,
      bounds.minX,
      bounds.minY
    );
    const toCell = gridToRowCol(next.gridX, next.gridY, bounds.minX, bounds.minY);

    const link = resolveEdgeLink(fromCell, toCell);
    panels[i + 1].creaseEdge = link.toEdge;

    // 判断是否是段的最后一个
    const nextNext = cells[i + 2];
    let isLast = false;
    if (nextNext) {
      const nextNextCell = gridToRowCol(
        nextNext.gridX,
        nextNext.gridY,
        bounds.minX,
        bounds.minY
      );
      const nextLink = resolveEdgeLink(toCell, nextNextCell);
      isLast = nextLink.axis !== link.axis;
    }

    hinges.push({
      id: `hinge-${i}`,
      fromPanelId: panels[i].id,
      toPanelId: panels[i + 1].id,
      fromIndex: i,
      toIndex: i + 1,
      fromEdge: link.fromEdge,
      toEdge: link.toEdge,
      axis: link.axis,
      angle: foldSolver(link.axis, isLast),
    });
  }

  return {
    rows: spanRows,
    cols: spanCols,
    pageWidth: canvasWidth,
    pageHeight: canvasHeight,
    panels,
    hinges,
  };
}

/**
 * 从图片数组构建螺旋模型
 */
export function buildSpiralModelFromImages(
  images: { src: string }[],
  gap: number = 1,
  scale: number = 1.5,
  canvasWidth: number = 900,
  canvasHeight: number = 1000
): PreviewStripModel {
  return buildSpiralModel(
    images.length,
    gap,
    scale,
    canvasWidth,
    canvasHeight
  );
}
