/**
 * CHARACTER-CORE-B2E9M
 * Classical character controller for The Simulation (Stage 1).
 * Ports the spirit of OpenViva's Loli state system (mood, body, task, hands, look, vision, autonomy)
 * while driving a real VRM model for Akari.
 */

import * as THREE from 'three';
import { loadVRM, updateVRM } from './vrm-loader.js';

export class Character {
  constructor(scene) {
    // CHARACTER-CORE-B2E9M-INIT
    this.scene = scene;
    this.position = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.speed = 2.6;
    this.vrm = null;
    this.vrmScene = null;
    this.ready = false;

    // Classical Viva-style state
    this.mood = { happy: 0.64, tired: 0.18, dirt: 0.02 };
    this.body = 'STAND';
    this.task = 'IDLE';
    this.autonomy = null;
    this.hands = { R: null, L: null };
    this.look = 'none';
    this.vision = [{ item: 'player', dist: 2.4 }];

    this._pendingDelta = null;
    this._placeholder = this._createPlaceholder();
    scene.add(this._placeholder);

    // Start loading VRM immediately
    this._loadModel();
  }

  /** CHARACTER-CORE-B2E9M-PLACEHOLDER */
  _createPlaceholder() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 0.85, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.7 })
    );
    body.position.y = 0.7;
    group.add(body);
    return group;
  }

  /** CHARACTER-CORE-B2E9M-LOAD */
  async _loadModel() {
    try {
      const { vrm, scene: vrmScene } = await loadVRM();
      this.vrm = vrm;
      this.vrmScene = vrmScene;

      // Position and add to world
      vrmScene.position.copy(this.position);
      this.scene.add(vrmScene);

      // Remove placeholder
      this.scene.remove(this._placeholder);
      this._placeholder = null;

      this.ready = true;
      console.log('[CHARACTER-CORE-B2E9M] Akari VRM ready');
    } catch (err) {
      console.error('[CHARACTER-CORE-B2E9M] VRM load failed, keeping placeholder', err);
    }
  }

  /** CHARACTER-CORE-B2E9M-RESET */
  reset() {
    this.position.set(0, 0, 0);
    this.yaw = 0;
    this.mood = { happy: 0.64, tired: 0.18, dirt: 0.02 };
    this.body = 'STAND';
    this.task = 'IDLE';
    this.autonomy = null;
    this.hands = { R: null, L: null };
    this.look = 'none';
    this._syncTransform();
  }

  /** CHARACTER-CORE-B2E9M-FULLSTATE */
  getFullState() {
    return {
      mood: { ...this.mood },
      body: this.body,
      task: this.task,
      autonomy: this.autonomy,
      hands: { ...this.hands },
      look: this.look,
      vision: [...this.vision]
    };
  }

  /** CHARACTER-CORE-B2E9M-DELTA */
  consumeDelta() {
    const d = this._pendingDelta;
    this._pendingDelta = null;
    return d;
  }

  _queueDelta(partial) {
    this._pendingDelta = { ...(this._pendingDelta || {}), ...partial };
  }

  /** CHARACTER-CORE-B2E9M-SYNC */
  _syncTransform() {
    const target = this.vrmScene || this._placeholder;
    if (target) {
      target.position.copy(this.position);
      target.rotation.y = this.yaw;
    }
  }

  /** CHARACTER-CORE-B2E9M-UPDATE
   * Main per-frame update. Handles movement, simple interactions, VRM tick.
   */
  update(dt, moveVec, lookDelta, interact, jump) {
    // Look / yaw
    if (lookDelta.x !== 0) {
      this.yaw -= lookDelta.x * 0.0045;
    }

    // Locomotion (later: feed into Viva-style animation sets)
    let moving = false;
    if (moveVec.lengthSq() > 0.01) {
      moving = true;
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const dir = forward.multiplyScalar(moveVec.y).add(right.multiplyScalar(moveVec.x));
      dir.normalize().multiplyScalar(this.speed * dt);
      this.position.add(dir);
      this.body = 'STAND'; // TODO: WALK / RUN body states from Viva
    }

    // Simple interaction: pick up nearby cookie
    if (interact) {
      const cookiePos = new THREE.Vector3(2.2, 0.15, 1.2);
      if (this.position.distanceTo(cookiePos) < 1.6 && !this.hands.R) {
        this.hands.R = 'holding:cookie';
        this.look = 'player';
        this.mood.happy = Math.min(1, this.mood.happy + 0.12);
        this._queueDelta({
          hands: { R: 'holding:cookie' },
          look: 'player',
          mood: { happy: +this.mood.happy.toFixed(2) }
        });
      }
    }

    this._syncTransform();

    // VRM animation tick
    if (this.vrm) {
      updateVRM(this.vrm, dt);
    }
  }

  /** CHARACTER-CORE-B2E9M-DEBUG */
  debugString() {
    return `mood:happy:${this.mood.happy.toFixed(2)} tired:${this.mood.tired.toFixed(2)}
body:${this.body} task:${this.task}
hands:R=${this.hands.R || 'null'} L=${this.hands.L || 'null'}
look:${this.look}  vrm:${this.ready ? 'ready' : 'loading'}
pos: ${this.position.x.toFixed(1)}, ${this.position.z.toFixed(1)}`;
  }
}
