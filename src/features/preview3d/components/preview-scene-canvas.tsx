import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

import { FoldedStrip } from "@/features/preview3d/components/folded-strip";
import type { PreviewStripModel } from "@/features/preview3d/model/types";

interface PreviewSceneCanvasProps {
  model: PreviewStripModel;
  sourceCanvas: HTMLCanvasElement;
}

function PreviewSceneCanvasComponent({ model, sourceCanvas }: PreviewSceneCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 12.4, 0.22], fov: 15 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#f4efe7"]} />
      <ambientLight intensity={1.25} color="#fffaf4" />
      <directionalLight
        castShadow
        intensity={1.25}
        color="#fffdf9"
        position={[2.2, 8.6, 2.2]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.24} color="#f1dcc0" position={[-2.2, 4.5, 1.8]} />

      <FoldedStrip model={model} sourceCanvas={sourceCanvas} />

      <ContactShadows
        position={[0, -0.08, 0]}
        opacity={0.22}
        scale={18}
        blur={2.2}
        far={6}
        resolution={1024}
        color="#9d907d"
      />

      <OrbitControls
        enablePan={false}
        target={[0, 0.02, 0]}
        minDistance={5}
        maxDistance={13}
        minPolarAngle={0.02}
        maxPolarAngle={0.24}
      />
    </Canvas>
  );
}

export const PreviewSceneCanvas = memo(PreviewSceneCanvasComponent);
