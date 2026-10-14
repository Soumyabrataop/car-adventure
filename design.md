# Car Racing Game Design

## 1. Technical Decisions

- **Build tool**: Vite.
- **Language**: Modern vanilla JavaScript with ES modules.
- **Renderer**: Three.js and `WebGLRenderer`.
- **Physics**: Rapier3D for rigid-body collision and raycasts.
- **Driving model**: Custom arcade controller layered over physics rather than a full realistic wheel simulator.
- **Models**: GLB assets loaded with `GLTFLoader`; use `DRACOLoader` for compressed geometry.
- **Audio**: Howler.js, initialized after the first user gesture.
- **Unit tests**: Vitest.
- **Browser tests**: Playwright.
- **Debug tools**: lil-gui and optional physics/debug helpers in development only.

The game is a static web application. No server or account system is required for the MVP.

## 2. Architecture

```text
main.js
  Game
    GameState
    InputController
    PhysicsWorld
      Vehicle
      TrackColliders
    RaceManager
    CameraController
    AudioManager
    UI
    Renderer
```

The architecture has three boundaries:

1. **Domain**: race rules, timers, checkpoints, and vehicle tuning calculations. These modules should not import Three.js.
2. **Simulation**: Rapier bodies, raycasts, fixed-step updates, and synchronization between physics objects and visual entities.
3. **Presentation**: Three.js scene objects, DOM HUD, menus, audio, and effects.

The `Game` object coordinates these boundaries but should not contain detailed race rules or vehicle math.

## 3. Module Responsibilities

### `Game.js`

- Own the animation loop and application lifecycle.
- Create and connect the domain, simulation, and presentation modules.
- Route state changes to UI and input systems.
- Run fixed physics steps and render interpolation.

### `GameState.js`

- Define valid states and legal transitions.
- Expose the current state to input, UI, audio, and race systems.
- Prevent driving input while loading, paused, finished, or in error.

### `InputController.js`

- Normalize keyboard and touch input into a small control object:

```js
{
  throttle: 0,
  brake: 0,
  steering: 0,
  pausePressed: false,
  resetPressed: false
}
```

- Track held controls separately from one-shot actions.
- Prevent page scrolling for gameplay keys while the game has focus.

### `Vehicle.js`

- Own vehicle tuning values, input interpretation, and physics-body synchronization.
- Apply longitudinal acceleration, braking, drag, lateral grip, steering limits, and off-track modifiers.
- Expose speed, heading, grounded state, and transform data to the camera and HUD.
- Provide a reset method that restores position, rotation, and velocity.

### `Track.js`

- Create or load visual track content.
- Register static Rapier colliders for road boundaries and barriers.
- Own checkpoint definitions and the start/finish trigger.
- Expose spawn points and the last valid recovery point.

### `RaceManager.js`

- Own lap count, checkpoint index, race timer, lap times, and finish logic.
- Receive checkpoint and finish-line events from the track.
- Reject out-of-order checkpoints.
- Emit plain data events such as `lapCompleted`, `raceFinished`, and `raceUpdated`.

### `CameraController.js`

- Follow the vehicle with configurable distance, height, look-ahead, and smoothing.
- Use the fixed-step vehicle transform plus render interpolation.
- Avoid controlling race state or vehicle movement.

### `AudioManager.js`

- Load optional sound assets.
- Control mute state and engine-loop parameters.
- Treat audio errors as non-blocking.

### UI modules

- `Menu`: loading, start, pause, finish, and error views.
- `Hud`: speed, lap, timer, mute, and pause controls.
- `Controls`: touch input buttons and control focus behavior.

## 4. Scene Layout

```text
Scene
  World
    Sky/Fog
    TrackVisuals
    StaticScenery
    StartGrid
    CheckpointMarkers (debug or subtle visual)
  Dynamic
    PlayerCar
      CarBody
      Wheels
      Effects
  Lights
  Debug (development only)
```

Visual scenery and colliders must be separate. A detailed tree or building should not automatically create an expensive physics body.

## 5. Domain Data

### Vehicle configuration

```js
{
  mass: 1200,
  maxSpeed: 42,
  reverseSpeed: 10,
  acceleration: 18,
  braking: 28,
  steeringRate: 2.2,
  lateralGrip: 7,
  rollingDrag: 1.4,
  offTrackGrip: 0.35
}
```

Values are starting points and must be tuned through playtesting. Keep them in one configuration object so debug controls and tests can change them.

### Checkpoint

```js
{
  id: 0,
  position: { x: 0, y: 0, z: 0 },
  width: 8,
  depth: 4
}
```

The `RaceManager` stores the next required checkpoint index. Crossing any other checkpoint has no lap-progress effect.

### Race state

