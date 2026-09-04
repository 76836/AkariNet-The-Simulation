# AkariNet – The Simulation

Stage 1 port of OpenViva-style classical character AI + Akari VRM into a playable HTML/JS environment for ChatML data generation.

**Live:** https://76836.github.io/AkariNet-The-Simulation/

## Current Features
- Third-person Genshin-like controls (keyboard + mouse + touch)
- Akari loaded as real VRM (`Akarilite.vrm` from AkariNet)
- Modular file structure with searchable alphanumeric IDs in comments
- Sparse Single Status Updates (SSU)
- Full session → ChatML export (brutalist format, no system prompt)
- Simple outdoor world (ground, path, trees, interactable cookie)

## File Map (IDs)
- `js/vrm-loader.js` — **VRM-LOADER-A7F3K**
- `js/character.js` — **CHARACTER-CORE-B2E9M**
- `js/world.js` — **WORLD-BUILDER-C4P8R**
- `js/main.js` — **MAIN-ENTRY-D1Q6T**
- `js/session-logger.js` — **SESSION-LOGGER-E5R2N**
- `js/input.js` — **INPUT-MANAGER-F8K3W**

## Controls
- **Desktop**: WASD / Arrows move, mouse-drag look, E interact, Space jump
- **Phone**: Left joystick move, right joystick look, E / Jump buttons
- Export ChatML button in top bar

## Next (still Stage 1)
- Port more OpenViva body states, animation sets, autonomy, vision interests
- Basic locomotion animations on the VRM
- Richer world + more interactables
- CLI testing harness

Only this repository is modified.
