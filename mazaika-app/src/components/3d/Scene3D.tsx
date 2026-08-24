import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, AdaptiveDpr, AdaptiveEvents, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { UILayer } from './Layers/UILayer';
import { CodeLayer } from './Layers/CodeLayer';
import { AILayer } from './Layers/AILayer';

export interface Scene3DHandle {
  layersGroup: THREE.Group | null;
}

interface LayersProps {
  separation: number;
}

function AmbientLights() {
  return (
    <>
      <ambientLight intensity={0.05} color="#0a0a1a" />
      {/* Cyan key light (top-left) */}
      <pointLight position={[-4, 3, 3]} intensity={30} color="#00f0ff" distance={12} decay={2} />
      {/* Purple fill light (bottom-right) */}
      <pointLight position={[4, -3, 2]} intensity={25} color="#9d00ff" distance={10} decay={2} />
      {/* Rim light (back) */}
      <pointLight position={[0, 0, -4]} intensity={15} color="#ffffff" distance={8} decay={2} />
      {/* Spot for top layer */}
      <spotLight
        position={[0, 5, 3]}
        angle={0.4}
        penumbra={0.8}
        intensity={20}
        color="#00f0ff"
        target-position={[0, 0.8, 0]}
      />
      {/* Spot for bottom layer */}
      <spotLight
        position={[0, -5, 3]}
        angle={0.4}
        penumbra={0.8}
        intensity={20}
        color="#9d00ff"
        target-position={[0, -0.8, 0]}
      />
    </>
  );
}

const LayersGroup = forwardRef<THREE.Group, LayersProps>(({ separation }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => groupRef.current as THREE.Group);

  return (
    <group ref={groupRef} rotation={[0.12, 0.3, 0]}>
      <UILayer positionY={separation} />
      <CodeLayer positionY={0} />
      <AILayer positionY={-separation} />
    </group>
  );
});
LayersGroup.displayName = 'LayersGroup';

function CameraRig({ fovTarget }: { fovTarget: number }) {
  const { camera } = useThree();
  useImperativeHandle({ current: camera }, () => camera);

  // Responsive FOV via useThree viewport is handled by the Canvas camera prop
  void fovTarget;
  return null;
}

interface Scene3DProps {
  separation?: number;
  enableControls?: boolean;
}

export function Scene3D({ separation = 0, enableControls = false }: Scene3DProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.5], fov: 52, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <CameraRig fovTarget={52} />
      <AmbientLights />
      <Environment preset="night" />
      <LayersGroup separation={separation} />
      {enableControls && (
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          dampingFactor={0.08}
          enableDamping
        />
      )}
    </Canvas>
  );
}
