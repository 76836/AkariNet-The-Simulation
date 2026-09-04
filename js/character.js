import * as THREE from 'three';

/**
 * Minimal classical character for Stage 1.
 * Ports the spirit of Viva's state (mood, body, task, hands, look, vision)
 * without the full animation graph yet.
 */
export class Character {
  constructor(scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.speed = 2.8;

    // Classical state
    this.mood = { happy: 0.64, tired: 0.18, dirt: 0.02 };
    this.body = 'STAND';
    this.task = 'IDLE';
    this.autonomy = null;
    this.hands = { R: null, L: null };
    this.look = 'none';
    this.vision = [{ item: 'player', dist: 2.4 }];

    this._pendingDelta = null;
    this._mesh = this._createPlaceholderMesh();
    scene.add(this._mesh);
  }

  _createPlaceholderMesh() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.25, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb6c1 })
    );
    body.position.y = 0.7;
    group.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffe0bd })
    );
    head.position.y = 1.45;
    group.add(head);
    return group;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.yaw = 0;
    this.mood = { happy: 0.64, tired: 0.18, dirt: 0.02 };
    this.body = 'STAND';
    this.task = 'IDLE';
    this.autonomy = null;
    this.hands = { R: null, L: null };
    this.look = 'none';
    this._mesh.position.copy(this.position);
    this._mesh.rotation.y = this.yaw;
  }

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

  // Returns a sparse delta object or null
  consumeDelta() {
    const d = this._pendingDelta;
    this._pendingDelta = null;
    return d;
  }

  _queueDelta(partial) {
    this._pendingDelta = { ...(this._pendingDelta || {}), ...partial };
  }

  update(dt, moveVec, lookDelta, interact, jump) {
    // Look / yaw
    if (lookDelta.x !== 0) {
      this.yaw -= lookDelta.x * 0.005;
    }

    // Movement
    if (moveVec.lengthSq() > 0.01) {
      const angle = this.yaw;
      const forward = new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle));
      const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
      const dir = forward.multiplyScalar(moveVec.y).add(right.multiplyScalar(moveVec.x));
      dir.normalize().multiplyScalar(this.speed * dt);
      this.position.add(dir);
      this.body = 'STAND'; // later: WALK
    }

    if (jump) {
      // placeholder
    }

    if (interact) {
      // Simple: if near cookie and hands free → pick up
      const cookiePos = new THREE.Vector3(2, 0.15, 1);
      if (this.position.distanceTo(cookiePos) < 1.5 && !this.hands.R) {
        this.hands.R = 'holding:cookie';
        this.look = 'player';
        this.mood.happy = Math.min(1, this.mood.happy + 0.15);
        this._queueDelta({
          hands: { R: 'holding:cookie' },
          look: 'player',
          mood: { happy: this.mood.happy }
        });
      }
    }

    this._mesh.position.copy(this.position);
    this._mesh.rotation.y = this.yaw;
  }

  debugString() {
    return `mood:happy:${this.mood.happy.toFixed(2)} tired:${this.mood.tired.toFixed(2)}
body:${this.body} task:${this.task}
hands:R=${this.hands.R || 'null'} L=${this.hands.L || 'null'}
look:${this.look}
pos: ${this.position.x.toFixed(1)}, ${this.position.z.toFixed(1)}`;
  }
}
