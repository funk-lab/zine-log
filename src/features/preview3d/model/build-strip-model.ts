import type {
  FoldAxis,
  PanelEdge,
  PreviewHinge,
  PreviewPanel,
  PreviewStripModel,
  PreviewTransform,
} from "@/features/preview3d/model/types";
import type { ImagePreviewRegion } from "@/features/preview3d/lib/extract-image-preview-layout";

const TARGET_PANEL_PIXELS = 360;
const MAX_GRID_DIMENSION = 4;
const MIN_GRID_DIMENSION = 2;
const MAX_WORLD_SIZE = 6.5;

interface GridCell {
  row: number;
  col: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveGridSize(pageWidth: number, pageHeight: number) {
  return {
    cols: clamp(Math.round(pageWidth / TARGET_PANEL_PIXELS), MIN_GRID_DIMENSION, MAX_GRID_DIMENSION),
    rows: clamp(Math.round(pageHeight / TARGET_PANEL_PIXELS), MIN_GRID_DIMENSION, MAX_GRID_DIMENSION),
  };
}

function buildSpiralPath(rows: number, cols: number) {
  const path: GridCell[] = [];
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;

  while (left <= right && top <= bottom) {
    for (let col = left; col <= right; col += 1) {
      path.push({ row: top, col });
    }
    top += 1;

    for (let row = top; row <= bottom; row += 1) {
      path.push({ row, col: right });
    }
    right -= 1;

    if (top <= bottom) {
      for (let col = right; col >= left; col -= 1) {
        path.push({ row: bottom, col });
      }
      bottom -= 1;
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row -= 1) {
        path.push({ row, col: left });
      }
      left += 1;
    }
  }

  return path;
}

function resolveEdgeLink(previous: GridCell, next: GridCell) {
  const dx = next.col - previous.col;
  const dy = next.row - previous.row;

  if (dx === 1 && dy === 0) {
    return {
      fromEdge: "right",
      toEdge: "left",
      axis: "y",
    } satisfies {
      fromEdge: PanelEdge;
      toEdge: PanelEdge;
      axis: FoldAxis;
    };
  }

  if (dx === -1 && dy === 0) {
    return {
      fromEdge: "left",
      toEdge: "right",
      axis: "y",
    } satisfies {
      fromEdge: PanelEdge;
      toEdge: PanelEdge;
      axis: FoldAxis;
    };
  }

  if (dx === 0 && dy === 1) {
    return {
      fromEdge: "bottom",
      toEdge: "top",
      axis: "x",
    } satisfies {
      fromEdge: PanelEdge;
      toEdge: PanelEdge;
      axis: FoldAxis;
    };
  }

  if (dx === 0 && dy === -1) {
    return {
      fromEdge: "top",
      toEdge: "bottom",
      axis: "x",
    } satisfies {
      fromEdge: PanelEdge;
      toEdge: PanelEdge;
      axis: FoldAxis;
    };
  }

  throw new Error("Spiral path produced non-adjacent cells.");
}

function resolveFoldAngle(index: number, axis: FoldAxis) {
  const sign = index % 2 === 0 ? 1 : -1;
  const baseAngle = axis === "y" ? 0.24 : 0.18;
  return sign * baseAngle;
}

function createBaseTransform(
  sourceRect: PreviewPanel["sourceRect"],
  pageWidth: number,
  pageHeight: number,
  worldScale: number,
): PreviewTransform {
  const centerX = sourceRect.x + sourceRect.width / 2;
  const centerY = sourceRect.y + sourceRect.height / 2;

  return {
    x: (centerX - pageWidth / 2) * worldScale,
    y: (pageHeight / 2 - centerY) * worldScale,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  };
}

function applyPanelFoldTransform(panel: PreviewPanel, hinge: PreviewHinge | undefined) {
  if (!hinge) {
    panel.transform.rotationX = -0.08;
    panel.transform.rotationY = 0.04;
    panel.transform.z = 0.05;
    return;
  }

  const fold = hinge.angle * 0.72;

  if (hinge.axis === "x") {
    panel.transform.rotationX = fold;
    panel.transform.rotationY = Math.sign(fold) * -0.025;
  } else {
    panel.transform.rotationX = Math.sign(fold) * -0.02;
    panel.transform.rotationY = -fold;
  }

  panel.transform.rotationZ = Math.sign(fold) * 0.015;
  panel.transform.z = 0.04 + Math.abs(fold) * 0.08;
}

