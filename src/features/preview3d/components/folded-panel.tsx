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
  const creaseDepth = 0.016;
  const creaseWidth = Math.min(panel.width, panel.height) * 0.06;

  switch (panel.creaseEdge) {
    case "left":
      return {
        position: [(-panel.width + creaseWidth) / 2, 0, creaseDepth] as [number, number, number],
        size: [creaseWidth, panel.height] as [number, number],
      };
    case "right":
      return {
        position: [(panel.width - creaseWidth) / 2, 0, creaseDepth] as [number, number, number],
        size: [creaseWidth, panel.height] as [number, number],
      };
    case "top":
      return {
        position: [0, (panel.height - creaseWidth) / 2, creaseDepth] as [number, number, number],
        size: [panel.width, creaseWidth] as [number, number],
      };
    case "bottom":
      return {
        position: [0, (-panel.height + creaseWidth) / 2, creaseDepth] as [number, number, number],
        size: [panel.width, creaseWidth] as [number, number],
      };
    default:
      return null;
  }
}

function FoldedPanelComponent({ panel, texture }: FoldedPanelProps) {
  const paperDepth = Math.min(panel.width, panel.height) * 0.028;
  const frontGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(panel.width, panel.height, 1, 1);
    applyUvRect(geometry, panel.uvRect);
    return geometry;
  }, [panel.height, panel.uvRect, panel.width]);

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
        roughness: 0.95,
        metalness: 0.02,
      }),
    [texture],
  );

  const paperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f4ecde",
        roughness: 0.98,
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
      <mesh geometry={bodyGeometry} material={paperMaterial} castShadow receiveShadow />
      <mesh
        geometry={frontGeometry}
        material={frontMaterial}
        position={[0, 0, paperDepth / 2 + 0.001]}
        castShadow
        receiveShadow
      />
      {crease ? (
        <mesh position={crease.position} castShadow={false} receiveShadow={false}>
          <planeGeometry args={crease.size} />
          <meshBasicMaterial color="#000000" transparent opacity={0.08} />
        </mesh>
      ) : null}
    </group>
  );
}

export const FoldedPanel = memo(FoldedPanelComponent);
