/**
 * VRM-LOADER-A7F3K
 * Dedicated module for loading and managing Akari's VRM model.
 * Adapted from AkariNet characters/akari/VRM/V3VRM.html and Digita/VRM.html.
 * Provides a clean Promise-based API for The Simulation.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// VRM-LOADER-A7F3K-CONFIG
const DEFAULT_VRM_URL = 'https://76836.github.io/Akari/characters/akari/VRM/Akarilite.vrm';

/**
 * VRM-LOADER-A7F3K-LOAD
 * Loads a VRM model and returns { vrm, scene }.
 * Handles cleanup of previous model if provided.
 */
export async function loadVRM(url = DEFAULT_VRM_URL, previousVrm = null) {
  if (previousVrm) {
    // VRM-LOADER-A7F3K-CLEANUP
    try {
      VRMUtils.deepDispose(previousVrm.scene);
    } catch (e) {
      console.warn('[VRM-LOADER-A7F3K] dispose warning', e);
    }
  }

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // VRM-LOADER-A7F3K-PROCESS
        const vrm = gltf.userData.vrm;

        if (!vrm) {
          reject(new Error('No VRM found in loaded GLTF'));
          return;
        }

        // Recommended optimizations from three-vrm
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);

        // Rotate to face -Z (common VRM convention adjustment)
        vrm.scene.rotation.y = Math.PI;

        // Neutral pose (arms down)
        try {
          const humanoid = vrm.humanoid;
          if (humanoid) {
            const rightUpper = humanoid.getNormalizedBoneNode('rightUpperArm');
            const leftUpper = humanoid.getNormalizedBoneNode('leftUpperArm');
            if (rightUpper) rightUpper.rotation.z = -1.0;
            if (leftUpper) leftUpper.rotation.z = 1.0;
          }
        } catch (e) {
          console.warn('[VRM-LOADER-A7F3K] bone pose warning', e);
        }

        console.log('[VRM-LOADER-A7F3K] Akari VRM loaded successfully');
        resolve({ vrm, scene: vrm.scene });
      },
      (progress) => {
        // VRM-LOADER-A7F3K-PROGRESS
        if (progress.total > 0) {
          const pct = (100 * progress.loaded / progress.total).toFixed(1);
          console.log(`[VRM-LOADER-A7F3K] ${pct}%`);
        }
      },
      (error) => {
        console.error('[VRM-LOADER-A7F3K] load failed', error);
        reject(error);
      }
    );
  });
}

/**
 * VRM-LOADER-A7F3K-UPDATE
 * Call every frame with delta time.
 */
export function updateVRM(vrm, delta) {
  if (vrm) {
    vrm.update(delta);
  }
}
