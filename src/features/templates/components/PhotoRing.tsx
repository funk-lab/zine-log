import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  type SpiralPosition,
  calculateSpiralLayout,
} from "@/features/templates/lib/spiral";
import type { GalleryImage } from "@/features/editor/types";
import { getImageEditStyles } from "@/features/editor/lib/image-styles";

// ==================== 类型定义 ====================

export interface PhotoRingProps {
  /** 图片数量 */
  count: number;
  /** 间隙系数，控制螺旋紧密程度，默认为 1 */
  gap?: number;
  /** 缩放系数，默认为 1 */
  scale?: number;
  /** 显示缩放（由 CanvasPanel 控制），默认为 1 */
  displayZoom?: number;
  /** 画板宽度 */
  width: number;
  /** 画板高度 */
  height: number;
  /** 基础单元格大小，默认为 80 */
  baseCell?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 图片数据源 - 使用统一的 GalleryImage 类型 */
  images?: GalleryImage[];
  /** 槽位内边距，默认为 2 */
  padding?: number;
  /** 自定义类名 */
  className?: string;
  /** 槽位点击回调 */
  onSlotClick?: (index: number) => void;
  /** 槽位双击回调 - 用于打开编辑侧边栏 */
  onSlotDoubleClick?: (index: number) => void;
}

// ==================== 组件 ====================

/**
 * PhotoRing 组件 - 方形螺旋图片布局
 *
 * 核心特性：
 * - 逆时针方形螺旋布局算法
 * - 自适应缩放，自动居中
 * - 支持图片或占位符显示
 * - 完全使用 Tailwind CSS 样式
 *
 * @example
 * ```tsx
 * <PhotoRing count={12} gap={1} scale={1.2} />
 * <PhotoRing
 *   count={8}
 *   images={[{ src: "/img1.jpg" }, { src: "/img2.jpg" }]}
 *   onSlotClick={(i) => console.log("点击了", i)}
 * />
 * ```
 */
export const PhotoRing: React.FC<PhotoRingProps> = ({
  count,
  gap = 1,
  scale = 1,
  displayZoom = 1,
  width,
  height,
  baseCell = 80,
  backgroundColor = "#16213e",
  images = [],
  padding = 2,
  className,
  onSlotClick,
  onSlotDoubleClick,
}) => {
  // effectiveScale 控制槽位大小 = baseCell * scale * zoom
  const effectiveScale = scale * displayZoom;

  const { positions, scaledCell } = useMemo(
    () => calculateSpiralLayout(count, gap, effectiveScale, width, height, baseCell),
    [count, gap, effectiveScale, width, height, baseCell]
  );

  // 图片内边距像素值
  const paddingPx = Math.max(0, Math.min(padding, scaledCell / 4));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] shadow-canvas",
        className
      )}
      style={{
        width,
        height,
        backgroundColor,
      }}
    >
      {positions.map(({ x, y, size, index }: SpiralPosition) => {
        const image = images[index];
        // 优先使用 blobUrl，兼容旧数据使用 src
        const imageUrl = image?.blobUrl || image?.src;
        const hasImage = !!imageUrl;

        return (
          <div
            key={`photo-ring-slot-${index}`}
            className={cn(
              "absolute overflow-hidden transition-all duration-200",
              "hover:z-10",
              hasImage
                ? "hover:scale-105 hover:shadow-lg bg-white cursor-pointer"
                : ""
            )}
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              padding: paddingPx,
            }}
            onClick={() => hasImage && onSlotClick?.(index)}
            onDoubleClick={() => hasImage && onSlotDoubleClick?.(index)}
            role={hasImage ? "button" : undefined}
            tabIndex={hasImage && (onSlotClick || onSlotDoubleClick) ? 0 : -1}
            onKeyDown={(e) => {
              if (
                hasImage &&
                onSlotClick &&
                (e.key === "Enter" || e.key === " ")
              ) {
                onSlotClick(index);
              }
            }}
            aria-label={hasImage ? `图片 ${index + 1}` : `空槽位 ${index + 1}`}
          >
            {/* 序号标记-测试用 */}
            {/* <span className="pointer-events-none absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {index + 1}
            </span> */}

            {/* 内容区域 */}
            <div className={cn("relative h-full w-full overflow-hidden")}>
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={image.alt || `图片 ${index + 1}`}
                  className="h-full w-full"
                  loading="lazy"
                  style={getImageEditStyles(image)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-slate-500">请选择图片</span>
                </div>
              )}
            </div>

            {/* 坐标标记-测试用 */}
            {/* <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/50 px-1 py-0.5 text-[9px] font-mono text-slate-400">
              {gridX},{gridY}
            </span> */}
          </div>
        );
      })}
    </div>
  );
};

export default PhotoRing;
