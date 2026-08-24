import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AILayerProps {
  positionY: number;
}

const NODE_COUNT = 18;

function NeuralNodes() {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Fixed node positions
  const nodePositions = useMemo<THREE.Vector3[]>(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2;
      const radius = 0.4 + (i % 3) * 0.45;
      positions.push(new THREE.Vector3(
        Math.cos(angle) * radius * 1.6,
        Math.sin(angle) * radius * 0.45,
        (Math.random() - 0.5) * 0.1
      ));
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!instancedRef.current) return;
    nodePositions.forEach((pos, i) => {
      const pulse = 0.025 + Math.sin(clock.elapsedTime * 1.5 + i * 0.7) * 0.015;
      dummy.position.set(pos.x, pos.y, pos.z + Math.sin(clock.elapsedTime * 0.4 + i) * 0.02);
      dummy.scale.setScalar(pulse * (i % 3 === 0 ? 2 : 1));
      dummy.updateMatrix();
      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, NODE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#00f0ff"
        emissive="#00f0ff"
        emissiveIntensity={2.5}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

function NeuralConnections({ nodePositions }: { nodePositions: THREE.Vector3[] }) {
  // Connect each node to its 2 nearest neighbors
  const connections = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    nodePositions.forEach((a, i) => {
      const next1 = nodePositions[(i + 1) % nodePositions.length];
      const next2 = nodePositions[(i + 4) % nodePositions.length];
      pairs.push([a, next1]);
      if (i % 3 === 0) pairs.push([a, next2]);
    });
    return pairs;
  }, [nodePositions]);

  return (
    <>
      {connections.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={i % 2 === 0 ? '#00f0ff' : '#9d00ff'}
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </>
  );
}

function PulseSpheres() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const positions = useMemo<[number, number, number][]>(() => [
    [-1.6, 0.1, 0], [0, 0.4, 0], [1.6, 0.1, 0],
    [-0.8, -0.35, 0], [0.8, -0.35, 0], [0, -0.05, 0],
  ], []);

  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const scale = 1 + Math.sin(clock.elapsedTime * 1.8 + i * 1.05) * 0.35;
      mesh.scale.setScalar(scale);
      (mesh.material as THREE.MeshStandardMaterial).opacity = 0.5 - scale * 0.2;
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => { refs.current[i] = el; }}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00f0ff' : '#9d00ff'}
            emissive={i % 2 === 0 ? '#00f0ff' : '#9d00ff'}
            emissiveIntensity={3}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// Floating particles
function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00f0ff"
        size={0.025}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function AILayer({ positionY }: AILayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const nodePositions = useMemo<THREE.Vector3[]>(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2;
      const radius = 0.4 + (i % 3) * 0.45;
      positions.push(new THREE.Vector3(
        Math.cos(angle) * radius * 1.6,
        Math.sin(angle) * radius * 0.45,
        0
      ));
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.1 + 2) * 0.05;
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
          opacity={0.07}
          roughness={0.05}
          metalness={0.1}
          transmission={0.85}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.2, 1.4, 0.04)]} />
        <lineBasicMaterial color="#9d00ff" transparent opacity={0.35} />
      </lineSegments>

      {/* Label */}
      <Text
        position={[-1.7, 0.85, 0.03]}
        fontSize={0.09}
        color="#9d00ff"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        AI CORE
      </Text>

      {/* Central glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color="#9d00ff"
          emissive="#9d00ff"
          emissiveIntensity={3}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Outer ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.012, 16, 60]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>

      <NeuralNodes />
      <NeuralConnections nodePositions={nodePositions} />
      <PulseSpheres />
      <Particles />
    </group>
  );
}
