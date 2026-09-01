import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExplodedLayers } from './ExplodedLayers';

gsap.registerPlugin(ScrollTrigger);

function SceneController() {
  const { camera } = useThree();
  const sceneGroup = useRef<THREE.Group>(null);
  
  // Track scroll state
  const state = useRef({
    separation: 1.6, // Start slightly exploded so it looks amazing right away!
    cameraZ: 6.5,
    cameraY: 0,
    cameraX: 0,
    rotationX: -0.2,
    rotationY: 0.35,
    rotationZ: 0,
  });

  // Track mouse coordinates for subtle parallax
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.landing-page',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        }
      });

      // 1. Hero -> Features: Expand to full Exploded View and tilt
      tl.to(state.current, {
        separation: 2.8,
        rotationX: -0.35,
        rotationY: -0.5,
        cameraZ: 8.0,
        cameraX: 0.5,
        ease: 'power1.inOut',
      }, 0);

      // 2. Features -> AI Section: Focus on bottom layer
      tl.to(state.current, {
        separation: 3.0,
        cameraY: -2.8,
        cameraZ: 6.8,
        rotationX: -0.45,
        rotationY: 0.6,
        ease: 'power1.inOut',
      }, 1);

      // 3. AI -> Pricing & CTA: Re-align into dynamic stack
      tl.to(state.current, {
        separation: 1.2,
        cameraY: 0,
        cameraZ: 7.2,
        rotationX: -0.15,
        rotationY: 0.2,
        ease: 'power1.inOut',
      }, 2);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    
    // Smooth mouse parallax + base rotation
    const targetRotX = state.current.rotationX - mouse.current.y * 0.15 + Math.sin(t * 0.5) * 0.03;
    const targetRotY = state.current.rotationY + mouse.current.x * 0.2 + Math.cos(t * 0.4) * 0.05;

    if (sceneGroup.current) {
      sceneGroup.current.rotation.x = THREE.MathUtils.lerp(sceneGroup.current.rotation.x, targetRotX, 0.08);
      sceneGroup.current.rotation.y = THREE.MathUtils.lerp(sceneGroup.current.rotation.y, targetRotY, 0.08);
      sceneGroup.current.rotation.z = THREE.MathUtils.lerp(sceneGroup.current.rotation.z, state.current.rotationZ, 0.08);
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.current.cameraX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.current.cameraY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, state.current.cameraZ, 0.08);
    camera.lookAt(0, state.current.cameraY, 0);
  });

  return (
    <group ref={sceneGroup}>
      <ExplodedLayers separation={state.current.separation} />
    </group>
  );
}

export function BackgroundScene3D() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0, // Behind HTML content but above background color
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <AdaptiveDpr pixelated={false} />
        
        {/* Crisp Lighting with Vibrant Colors */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={3.5} color="#00f0ff" distance={30} />
        <pointLight position={[-10, -10, -5]} intensity={3.0} color="#9d00ff" distance={30} />
        <pointLight position={[0, 0, 8]} intensity={1.5} color="#ffffff" distance={20} />
        <directionalLight position={[0, 15, 5]} intensity={2.0} color="#00f5d4" />
        
        {/* Background Starry Nebula */}
        <Stars radius={80} depth={40} count={3500} factor={4} saturation={1} fade speed={1.5} />

        {/* 3D Scene */}
        <SceneController />
      </Canvas>
    </div>
  );
}
