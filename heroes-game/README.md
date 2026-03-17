# Heroes of Might & Magic - Browser Game

A HoMM2-inspired turn-based strategy game built with React + Vite.

## Getting Started

```bash
npm install
npm run dev
```

## Controls

- **WASD / Arrow Keys** — Move hero
- **E / Enter** — End turn
- **T** — Enter town (when on castle tile)
- **Escape** — Close menus
- **Click** — Move to adjacent tile

## Features

- Procedurally generated adventure map with varied terrain
- Town management with 7 buildable structures
- Unit recruitment (Peasants → Paladins, 6 tiers)
- 4 resource types: Gold, Wood, Ore, Gems
- Turn-based tactical combat with initiative system
- Hero leveling with XP and stat progression
- Minimap, event log, and resource tracking

## Project Structure

```
src/
  main.jsx          # Entry point
  HeroesGame.jsx    # Main game component (all game logic)
```

## Extending the Game

Key areas to expand:
- **Multiple heroes** — Add hero hiring and army splitting
- **AI opponents** — Enemy hero movement and town management
- **Spells** — Magic system with mana and spell books
- **Map editor** — Custom map creation tool
- **Multiplayer** — Hot-seat or networked play
- **More factions** — Necropolis, Warlock, Sorceress, etc.
- **Pathfinding** — A* for click-to-move across the map
