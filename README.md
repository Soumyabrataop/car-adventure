# Night Circuit

Night Circuit is a browser-based 3D arcade racing prototype built with vanilla JavaScript, Three.js, and Vite.

## Features

- Procedural oval racing track with road markings, barriers, grass, and start grid.
- Arcade driving with acceleration, braking, steering, reverse, grip, and drag.
- Keyboard and touch controls.
- Countdown, ordered checkpoints, lap timing, pause, restart, and finish states.
- Responsive HUD for speed, lap progress, and race time.

## Requirements

- Node.js 20 or newer
- A modern browser with WebGL 2 support

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use `WASD` or the arrow keys to drive, `R` to reset, and `Escape` to pause.

## Validation

```bash
npm test
npm run build
```

The tests cover checkpoint ordering, lap completion, and race finishing. The production build outputs to `dist/`.

## Deployment

The app is currently available through a temporary Vercel deployment:

**Deployment URL:** https://temporary-fast-breeze-16tv8rg.vercel.app

This anonymous deployment expires after 60 minutes. Run `vercel login` and then
`npx vercel --prod` to create a permanent project deployment.

Vercel detects the Vite project automatically. To deploy from the repository with the Vercel CLI:

```bash
npx vercel --prod
```

Use the project root as the Vercel root directory. The build command is `npm run build`, and the output directory is `dist`.

## Project Structure

```text
src/
	main.js
	style.css
	game/
		InputController.js
		RaceManager.js
		Track.js
		Vehicle.js
index.html
plan.md
requirements.md
design.md
```