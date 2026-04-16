import { Suspense, lazy, memo, useMemo } from "react";

import { extractImagePreviewLayout } from "@/features/preview3d/lib/extract-image-preview-layout";
import { buildStripModelFromRegions } from "@/features/preview3d/model/build-strip-model";
import { buildSpiralModel } from "@/features/preview3d/model/build-spiral-model";

import { usePreviewTextureSource } from "@/features/preview3d/lib/use-preview-texture-source";

const PreviewSceneCanvas = lazy(async () =>
  import("@/features/preview3d/components/preview-scene-canvas").then(
    (module) => ({
      default: module.PreviewSceneCanvas,
    })
  )
);

interface Preview3DProps {
  svgMarkup: string;
  width: number;
  height: number;
  accent: string;
  // 新：统一算法参数
  count?: number;
  gap?: number;
  scale?: number;
}

function Preview3DComponent({
  svgMarkup,
  width,
  height,
  accent,
  count,
  gap,
  scale,
}: Preview3DProps) {
  const previewLayout = useMemo(
    () => extractImagePreviewLayout(svgMarkup),
    [svgMarkup]
  );

  // 当提供 count/gap/scale 时使用新的统一算法
  // TODO: 旋转的顺序有问题，暂时不用
  const useSpiralModel =
    count !== undefined && gap !== undefined && scale !== undefined;

  const model = useMemo(() => {
    // if (useSpiralModel) {
    //   return buildSpiralModel(count, gap, scale, width, height);
    // }
    // 回退：使用旧方法（从 SVG 解析）
    return buildStripModelFromRegions(width, height, previewLayout.regions);
  }, [width, height, previewLayout.regions]);

  const { canvas, isLoading, error } = usePreviewTextureSource(
    previewLayout.svgMarkup,
    width,
    height
  );
  if (previewLayout.regions.length === 0) {
    return (
      <div className="grid h-full place-items-center rounded-[28px] border border-slate-200 bg-white text-sm text-slate-500">
        请选择图片
      </div>
    );
  }
  if (error) {
    return (
      <div className="grid h-full place-items-center rounded-[28px] border border-slate-200 bg-white text-sm text-slate-500">
        3D 预览生成失败，请稍后重试。
      </div>
    );
  }

  if (isLoading || !canvas) {
    return (
      <div className="grid h-full place-items-center rounded-[28px] border border-slate-200 bg-white text-sm text-slate-500">
        正在生成 3D 预览…
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-hidden rounded-[28px]"
      style={{ backgroundColor: accent }}
    >
      <Suspense fallback={<div className="h-full w-full bg-transparent" />}>
        <PreviewSceneCanvas
          model={model}
          sourceCanvas={canvas}
          accent={accent}
        />
      </Suspense>
    </div>
  );
}

export const Preview3D = memo(Preview3DComponent);
