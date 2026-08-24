import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

interface UILayerProps {
  positionY: number;
}

const WIDGET_POSITIONS: [number, number, number][] = [
  [-1.4, 0.4, 0],
  [0, 0.4, 0],
  [1.4, 0.4, 0],
  [-0.7, -0.5, 0.05],
  [0.7, -0.5, 0.05],
];

const WIDGET_COLORS = ['#00f0ff', '#9d00ff', '#00f0ff', '#9d00ff', '#00f0ff'];

function WidgetCard({ position, color, index }: { position: [number, number, number]; color: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8 + index) * 0.04;
    }
  });

  return (
    <group position={position}>
      {/* Card glass bg */}
      <RoundedBox ref={meshRef} args={[0.9, 0.55, 0.02]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0}
          transmission={0.7}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
      {/* Card border glow */}
      <RoundedBox args={[0.92, 0.57, 0.01]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
          wireframe={false}
        />
      </RoundedBox>
      {/* Mini icon pill */}
      <mesh position={[-0.3, 0.12, 0.015]}>
        <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Text lines */}
      <Text
        position={[0.05, 0.08, 0.02]}
        fontSize={0.055}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.7}
        font={undefined}
      >
        {['AI Builder', 'Analytics', 'Telegram Bot', 'Deployments', 'Live Preview'][index]}
      </Text>
      <mesh position={[0, -0.08, 0.015]}>
        <boxGeometry args={[0.6, 0.008, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.1, -0.16, 0.015]}>
        <boxGeometry args={[0.4, 0.008, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function UILayer({ positionY }: UILayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, positionY, 0]}>
      {/* Glass slab base */}
      <mesh>
        <boxGeometry args={[4.2, 1.4, 0.04]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          transparent
          opacity={0.06}
          roughness={0.05}
          metalness={0}
          transmission={0.9}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Slab border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.2, 1.4, 0.04)]} />
        <lineBasicMaterial color="#00f0ff" transparent opacity={0.3} />
      </lineSegments>

      {/* Label */}
      <Text
        position={[-1.7, 0.85, 0.03]}
        fontSize={0.09}
        color="#00f0ff"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        UI LAYER
      </Text>

      {WIDGET_POSITIONS.map((pos, i) => (
        <WidgetCard key={i} position={pos} color={WIDGET_COLORS[i]} index={i} />
      ))}
    </group>
  );
}
