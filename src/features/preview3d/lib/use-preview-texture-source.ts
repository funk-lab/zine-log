import { useEffect, useState } from "react";

import { rasterizeSvgToCanvas } from "@/features/rendering/lib/rasterize-svg";

const PREVIEW_TEXTURE_SCALE = 3;
const PREVIEW_MAX_PIXELS = 24000000;

interface PreviewTextureState {
  canvas: HTMLCanvasElement | null;
  error: Error | null;
}

export function usePreviewTextureSource(previewSvgMarkup: string, width: number, height: number) {
  const [state, setState] = useState<PreviewTextureState>({
    canvas: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    void rasterizeSvgToCanvas(previewSvgMarkup, width, height, {
      scale: PREVIEW_TEXTURE_SCALE,
      maxPixels: PREVIEW_MAX_PIXELS,
    })
      .then((canvas) => {
        if (cancelled) {
          return;
        }

        setState({
          canvas,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState({
          canvas: null,
          error: error instanceof Error ? error : new Error("Preview texture generation failed."),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [height, previewSvgMarkup, width]);

  return {
    ...state,
    isLoading: state.canvas === null && state.error === null,
  };
}
