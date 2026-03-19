import { describe, expect, it } from "vitest";

import { buildStripModel, buildStripModelFromRegions } from "@/features/preview3d/model/build-strip-model";

describe("buildStripModel", () => {
  it("builds adjacent spiral-linked panels with UVs", () => {
    const model = buildStripModel(1200, 1600);

    expect(model.panels.length).toBe(12);
    expect(model.hinges.length).toBe(11);
    expect(model.rows).toBe(4);
    expect(model.cols).toBe(3);

    for (const panel of model.panels) {
      expect(panel.uvRect.u0).toBeGreaterThanOrEqual(0);
      expect(panel.uvRect.v0).toBeGreaterThanOrEqual(0);
      expect(panel.uvRect.u1).toBeLessThanOrEqual(1);
      expect(panel.uvRect.v1).toBeLessThanOrEqual(1);
      expect(panel.width).toBeGreaterThan(0);
      expect(panel.height).toBeGreaterThan(0);
    }

    for (const hinge of model.hinges) {
      expect(Math.abs(hinge.toIndex - hinge.fromIndex)).toBe(1);
      expect(["top", "right", "bottom", "left"]).toContain(hinge.fromEdge);
      expect(["top", "right", "bottom", "left"]).toContain(hinge.toEdge);
    }
  });

  it("builds panels from actual image regions", () => {
    const model = buildStripModelFromRegions(1200, 1600, [
      { x: 154, y: 190, width: 500, height: 720 },
      { x: 816, y: 838, width: 220, height: 252 },
    ]);

    expect(model.panels).toHaveLength(2);
    expect(model.hinges).toHaveLength(1);
    expect(model.panels[0].sourceRect.width).toBe(500);
    expect(model.panels[1].sourceRect.height).toBe(252);
    expect(model.panels[0].uvRect.u0).toBeCloseTo(154 / 1200);
    expect(model.panels[1].uvRect.v1).toBeCloseTo(1 - 838 / 1600);
  });
});
