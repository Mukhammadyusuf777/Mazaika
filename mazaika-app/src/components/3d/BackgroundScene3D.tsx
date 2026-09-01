import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExplodedLayers } from './ExplodedLayers';

gsap.registerPlugin(ScrollTrigger);

function SceneController() {
  const { camera } = useThree();
  const sceneGroup = useRef<THREE.Group>(null);

  // Animation state values controlled by GSAP ScrollTrigger
  const state = useRef({
    separation: 0.25, // Compact monolithic cluster in Hero
    cameraZ: 6.8,
    cameraY: 0,
    cameraX: 0,
    rotationX: -0.15,
    rotationY: 0.25,
    rotationZ: 0,
  });

  // Mouse coords for smooth parallax
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
          scrub: 1.4,
        },
      });

      // 1. Hero -> Features: Blocks cleanly disperse into peripheral Exploded View
      tl.to(
        state.current,
        {
          separation: 1.85,
          rotationX: -0.22,
          rotationY: -0.35,
          cameraZ: 7.6,
          ease: 'power1.inOut',
        },
        0
      );

      // 2. Features -> AI Section: Floating orbital view
      tl.to(
        state.current,
        {
          separation: 2.4,
          cameraY: -1.2,
          cameraZ: 8.2,
          rotationX: -0.3,
          rotationY: 0.45,
          ease: 'power1.inOut',
        },
        1
      );

      // 3. AI -> Pricing & CTA: Re-converge into subtle framing
      tl.to(
        state.current,
        {
          separation: 1.1,
          cameraY: 0,
          cameraZ: 7.0,
          rotationX: -0.1,
          rotationY: 0.15,
          ease: 'power1.inOut',
        },
        2
      );
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Smooth inertia dampening for mouse parallax
    const targetRotX =
      state.current.rotationX - mouse.current.y * 0.08 + Math.sin(t * 0.3) * 0.02;
    const targetRotY =
      state.current.rotationY + mouse.current.x * 0.12 + Math.cos(t * 0.25) * 0.025;

    if (sceneGroup.current) {
      sceneGroup.current.rotation.x = THREE.MathUtils.lerp(
        sceneGroup.current.rotation.x,
        targetRotX,
        0.05
      );
      sceneGroup.current.rotation.y = THREE.MathUtils.lerp(
        sceneGroup.current.rotation.y,
        targetRotY,
        0.05
      );
      sceneGroup.current.rotation.z = THREE.MathUtils.lerp(
        sceneGroup.current.rotation.z,
        state.current.rotationZ,
        0.05
      );
    }

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      state.current.cameraX + mouse.current.x * 0.3,
      0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      state.current.cameraY - mouse.current.y * 0.3,
      0.05
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      state.current.cameraZ,
      0.05
    );
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
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#06070B',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <AdaptiveDpr pixelated={false} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.45} color="#0d1424" />

        {/* Rim Backlight */}
        <directionalLight
          position={[0, 8, -6]}
          intensity={2.8}
          color="#8B5CF6"
        />

        {/* Key Cyan Fill */}
        <directionalLight
          position={[6, 8, 6]}
          intensity={2.2}
          color="#00F0FF"
        />

        {/* Soft Accent Pointlights */}
        <pointLight
          position={[-6, -4, 4]}
          intensity={1.8}
          color="#8B5CF6"
          distance={16}
        />
        <pointLight
          position={[6, -4, 4]}
          intensity={1.8}
          color="#00F0FF"
          distance={16}
        />

        {/* Mazaika 3D Core */}
        <SceneController />
      </Canvas>
    </div>
  );
}
