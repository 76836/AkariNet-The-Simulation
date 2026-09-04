import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Character } from './character.js';
import { SessionLogger } from './session-logger.js';
import { InputManager } from './input.js';

const container = document.getElementById('canvas-container');
const statePanel = document.getElementById('state-panel');
const statusEl = document.getElementById('status');

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 80);

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(5, 10, 7);
dir.castShadow = true;
scene.add(dir);

// Ground
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a7d44 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Simple marker for "cookie" interactable
const cookieGeo = new THREE.SphereGeometry(0.15, 16, 16);
const cookieMat = new THREE.MeshStandardMaterial({ color: 0xc4a35a });
const cookie = new THREE.Mesh(cookieGeo, cookieMat);
cookie.position.set(2, 0.15, 1);
scene.add(cookie);

// Camera (third-person)
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
let cameraTarget = new THREE.Vector3();
let cameraOffset = new THREE.Vector3(0, 1.6, 3.5);

// Character + systems
const character = new Character(scene);
const logger = new SessionLogger();
const input = new InputManager();

// Initial full state
logger.pushState(character.getFullState());
logger.pushAssistant('*stands quietly, looking around*');

// UI
document.getElementById('btn-export').onclick = () => {
  const chatml = logger.toChatML();
  const blob = new Blob([chatml], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `session-${Date.now()}.chatml`;
  a.click();
};

document.getElementById('btn-reset').onclick = () => {
  logger.reset();
  character.reset();
  logger.pushState(character.getFullState());
  statusEl.textContent = 'Session reset';
};

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main loop
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

  // Simple third-person camera follow
  cameraTarget.copy(character.position).add(new THREE.Vector3(0, 1.2, 0));
  const desired = cameraTarget.clone().add(cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), character.yaw));
  camera.position.lerp(desired, 1 - Math.exp(-4 * dt));
  camera.lookAt(cameraTarget);

  // Update state panel
  statePanel.textContent = character.debugString();

  renderer.render(scene, camera);
}
animate();

statusEl.textContent = 'Stage 1 ready – move with WASD / touch';
