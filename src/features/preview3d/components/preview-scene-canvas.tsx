import { memo, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { ClothBackdrop } from "@/features/preview3d/components/cloth-backdrop";
import { FoldedStrip } from "@/features/preview3d/components/folded-strip";
import { GroundShadow } from "@/features/preview3d/components/ground-shadow";
import {
  PREVIEW_STRIP_POSITION,
  PREVIEW_STRIP_ROTATION,
} from "@/features/preview3d/lib/scene-layout";
import type { PreviewStripModel } from "@/features/preview3d/model/types";

interface PreviewSceneCanvasProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
  accent: string;
}

function resolveWorldBounds(model: PreviewStripModel) {
  const rootRotation = new THREE.Euler(...PREVIEW_STRIP_ROTATION, "XYZ");
  const rootPosition = new THREE.Vector3(...PREVIEW_STRIP_POSITION);
  const bounds = new THREE.Box3();

  model.panels.forEach((panel) => {
    const panelRotation = new THREE.Euler(
      panel.transform.rotationX,
      panel.transform.rotationY,
      panel.transform.rotationZ,
      "XYZ",
    );
    const panelPosition = new THREE.Vector3(
      panel.transform.x,
      panel.transform.y,
      panel.transform.z,
    );

    const corners = [
      new THREE.Vector3(-panel.width / 2, -panel.height / 2, 0),
      new THREE.Vector3(panel.width / 2, -panel.height / 2, 0),
      new THREE.Vector3(-panel.width / 2, panel.height / 2, 0),
      new THREE.Vector3(panel.width / 2, panel.height / 2, 0),
    ];

    corners.forEach((corner) => {
      const worldPoint = corner
        .applyEuler(panelRotation)
        .add(panelPosition)
        .applyEuler(rootRotation)
        .add(rootPosition);
      bounds.expandByPoint(worldPoint);
    });
  });

  return bounds;
}

function resolveFrameState(model: PreviewStripModel) {
  const bounds = resolveWorldBounds(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const focusCenter = center.clone().add(new THREE.Vector3(0, Math.max(size.y, size.z) * 0.12, 0));

  return {
    bounds,
    center,
    focusCenter,
    size,
    corners: [
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z),
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z),
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z),
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z),
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z),
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z),
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
    ],
  };
}

function AutoFrameCamera({
  center,
  corners,
}: {
  center: THREE.Vector3;
  corners: THREE.Vector3[];
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    const direction = new THREE.Vector3(0.4, 4.1, 8.8).normalize();
    const fitsAtDistance = (distance: number) => {
      camera.position.copy(center).addScaledVector(direction, distance);
      camera.lookAt(center);
      camera.updateMatrixWorld(true);
      const margin = 0.8;

      return corners.every((corner) => {
        const projected = corner.clone().project(camera);
        return (
          Number.isFinite(projected.x) &&
          Number.isFinite(projected.y) &&
          Math.abs(projected.x) <= margin &&
          Math.abs(projected.y) <= margin
        );
      });
    };

    let distance = 8.6;
    while (distance < 24 && !fitsAtDistance(distance)) {
      distance += 0.4;
    }

    camera.position.copy(center).addScaledVector(direction, distance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [camera, center, corners, size.height, size.width]);

  return null;
}

function PreviewSceneCanvasComponent({ model, sourceCanvas, accent }: PreviewSceneCanvasProps) {
  const frameState = useMemo(() => resolveFrameState(model), [model]);
  const clothWidth = useMemo(
    () => Math.max(frameState.size.x * 1.42, 11.8),
    [frameState.size.x],
  );
  const clothHeight = useMemo(
    () => Math.max(Math.max(frameState.size.z, frameState.size.y) * 1.7, 9.4),
    [frameState.size.y, frameState.size.z],
  );
  const clothPosition = useMemo<[number, number, number]>(
    () => [
      frameState.center.x,
      frameState.bounds.min.y - 0.42,
      frameState.center.z - 0.18,
    ],
    [frameState.bounds.min.y, frameState.center.x, frameState.center.z],
  );
  const shadowScale = useMemo(
    () => Math.max(frameState.size.x, frameState.size.z) * 1.55,
    [frameState.size.x, frameState.size.z],
  );
  const groundShadowSize = useMemo<[number, number]>(
    () => [
      Math.max(frameState.size.x * 1.08, 3.8),
      Math.max(frameState.size.z * 1.14, 3.4),
    ],
    [frameState.size.x, frameState.size.z],
  );
  const shadowPosition = useMemo<[number, number, number]>(
    () => [frameState.center.x, frameState.bounds.min.y - 0.03, frameState.center.z],
    [frameState.bounds.min.y, frameState.center.x, frameState.center.z],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.4, 4.1, 8.8], fov: 24 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#efe7db"]} />
      <ambientLight intensity={0.72} color="#fffaf3" />
      <directionalLight
        castShadow
        intensity={1.36}
        color="#fffdf9"
        position={[3.8, 6.8, 5.4]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.28} color="#e5d4bd" position={[-3.6, 3.8, 2.4]} />
      <spotLight
        castShadow
        intensity={0.42}
        color="#fff2dd"
        angle={0.5}
        penumbra={0.8}
        position={[-1.2, 6.2, 6.4]}
      />

      <AutoFrameCamera center={frameState.focusCenter} corners={frameState.corners} />
      <ClothBackdrop
        position={clothPosition}
        accent={accent}
        width={clothWidth}
        height={clothHeight}
      />
      <GroundShadow
        position={[frameState.center.x, frameState.bounds.min.y - 0.015, frameState.center.z]}
        width={groundShadowSize[0]}
        height={groundShadowSize[1]}
      />
      <FoldedStrip model={model} sourceCanvas={sourceCanvas} />

      <ContactShadows
        position={shadowPosition}
        opacity={0.28}
        scale={shadowScale}
        blur={2.8}
        far={6}
        resolution={1024}
        color="#9f8f7a"
      />

      <OrbitControls
        enablePan={false}
        target={[frameState.focusCenter.x, frameState.focusCenter.y, frameState.focusCenter.z]}
        minDistance={6.8}
        maxDistance={18}
        minPolarAngle={0.78}
        maxPolarAngle={1.08}
        minAzimuthAngle={-0.36}
        maxAzimuthAngle={0.2}
      />
    </Canvas>
  );
}

export const PreviewSceneCanvas = memo(PreviewSceneCanvasComponent);
