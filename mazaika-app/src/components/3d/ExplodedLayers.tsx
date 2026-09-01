import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

interface WorkflowNodeSpec {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  details: string;
  color: string;
  badge: string;
  pos: [number, number, number];
  drift: [number, number, number];
  type: 'start' | 'menu' | 'ai' | 'payment' | 'analytics' | 'webhook';
}

const NODES_DATA: WorkflowNodeSpec[] = [
  {
    id: 'start',
    tag: '⚡ TRIGGER',
    title: 'Start Trigger',
    subtitle: 'cmd: /start',
    details: 'User joins bot',
    color: '#10B981',
    badge: 'ACTIVE',
    pos: [-2.6, 1.3, -0.4],
    drift: [-2.2, 1.4, -0.8],
    type: 'start',
  },
  {
    id: 'menu',
    tag: '💬 DIALOG',
    title: 'Interactive Menu',
    subtitle: 'Buttons & Catalog',
    details: '3 menu branches',
    color: '#38BDF8',
    badge: 'ONLINE',
    pos: [-0.6, 0.7, 0.2],
    drift: [-1.4, 0.8, 0.4],
    type: 'menu',
  },
  {
    id: 'ai',
    tag: '🤖 MAZAIKA AI',
    title: 'DeepSeek R1 Core',
    subtitle: 'Reasoning Engine',
    details: '16K tokens • Contextual',
    color: '#00F0FF',
    badge: 'RUNNING',
    pos: [1.8, 1.2, -0.3],
    drift: [1.8, 1.2, -0.6],
    type: 'ai',
  },
  {
    id: 'payment',
    tag: '💳 PAYMENT',
    title: 'Payme / Click',
    subtitle: 'Auto Invoice',
    details: '99,000 UZS • Instant',
    color: '#F59E0B',
    badge: 'SUCCESS',
    pos: [0.9, -0.8, 0.5],
    drift: [2.0, -1.2, 0.9],
    type: 'payment',
  },
  {
    id: 'analytics',
    tag: '📊 CRM & STATS',
    title: 'Live Analytics',
    subtitle: 'Real-time Metrics',
    details: '1,240 events today',
    color: '#8B5CF6',
    badge: 'SYNCED',
    pos: [-1.8, -0.9, -0.2],
    drift: [-2.4, -1.3, -0.6],
    type: 'analytics',
  },
  {
    id: 'webhook',
    tag: '📦 INTEGRATION',
    title: 'Google Sheets & API',
    subtitle: 'REST Webhook Sync',
    details: 'POST /v1/leads • 200 OK',
    color: '#EC4899',
    badge: '200 OK',
    pos: [2.8, -0.4, -0.9],
    drift: [3.0, -0.5, -1.4],
    type: 'webhook',
  },
];

const CONNECTIONS = [
  { from: 0, to: 1, color: '#38BDF8', label: 'on_start' },
  { from: 1, to: 2, color: '#00F0FF', label: 'ai_prompt' },
  { from: 2, to: 3, color: '#F59E0B', label: 'checkout' },
  { from: 2, to: 4, color: '#8B5CF6', label: 'log_event' },
  { from: 3, to: 5, color: '#EC4899', label: 'sync_order' },
];

