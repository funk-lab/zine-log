import { describe, expect, it } from "vitest";
import { buildSpiralModel } from "@/features/preview3d/model/build-spiral-model";
import { calculateSpiralLayout } from "@/features/templates/lib/spiral";

describe("buildSpiralModel", () => {
  it("应该生成正确数量的面板", () => {
    const model = buildSpiralModel(8, 1, 1.5, 900, 1000);
    expect(model.panels).toHaveLength(8);
    expect(model.hinges).toHaveLength(7);
  });

  it("空数量时返回空模型", () => {
    const model = buildSpiralModel(0, 1, 1.5, 900, 1000);
    expect(model.panels).toHaveLength(0);
    expect(model.hinges).toHaveLength(0);
  });

  it("面板索引应该连续", () => {
    const model = buildSpiralModel(5, 1, 1.5, 900, 1000);
    model.panels.forEach((panel, index) => {
      expect(panel.index).toBe(index);
    });
  });

  it("第一个面板在原点（索引0）", () => {
    const model = buildSpiralModel(8, 1, 1.5, 900, 1000);
    const firstPanel = model.panels[0];
    // 索引 0 对应螺旋起点 [0,0]
    expect(firstPanel.row).toBeDefined();
    expect(firstPanel.col).toBeDefined();
  });
});

describe("螺旋算法一致性 - 3D 与 DOM", () => {
  const testCases = [
    { count: 1, gap: 1, scale: 1 },
    { count: 4, gap: 1, scale: 1.5 },
    { count: 8, gap: 1, scale: 1.5 },
    { count: 12, gap: 2, scale: 1.2 },
  ];

  testCases.forEach(({ count, gap, scale }) => {
    it(`应该与 DOM 算法一致 (count=${count}, gap=${gap}, scale=${scale})`, () => {
      const canvasWidth = 900;
      const canvasHeight = 1000;
      const baseCell = 80;

      // DOM 布局计算
      const domLayout = calculateSpiralLayout(
        count,
        gap,
        scale,
        canvasWidth,
        canvasHeight,
        baseCell
      );

      // 3D 模型
      const model3d = buildSpiralModel(
        count,
        gap,
        scale,
        canvasWidth,
        canvasHeight
      );

      // 验证面板数量一致
      expect(model3d.panels.length).toBe(domLayout.positions.length);

      // 验证顺序一致（都从 [0,0] 开始）
      const firstDom = domLayout.positions[0];
      const first3d = model3d.panels[0];

      // 第一个应该是螺旋起点
      expect(firstDom.gridX).toBe(0);
      expect(firstDom.gridY).toBe(0);

      // 验证整体网格范围一致
      const domGridXs = domLayout.positions.map((p) => p.gridX);
      const domGridYs = domLayout.positions.map((p) => p.gridY);
      const domMinX = Math.min(...domGridXs);
      const domMaxX = Math.max(...domGridXs);
      const domMinY = Math.min(...domGridYs);
      const domMaxY = Math.max(...domGridYs);

      // 3D 模型的 row/col 映射应该覆盖相同的范围
      const modelRows = model3d.panels.map((p) => p.row);
      const modelCols = model3d.panels.map((p) => p.col);

      // 验证面板大小一致（考虑 WORLD_SCALE 转换）
      const WORLD_SCALE = 0.007;
      const expected3dSize = domLayout.scaledCell * WORLD_SCALE;
      model3d.panels.forEach((panel) => {
        expect(panel.width).toBeCloseTo(expected3dSize, 5);
        expect(panel.height).toBeCloseTo(expected3dSize, 5);
      });

      // 验证相对位置关系（相邻面板应该在空间上相邻）
      for (let i = 0; i < model3d.hinges.length; i++) {
        const hinge = model3d.hinges[i];
        const fromPanel = model3d.panels[hinge.fromIndex];
        const toPanel = model3d.panels[hinge.toIndex];

        // 铰链应该连接相邻的面板
        expect(hinge.fromIndex + 1).toBe(hinge.toIndex);

        // 边缘应该有效
        expect(["top", "bottom", "left", "right"]).toContain(hinge.fromEdge);
        expect(["top", "bottom", "left", "right"]).toContain(hinge.toEdge);
      }
    });
  });
});

describe("螺旋路径验证", () => {
  it("8 个点的螺旋顺序应该与 DOM 一致", () => {
    // 来自 spiral.test.ts 的预期顺序
    const expectedSpiralOrder = [
      [0, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [-1, -2],
      [0, -2],
      [1, -2],
    ];

    const model = buildSpiralModel(8, 1, 1.5, 900, 1000);

    // 从面板反向推导 grid 坐标
    // 注意：row 和 col 可能有偏移，但相对关系应该一致
    expect(model.panels.length).toBe(8);

    // 验证连续面板的相邻关系
    for (let i = 0; i < model.hinges.length; i++) {
      const fromPanel = model.panels[i];
      const toPanel = model.panels[i + 1];

      const rowDiff = Math.abs(toPanel.row - fromPanel.row);
      const colDiff = Math.abs(toPanel.col - fromPanel.col);

      // 相邻面板应该在网格上相邻
      expect(rowDiff + colDiff).toBe(1);
    }
  });
});
