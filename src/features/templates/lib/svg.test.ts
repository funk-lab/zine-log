import { describe, expect, it } from "vitest";

import { generateSpiralPositions } from "@/features/templates/lib/svg";

describe("generateSpiralPositions", () => {
  it("follows the photo ring spiral order", () => {
    expect(generateSpiralPositions(8)).toEqual([
      [0, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [-1, -2],
      [0, -2],
      [1, -2],
    ]);
  });
});
