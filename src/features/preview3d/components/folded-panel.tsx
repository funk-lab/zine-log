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
    uvRect.u0,
    uvRect.v1,
    uvRect.u1,
    uvRect.v1,
    uvRect.u0,
    uvRect.v0,
    uvRect.u1,
    uvRect.v0,
  ]);

  uvAttribute.array.set(uvValues);
  uvAttribute.needsUpdate = true;
}

function FoldedPanelComponent({ panel, texture }: FoldedPanelProps) {
  const paperDepth = 0.01;
  const frontGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(panel.width, panel.height, 1, 1);
    applyUvRect(geometry, panel.uvRect);
    return geometry;
  }, [panel]);

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
        roughness: 0.5,
      }),
    [texture],
  );

  const paperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f5eddf",
        roughness: 0.7,
      }),
    [],
  );

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
        castShadow
        receiveShadow
      />
      <mesh
        geometry={frontGeometry}
        material={frontMaterial}
        position={[0, 0, paperDepth / 2 + 0.001]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

export const FoldedPanel = memo(FoldedPanelComponent);
