/**
 * WORLD-BUILDER-C4P8R
 * Constructs the playable 3D environment for The Simulation.
 * Inspired by OpenViva outdoor/indoor spaces (simple but expandable).
 */

import * as THREE from 'three';

/**
 * WORLD-BUILDER-C4P8R-CREATE
 * Returns { ground, lights, interactables[] }
 */
export function createWorld(scene) {
  // WORLD-BUILDER-C4P8R-SKY
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 25, 90);

  // WORLD-BUILDER-C4P8R-LIGHTS
  const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 1.1);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff5e6, 1.6);
  sun.position.set(8, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  scene.add(sun);

  // WORLD-BUILDER-C4P8R-GROUND
  const groundGeo = new THREE.PlaneGeometry(120, 120);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x4a8c4a,
    roughness: 0.9,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // WORLD-BUILDER-C4P8R-PROPS
  // Simple path
  const pathGeo = new THREE.PlaneGeometry(3, 30);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xc2b280, roughness: 1 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, -5);
  path.receiveShadow = true;
  scene.add(path);

  // Cookie interactable (Stage 1 test object)
  const cookieGroup = new THREE.Group();
  const cookie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.07, 16),
    new THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.7 })
  );
  cookie.position.y = 0.04;
  cookie.castShadow = true;
  cookieGroup.add(cookie);
  cookieGroup.position.set(2.2, 0, 1.2);
  scene.add(cookieGroup);

  // A few decorative trees (simple cones)
  for (let i = 0; i < 8; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x5c4033 })
    );
    trunk.position.y = 0.45;
    trunk.castShadow = true;
    tree.add(trunk);
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
    );
    leaves.position.y = 1.5;
    leaves.castShadow = true;
    tree.add(leaves);
    const angle = (i / 8) * Math.PI * 2;
    tree.position.set(Math.cos(angle) * 9 + (Math.random()-0.5)*2, 0, Math.sin(angle) * 9 + (Math.random()-0.5)*2);
    scene.add(tree);
  }

  return {
    ground,
    lights: { hemi, sun },
    interactables: [
      { id: 'cookie', object: cookieGroup, type: 'pickup', position: cookieGroup.position.clone() }
    ]
  };
}
