import { memo, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { FoldedPanel } from "@/features/preview3d/components/folded-panel";
import type { PanelEdge, PreviewHinge, PreviewStripModel } from "@/features/preview3d/model/types";

interface FoldedStripProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
}

interface FoldedStripNodeProps {
  model: PreviewStripModel;
  index: number;
  hingesByFromIndex: Map<number, PreviewHinge>;
  progress: MutableRefObject<number>;
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
  progress,
  texture,
}: FoldedStripNodeProps) {
  const panel = model.panels[index];
  const hinge = hingesByFromIndex.get(index);
  const hingeRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (panelRef.current) {
      const targetPanelRotation = index === 0 ? 0.08 : 0;
      panelRef.current.rotation.x = THREE.MathUtils.damp(
        panelRef.current.rotation.x,
        targetPanelRotation * progress.current,
        5,
        delta,
      );
    }

    if (!hingeRef.current || !hinge) {
      return;
    }

    const currentValue = hinge.axis === "x"
      ? hingeRef.current.rotation.x
      : hingeRef.current.rotation.y;
    const nextValue = THREE.MathUtils.damp(currentValue, hinge.angle * progress.current, 5, delta);

    if (hinge.axis === "x") {
      hingeRef.current.rotation.x = nextValue;
    } else {
      hingeRef.current.rotation.y = nextValue;
    }
  });

  return (
    <group>
      <group ref={panelRef}>
        <FoldedPanel panel={panel} texture={texture} />
      </group>
      {hinge ? (
        <group ref={hingeRef} position={resolveEdgePosition(panel.width, panel.height, hinge.fromEdge)}>
          <group position={resolvePanelOffset(model.panels[hinge.toIndex].width, model.panels[hinge.toIndex].height, hinge.toEdge)}>
            <FoldedStripNode
              model={model}
              index={hinge.toIndex}
              hingesByFromIndex={hingesByFromIndex}
              progress={progress}
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
  const progressRef = useRef(0);
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
    progressRef.current = THREE.MathUtils.damp(progressRef.current, 1, 3.5, delta);

    if (!rootRef.current) {
      return;
    }

    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, -1.5, 3.5, delta);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, 0, 3.5, delta);
    rootRef.current.rotation.z = THREE.MathUtils.damp(rootRef.current.rotation.z, 0, 3.5, delta);
  });

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group ref={rootRef} position={[0, 0.08, 0]}>
      <FoldedStripNode
        model={model}
        index={0}
        hingesByFromIndex={hingesByFromIndex}
        progress={progressRef}
        texture={texture}
      />
    </group>
  );
}

export const FoldedStrip = memo(FoldedStripComponent);
