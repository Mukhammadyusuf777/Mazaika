import * as THREE from 'three';

export function createGlassMaterial(color = '#00f0ff', opacity = 0.1): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  });
}

export function createNeonMaterial(color = '#00f0ff', intensity = 2): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    transparent: true,
    opacity: 0.8,
  });
}
