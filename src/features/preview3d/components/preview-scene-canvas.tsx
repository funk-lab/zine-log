import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { FoldedStrip } from "@/features/preview3d/components/folded-strip";
import type { PreviewStripModel } from "@/features/preview3d/model/types";

interface PreviewSceneCanvasProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
  accent: string;
}

function PreviewSceneCanvasComponent({
  model,
  sourceCanvas,
  accent,
}: PreviewSceneCanvasProps) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0.4, 4.1, 8.8], fov: 24 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={[accent]} />
      <ambientLight intensity={0.8} color="#fffaf4" />
      <directionalLight
        castShadow
        intensity={1.5}
        color="#fffdf9"
        position={[5, 10, -5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={0.5}
      />
      <directionalLight
        intensity={0.24}
        color="#f1dcc0"
        position={[-5, 5, -5]}
      />
      <FoldedStrip model={model} sourceCanvas={sourceCanvas} />
      <ContactShadows
        position={[0, -0.08, 0]}
        opacity={0.5}
        scale={18}
        blur={1}
        far={6}
        resolution={1024}
        color="#4e473d"
      />

      <OrbitControls
        enablePan={false} // 启用平移
        target={[0, 0.02, 0]} // 视角中心点
        minDistance={5} // 最小距离
        maxDistance={15} // 略微增加最大距离
        minPolarAngle={0} // 允许向上看
        maxPolarAngle={Math.PI / 2.2} // 允许向下看接近水平，解除方向锁
      />
    </Canvas>
  );
}

export const PreviewSceneCanvas = memo(PreviewSceneCanvasComponent);
