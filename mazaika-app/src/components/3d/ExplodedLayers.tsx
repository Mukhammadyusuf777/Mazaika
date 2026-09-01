import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Torus, Float } from '@react-three/drei';
import * as THREE from 'three';

// ─── UI LAYER ─────────────────────────────────────────────────────────────
function UILayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = positionY + Math.sin(clock.elapsedTime * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Glowing Glass Slab */}
      <mesh>
        <boxGeometry args={[5.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color="#0d1b2a"
          emissive="#00f0ff"
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.65}
        />
      </mesh>
      {/* Neon Edge Outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5.2, 3.2, 0.08)]} />
        <lineBasicMaterial color="#00f0ff" linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* Floating 3D Widget 1: Telegram Bot Chat Card */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[-1.2, 0.4, 0.35]}>
          <RoundedBox args={[2.2, 1.4, 0.08]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#1b263b" emissive="#9d00ff" emissiveIntensity={0.3} roughness={0.2} transparent opacity={0.85} />
          </RoundedBox>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(2.2, 1.4, 0.08)]} />
            <lineBasicMaterial color="#9d00ff" transparent opacity={0.8} />
          </lineSegments>
          
          {/* Avatar Icon */}
          <mesh position={[-0.75, 0.35, 0.06]}>
            <circleGeometry args={[0.16, 32]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          {/* Header Line */}
          <mesh position={[0.05, 0.35, 0.06]}>
            <planeGeometry args={[1.1, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Message Bubble 1 */}
          <mesh position={[-0.1, 0.05, 0.06]}>
            <planeGeometry args={[1.5, 0.22]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
          </mesh>
          {/* Message Bubble 2 (Action Button) */}
          <mesh position={[0.1, -0.32, 0.06]}>
            <planeGeometry args={[1.3, 0.24]} />
            <meshBasicMaterial color="#9d00ff" transparent opacity={0.7} />
          </mesh>
        </group>
      </Float>

      {/* Floating 3D Widget 2: Analytics & Payment Card */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group position={[1.3, -0.3, 0.3]}>
          <RoundedBox args={[1.9, 1.5, 0.08]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#0d1b2a" emissive="#00f0ff" emissiveIntensity={0.25} roughness={0.2} transparent opacity={0.85} />
          </RoundedBox>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.9, 1.5, 0.08)]} />
            <lineBasicMaterial color="#00f0ff" transparent opacity={0.8} />
          </lineSegments>
          
          {/* Stat Bar 1 */}
          <mesh position={[-0.45, -0.2, 0.06]}>
            <planeGeometry args={[0.16, 0.6]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          {/* Stat Bar 2 */}
          <mesh position={[-0.15, -0.05, 0.06]}>
            <planeGeometry args={[0.16, 0.9]} />
            <meshBasicMaterial color="#9d00ff" />
          </mesh>
          {/* Stat Bar 3 */}
          <mesh position={[0.15, 0.1, 0.06]}>
            <planeGeometry args={[0.16, 1.2]} />
            <meshBasicMaterial color="#00f5d4" />
          </mesh>
          {/* Stat Bar 4 */}
          <mesh position={[0.45, 0.25, 0.06]}>
            <planeGeometry args={[0.16, 1.5]} />
            <meshBasicMaterial color="#f72585" />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

// ─── CODE LAYER ───────────────────────────────────────────────────────────
function CodeLayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = positionY + Math.sin(clock.elapsedTime * 1.2 + 2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Glowing Glass Slab */}
      <mesh>
        <boxGeometry args={[5.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color="#10002b"
          emissive="#7b2cbf"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.65}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5.2, 3.2, 0.08)]} />
        <lineBasicMaterial color="#a855f7" linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* 3D Code Nodes & Logic Grid */}
      <group position={[0, 0, 0.1]}>
        {/* Code Lines as Neon Bars */}
        {[
          { y: 0.9, x: -1.2, w: 1.8, c: '#00f0ff' },
          { y: 0.9, x: 0.4, w: 1.0, c: '#9d00ff' },
          { y: 0.6, x: -0.8, w: 2.2, c: '#f72585' },
          { y: 0.3, x: -1.0, w: 1.4, c: '#00f5d4' },
          { y: 0.0, x: -0.4, w: 2.4, c: '#a855f7' },
          { y: -0.3, x: -1.2, w: 1.2, c: '#00f0ff' },
          { y: -0.6, x: -0.6, w: 2.0, c: '#fbbf24' },
          { y: -0.9, x: -1.0, w: 1.6, c: '#00f5d4' },
        ].map((line, idx) => (
          <mesh key={idx} position={[line.x, line.y, 0]}>
            <planeGeometry args={[line.w, 0.12]} />
            <meshBasicMaterial color={line.c} transparent opacity={0.85} />
          </mesh>
        ))}

        {/* Floating Node Chips */}
        <Float speed={3} rotationIntensity={0.3} floatIntensity={0.5}>
          <group position={[1.4, 0.5, 0.3]}>
            <RoundedBox args={[1.2, 0.5, 0.06]} radius={0.04}>
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
            </RoundedBox>
          </group>
        </Float>
        <Float speed={2.8} rotationIntensity={0.3} floatIntensity={0.5}>
          <group position={[1.2, -0.6, 0.3]}>
            <RoundedBox args={[1.4, 0.5, 0.06]} radius={0.04}>
              <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={0.8} />
            </RoundedBox>
          </group>
        </Float>
      </group>
    </group>
  );
}

