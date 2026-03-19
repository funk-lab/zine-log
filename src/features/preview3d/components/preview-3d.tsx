import { Suspense, lazy, memo, useMemo } from "react";

import { extractImagePreviewLayout } from "@/features/preview3d/lib/extract-image-preview-layout";
import { buildStripModelFromRegions } from "@/features/preview3d/model/build-strip-model";
import { usePreviewTextureSource } from "@/features/preview3d/lib/use-preview-texture-source";

const PreviewSceneCanvas = lazy(async () =>
  import("@/features/preview3d/components/preview-scene-canvas").then((module) => ({
    default: module.PreviewSceneCanvas,
  })),
);

interface Preview3DProps {
  svgMarkup: string;
  width: number;
  height: number;
}

function Preview3DComponent({ svgMarkup, width, height }: Preview3DProps) {
  const previewLayout = useMemo(() => extractImagePreviewLayout(svgMarkup), [svgMarkup]);
  const model = useMemo(
    () => buildStripModelFromRegions(width, height, previewLayout.regions),
    [height, previewLayout.regions, width],
  );
  const { canvas, isLoading, error } = usePreviewTextureSource(previewLayout.svgMarkup, width, height);

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
    <div className="h-full overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff,_#f2eee7_58%,_#e7e0d5)]">
      <Suspense fallback={<div className="h-full w-full bg-transparent" />}>
        <PreviewSceneCanvas model={model} sourceCanvas={canvas} />
      </Suspense>
    </div>
  );
}

export const Preview3D = memo(Preview3DComponent);
