import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExplodedLayers } from './ExplodedLayers';

gsap.registerPlugin(ScrollTrigger);

function SceneController() {
  const { camera } = useThree();
  const sceneGroup = useRef<THREE.Group>(null);
  const state = useRef({
    separation: 0,
    cameraZ: 6,
    cameraY: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  });

  useEffect(() => {
    // We animate state object using GSAP and apply it to Three.js in useFrame
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.lp-main',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        }
      });

      // Phase 1: Scroll to Features -> Explode layers and tilt
      tl.to(state.current, {
        separation: 2.5,
        rotationX: -Math.PI / 6,
        rotationY: -Math.PI / 8,
        cameraZ: 8,
        ease: 'power2.inOut',
      }, 0);

      // Phase 2: Scroll to AI -> Focus on bottom layer
      tl.to(state.current, {
        cameraY: -2.5, // Move camera down
        rotationX: -Math.PI / 4,
        cameraZ: 7,
        ease: 'power2.inOut',
      }, 1);

      // Phase 3: Scroll to Pricing/CTA -> Collapse back
      tl.to(state.current, {
        separation: 0,
        cameraY: 0,
        rotationX: 0,
        rotationY: 0,
        cameraZ: 6,
        ease: 'power2.inOut',
      }, 2);
    });

    return () => ctx.revert();
  }, []);

  useFrame(() => {
    if (sceneGroup.current) {
      sceneGroup.current.rotation.x = THREE.MathUtils.lerp(sceneGroup.current.rotation.x, state.current.rotationX, 0.1);
      sceneGroup.current.rotation.y = THREE.MathUtils.lerp(sceneGroup.current.rotation.y, state.current.rotationY, 0.1);
      sceneGroup.current.rotation.z = THREE.MathUtils.lerp(sceneGroup.current.rotation.z, state.current.rotationZ, 0.1);
    }
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, state.current.cameraZ, 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.current.cameraY, 0.1);
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
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', background: '#02040a' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <color attach="background" args={['#02040a']} />
        <fog attach="fog" args={['#02040a', 5, 20]} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} color="#00f0ff" />
        <directionalLight position={[-5, -10, -5]} intensity={1} color="#9d00ff" />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />
        
        {/* Main Logic */}
        <SceneController />
      </Canvas>
    </div>
  );
}
