# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of three browser-based RPG games built with different approaches:
- **heroes-game** — Heroes of Might & Magic 2-inspired strategy game (React + Vite)
- **realms-of-shadow** — Turn-based fantasy dungeon crawler (React + Vite)
- **rpg.html** — Standalone canvas-based dungeon crawler (vanilla JS, no build step)

## Development Commands

Each React project is independent with its own node_modules:

```bash
# Heroes Game (React 18.3, Vite 6)
cd heroes-game && npm install && npm run dev

# Realms of Shadow (React 18.2, Vite 5)
cd realms-of-shadow && npm install && npm run dev
```

Production builds: `npm run build` / `npm run preview` in each project directory.

`rpg.html` runs directly in a browser with no build step.

No test runner, linter, or TypeScript is configured in any project.

## Architecture

All three games follow a **monolithic single-file** pattern — each game's entire logic lives in one file:

- `heroes-game/src/HeroesGame.jsx` — ~845 lines, all game state via React hooks
- `realms-of-shadow/src/App.jsx` — ~746 lines, all game state via React hooks
- `rpg.html` — ~938 lines, vanilla JS with canvas rendering

Entry points (`main.jsx`) just mount the root component. No shared code, utilities, or component libraries exist between projects. All styling is inline React styles. UI uses emoji for icons.
