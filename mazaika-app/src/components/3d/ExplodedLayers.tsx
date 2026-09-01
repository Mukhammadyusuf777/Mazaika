import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

interface WorkflowNodeData {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  color: string;
  pos: [number, number, number];
  drift: [number, number, number];
}

const WORKFLOW_NODES: WorkflowNodeData[] = [
  {
    id: 'start',
    title: 'Start Trigger',
    icon: '🚀',
    subtitle: '/start command',
    color: '#10B981',
    pos: [-2.2, 1.4, 0],
    drift: [-1.8, 1.2, -0.6],
  },
  {
    id: 'message',
    title: 'Interactive Menu',
    icon: '💬',
    subtitle: 'Buttons & Catalog',
    color: '#38BDF8',
    pos: [-0.4, 0.9, 0.4],
    drift: [-1.2, 0.6, 0.2],
  },
  {
    id: 'ai',
    title: 'Mazaika AI Agent',
    icon: '🧠',
    subtitle: 'DeepSeek R1 Core',
    color: '#00F0FF',
    pos: [1.6, 1.2, -0.2],
    drift: [1.6, 1.0, -0.4],
  },
  {
    id: 'payme',
    title: 'Payme / Click',
    icon: '💳',
    subtitle: 'Auto Invoice (UZS)',
    color: '#F59E0B',
    pos: [0.8, -0.7, 0.6],
    drift: [1.8, -1.0, 0.8],
  },
  {
    id: 'analytics',
    title: 'Live Analytics',
    icon: '📊',
    subtitle: 'Conversion & CRM',
    color: '#8B5CF6',
    pos: [-1.6, -0.8, -0.3],
    drift: [-2.0, -1.2, -0.5],
  },
  {
    id: 'webhook',
    title: 'Webhook API',
    icon: '⚡',
    subtitle: 'HTTP REST Sync',
    color: '#EC4899',
    pos: [2.6, -0.3, -0.8],
    drift: [2.8, -0.4, -1.2],
  },
];

const CONNECTIONS = [
  { from: 0, to: 1, color: '#38BDF8' },
  { from: 1, to: 2, color: '#00F0FF' },
  { from: 2, to: 3, color: '#F59E0B' },
  { from: 2, to: 4, color: '#8B5CF6' },
  { from: 3, to: 5, color: '#EC4899' },
];

function WorkflowNode3D({
  data,
  separation,
}: {
  data: WorkflowNodeData;
  separation: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // Gentle organic floating oscillation
    const floatY = Math.sin(t * 1.2 + data.pos[0] * 1.5) * 0.07;
    const floatRotX = Math.sin(t * 0.5 + data.pos[1]) * 0.03;
    const floatRotY = Math.cos(t * 0.4 + data.pos[2]) * 0.03;

    // Disperse outwards on scroll to keep center clear
    groupRef.current.position.x = data.pos[0] + data.drift[0] * separation;
    groupRef.current.position.y = data.pos[1] + data.drift[1] * separation + floatY;
    groupRef.current.position.z = data.pos[2] + data.drift[2] * separation;

    groupRef.current.rotation.x = floatRotX;
    groupRef.current.rotation.y = floatRotY;
  });

  return (
    <group ref={groupRef} position={data.pos}>
      {/* Dark Obsidian Glass Base Panel */}
      <RoundedBox args={[2.1, 1.05, 0.06]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0b101c"
          metalness={0.2}
          roughness={0.12}
          transmission={0.85}
          thickness={0.8}
          transparent
          opacity={0.88}
          reflectivity={0.9}
        />
      </RoundedBox>

      {/* Subtle Glowing Perimeter Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.1, 1.05, 0.06)]} />
        <lineBasicMaterial color={data.color} transparent opacity={0.7} />
      </lineSegments>

      {/* Top Header Banner */}
      <mesh position={[0, 0.36, 0.035]}>
        <planeGeometry args={[1.98, 0.22]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.2} />
      </mesh>

      {/* Port Connector Left (Input) */}
      <mesh position={[-1.06, 0, 0]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={data.color} />
      </mesh>

      {/* Port Connector Right (Output) */}
      <mesh position={[1.06, 0, 0]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={data.color} />
      </mesh>

      {/* Node Title */}
      <Text
        position={[-0.85, 0.36, 0.045]}
        fontSize={0.12}
        color="#FFFFFF"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {`${data.icon}  ${data.title}`}
      </Text>

      {/* Node Subtitle / Payload Info */}
      <Text
        position={[-0.85, 0.02, 0.045]}
        fontSize={0.095}
        color="#94A3B8"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {data.subtitle}
      </Text>

      {/* Status Active Badge */}
      <mesh position={[0.7, -0.26, 0.04]}>
        <planeGeometry args={[0.42, 0.16]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.25} />
      </mesh>
      <Text
        position={[0.7, -0.26, 0.045]}
        fontSize={0.075}
        color={data.color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        ACTIVE
      </Text>
    </group>
  );
}

// ─── DATA PULSE PARTICLE ON CURVE ──────────────────────────────────────────
function DataPulse({
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

  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    );
  }, [start, end, mid]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const progress = ((clock.elapsedTime * speed * 0.4 + offset) % 1);
    const point = curve.getPoint(progress);
    meshRef.current.position.set(point.x, point.y, point.z);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ─── WORKFLOW CONNECTIONS GRAPH ────────────────────────────────────────────
function WorkflowConnections({ separation }: { separation: number }) {
  // Calculate dynamic node positions factoring in separation
  const currentPositions = useMemo(() => {
    return WORKFLOW_NODES.map((n) => [
      n.pos[0] + n.drift[0] * separation,
      n.pos[1] + n.drift[1] * separation,
      n.pos[2] + n.drift[2] * separation,
    ] as [number, number, number]);
  }, [separation]);

  return (
    <group>
      {CONNECTIONS.map((c, idx) => {
        const startPos = currentPositions[c.from];
        const endPos = currentPositions[c.to];

        const mid: [number, number, number] = [
          (startPos[0] + endPos[0]) / 2,
          (startPos[1] + endPos[1]) / 2 + 0.3,
          (startPos[2] + endPos[2]) / 2 + 0.2,
        ];

        return (
          <group key={idx}>
            {/* Glowing Wire Cable */}
            <QuadraticBezierLine
              start={startPos}
              end={endPos}
              mid={mid}
              color={c.color}
              lineWidth={1.2}
              transparent
              opacity={0.45}
            />

            {/* Flowing Energy Data Pulses */}
            <DataPulse start={startPos} end={endPos} mid={mid} color={c.color} speed={1.2} offset={0} />
            <DataPulse start={startPos} end={endPos} mid={mid} color={c.color} speed={1.2} offset={0.5} />
          </group>
        );
      })}
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
      {/* Connected 3D Bot Workflow Nodes */}
      {WORKFLOW_NODES.map((node) => (
        <WorkflowNode3D key={node.id} data={node} separation={separation} />
      ))}

      {/* Animated Data Transfer Wires */}
      <WorkflowConnections separation={separation} />
    </group>
  );
}
