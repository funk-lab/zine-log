import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { FoldedPanel } from "@/features/preview3d/components/folded-panel";
import type {
  PanelEdge,
  PreviewHinge,
  PreviewStripModel,
} from "@/features/preview3d/model/types";

interface FoldedStripProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
}

interface FoldedStripNodeProps {
  model: PreviewStripModel;
  index: number;
  hingesByFromIndex: Map<number, PreviewHinge>;
  texture: THREE.CanvasTexture;
}

function resolveEdgePosition(width: number, height: number, edge: PanelEdge) {
  switch (edge) {
    case "left":
      return [-width / 2, 0, 0] as [number, number, number];
    case "right":
      return [width / 2, 0, 0] as [number, number, number];
    case "top":
      return [0, height / 2, 0] as [number, number, number];
    case "bottom":
      return [0, -height / 2, 0] as [number, number, number];
  }
}

function resolvePanelOffset(width: number, height: number, edge: PanelEdge) {
  switch (edge) {
    case "left":
      return [width / 2, 0, 0] as [number, number, number];
    case "right":
      return [-width / 2, 0, 0] as [number, number, number];
    case "top":
      return [0, -height / 2, 0] as [number, number, number];
    case "bottom":
      return [0, height / 2, 0] as [number, number, number];
  }
}

function FoldedStripNode({
  model,
  index,
  hingesByFromIndex,
  texture,
}: FoldedStripNodeProps) {
  const panel = model.panels[index];
  const hinge = hingesByFromIndex.get(index);
  const hingeRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Group>(null);

  // TODO: 旋转动画
  // useFrame((_, delta) => {
  // if (panelRef.current) {
  //   const targetPanelRotation = index === 0 ? 0.08 : 0;
  //   panelRef.current.rotation.x = THREE.MathUtils.damp(
  //     panelRef.current.rotation.x,
  //     targetPanelRotation * progress.current,
  //     5,
  //     delta,
  //   );
  // }
  // });

  const resolveRotation: [number, number, number] = useMemo(() => {
    if (!hinge) {
      return [0, 0, 0];
    }
    if (hinge.axis === "x") {
      return [hinge.angle, 0, 0];
    } else if (hinge.axis === "y") {
      return [0, hinge.angle, 0];
    }
    return [0, 0, 0];
  }, [hinge]);

  return (
    <group>
      <group ref={panelRef}>
        <FoldedPanel panel={panel} texture={texture} />
      </group>
      {hinge ? (
        <group
          ref={hingeRef}
          position={resolveEdgePosition(
            panel.width,
            panel.height,
            hinge.fromEdge,
          )}
          rotation={resolveRotation}
        >
          <group
            position={resolvePanelOffset(
              model.panels[hinge.toIndex].width,
              model.panels[hinge.toIndex].height,
              hinge.toEdge,
            )}
          >
            <FoldedStripNode
              model={model}
              index={hinge.toIndex}
              hingesByFromIndex={hingesByFromIndex}
              texture={texture}
            />
          </group>
        </group>
      ) : null}
    </group>
  );
}

function FoldedStripComponent({ model, sourceCanvas }: FoldedStripProps) {
  const rootRef = useRef<THREE.Group>(null);
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

  const hingesByFromIndex = useMemo(
    () => new Map(model.hinges.map((hinge) => [hinge.fromIndex, hinge])),
    [model.hinges],
  );

  useFrame((_, delta) => {
    if (!rootRef.current) {
      return;
    }

    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      -Math.PI / 2,
      3.5,
      delta,
    );
    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      0,
      3.5,
      delta,
    );
    rootRef.current.rotation.z = THREE.MathUtils.damp(
      rootRef.current.rotation.z,
      0,
      3.5,
      delta,
    );
  });

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group ref={rootRef} position={[0, 0.2, 0]}>
      <FoldedStripNode
        model={model}
        index={0}
        hingesByFromIndex={hingesByFromIndex}
        texture={texture}
      />
    </group>
  );
}

export const FoldedStrip = memo(FoldedStripComponent);
