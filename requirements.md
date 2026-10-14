# Car Racing Game Requirements

## 1. Product Goal

Create a browser-based 3D arcade racing game using HTML, CSS, JavaScript, and Three.js. A player must be able to start a race, drive a car around a closed track, complete valid laps, and finish the race while receiving clear visual and audio feedback.

## 2. Scope

### MVP Includes

- One playable car.
- One closed 3D track.
- A configurable lap count, defaulting to three laps.
- Keyboard controls and basic touch controls.
- Arcade-style acceleration, braking, steering, reverse, grip, and friction.
- Collision with track barriers and off-track slowdown.
- Ordered checkpoints and shortcut-resistant lap validation.
- Chase camera with reset behavior.
- Start menu, countdown, HUD, pause, restart, and finish results.
- Timer, lap counter, speed display, mute toggle, and placeholder audio.
- Responsive desktop and mobile presentation.

### Explicitly Out of MVP Scope

- Online multiplayer.
- AI opponents.
- Multiple tracks or cars.
- User accounts, leaderboards, or server persistence.
- Realistic motorsport simulation.
- Advanced progression, upgrades, or economy systems.

## 3. Users and Environment

- The primary user is a player using a modern desktop or mobile browser.
- The game must run in browsers with WebGL 2 support.
- The game must not require an account or network backend.
- Local development must use Vite; production must be deployable as static files.

## 4. Functional Requirements

### FR-01: Loading and Start

- The application must show a loading state while the renderer and required assets initialize.
- The start screen must provide a clear Play action and show the available controls.
- The game must handle WebGL or asset-loading failure with a readable recovery message.
- The first user interaction may initialize audio to comply with browser autoplay policies.

### FR-02: Vehicle Controls

- The player must control throttle, brake, steering, and reverse.
- `W`/Up must accelerate, `S`/Down must brake or reverse, and `A`/Left and `D`/Right must steer.
- Controls must be sampled independently from rendering so input remains reliable at different frame rates.
- Steering must become less aggressive at high speed.
- The vehicle must slow through drag and lateral grip when the player releases input.
- The vehicle must have a bounded reverse speed.
- `R` must return the vehicle to a valid recovery position.

### FR-03: Track and Collision

- The track must visibly contain road, boundaries, grass, barriers, a start/finish line, and checkpoints.
- The vehicle must collide with physical barriers instead of passing through them.
- Leaving the road must reduce grip or speed without making the vehicle permanently unusable.
- Visual scenery must not be required to have physics colliders.

### FR-04: Race Rules

- The race must enter a countdown before accepting active driving input.
- The player must pass checkpoints in order.
- A lap must count only after all checkpoints for that lap have been passed and the finish line is crossed.
- Invalid shortcut crossings must not advance the lap.
- The game must track current lap, elapsed race time, best lap time, and total finish time.
- The race must finish after the configured number of valid laps.

### FR-05: Game States

The application must support these states:

- `loading`
- `menu`
- `countdown`
- `racing`
- `paused`
- `finished`
- `error`

Only `racing` may apply vehicle movement from player input. `Escape` must pause and resume the race when the current state allows it.

### FR-06: Camera

- The default camera must follow behind and above the vehicle.
- Camera movement must be smoothed to avoid abrupt jumps.
- The camera must look ahead based on vehicle velocity or heading.
- A reset action must restore the vehicle and camera to a valid track position.

### FR-07: User Interface

During a race, the HUD must expose:

- Current speed.
- Current lap and total laps.
- Elapsed race time.
- Pause control.
- Mute state.

The UI must provide restart and resume actions where appropriate and must display a clear finish result.

### FR-08: Audio

- Audio must be muted and unmuted from the UI.
- Engine audio must respond to vehicle speed or throttle when enabled.
- Countdown, collision, tire, finish, and menu feedback may use placeholder sounds in the MVP.
- Audio failure must not prevent the game from running.

## 5. Non-Functional Requirements

### NFR-01: Performance

- Target a stable 60 FPS on a typical desktop with the MVP scene.
- Use a fixed physics timestep independent of render frame rate.
- Avoid rebuilding the entire HUD DOM on every frame.
- Use compressed GLB assets and texture sizes appropriate for the target device.
- Reuse temporary particle and effect objects through pooling where practical.

### NFR-02: Responsiveness

- The game must remain usable at desktop and mobile viewport sizes.
- The canvas must resize without stretching the scene or breaking pointer controls.
- Touch controls must have stable dimensions and adequate hit areas.

### NFR-03: Accessibility

- Menus and controls must use semantic HTML buttons and labels.
- Interactive controls must be keyboard reachable and visibly focused.
- Important status updates must not rely on color alone.
- The game must provide a mute option and avoid essential information in audio only.
- Motion and screen effects must be restrained enough not to obscure the HUD.

### NFR-04: Reliability

- Missing optional audio or visual assets must degrade gracefully.
- The app must not leave an unrecoverable race after a pause, reset, or invalid collision.
- Asset-loading and runtime errors must be logged during development and shown as actionable UI errors when they block play.

### NFR-05: Maintainability

- Race rules and vehicle calculations must be unit-testable without a WebGL canvas.
- Rendering, physics, input, UI, and audio responsibilities must remain separated.
- Game configuration values must be centralized instead of scattered through frame-loop code.

## 6. Acceptance Criteria

The MVP is accepted when all of the following are true:

1. A production build starts in a supported browser without uncaught initialization errors.
2. The player can accelerate, brake, reverse, steer, and recover the car.
3. The car collides with barriers and slows when off the road.
4. The start flow includes loading, menu, countdown, and racing states.
5. The HUD displays speed, lap, and elapsed time during a race.
6. Checkpoints must be crossed in order before a lap can complete.
7. Pause, resume, restart, mute, and finish actions work.
8. A three-lap race produces a finish result with a total time.
9. Unit tests cover checkpoint ordering, lap completion, timers, and reset behavior.
10. Browser smoke tests verify the canvas, start flow, pause, and restart behavior.
11. The layout remains usable at desktop and mobile viewport sizes.

## 7. Quality Gates by Milestone

- **Foundation**: Vite starts, Three.js renders, and resize handling works.
- **Driving**: The car responds consistently to keyboard input and can be reset.
- **Race**: Checkpoints, laps, timer, pause, and finish states pass focused tests.
- **Presentation**: HUD, menus, audio, and responsive controls are usable.
- **Release**: Production build, unit tests, browser smoke tests, and manual desktop/mobile checks pass.
