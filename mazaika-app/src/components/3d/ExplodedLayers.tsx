import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * High-Tech Ambient Cyber Constellation
 * Designed for Investor-Grade SaaS Background
 * Positioned in deep space to provide depth, atmosphere, and parallax
 * WITHOUT clashing with HTML text and UI components.
 */

interface ParticleNode {
  pos: [number, number, number];
  color: string;
  size: number;
  speed: number;
  orbitRadius: number;
  angle: number;
}

export function ExplodedLayers({ separation }: { separation: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);

  // Generate cyber constellation nodes in deep background space
  const nodes = useMemo(() => {
    const list: ParticleNode[] = [];
    const colors = ['#00D9FF', '#7C3AED', '#38BDF8', '#10B981', '#F59E0B'];
    
    // Peripheral cluster positions (away from screen center)
    const clusters: [number, number, number][] = [
      [-6.5, 3.2, -3.5],
      [6.8, 3.5, -4.0],
      [-7.2, -2.8, -3.0],
      [7.0, -2.5, -3.8],
      [-4.5, -4.2, -5.0],
      [4.8, 4.5, -4.5],
      [-5.8, 0.5, -4.2],
      [6.2, -0.2, -3.6],
    ];

    clusters.forEach((base, i) => {
      list.push({
        pos: base,
        color: colors[i % colors.length],
        size: 0.22,
        speed: 0.3 + (i % 3) * 0.15,
        orbitRadius: 0.4 + (i % 4) * 0.15,
        angle: (i * Math.PI) / 4,
      });
    });

    return list;
  }, []);

  // Ambient cyber dust particles
  const [dustPositions, dustColors] = useMemo(() => {
    const count = 380;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color('#00D9FF');
    const c2 = new THREE.Color('#7C3AED');
    const c3 = new THREE.Color('#38BDF8');

    for (let i = 0; i < count; i++) {
      // Spread wide in X and Y, deep in Z so it never invades hero foreground
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = -2 - Math.random() * 8;

      const pick = Math.random();
      const col = pick > 0.6 ? c1 : pick > 0.3 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return [positions, colors];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.015;
      pointsRef.current.rotation.x = Math.sin(t * 0.01) * 0.03;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.04;
      ringRef.current.rotation.y = Math.sin(t * 0.03) * 0.15;
    }
  });

  return (
    <group>
      {/* 1. Ambient Perspective Grid Plane in deep floor */}
      <mesh position={[0, -5, -4]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <planeGeometry args={[48, 48, 36, 36]} />
        <meshBasicMaterial
          color="#00D9FF"
          wireframe
          transparent
          opacity={0.035}
        />
      </mesh>

      {/* 2. Floating Cyber Horizon Rings in deep space */}
      <group ref={ringRef} position={[0, 0, -6]}>
        <mesh>
          <torusGeometry args={[8.5, 0.018, 16, 96]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.12} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[11.2, 0.012, 16, 96]} />
          <meshBasicMaterial color="#7C3AED" transparent opacity={0.08} />
        </mesh>
      </group>

      {/* 3. Deep Cyber Dust Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[dustColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 4. Peripheral Holographic Nodes & Beams */}
      <group ref={linesGroupRef}>
        {nodes.map((node, idx) => {
          const shiftX = node.pos[0] > 0 ? separation * 1.5 : -separation * 1.5;
          const shiftY = node.pos[1] > 0 ? separation * 0.8 : -separation * 0.8;
          const actualPos: [number, number, number] = [
            node.pos[0] + shiftX,
            node.pos[1] + shiftY,
            node.pos[2],
          ];

          return (
            <group key={idx} position={actualPos}>
              {/* Outer halo */}
              <mesh>
                <sphereGeometry args={[node.size * 2.2, 16, 16]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={0.08}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* Glowing Core Orb */}
              <mesh>
                <sphereGeometry args={[node.size, 20, 20]} />
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={2.4}
                  roughness={0.2}
                />
              </mesh>

              {/* Orbiting Ring */}
              <mesh rotation={[Math.PI / 3, (idx * Math.PI) / 3, 0]}>
                <torusGeometry args={[node.size * 1.7, 0.015, 8, 32]} />
                <meshBasicMaterial color={node.color} transparent opacity={0.35} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