```js
{
  state: 'racing',
  currentLap: 1,
  totalLaps: 3,
  nextCheckpoint: 0,
  elapsedTime: 0,
  lastLapTime: null,
  bestLapTime: null,
  finishTime: null
}
```

State updates should be immutable plain data or controlled mutations behind a small API so they can be tested without a renderer.

## 6. Update Loop

Use a fixed physics timestep with an accumulator:

```text
frameDelta = clamp(clock delta, 0, max frame delta)
accumulator += frameDelta

while accumulator >= fixedStep:
  input = inputController.sample()
  vehicle.applyInput(input, fixedStep)
  physicsWorld.step()
  vehicle.syncFromPhysics()
  track.detectRaceTriggers(vehicle)
  raceManager.update(fixedStep)
  accumulator -= fixedStep

alpha = accumulator / fixedStep
camera.update(vehicle.previousTransform, vehicle.transform, alpha)
hud.update(raceManager.snapshot(), vehicle.snapshot())
renderer.render(scene, camera)
```

Use a maximum frame delta so a tab switch or debugger pause cannot produce a dangerous burst of physics steps. Keep DOM updates out of the physics loop and avoid loading assets inside either loop.

## 7. State Transitions

```text
loading -> menu -> countdown -> racing -> finished
                         |          |
                         v          v
                       paused <-----+
                         |
                         v
                       racing
```

- `loading` moves to `menu` after required assets are ready.
- `menu` starts `countdown` when Play is activated.
- `countdown` moves to `racing` after the countdown completes.
- `racing` moves to `paused` through Escape or the pause button.
- `paused` returns to `racing` through Resume or returns to `menu` through Restart.
- `racing` moves to `finished` after the final valid lap.
- Any blocking initialization failure moves to `error`.

## 8. Physics and Driving

Use Rapier for collision response and ground/barrier queries, but calculate the driving feel explicitly:

1. Convert the vehicle's forward and right directions into world vectors.
2. Project velocity onto those directions.
3. Apply throttle and brake along the forward axis.
4. Apply drag to forward velocity and lateral grip to sideways velocity.
5. Scale steering by current forward speed.
6. Apply an off-track modifier when the vehicle is outside the road surface.
7. Clamp forward and reverse speeds.
8. Step Rapier and copy the resulting transform to the Three.js model.

This approach provides controllable arcade handling without coupling lap rules to rigid-body details.

## 9. Asset Loading

- Load required car and track assets through a shared loading manager.
- Show progress in the loading UI.
- Treat audio and optional polish assets as non-blocking.
- Keep model paths centralized in an asset manifest.
- Dispose of geometries, materials, textures, and audio nodes when a scene is replaced.
- Start with primitive geometry if final assets are not ready; the game must remain playable during development.

## 10. UI and Audio Design

The HUD is a semantic HTML layer positioned over the canvas. Three.js is responsible for the world, not essential text.

- Use stable HUD regions for speed, lap, timer, and actions.
- Update values only when their displayed value changes or at a small fixed UI rate.
- Use buttons for pause, restart, mute, and touch controls.
- Keep focus visible and preserve keyboard access through menus.
- Start Howler audio after Play; engine sound volume and rate follow vehicle speed.
- Mute must immediately silence all active sounds and persist for the current session.

## 11. Testing Design

### Unit tests

- Checkpoint progression accepts only the expected checkpoint.
- Finish-line crossing without all checkpoints does not complete a lap.
- A valid lap increments the lap count and records a lap time.
- The final valid lap transitions to `finished`.
- Pause stops race-time progression and movement input.
- Reset restores a valid vehicle transform and clears velocity.
- Vehicle input calculations respect speed and reverse limits.

### Browser tests

- The page loads and contains a visible canvas.
- Play transitions from menu to countdown and then racing.
- HUD values appear during gameplay.
- Pause and resume work.
- Restart returns to a clean starting state.
- A mobile viewport does not cause layout overflow or hidden primary controls.

## 12. Performance and Debugging

- Use frustum culling and low-detail materials for distant scenery.
- Keep shadow maps modest and disable expensive effects on small screens if necessary.
- Reuse particle objects and avoid allocations inside the fixed update loop.
- Add development-only FPS, physics collider, axes, and vehicle-tuning panels.
- Record frame time and physics-step counts when investigating performance.
- Remove or tree-shake development tools from production builds.

## 13. Implementation Order

1. Vite shell, renderer, resize handling, and empty scene.
2. Domain race manager and tests.
3. Track primitives, colliders, checkpoints, and spawn point.
4. Vehicle physics, input, and chase camera.
5. State transitions, HUD, pause, restart, and finish flow.
6. GLB assets, audio, effects, and responsive touch controls.
7. Playwright smoke tests and performance pass.
