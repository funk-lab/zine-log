import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";

interface GroundShadowProps {
  position: [number, number, number];
  width: number;
  height: number;
}

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = context.createRadialGradient(256, 256, 48, 256, 256, 232);
  gradient.addColorStop(0, "rgba(34, 24, 14, 0.38)");
  gradient.addColorStop(0.38, "rgba(34, 24, 14, 0.2)");
  gradient.addColorStop(0.76, "rgba(34, 24, 14, 0.06)");
  gradient.addColorStop(1, "rgba(34, 24, 14, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function GroundShadowComponent({ position, width, height }: GroundShadowProps) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height, 1, 1), [height, width]);
  const texture = useMemo(() => createShadowTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture ?? undefined,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    [texture],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture?.dispose();
    };
  }, [geometry, material, texture]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={0}
    />
  );
}

export const GroundShadow = memo(GroundShadowComponent);
