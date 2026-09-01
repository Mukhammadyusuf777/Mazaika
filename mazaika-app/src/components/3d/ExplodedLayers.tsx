import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ─── UI LAYER ─────────────────────────────────────────────────────────────
function UILayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = positionY;
      // Slight floating effect for the entire layer
      groupRef.current.position.y += Math.sin(clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Glass Slab */}
      <mesh>
        <boxGeometry args={[5, 3, 0.05]} />
        <meshPhysicalMaterial color="#00f0ff" transparent opacity={0.05} metalness={0.1} roughness={0.1} transmission={0.9} thickness={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5, 3, 0.05)]} />
        <lineBasicMaterial color="#00f0ff" transparent opacity={0.3} />
      </lineSegments>

      {/* Floating UI Widget */}
      <group position={[-1, 0.5, 0.2]}>
        <RoundedBox args={[1.5, 1, 0.05]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial color="#9d00ff" transparent opacity={0.1} transmission={0.8} />
        </RoundedBox>
        <mesh position={[-0.5, 0.3, 0.03]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.2, 0.3, 0.03]}>
          <planeGeometry args={[0.8, 0.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, -0.2, 0.03]}>
          <planeGeometry args={[1.2, 0.4]} />
          <meshBasicMaterial color="#9d00ff" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Floating UI Widget 2 */}
      <group position={[1.2, -0.4, 0.15]}>
        <RoundedBox args={[1.8, 1.2, 0.05]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial color="#00f0ff" transparent opacity={0.1} transmission={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.3, 0.03]}>
          <planeGeometry args={[1.4, 0.1]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.3, 0, 0.03]}>
          <planeGeometry args={[0.8, 0.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ─── CODE LAYER ───────────────────────────────────────────────────────────
const CODE_SNIPPET = `interface BotContext {
  id: string;
  userId: string;
  flow: NodeGraph;
}

async function handleMessage(ctx) {
  const intent = await ai.analyze(ctx.text);
  if (intent.confidence > 0.9) {
    return ctx.reply(intent.answer);
  }
}`;

function CodeLayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = positionY;
      groupRef.current.position.y += Math.sin(clock.elapsedTime * 0.8 + 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[5, 3, 0.05]} />
        <meshPhysicalMaterial color="#9d00ff" transparent opacity={0.05} transmission={0.9} thickness={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5, 3, 0.05)]} />
        <lineBasicMaterial color="#9d00ff" transparent opacity={0.3} />
      </lineSegments>

      <Text
        position={[-2.2, 1, 0.1]}
        fontSize={0.15}
        color="#00f0ff"
        anchorX="left"
        anchorY="top"
        font={undefined}
        maxWidth={4.5}
        lineHeight={1.5}
      >
        {CODE_SNIPPET}
      </Text>
    </group>
  );
}

// ─── AI LAYER ─────────────────────────────────────────────────────────────
function AILayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = positionY;
      groupRef.current.position.y += Math.sin(t * 0.8 + 4) * 0.05;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.1;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.1;
      particlesRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[5, 3, 0.05]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.02} transmission={0.9} thickness={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5, 3, 0.05)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </lineSegments>

      {/* AI Core */}
      <Sphere ref={coreRef} args={[0.4, 32, 32]} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#9d00ff" emissive="#9d00ff" emissiveIntensity={2} wireframe />
      </Sphere>

      {/* Outer Rings */}
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.01, 16, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.1, 0.01, 16, 64]} />
        <meshBasicMaterial color="#9d00ff" transparent opacity={0.5} />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef} position={[0, 0, 0.2]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00f0ff" size={0.03} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────
export interface ExplodedLayersProps {
  separation: number;
}

export function ExplodedLayers({ separation }: ExplodedLayersProps) {
  // Connections between layers
  const connections = useMemo(() => {
    return [
      [new THREE.Vector3(-1.5, separation, 0), new THREE.Vector3(-1.5, 0, 0)],
      [new THREE.Vector3(1.5, separation, 0), new THREE.Vector3(1.5, 0, 0)],
      [new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(-1.5, -separation, 0)],
      [new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(1.5, -separation, 0)],
      [new THREE.Vector3(0, separation, 0), new THREE.Vector3(0, -separation, 0)],
    ];
  }, [separation]);

  return (
    <group>
      <UILayer positionY={separation} />
      <CodeLayer positionY={0} />
      <AILayer positionY={-separation} />
      
      {/* Draw connecting lines if separated */}
      {separation > 0.1 && connections.map((points, i) => (
        <Line key={i} points={points as any} color={i % 2 === 0 ? "#00f0ff" : "#9d00ff"} lineWidth={1} dashed dashSize={0.1} gapSize={0.1} transparent opacity={0.3} />
      ))}
    </group>
  );
}