function NodeVisualInternal({ type, color }: { type: WorkflowNodeSpec['type']; color: string }) {
  if (type === 'ai') {
    return (
      <group position={[0.65, -0.05, 0.05]}>
        {/* Pulsing AI Neural Ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.18, 0.02, 12, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={2.5} />
        </mesh>
      </group>
    );
  }

  if (type === 'analytics') {
    return (
      <group position={[0.6, -0.15, 0.05]}>
        {/* Mini 3D Bar Chart */}
        {[0.14, 0.28, 0.2, 0.35].map((h, i) => (
          <mesh key={i} position={[(i - 1.5) * 0.09, h / 2, 0]}>
            <boxGeometry args={[0.06, h, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'payment') {
    return (
      <group position={[0.65, -0.08, 0.05]}>
        <mesh>
          <planeGeometry args={[0.36, 0.22]} />
          <meshStandardMaterial color="#0b1e17" />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.36, 0.22)]} />
          <lineBasicMaterial color={color} />
        </lineSegments>
        <mesh position={[-0.08, 0.02, 0.01]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  return null;
}

function WorkflowNode3D({
  data,
  separation,
}: {
  data: WorkflowNodeSpec;
  separation: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // Smooth organic oscillation
    const floatY = Math.sin(t * 1.3 + data.pos[0] * 1.8) * 0.08;
    const floatRotX = Math.sin(t * 0.6 + data.pos[1]) * 0.035;
    const floatRotY = Math.cos(t * 0.5 + data.pos[2]) * 0.035;

    // Glide outwards on scroll to keep center clear
    groupRef.current.position.x = data.pos[0] + data.drift[0] * separation;
    groupRef.current.position.y = data.pos[1] + data.drift[1] * separation + floatY;
    groupRef.current.position.z = data.pos[2] + data.drift[2] * separation;

    groupRef.current.rotation.x = floatRotX;
    groupRef.current.rotation.y = floatRotY;
  });

  return (
    <group ref={groupRef} position={data.pos}>
      {/* 1. Main Frosted Obsidian Glass Body */}
      <RoundedBox args={[2.3, 1.25, 0.08]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#080d18"
          metalness={0.25}
          roughness={0.12}
          transmission={0.88}
          thickness={1.1}
          transparent
          opacity={0.9}
          reflectivity={0.95}
          clearcoat={0.9}
        />
      </RoundedBox>

      {/* 2. Vibrant Glowing Perimeter Bevel */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.3, 1.25, 0.08)]} />
        <lineBasicMaterial color={data.color} transparent opacity={0.85} linewidth={1.5} />
      </lineSegments>

      {/* 3. Top Header Bar with Accent Color Fill */}
      <mesh position={[0, 0.44, 0.045]}>
        <planeGeometry args={[2.18, 0.26]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.22} />
      </mesh>

      {/* Header Tag / Type */}
      <Text
        position={[-0.96, 0.44, 0.055]}
        fontSize={0.095}
        color={data.color}
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {data.tag}
      </Text>

      {/* Status Badge Pill */}
      <mesh position={[0.78, 0.44, 0.05]}>
        <planeGeometry args={[0.42, 0.16]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.35} />
      </mesh>
      <Text
        position={[0.78, 0.44, 0.055]}
        fontSize={0.075}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`● ${data.badge}`}
      </Text>

      {/* 4. Left Input Port Knob */}
      <mesh position={[-1.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.8} />
      </mesh>

      {/* 5. Right Output Port Knob */}
      <mesh position={[1.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.8} />
      </mesh>

      {/* 6. Node Title */}
      <Text
        position={[-0.96, 0.14, 0.055]}
        fontSize={0.14}
        color="#FFFFFF"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {data.title}
      </Text>

      {/* 7. Node Subtitle / Payload Info */}
      <Text
        position={[-0.96, -0.08, 0.055]}
        fontSize={0.095}
        color="#94A3B8"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {data.subtitle}
      </Text>

      {/* 8. Node Details / Metrics */}
      <Text
        position={[-0.96, -0.32, 0.055]}
        fontSize={0.085}
        color="#64748B"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {data.details}
      </Text>

      {/* 9. Specialized Visual Widget (e.g. AI Orb, Bar Chart) */}
      <NodeVisualInternal type={data.type} color={data.color} />
    </group>
  );
}

// ─── DATA PACKET TRAVELLING ON CABLE ──────────────────────────────────────
function DataPacket({
  start,
  end,
  mid,
  color,
  speed = 1.0,
  offset = 0,
}: {
  start: [number, number, number];
  end: [number, number, number];
  mid: [number, number, number];
  color: string;
  speed?: number;
  offset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    );
  }, [start, end, mid]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const progress = ((clock.elapsedTime * speed * 0.45 + offset) % 1);
    const point = curve.getPoint(progress);

    meshRef.current.position.set(point.x, point.y, point.z);
    glowRef.current.position.set(point.x, point.y, point.z);
  });

  return (
    <group>
      {/* Inner Core Pulse */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={3.0} />
      </mesh>
      {/* Soft Outer Halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// ─── NEON CONNECTIONS GRAPH ────────────────────────────────────────────────
function WorkflowConnections({ separation }: { separation: number }) {
  const currentPositions = useMemo(() => {
    return NODES_DATA.map((n) => [
      n.pos[0] + n.drift[0] * separation,
      n.pos[1] + n.drift[1] * separation,
      n.pos[2] + n.drift[2] * separation,
    ] as [number, number, number]);
  }, [separation]);

  return (
    <group>
      {CONNECTIONS.map((c, idx) => {
        // Wire connects from right port of Node A to left port of Node B
        const startPos: [number, number, number] = [
          currentPositions[c.from][0] + 1.16,
          currentPositions[c.from][1],
          currentPositions[c.from][2],
        ];
        const endPos: [number, number, number] = [
          currentPositions[c.to][0] - 1.16,
          currentPositions[c.to][1],
          currentPositions[c.to][2],
        ];

        const mid: [number, number, number] = [
          (startPos[0] + endPos[0]) / 2,
          (startPos[1] + endPos[1]) / 2 + 0.35,
          (startPos[2] + endPos[2]) / 2 + 0.25,
        ];

        return (
          <group key={idx}>
            {/* Glowing Flow Cable Wire */}
            <QuadraticBezierLine
              start={startPos}
              end={endPos}
              mid={mid}
              color={c.color}
              lineWidth={2.2}
              transparent
              opacity={0.65}
            />

            {/* Live Data Pulses traveling continuously */}
            <DataPacket start={startPos} end={endPos} mid={mid} color={c.color} speed={1.3} offset={0} />
            <DataPacket start={startPos} end={endPos} mid={mid} color={c.color} speed={1.3} offset={0.5} />
          </group>
        );
      })}
    </group>
  );
}

// ─── AMBIENT CYBER DUST PARTICLES ──────────────────────────────────────────
function AmbientCyberDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const particlesData = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesData, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#38BDF8"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────
export interface ExplodedLayersProps {
  separation: number;
}

export function ExplodedLayers({ separation }: ExplodedLayersProps) {
  return (
    <group scale={1.12}>
      {/* 3D Bot Builder Nodes */}
      {NODES_DATA.map((node) => (
        <WorkflowNode3D key={node.id} data={node} separation={separation} />
      ))}

      {/* Glowing Data Flow Cables */}
      <WorkflowConnections separation={separation} />

      {/* Cyber Dust Ambient Particles */}
      <AmbientCyberDust />
    </group>
  );
}