function resolveDirectionalLink(fromRegion: ImagePreviewRegion, toRegion: ImagePreviewRegion) {
  const fromCenterX = fromRegion.x + fromRegion.width / 2;
  const fromCenterY = fromRegion.y + fromRegion.height / 2;
  const toCenterX = toRegion.x + toRegion.width / 2;
  const toCenterY = toRegion.y + toRegion.height / 2;
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? ({
          fromEdge: "right",
          toEdge: "left",
          axis: "y",
        } satisfies {
          fromEdge: PanelEdge;
          toEdge: PanelEdge;
          axis: FoldAxis;
        })
      : ({
          fromEdge: "left",
          toEdge: "right",
          axis: "y",
        } satisfies {
          fromEdge: PanelEdge;
          toEdge: PanelEdge;
          axis: FoldAxis;
        });
  }

  return dy >= 0
    ? ({
        fromEdge: "bottom",
        toEdge: "top",
        axis: "x",
      } satisfies {
        fromEdge: PanelEdge;
        toEdge: PanelEdge;
        axis: FoldAxis;
      })
    : ({
        fromEdge: "top",
        toEdge: "bottom",
        axis: "x",
      } satisfies {
        fromEdge: PanelEdge;
        toEdge: PanelEdge;
        axis: FoldAxis;
      });
}

export function buildStripModelFromRegions(
  pageWidth: number,
  pageHeight: number,
  regions: ImagePreviewRegion[],
): PreviewStripModel {
  if (!regions.length) {
    return buildStripModel(pageWidth, pageHeight);
  }

  const worldScale = MAX_WORLD_SIZE / Math.max(pageWidth, pageHeight);
  const panels: PreviewPanel[] = regions.map((region, index) => ({
    id: `panel-${index}`,
    index,
    row: 0,
    col: 0,
    width: region.width * worldScale,
    height: region.height * worldScale,
    sourceRect: {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
    },
    uvRect: {
      u0: region.x / pageWidth,
      v0: 1 - (region.y + region.height) / pageHeight,
      u1: (region.x + region.width) / pageWidth,
      v1: 1 - region.y / pageHeight,
    },
    transform: createBaseTransform(
      {
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
      },
      pageWidth,
      pageHeight,
      worldScale,
    ),
  }));

  const hinges: PreviewHinge[] = panels.slice(1).map((panel, index) => {
    const previous = regions[index];
    const current = regions[index + 1];
    const link = resolveDirectionalLink(previous, current);
    panel.creaseEdge = link.toEdge;

    return {
      id: `hinge-${index}`,
      fromPanelId: panels[index].id,
      toPanelId: panel.id,
      fromIndex: index,
      toIndex: panel.index,
      fromEdge: link.fromEdge,
      toEdge: link.toEdge,
      axis: link.axis,
      angle: resolveFoldAngle(index, link.axis),
    };
  });

  panels.forEach((panel, index) => {
    applyPanelFoldTransform(panel, index === 0 ? undefined : hinges[index - 1]);
  });

  return {
    rows: 1,
    cols: panels.length,
    pageWidth,
    pageHeight,
    panels,
    hinges,
  };
}

export function buildStripModel(pageWidth: number, pageHeight: number): PreviewStripModel {
  const { rows, cols } = resolveGridSize(pageWidth, pageHeight);
  const path = buildSpiralPath(rows, cols);
  const pixelPanelWidth = pageWidth / cols;
  const pixelPanelHeight = pageHeight / rows;
  const worldScale = MAX_WORLD_SIZE / Math.max(pageWidth, pageHeight);
  const worldPanelWidth = pixelPanelWidth * worldScale;
  const worldPanelHeight = pixelPanelHeight * worldScale;

  const panels: PreviewPanel[] = path.map((cell, index) => ({
    id: `panel-${index}`,
    index,
    row: cell.row,
    col: cell.col,
    width: worldPanelWidth,
    height: worldPanelHeight,
    sourceRect: {
      x: cell.col * pixelPanelWidth,
      y: cell.row * pixelPanelHeight,
      width: pixelPanelWidth,
      height: pixelPanelHeight,
    },
    uvRect: {
      u0: cell.col / cols,
      v0: 1 - (cell.row + 1) / rows,
      u1: (cell.col + 1) / cols,
      v1: 1 - cell.row / rows,
    },
    transform: createBaseTransform(
      {
        x: cell.col * pixelPanelWidth,
        y: cell.row * pixelPanelHeight,
        width: pixelPanelWidth,
        height: pixelPanelHeight,
      },
      pageWidth,
      pageHeight,
      worldScale,
    ),
  }));

  const hinges: PreviewHinge[] = path.slice(1).map((cell, index) => {
    const previous = path[index];
    const next = cell;
    const link = resolveEdgeLink(previous, next);
    panels[index + 1].creaseEdge = link.toEdge;

    return {
      id: `hinge-${index}`,
      fromPanelId: panels[index].id,
      toPanelId: panels[index + 1].id,
      fromIndex: index,
      toIndex: index + 1,
      fromEdge: link.fromEdge,
      toEdge: link.toEdge,
      axis: link.axis,
      angle: resolveFoldAngle(index, link.axis),
    };
  });

  panels.forEach((panel, index) => {
    applyPanelFoldTransform(panel, index === 0 ? undefined : hinges[index - 1]);
  });

  return {
    rows,
    cols,
    pageWidth,
    pageHeight,
    panels,
    hinges,
  };
}
