import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface CodeLayerProps {
  positionY: number;
}

const CODE_LINES = [
  'const ai = new MazaikaEngine({',
  '  model: "gemini-1.5-flash",',
  '  context: projectState,',
  '  mode: "patch",',
  '});',
  '',
  'POST /api/ai/generate',
  '{ "intent": "support_query",',
  '  "confidence": 0.97 }',
  '',
  'type BotNode = {',
  '  id: string;',
  '  type: NodeType;',
  '  data: NodeData;',
  '}',
];

const COLORS = ['#00f0ff', '#9d00ff', '#ffffff', '#00f0ff', '#9d00ff'];

function CodeLine({ text, position, colorIndex }: { text: string; position: [number, number, number]; colorIndex: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.55 + Math.sin(clock.elapsedTime * 1.2 + colorIndex) * 0.25;
    }
  });

  if (!text) return null;

  return (
    <group position={position}>
      {/* Glow underline */}
      <mesh ref={meshRef}>
        <boxGeometry args={[text.length * 0.048, 0.006, 0.002]} />
        <meshStandardMaterial
          color={COLORS[colorIndex % COLORS.length]}
          emissive={COLORS[colorIndex % COLORS.length]}
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      <Text
        position={[0, 0.025, 0.01]}
        fontSize={0.055}
        color={COLORS[colorIndex % COLORS.length]}
        anchorX="left"
        anchorY="middle"
        font={undefined}
        maxWidth={3.5}
      >
        {text}
      </Text>
    </group>
  );
}

function ConnectionLines() {
  const points = useMemo(() => {
    const pts: [THREE.Vector3, THREE.Vector3][] = [];
    const endpoints: [number, number, number][] = [
      [-1.8, 0.5, 0], [1.8, 0.5, 0],
      [-1.8, -0.5, 0], [1.8, -0.5, 0],
      [0, 0.7, 0], [0, -0.7, 0],
    ];
    for (let i = 0; i < endpoints.length - 1; i += 2) {
      pts.push([
        new THREE.Vector3(...endpoints[i]),
        new THREE.Vector3(...endpoints[i + 1])
      ]);
    }
    return pts;
  }, []);

  return (
    <>
      {points.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={i % 2 === 0 ? '#00f0ff' : '#9d00ff'}
          lineWidth={0.8}
          transparent
          opacity={0.25}
          dashed
          dashSize={0.1}
          gapSize={0.06}
        />
      ))}
    </>
  );
}

export function CodeLayer({ positionY }: CodeLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.12 + 1) * 0.05;
    }
    if (scanRef.current) {
      // scanning line animation
      scanRef.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.6;
      (scanRef.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, positionY, 0]}>
      {/* Glass slab */}
      <mesh>
        <boxGeometry args={[4.2, 1.4, 0.04]} />
        <meshPhysicalMaterial
          color="#9d00ff"
          transparent
          opacity={0.06}
          roughness={0.05}
          metalness={0}
          transmission={0.9}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.2, 1.4, 0.04)]} />
        <lineBasicMaterial color="#9d00ff" transparent opacity={0.3} />
      </lineSegments>

      {/* Scanning line */}
      <mesh ref={scanRef} position={[0, 0, 0.025]}>
        <boxGeometry args={[4.0, 0.008, 0.002]} />
        <meshStandardMaterial color="#9d00ff" emissive="#9d00ff" emissiveIntensity={3} transparent opacity={0.4} />
      </mesh>

      {/* Label */}
      <Text
        position={[-1.7, 0.85, 0.03]}
        fontSize={0.09}
        color="#9d00ff"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        CODE LAYER
      </Text>

      {/* Code lines */}
      {CODE_LINES.map((line, i) => (
        <CodeLine
          key={i}
          text={line}
          position={[-1.7, 0.58 - i * 0.082, 0.025]}
          colorIndex={i}
        />
      ))}

      <ConnectionLines />
    </group>
  );
}
