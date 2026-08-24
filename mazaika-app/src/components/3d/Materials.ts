import * as THREE from 'three';

export function createGlassMaterial(color = '#00f0ff', opacity = 0.15): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    envMapIntensity: 1.0,
    attenuationColor: new THREE.Color(color),
    attenuationDistance: 0.5,
  });
}

export function createNeonMaterial(color = '#00f0ff', intensity = 2): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
}

export function createWireframeMaterial(color = '#9d00ff'): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
}

export function createParticleMaterial(color = '#00f0ff'): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
