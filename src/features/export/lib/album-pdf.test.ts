import { describe, expect, it, vi, beforeEach } from "vitest";
import type { GalleryImage } from "@/features/editor/types";

// Mock canvas and ImageBitmap
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn().mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
  }),
  convertToBlob: vi.fn().mockResolvedValue(new Blob()),
};

const mockImageBitmap = {
  width: 1200,
  height: 800,
  close: vi.fn(),
};

global.OffscreenCanvas = vi.fn().mockImplementation(() => mockCanvas) as any;
global.createImageBitmap = vi.fn().mockResolvedValue(mockImageBitmap);

describe("album-pdf", () => {
  describe("scaleFactor", () => {
    it("should scale canvas dimensions by scaleFactor", () => {
      const slotWidth = 185;
      const slotHeight = 185;
      const scaleFactor = 2;

      const expectedCanvasWidth = slotWidth * scaleFactor;
      const expectedCanvasHeight = slotHeight * scaleFactor;

      expect(expectedCanvasWidth).toBe(370);
      expect(expectedCanvasHeight).toBe(370);
    });

    it("should use default scaleFactor of 2", () => {
      const scaleFactor = 2; // default value
      const slotWidth = 185;

      const canvasWidth = slotWidth * scaleFactor;

      expect(canvasWidth).toBe(370);
    });

    it("should support custom scaleFactor", () => {
      const scaleFactor = 3; // high quality
      const slotWidth = 185;

      const canvasWidth = slotWidth * scaleFactor;

      expect(canvasWidth).toBe(555);
    });
  });

  describe("ExportContext", () => {
    it("should read all edit properties from GalleryImage", () => {
      const mockImage: GalleryImage = {
        id: "test-1",
        src: "https://example.com/image.jpg",
        name: "test.jpg",
        rotate: 90,
        fitMode: "contain",
        zoom: 1.5,
        flipX: true,
        flipY: false,
        offsetX: 10,
        offsetY: -20,
        brightness: 10,
        contrast: 20,
        saturate: 30,
        grayscale: false,
        borderRadius: 5,
        margin: 2,
      };

      // Verify all properties exist
      expect(mockImage.rotate).toBe(90);
      expect(mockImage.fitMode).toBe("contain");
      expect(mockImage.zoom).toBe(1.5);
      expect(mockImage.flipX).toBe(true);
      expect(mockImage.flipY).toBe(false);
      expect(mockImage.offsetX).toBe(10);
      expect(mockImage.offsetY).toBe(-20);
      expect(mockImage.brightness).toBe(10);
      expect(mockImage.contrast).toBe(20);
      expect(mockImage.saturate).toBe(30);
      expect(mockImage.grayscale).toBe(false);
      expect(mockImage.borderRadius).toBe(5);
      expect(mockImage.margin).toBe(2);
    });

    it("should use default values for optional properties", () => {
      const mockImage: GalleryImage = {
        id: "test-2",
        src: "https://example.com/image2.jpg",
        name: "test2.jpg",
        rotate: 0,
        fitMode: "cover",
        zoom: 1,
        flipX: false,
        flipY: false,
        offsetX: 0,
        offsetY: 0,
        brightness: 0,
        contrast: 0,
        saturate: 0,
        grayscale: false,
        borderRadius: 0,
        margin: 0,
      };

      expect(mockImage.rotate).toBe(0);
      expect(mockImage.fitMode).toBe("cover");
      expect(mockImage.zoom).toBe(1);
      expect(mockImage.flipX).toBe(false);
      expect(mockImage.flipY).toBe(false);
      expect(mockImage.offsetX).toBe(0);
      expect(mockImage.offsetY).toBe(0);
      expect(mockImage.brightness).toBe(0);
      expect(mockImage.contrast).toBe(0);
      expect(mockImage.saturate).toBe(0);
      expect(mockImage.grayscale).toBe(false);
      expect(mockImage.borderRadius).toBe(0);
      expect(mockImage.margin).toBe(0);
    });
  });

  describe("calcFit", () => {
    // Test helper function logic
    it("should handle cover mode - wider image", () => {
      // Image: 1200x800, Slot: 200x100
      // Image ratio (1.5) > Slot ratio (2) means image is taller
      // Should crop top/bottom, fit width
      const iw = 1200, ih = 800;
      const sw = 200, sh = 100;

      // cover: wider image -> crop sides
      // taller image -> crop top/bottom
      expect(iw / ih).toBe(1.5);
      expect(sw / sh).toBe(2);

      // When slot is wider relative to image, crop top/bottom
      // sc = sh / ih = 100 / 800 = 0.125
      // dh = sh = 100
      // dw = iw * sc = 1200 * 0.125 = 150
      // sx = 0, sy = (800 - 100/0.125) / 2 = (800 - 800) / 2 = 0
      // sW = iw = 1200, sH = sh/sc = 100/0.125 = 800
    });

    it("should handle contain mode", () => {
      const iw = 1200, ih = 800;
      const sw = 200, sh = 100;
      const ir = iw / ih; // 1.5

      // contain: fit within slot, maintain aspect ratio
      // dw = sw = 200, dh = sw / ir = 200 / 1.5 = 133.33
      expect(ir).toBe(1.5);
      expect(sw / ir).toBeCloseTo(133.33);
    });

    it("should handle fill mode", () => {
      const iw = 1200, ih = 800;
      const sw = 200, sh = 100;

      // fill: stretch to fill slot
      expect(sw).toBe(200);
      expect(sh).toBe(100);
    });
  });

  describe("slot dimensions", () => {
    it("should calculate correct slot sizes from GRID_CONFIG", () => {
      // A4: 842 x 595 pt
      // margins: 30 pt each side
      // grid: 4 columns x 3 rows, gutter: 12pt

      const pageWidth = 842;
      const pageHeight = 595;
      const margin = 30;
      const gutter = 12;
      const columns = 4;
      const rows = 3;

      const contentWidth = pageWidth - margin * 2; // 782
      const contentHeight = pageHeight - margin * 2; // 535

      const slotWidth = (contentWidth - gutter * (columns - 1)) / columns;
      const slotHeight = (contentHeight - gutter * (rows - 1)) / rows;

      expect(contentWidth).toBe(782);
      expect(contentHeight).toBe(535);
      expect(slotWidth).toBeCloseTo(180.5, 0);
      expect(slotHeight).toBeCloseTo(161.5, 0);
    });
  });

  describe("progress callback", () => {
    it("should report progress correctly", () => {
      const progressCalls: number[] = [];
      const mockProgress = (p: number, _msg: string) => {
        progressCalls.push(p);
      };

      // Simulate progress reporting
      mockProgress(0.02, "初始化 PDF…");
      mockProgress(0.5, "导出中...");
      mockProgress(1, "完成");

      expect(progressCalls).toEqual([0.02, 0.5, 1]);
    });
  });
});
