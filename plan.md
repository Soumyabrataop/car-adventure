# Car Racing Game Plan

## Goal

Build a browser-based 3D car racing game with HTML, CSS, JavaScript, Three.js, and supporting JavaScript libraries. The first playable version should let a player drive around a closed track, complete laps, avoid leaving the course, and see race progress.

## Recommended Stack

- **Vite**: local development server and production bundling.
- **Three.js**: 3D scene, camera, lighting, materials, models, and rendering.
- **Rapier3D** or **cannon-es**: collision detection and vehicle physics. Start with Rapier3D for reliable rigid-body collisions; use raycasts or a custom arcade controller for the car's driving feel.
- **GLTFLoader** and **DRACOLoader**: load optimized `.glb` car and environment models.
- **Howler.js**: engine, tire, collision, and menu audio.
- **dat.GUI** or **lil-gui**: development-only tuning controls for handling, camera, and lighting.
- **Vitest**: unit tests for race rules, lap detection, checkpoints, and timing.
- **Playwright**: browser smoke tests for loading, input, HUD, and restart behavior.

Avoid adding a full game engine until the core Three.js prototype proves that it is needed.

## MVP Features

1. Start screen with a play button and control hints.
2. A low-poly car with acceleration, braking, steering, reverse, and friction.
3. A closed 3D track with road, grass, barriers, checkpoints, and a finish line.
4. Chase camera that follows the car and supports a simple camera reset.
5. Lap counter, race timer, speed display, and pause/restart controls.
6. Off-track slowdown and collision response.
7. Finish state after a configurable number of laps.
8. Responsive layout that works with keyboard controls and basic touch buttons.
9. Placeholder sound effects and a mute toggle.

## Project Structure

```text
src/
  main.js
  style.css
  game/
    Game.js
    GameState.js
    RaceManager.js
    Track.js
    Vehicle.js
    CameraController.js
    InputController.js
    AudioManager.js
  scene/
    createScene.js
    createLights.js
    createEnvironment.js
  ui/
    Hud.js
    Menu.js
    Controls.js
  assets/
    models/
    textures/
    audio/
tests/
  race-manager.test.js
  vehicle.test.js
public/
README.md
```

Keep game rules independent from Three.js where possible. This makes lap logic, timing, and input behavior testable without a WebGL canvas.

## Implementation Phases

### 1. Project Setup

- Initialize a Vite vanilla JavaScript project.
- Add Three.js, the chosen physics library, Howler.js, Vitest, and Playwright.
- Add npm scripts for `dev`, `build`, `preview`, `test`, and `test:e2e`.
- Create the base HTML shell and responsive CSS reset.
- Verify that an empty Three.js scene renders without console errors.

### 2. Rendering Foundation

- Create the renderer, scene, camera, resize handler, and animation loop.
- Add directional and ambient lighting, fog, a sky color, and a ground plane.
- Use a consistent world-unit convention, such as one meter per Three.js unit.
- Add a development debug toggle for axes, collision shapes, and frame rate.

### 3. Track and Environment

- Build a simple track from reusable straight and curved segments, or import a prepared GLB track.
- Add visible road boundaries, barriers, grass, start grid, and checkpoints.
- Define checkpoints as ordered volumes with clear IDs.
- Add simple materials first; replace them with optimized textures and models later.
- Keep static scenery separate from physics colliders so visual detail does not slow collision checks.

### 4. Vehicle and Driving Model

- Create a car entity containing its visual model, physics body, wheels, and tuning values.
- Implement arcade handling before attempting realistic simulation:
  - throttle and brake force
  - steering sensitivity based on speed
  - forward drag and lateral grip
  - reverse speed limit
  - air or off-track slowdown
  - reset when the car is overturned or stuck
- Use physics raycasts or wheel contact checks for ground detection.
- Synchronize the Three.js car model from the physics body each frame.
- Add debug sliders for acceleration, grip, steering, drag, and top speed.

### 5. Race Rules and Game State

- Define states such as `menu`, `countdown`, `racing`, `paused`, `finished`, and `results`.
- Implement a countdown before controls become active.
- Track elapsed time, current lap, checkpoint order, best lap, and total race time.
- Require checkpoints to be crossed in order to prevent shortcut exploits.
- Detect lap completion only after the player has passed every checkpoint.
- Add restart and reset-to-last-checkpoint behavior.

### 6. Camera and Controls

- Implement a spring-like chase camera with configurable distance, height, look-ahead, and smoothing.
- Add keyboard controls using `WASD` and arrow keys.
- Support pause with `Escape` and reset with `R`.
- Add touch controls only after keyboard driving is stable.
- Prevent browser scrolling and focus problems while gameplay controls are active.

### 7. HUD and Menus

- Build semantic HTML overlays instead of placing text in the 3D scene.
- Display speed, lap progress, position if opponents exist, timer, and pause state.
- Add start, pause, restart, finish, and settings controls.
- Keep HUD updates event-driven or throttled rather than rebuilding the entire DOM every frame.
- Ensure text and buttons remain readable at mobile widths.

### 8. Audio and Polish

- Load audio only after user interaction to satisfy browser autoplay rules.
- Add looping engine audio whose pitch changes with speed or RPM.
- Add tire, collision, countdown, finish, and button sounds.
- Add restrained screen shake, skid marks, dust effects, and lighting polish only after gameplay is reliable.
- Use object pooling for repeated particles and temporary effects.

### 9. Optional Expansion

Add these only after the MVP is stable:

- AI opponents following a waypoint graph.
- Multiple tracks and selectable cars.
- Checkpoints with shortcuts and alternate routes.
- Ghost replay for the best lap.
- Drift scoring, boost pads, ramps, and collectibles.
- Persistent best times using `localStorage`.
- Gamepad support.
- Web worker support for expensive AI or physics calculations.

## Core Update Loop

Use a fixed physics timestep with an accumulator so physics behavior is stable across frame rates:

```text
read input
accumulate elapsed time
while accumulator >= fixed timestep:
  update vehicle input
  step physics
  update race rules
  accumulator -= fixed timestep
interpolate visual transforms
update camera
update HUD
render scene
```

Do not put race completion logic, DOM manipulation, or asset loading directly inside the render loop.

## Validation Strategy

- Unit test checkpoint ordering, lap completion, timer transitions, reset behavior, and invalid shortcuts.
- Test vehicle input mapping independently from the physics implementation.
- Run a production build to catch asset paths and bundling errors.
- Use Playwright to verify that the game loads, the canvas is non-empty, the start button enters gameplay, pause works, and restart returns the car to a valid position.
- Manually test desktop keyboard controls and at least one mobile viewport.
- Check for WebGL context failures, missing assets, uncaught promise rejections, and excessive frame-time spikes.
- Profile before adding visual detail; target a stable 60 FPS on a typical desktop and acceptable degradation on mobile.

## Suggested Delivery Order

1. Vite setup and empty Three.js scene.
2. Track, car placeholder, and chase camera.
3. Keyboard driving with arcade physics.
4. Checkpoints, laps, timer, and finish state.
5. HUD, menus, pause, and restart.
6. Real models, materials, lighting, and audio.
7. Tests, responsive touch controls, and performance pass.
8. Optional AI opponents and additional content.

## Definition of Done for the MVP

- The game starts from a browser page without console errors.
- The player can drive, steer, brake, reverse, and recover from a stuck state.
- The track has ordered checkpoints and valid lap detection.
- The HUD shows live speed, lap, and time information.
- Pause, restart, and finish states work correctly.
- The production build succeeds.
- Focused automated tests cover the race rules.
- The game remains usable at desktop and mobile viewport sizes.
