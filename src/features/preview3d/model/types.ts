export type PanelEdge = "top" | "right" | "bottom" | "left";
export type FoldAxis = "x" | "y";

export interface UvRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface PreviewTransform {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

export interface PreviewPanel {
  id: string;
  index: number;
  row: number;
  col: number;
  width: number;
  height: number;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  uvRect: UvRect;
  creaseEdge?: PanelEdge;
  transform: PreviewTransform;
}

export interface PreviewHinge {
  id: string;
  fromPanelId: string;
  toPanelId: string;
  fromIndex: number;
  toIndex: number;
  fromEdge: PanelEdge;
  toEdge: PanelEdge;
  axis: FoldAxis;
  angle: number;
}

export interface PreviewStripModel {
  rows: number;
  cols: number;
  pageWidth: number;
  pageHeight: number;
  panels: PreviewPanel[];
  hinges: PreviewHinge[];
}
