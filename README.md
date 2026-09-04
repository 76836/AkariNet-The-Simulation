# AkariNet - The Simulation

Stage 1: Port of Viva-style classical character AI behaviors to pure HTML + JavaScript for high-quality data generation.

**Goal**: Generate ChatML trajectories of humanoid character control (state, actions, voice, events) for training smaller models.

## Features (Day 0)
- Third-person playable character (Genshin-like feel)
- Keyboard + mouse + touch controls
- Sparse Single Status Updates (SSU)
- Session recording → ChatML export
- VRM character support (code adapted from AkariNet)
- No VR (desktop/mobile web only for now)

## Live
Once GitHub Pages is enabled: https://76836.github.io/AkariNet-The-Simulation/

## Controls
- **Desktop**: WASD / Arrow keys move, mouse look, Space jump, E interact
- **Mobile**: Virtual joystick + look pad + action buttons
- **Export**: Button to download current session as `.chatml` / `.jsonl`

## Architecture (Stage 1)
- Classical engine in JS (mood, body state, active task, autonomy, hands, vision interests)
- Sparse state deltas only
- Full ChatML logger from the first frame
- Later stages will add LLM control loop

## Repo Rules
Only this repository is modified. Code is adapted/copied from OpenViva (MIT) and AkariNet where useful.
