import * as THREE from 'three';

export function createObsidianGlassMaterial(color = '#0e1626', opacity = 0.85): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.12,
    transmission: 0.85,
    thickness: 1.2,
    ior: 1.52,
    transparent: true,
    opacity,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });
}

export function createNeonCoreMaterial(color = '#00F0FF', intensity = 1.8): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.5,
  });
}
