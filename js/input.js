/**
 * INPUT-MANAGER-F8K3W
 * Unified keyboard + mouse + touch controls for third-person play.
 */

export class InputManager {
  constructor() {
    // INPUT-MANAGER-F8K3W-INIT
    this.keys = {};
    this.move = { x: 0, y: 0 };
    this.lookDelta = { x: 0, y: 0 };
    this.interact = false;
    this.jump = false;

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE') this.interact = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.jump = true;
      }
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    let dragging = false;
    window.addEventListener('mousedown', () => { dragging = true; });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', e => {
      if (dragging || document.pointerLockElement) {
        this.lookDelta.x += e.movementX;
        this.lookDelta.y += e.movementY;
      }
    });

    this._setupJoystick('move-zone', 'move-stick', (x, y) => {
      this.move.x = x;
      this.move.y = -y;
    });
    this._setupJoystick('look-zone', 'look-stick', (x, y) => {
      this.lookDelta.x += x * 14;
      this.lookDelta.y += y * 9;
    });

    document.getElementById('btn-interact')?.addEventListener('touchstart', e => {
      e.preventDefault();
      this.interact = true;
    }, { passive: false });
    document.getElementById('btn-jump')?.addEventListener('touchstart', e => {
      e.preventDefault();
      this.jump = true;
    }, { passive: false });
  }

  /** INPUT-MANAGER-F8K3W-JOYSTICK */
  _setupJoystick(zoneId, stickId, cb) {
    const zone = document.getElementById(zoneId);
    const stick = document.getElementById(stickId);
    if (!zone || !stick) return;

    let active = false;
    const maxR = 42;

    const handler = (clientX, clientY) => {
      const rect = zone.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, maxR);
      dx = (dx / len) * clamped;
      dy = (dy / len) * clamped;
      stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      cb(dx / maxR, dy / maxR);
    };

    zone.addEventListener('touchstart', e => {
      active = true;
      handler(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }, { passive: false });
    zone.addEventListener('touchmove', e => {
      if (active) handler(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }, { passive: false });
    zone.addEventListener('touchend', () => {
      active = false;
      stick.style.transform = 'translate(-50%, -50%)';
      cb(0, 0);
    });
  }

  getMoveVector() {
    let x = this.move.x;
    let y = this.move.y;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) y += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y -= 1;
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len, lengthSq: () => x * x + y * y };
  }

  getLookDelta() {
    const d = { x: this.lookDelta.x, y: this.lookDelta.y };
    this.lookDelta.x = 0;
    this.lookDelta.y = 0;
    return d;
  }

  consumeInteract() {
    const v = this.interact;
    this.interact = false;
    return v;
  }

  consumeJump() {
    const v = this.jump;
    this.jump = false;
    return v;
  }
}
