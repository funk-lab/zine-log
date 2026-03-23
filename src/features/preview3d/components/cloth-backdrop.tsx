import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";

function createClothTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.fillStyle = "#efe5d7";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 6) {
    const alpha = 0.018 + (y % 18 === 0 ? 0.015 : 0);
    context.fillStyle = `rgba(118, 101, 82, ${alpha})`;
    context.fillRect(0, y, canvas.width, 2);
  }

  for (let x = 0; x < canvas.width; x += 8) {
    const alpha = 0.012 + (x % 24 === 0 ? 0.01 : 0);
    context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    context.fillRect(x, 0, 1, canvas.height);
  }

  const gradient = context.createRadialGradient(360, 260, 120, 420, 320, 620);
  gradient.addColorStop(0, "rgba(255,255,255,0.22)");
  gradient.addColorStop(0.52, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.08)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1.6);
  texture.needsUpdate = true;
  return texture;
}

interface ClothBackdropProps {
  position: [number, number, number];
  accent: string;
  width: number;
  height: number;
}

function resolveBackdropColor(accent: string) {
  const accentColor = new THREE.Color(accent);
  const clothBase = new THREE.Color("#efe5d7");
  return clothBase.lerp(accentColor, 0.78);
}

function ClothBackdropComponent({ position, accent, width, height }: ClothBackdropProps) {
  const geometry = useMemo(() => {
    const nextGeometry = new THREE.PlaneGeometry(width, height, 44, 36);
    const position = nextGeometry.getAttribute("position");

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const z =
        Math.sin(x * 0.58 + y * 0.18) * 0.05 +
        Math.cos(y * 0.66 - x * 0.14) * 0.035 +
        Math.sin((x + y) * 0.82) * 0.018;
      position.setZ(index, z);
    }

    position.needsUpdate = true;
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, [height, width]);
  const texture = useMemo(() => {
    const nextTexture = createClothTexture();
    if (nextTexture) {
      nextTexture.repeat.set(Math.max(width / 5.4, 1.4), Math.max(height / 5.8, 1.2));
      nextTexture.needsUpdate = true;
    }
    return nextTexture;
  }, [height, width]);

  const material = useMemo(
    () => {
      const clothColor = resolveBackdropColor(accent);

      return new THREE.MeshStandardMaterial({
        color: clothColor,
        map: texture ?? undefined,
        roughness: 1,
        metalness: 0,
      });
    },
    [accent, texture],
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
      rotation={[-Math.PI / 2, 0, 0.03]}
      renderOrder={-1}
      receiveShadow
    />
  );
}

export const ClothBackdrop = memo(ClothBackdropComponent);
