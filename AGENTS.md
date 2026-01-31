# Repository Guidelines

## Project Structure & Module Organization
This repository is a small, static Three.js demo.
- `index.html`: HTML shell, UI markup, and inline styles.
- `main.js`: All simulation logic, rendering setup, and interaction handlers.
- External dependency: Three.js is loaded via CDN in `index.html`.

## Build, Test, and Development Commands
There is no build step. Serve the folder locally to avoid browser file restrictions.
- `python3 -m http.server 8080`: start a local web server.
- Open `http://localhost:8080/index.html` in a browser to run the simulator.

## Coding Style & Naming Conventions
- Indentation: 4 spaces, no tabs.
- JavaScript uses `camelCase` for variables/functions and `PascalCase` for classes (`Pig`, `Dog`).
- Keep top-level state in module scope (`scene`, `camera`, `pigs`) and prefer small helpers (`createBarn`, `updateUI`).
- Avoid adding new dependencies unless necessary; this is a CDN-first setup.

## Testing Guidelines
No automated tests are present. When making changes:
- Manually validate by running the simulator and checking interactions (add animals, feed, toggle time, petting).
- If adding tests, document how to run them here.

## Commit & Pull Request Guidelines
Recent commits use short, descriptive messages with an optional `Fix:` prefix (e.g., `Fix: Remove OrbitControls dependency`).
- Keep commit subjects in imperative present tense.
- PRs should include a concise summary, key behavior changes, and screenshots or a short screen recording for UI/visual updates.

## Configuration & Asset Notes
- Any new assets should live alongside `index.html` or in a new `/assets` folder; update paths accordingly.
- If you change the Three.js version or CDN, verify the loading fallback and initial render.
