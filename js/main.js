/**
 * MAIN-ENTRY-D1Q6T
 * Entry point for The Simulation (Stage 1).
 * Wires world, character (VRM Akari), input, camera, and ChatML session logger.
 */

import * as THREE from 'three';
import { Character } from './character.js';
import { SessionLogger } from './session-logger.js';
import { InputManager } from './input.js';
import { createWorld } from './world.js';

// MAIN-ENTRY-D1Q6T-DOM
const container = document.getElementById('canvas-container');
const statePanel = document.getElementById('state-panel');
const statusEl = document.getElementById('status');

// MAIN-ENTRY-D1Q6T-RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// MAIN-ENTRY-D1Q6T-SCENE
const scene = new THREE.Scene();
const world = createWorld(scene);

// MAIN-ENTRY-D1Q6T-CAMERA
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
const cameraTarget = new THREE.Vector3();
const cameraOffset = new THREE.Vector3(0, 1.55, 3.8);

// MAIN-ENTRY-D1Q6T-SYSTEMS
const character = new Character(scene);
const logger = new SessionLogger();
const input = new InputManager();

// Initial full state (Stage 0 style)
logger.pushState(character.getFullState());
logger.pushAssistant('*stands quietly, looking around*');

// MAIN-ENTRY-D1Q6T-UI
document.getElementById('btn-export').onclick = () => {
  const chatml = logger.toChatML();
  const blob = new Blob([chatml], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `simulation-session-${Date.now()}.chatml`;
  a.click();
  statusEl.textContent = 'ChatML exported';
};

document.getElementById('btn-reset').onclick = () => {
  logger.reset();
  character.reset();
  logger.pushState(character.getFullState());
  statusEl.textContent = 'Session reset';
};

// MAIN-ENTRY-D1Q6T-RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// MAIN-ENTRY-D1Q6T-LOOP
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  const move = input.getMoveVector();
  const look = input.getLookDelta();
  character.update(dt, move, look, input.consumeInteract(), input.consumeJump());

  // Sparse SSU
  const delta = character.consumeDelta();
  if (delta) {
    logger.pushState(delta);
  }

  // Third-person camera
  cameraTarget.copy(character.position).add(new THREE.Vector3(0, 1.25, 0));
  const desired = cameraTarget.clone().add(
    cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), character.yaw)
  );
  camera.position.lerp(desired, 1 - Math.exp(-3.8 * dt));
  camera.lookAt(cameraTarget);

  statePanel.textContent = character.debugString();
  renderer.render(scene, camera);
}
animate();

statusEl.textContent = 'Stage 1 – Akari VRM loading…';
// Update status once VRM is ready (polled lightly)
const readyCheck = setInterval(() => {
  if (character.ready) {
    statusEl.textContent = 'Stage 1 ready – WASD / touch to move, E to interact';
    clearInterval(readyCheck);
  }
}, 400);
