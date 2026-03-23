import { memo, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { FoldedPanel } from "@/features/preview3d/components/folded-panel";
import {
  PREVIEW_STRIP_POSITION,
  PREVIEW_STRIP_ROTATION,
} from "@/features/preview3d/lib/scene-layout";
import type { PreviewStripModel } from "@/features/preview3d/model/types";

interface FoldedStripProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
}

function FoldedStripComponent({ model, sourceCanvas }: FoldedStripProps) {
  const { gl } = useThree();

  const texture = useMemo(() => {
    const nextTexture = new THREE.CanvasTexture(sourceCanvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.generateMipmaps = true;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [gl, sourceCanvas]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group rotation={PREVIEW_STRIP_ROTATION} position={PREVIEW_STRIP_POSITION}>
      {model.panels.map((panel) => (
        <group
          key={panel.id}
          position={[panel.transform.x, panel.transform.y, panel.transform.z]}
          rotation={[
            panel.transform.rotationX,
            panel.transform.rotationY,
            panel.transform.rotationZ,
          ]}
        >
          <FoldedPanel panel={panel} texture={texture} />
        </group>
      ))}
    </group>
  );
}

export const FoldedStrip = memo(FoldedStripComponent);