// ─── AI LAYER ─────────────────────────────────────────────────────────────
function AILayer({ positionY }: { positionY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 350;
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 0.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = positionY + Math.sin(t * 1.2 + 4) * 0.08;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.15;
      coreRef.current.scale.set(scale, scale, scale);
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.3;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 1.2;
      ring1Ref.current.rotation.y = t * 0.8;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 1.0;
      ring2Ref.current.rotation.z = t * 0.6;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.2;
      particlesRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Glowing Glass Slab */}
      <mesh>
        <boxGeometry args={[5.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color="#050a30"
          emissive="#00f0ff"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.65}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5.2, 3.2, 0.08)]} />
        <lineBasicMaterial color="#00f0ff" linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* AI Core Nucleus */}
      <Sphere ref={coreRef} args={[0.55, 24, 24]} position={[0, 0, 0.3]}>
        <meshStandardMaterial
          color="#9d00ff"
          emissive="#00f0ff"
          emissiveIntensity={2.5}
          wireframe
        />
      </Sphere>

      {/* Inner Glowing Core */}
      <Sphere args={[0.35, 16, 16]} position={[0, 0, 0.3]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>

      {/* Orbiting Quantum Rings */}
      <Torus ref={ring1Ref} args={[1.0, 0.02, 16, 64]} position={[0, 0, 0.3]}>
        <meshBasicMaterial color="#00f0ff" />
      </Torus>
      <Torus ref={ring2Ref} args={[1.35, 0.02, 16, 64]} position={[0, 0, 0.3]}>
        <meshBasicMaterial color="#f72585" />
      </Torus>

      {/* Particle Swarm */}
      <points ref={particlesRef} position={[0, 0, 0.3]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#00f5d4"
          size={0.06}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────
export interface ExplodedLayersProps {
  separation: number;
}

export function ExplodedLayers({ separation }: ExplodedLayersProps) {
  return (
    <group scale={1.15}>
      <UILayer positionY={separation} />
      <CodeLayer positionY={0} />
      <AILayer positionY={-separation} />

      {/* Glowing Vertical Connector Beams */}
      {separation > 0.1 && (
        <>
          {[-2.3, 2.3].map((x) =>
            [-1.4, 1.4].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0, z]}>
                <cylinderGeometry args={[0.025, 0.025, separation * 2.2, 16]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
              </mesh>
            ))
          )}
        </>
      )}
    </group>
  );
}
