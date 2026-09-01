import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface LegoBlockProps {
  initialPos: [number, number, number];
  driftDir: [number, number, number];
  separation: number;
  color: string;
  glowColor: string;
  size?: [number, number, number];
  rotationSpeed?: number;
}

function ModularLegoBlock({
  initialPos,
  driftDir,
  separation,
  color,
  glowColor,
  size = [1.1, 1.1, 1.1],
  rotationSpeed = 0.5,
}: LegoBlockProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    // Subtle breathing / floating motion
    const floatY = Math.sin(t * rotationSpeed + initialPos[0] * 2) * 0.08;
    const floatRotX = Math.sin(t * 0.4 + initialPos[1]) * 0.04;
    const floatRotY = Math.cos(t * 0.3 + initialPos[2]) * 0.04;

    // Calculate current position based on scroll separation
    meshRef.current.position.x = initialPos[0] + driftDir[0] * separation;
    meshRef.current.position.y = initialPos[1] + driftDir[1] * separation + floatY;
    meshRef.current.position.z = initialPos[2] + driftDir[2] * separation;

    meshRef.current.rotation.x = floatRotX;
    meshRef.current.rotation.y = floatRotY;
  });

  const [w, h, d] = size;

  return (
    <group ref={meshRef} position={initialPos}>
      {/* Outer Obsidian Glass Body */}
      <RoundedBox args={[w, h, d]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.15}
          roughness={0.15}
          transmission={0.88}
          thickness={1.4}
          ior={1.5}
          transparent
          opacity={0.75}
          reflectivity={0.8}
          clearcoat={0.8}
        />
      </RoundedBox>

      {/* Elegant Glowing Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={glowColor} transparent opacity={0.65} />
      </lineSegments>

      {/* Lego Studs on Top Face */}
      {[-w / 4, w / 4].map((sx, i) =>
        [-d / 4, d / 4].map((sz, j) => (
          <mesh key={`${i}-${j}`} position={[sx, h / 2 + 0.06, sz]}>
            <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
            <meshPhysicalMaterial
              color={color}
              metalness={0.2}
              roughness={0.1}
              transmission={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}

      {/* Internal Pulsing Neon AI Core */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w * 0.42, h * 0.42, d * 0.42]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={1.6}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

export interface ExplodedLayersProps {
  separation: number;
}

export function ExplodedLayers({ separation }: ExplodedLayersProps) {
  // Pre-configured block matrix representing Mazaika's modular Lego architecture
  const blocks = useMemo(() => [
    // Central Anchor Blocks (Disperse outwards to left & right on scroll)
    { initialPos: [-0.9, 0.6, 0.3] as [number, number, number], driftDir: [-2.4, 0.8, -0.5] as [number, number, number], color: '#09101d', glowColor: '#00F0FF', size: [1.2, 0.8, 1.2] as [number, number, number], rotationSpeed: 0.6 },
    { initialPos: [0.8, 0.7, -0.2] as [number, number, number], driftDir: [2.5, 0.9, -0.8] as [number, number, number], color: '#130c24', glowColor: '#8B5CF6', size: [1.3, 0.9, 1.3] as [number, number, number], rotationSpeed: 0.5 },
    { initialPos: [-0.7, -0.7, 0.5] as [number, number, number], driftDir: [-2.2, -0.9, 0.4] as [number, number, number], color: '#09101d', glowColor: '#00F0FF', size: [1.1, 1.1, 1.1] as [number, number, number], rotationSpeed: 0.7 },
    { initialPos: [0.9, -0.6, 0.2] as [number, number, number], driftDir: [2.3, -0.8, 0.6] as [number, number, number], color: '#130c24', glowColor: '#8B5CF6', size: [1.2, 0.9, 1.2] as [number, number, number], rotationSpeed: 0.4 },

    // Peripheral Supporting Modules
    { initialPos: [-1.8, -0.1, -0.6] as [number, number, number], driftDir: [-3.2, 0.2, -1.2] as [number, number, number], color: '#08111e', glowColor: '#38BDF8', size: [0.9, 0.9, 0.9] as [number, number, number], rotationSpeed: 0.8 },
    { initialPos: [1.9, 0.2, -0.5] as [number, number, number], driftDir: [3.4, 0.3, -1.0] as [number, number, number], color: '#140c24', glowColor: '#A855F7', size: [1.0, 0.8, 1.0] as [number, number, number], rotationSpeed: 0.55 },
    { initialPos: [0.1, 1.4, -0.4] as [number, number, number], driftDir: [0.2, 2.2, -1.5] as [number, number, number], color: '#09101d', glowColor: '#00F0FF', size: [1.0, 0.7, 1.0] as [number, number, number], rotationSpeed: 0.65 },
    { initialPos: [-0.1, -1.4, -0.3] as [number, number, number], driftDir: [-0.3, -2.4, -1.2] as [number, number, number], color: '#130c24', glowColor: '#8B5CF6', size: [1.1, 0.8, 1.1] as [number, number, number], rotationSpeed: 0.5 },
  ], []);

  return (
    <group position={[0, 0, 0]}>
      {blocks.map((block, idx) => (
        <ModularLegoBlock
          key={idx}
          initialPos={block.initialPos}
          driftDir={block.driftDir}
          separation={separation}
          color={block.color}
          glowColor={block.glowColor}
          size={block.size}
          rotationSpeed={block.rotationSpeed}
        />
      ))}
    </group>
  );
}
