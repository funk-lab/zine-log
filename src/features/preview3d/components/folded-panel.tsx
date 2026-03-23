import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";

import type { PreviewPanel, UvRect } from "@/features/preview3d/model/types";

interface FoldedPanelProps {
  panel: PreviewPanel;
  texture: THREE.Texture;
}

function applyUvRect(geometry: THREE.PlaneGeometry, uvRect: UvRect) {
  const uvAttribute = geometry.getAttribute("uv");
  const uvValues = new Float32Array([
    uvRect.u0, uvRect.v1,
    uvRect.u1, uvRect.v1,
    uvRect.u0, uvRect.v0,
    uvRect.u1, uvRect.v0,
  ]);

  uvAttribute.array.set(uvValues);
  uvAttribute.needsUpdate = true;
}

function resolveCreaseTransform(panel: PreviewPanel) {
  const creaseWidth = Math.min(panel.width, panel.height) * 0.06;

  switch (panel.creaseEdge) {
    case "left":
      return {
        position: [(-panel.width + creaseWidth) / 2, 0] as [number, number],
        size: [creaseWidth, panel.height] as [number, number],
      };
    case "right":
      return {
        position: [(panel.width - creaseWidth) / 2, 0] as [number, number],
        size: [creaseWidth, panel.height] as [number, number],
      };
    case "top":
      return {
        position: [0, (panel.height - creaseWidth) / 2] as [number, number],
        size: [panel.width, creaseWidth] as [number, number],
      };
    case "bottom":
      return {
        position: [0, (-panel.height + creaseWidth) / 2] as [number, number],
        size: [panel.width, creaseWidth] as [number, number],
      };
    default:
      return null;
  }
}

function resolveSurfaceBleed(panel: PreviewPanel) {
  const seamBleed = Math.min(panel.width, panel.height) * 0.045;

  switch (panel.creaseEdge) {
    case "left":
      return {
        width: panel.width + seamBleed,
        height: panel.height,
        offset: [-seamBleed / 2, 0, 0] as [number, number, number],
      };
    case "right":
      return {
        width: panel.width + seamBleed,
        height: panel.height,
        offset: [seamBleed / 2, 0, 0] as [number, number, number],
      };
    case "top":
      return {
        width: panel.width,
        height: panel.height + seamBleed,
        offset: [0, seamBleed / 2, 0] as [number, number, number],
      };
    case "bottom":
      return {
        width: panel.width,
        height: panel.height + seamBleed,
        offset: [0, -seamBleed / 2, 0] as [number, number, number],
      };
    default:
      return {
        width: panel.width,
        height: panel.height,
        offset: [0, 0, 0] as [number, number, number],
      };
  }
}

function FoldedPanelComponent({ panel, texture }: FoldedPanelProps) {
  const paperDepth = Math.min(panel.width, panel.height) * 0.028;
  const surfaceBleed = useMemo(() => resolveSurfaceBleed(panel), [panel]);
  const frontGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(surfaceBleed.width, surfaceBleed.height, 1, 1);
    applyUvRect(geometry, panel.uvRect);
    return geometry;
  }, [panel.uvRect, surfaceBleed.height, surfaceBleed.width]);

  const bodyGeometry = useMemo(
    () => new THREE.BoxGeometry(panel.width, panel.height, paperDepth),
    [panel.height, panel.width, paperDepth],
  );

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        color: "#fffdf8",
        transparent: true,
        alphaTest: 0.02,
        roughness: 0.88,
        metalness: 0.02,
      }),
    [texture],
  );

  const paperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f5eddf",
        roughness: 0.94,
        metalness: 0.01,
      }),
    [],
  );

  const crease = useMemo(() => resolveCreaseTransform(panel), [panel]);

  useEffect(() => {
    return () => {
      frontGeometry.dispose();
      bodyGeometry.dispose();
      frontMaterial.dispose();
      paperMaterial.dispose();
    };
  }, [bodyGeometry, frontGeometry, frontMaterial, paperMaterial]);

  return (
    <group>
      <mesh
        geometry={bodyGeometry}
        material={paperMaterial}
        position={[0, 0, paperDepth / 2]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={frontGeometry}
        material={frontMaterial}
        position={[
          surfaceBleed.offset[0],
          surfaceBleed.offset[1],
          paperDepth + 0.001 + surfaceBleed.offset[2],
        ]}
        castShadow
        receiveShadow
      />
      {crease ? (
        <mesh
          position={[crease.position[0], crease.position[1], paperDepth + 0.002]}
          castShadow={false}
          receiveShadow={false}
        >
          <planeGeometry args={crease.size} />
          <meshBasicMaterial color="#000000" transparent opacity={0.11} />
        </mesh>
      ) : null}
    </group>
  );
}

export const FoldedPanel = memo(FoldedPanelComponent);
