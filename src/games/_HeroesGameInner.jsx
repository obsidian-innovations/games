import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── Constants & Config ────────────────────────────────────────
const TILE = 48;
const MAP_W = 20;
const MAP_H = 14;
const TERRAIN = { GRASS: 0, WATER: 1, FOREST: 2, MOUNTAIN: 3, ROAD: 4, SAND: 5 };
const TERRAIN_COLORS = {
  [TERRAIN.GRASS]: "#4a7c3f",
  [TERRAIN.WATER]: "#2a5c8f",
  [TERRAIN.FOREST]: "#2d5a27",
  [TERRAIN.MOUNTAIN]: "#6b6b6b",
  [TERRAIN.ROAD]: "#8b7355",
  [TERRAIN.SAND]: "#c4a96a",
};
const TERRAIN_ICONS = {
  [TERRAIN.FOREST]: "🌲",
  [TERRAIN.MOUNTAIN]: "⛰️",
  [TERRAIN.WATER]: "🌊",
};

const RESOURCES = ["gold", "wood", "ore", "gems"];
const RESOURCE_ICONS = { gold: "💰", wood: "🪵", ore: "⛏️", gems: "💎" };

const UNIT_TYPES = {
  peasant:    { name: "Peasant",    atk: 1,  def: 1,  hp: 3,   dmg: [1,1],  spd: 3,  cost: { gold: 20 },  icon: "👨‍🌾", tier: 1 },
  archer:     { name: "Archer",     atk: 5,  def: 3,  hp: 10,  dmg: [2,3],  spd: 4,  cost: { gold: 150 }, icon: "🏹", tier: 2 },
  griffon:    { name: "Griffin",    atk: 8,  def: 8,  hp: 25,  dmg: [3,6],  spd: 6,  cost: { gold: 300 }, icon: "🦅", tier: 3 },
  swordsman:  { name: "Swordsman",  atk: 10, def: 12, hp: 35,  dmg: [6,9],  spd: 5,  cost: { gold: 400 }, icon: "⚔️", tier: 4 },
  cavalier:   { name: "Cavalier",   atk: 15, def: 15, hp: 60,  dmg: [10,14],spd: 7,  cost: { gold: 600 }, icon: "🐴", tier: 5 },
  paladin:    { name: "Paladin",    atk: 17, def: 18, hp: 80,  dmg: [15,20],spd: 8,  cost: { gold: 900 }, icon: "🛡️", tier: 6 },
  skeleton:   { name: "Skeleton",   atk: 4,  def: 3,  hp: 6,   dmg: [1,3],  spd: 4,  cost: { gold: 75 },  icon: "💀", tier: 1 },
  zombie:     { name: "Zombie",     atk: 5,  def: 2,  hp: 20,  dmg: [2,3],  spd: 3,  cost: { gold: 150 }, icon: "🧟", tier: 2 },
  vampire:    { name: "Vampire",    atk: 10, def: 9,  hp: 30,  dmg: [5,8],  spd: 6,  cost: { gold: 500 }, icon: "🧛", tier: 4 },
  dragon:     { name: "Dragon",     atk: 22, def: 22, hp: 200, dmg: [25,50],spd: 11, cost: { gold: 3000 },icon: "🐉", tier: 7 },
};

const ENEMY_ARMIES = [
  [{ type: "skeleton", count: 8 }, { type: "zombie", count: 4 }],
  [{ type: "skeleton", count: 15 }, { type: "vampire", count: 2 }],
  [{ type: "zombie", count: 10 }, { type: "vampire", count: 5 }],
  [{ type: "skeleton", count: 20 }, { type: "zombie", count: 8 }, { type: "vampire", count: 3 }],
  [{ type: "dragon", count: 1 }],
];

const BUILDINGS = {
  tavern:     { name: "Tavern",     cost: { gold: 500, wood: 5 },  icon: "🍺", desc: "+1 morale", built: false },
  guardhouse: { name: "Guardhouse", cost: { gold: 200, wood: 5 },  icon: "🏠", desc: "Recruit Peasants", recruits: "peasant" },
  archery:    { name: "Archery",    cost: { gold: 1000, wood: 10 }, icon: "🎯", desc: "Recruit Archers", recruits: "archer" },
  griffinTower:{name: "Griffin Tower",cost:{ gold: 2000, ore: 10 }, icon: "🗼", desc: "Recruit Griffins", recruits: "griffon" },
  barracks:   { name: "Barracks",   cost: { gold: 3000, ore: 15, wood: 10 }, icon: "⚒️", desc: "Recruit Swordsmen", recruits: "swordsman" },
  jousting:   { name: "Jousting",   cost: { gold: 4000, ore: 20 }, icon: "🏇", desc: "Recruit Cavaliers", recruits: "cavalier" },
  cathedral:  { name: "Cathedral",  cost: { gold: 6000, ore: 20, gems: 10 }, icon: "⛪", desc: "Recruit Paladins", recruits: "paladin" },
};

// ─── Map Generation ────────────────────────────────────────────
function generateMap() {
  const map = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => TERRAIN.GRASS)
  );
  // Water bodies
  for (let i = 0; i < 3; i++) {
    const cx = 3 + Math.floor(Math.random() * (MAP_W - 6));
    const cy = 3 + Math.floor(Math.random() * (MAP_H - 6));
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -2; dx <= 2; dx++)
        if (cy+dy >= 0 && cy+dy < MAP_H && cx+dx >= 0 && cx+dx < MAP_W && Math.random() > 0.2)
          map[cy+dy][cx+dx] = TERRAIN.WATER;
  }
  // Forests
  for (let i = 0; i < 25; i++) {
    const x = Math.floor(Math.random() * MAP_W);
    const y = Math.floor(Math.random() * MAP_H);
    if (map[y][x] === TERRAIN.GRASS) map[y][x] = TERRAIN.FOREST;
  }
  // Mountains
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(Math.random() * MAP_W);
    const y = Math.floor(Math.random() * MAP_H);
    if (map[y][x] === TERRAIN.GRASS) map[y][x] = TERRAIN.MOUNTAIN;
  }
  // Sand patches
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(Math.random() * MAP_W);
    const y = Math.floor(Math.random() * MAP_H);
    if (map[y][x] === TERRAIN.GRASS) map[y][x] = TERRAIN.SAND;
  }
  // Clear spawn area
  for (let dy = 0; dy < 3; dy++)
    for (let dx = 0; dx < 3; dx++)
      map[dy][dx] = TERRAIN.GRASS;
  return map;
}

function generateMapObjects(map) {
  const objects = [];
  const occupied = new Set(["0,0", "1,0", "0,1"]);

  // Resource pickups
  for (let i = 0; i < 12; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * MAP_W);
      y = Math.floor(Math.random() * MAP_H);
    } while (map[y][x] === TERRAIN.WATER || map[y][x] === TERRAIN.MOUNTAIN || occupied.has(`${x},${y}`));
    occupied.add(`${x},${y}`);
    const res = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    const amt = res === "gold" ? 200 + Math.floor(Math.random() * 500) : 2 + Math.floor(Math.random() * 6);
    objects.push({ type: "resource", x, y, resource: res, amount: amt, id: `res-${i}` });
  }

  // Enemy encounters
  for (let i = 0; i < 6; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * MAP_W);
      y = Math.floor(Math.random() * MAP_H);
    } while (map[y][x] === TERRAIN.WATER || map[y][x] === TERRAIN.MOUNTAIN || occupied.has(`${x},${y}`));
    occupied.add(`${x},${y}`);
    objects.push({
      type: "enemy",
      x, y,
      army: ENEMY_ARMIES[Math.min(i, ENEMY_ARMIES.length - 1)].map(u => ({ ...u })),
      id: `enemy-${i}`,
      icon: "☠️",
    });
  }

  // Treasure chests
  for (let i = 0; i < 4; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * MAP_W);
      y = Math.floor(Math.random() * MAP_H);
    } while (map[y][x] === TERRAIN.WATER || map[y][x] === TERRAIN.MOUNTAIN || occupied.has(`${x},${y}`));
    occupied.add(`${x},${y}`);
    objects.push({ type: "chest", x, y, gold: 500 + Math.floor(Math.random() * 1000), id: `chest-${i}` });
  }

  return objects;
}

// ─── Combat Logic ──────────────────────────────────────────────
function rollDamage(unit, count) {
  const [lo, hi] = unit.dmg;
  let total = 0;
  for (let i = 0; i < count; i++) total += lo + Math.floor(Math.random() * (hi - lo + 1));
  return total;
}

function runCombat(playerArmy, enemyArmy) {
  const log = [];
  const pa = playerArmy.map(s => ({ ...s, stats: UNIT_TYPES[s.type], currentHp: UNIT_TYPES[s.type].hp * s.count, side: "player" }));
  const ea = enemyArmy.map(s => ({ ...s, stats: UNIT_TYPES[s.type], currentHp: UNIT_TYPES[s.type].hp * s.count, side: "enemy" }));

  const allUnits = [...pa, ...ea].sort((a, b) => b.stats.spd - a.stats.spd);
  let round = 0;

  while (pa.some(u => u.currentHp > 0) && ea.some(u => u.currentHp > 0) && round < 30) {
    round++;
    log.push(`── Round ${round} ──`);

    for (const attacker of allUnits) {
      if (attacker.currentHp <= 0) continue;
      const targets = attacker.side === "player" ? ea : pa;
      const alive = targets.filter(t => t.currentHp > 0);
      if (alive.length === 0) break;

      const target = alive[Math.floor(Math.random() * alive.length)];
      const atkBonus = attacker.stats.atk - target.stats.def;
      const livingCount = Math.ceil(attacker.currentHp / attacker.stats.hp);
      let dmg = rollDamage(attacker.stats, livingCount);
      dmg = Math.max(1, Math.round(dmg * (1 + atkBonus * 0.05)));
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const remaining = Math.ceil(target.currentHp / target.stats.hp);

      log.push(`${attacker.stats.icon} ${attacker.stats.name} (${livingCount}) → ${target.stats.icon} ${target.stats.name} for ${dmg} dmg${target.currentHp <= 0 ? " 💥 DESTROYED" : ` (${remaining} left)`}`);
    }
  }

  const won = pa.some(u => u.currentHp > 0);
  const surviving = pa.filter(u => u.currentHp > 0).map(u => ({
    type: u.type,
    count: Math.ceil(u.currentHp / u.stats.hp),
  }));

  return { won, log, surviving };
}

// ─── Components ────────────────────────────────────────────────

function ResourceBar({ resources }) {
  return (
    <div style={{
      display: "flex", gap: 16, padding: "6px 16px",
      background: "linear-gradient(180deg, #2a1a0a 0%, #1a0e04 100%)",
      borderBottom: "2px solid #8b6914",
      fontFamily: "'Cinzel', serif",
      fontSize: 13, color: "#e8d5a3",
    }}>
      {RESOURCES.map(r => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 16 }}>{RESOURCE_ICONS[r]}</span>
          <span style={{ color: "#ffd700", fontWeight: 700 }}>{resources[r]}</span>
        </div>
      ))}
    </div>
  );
}

function MiniMap({ map, hero, objects }) {
  const scale = 4;
  return (
    <div style={{
      border: "2px solid #8b6914",
      borderRadius: 4,
      overflow: "hidden",
      width: MAP_W * scale,
      height: MAP_H * scale,
      position: "relative",
      flexShrink: 0,
    }}>
      {map.map((row, y) => row.map((t, x) => (
        <div key={`${x}-${y}`} style={{
          position: "absolute", left: x * scale, top: y * scale,
          width: scale, height: scale,
          background: TERRAIN_COLORS[t],
        }} />
      )))}
      {objects.map(o => (
        <div key={o.id} style={{
          position: "absolute", left: o.x * scale, top: o.y * scale,
          width: scale, height: scale,
          background: o.type === "enemy" ? "#ff0000" : o.type === "resource" ? "#ffff00" : "#ff8800",
          borderRadius: "50%",
        }} />
      ))}
      <div style={{
        position: "absolute", left: hero.x * scale - 1, top: hero.y * scale - 1,
        width: scale + 2, height: scale + 2,
        background: "#00ff00", borderRadius: "50%",
        boxShadow: "0 0 4px #00ff00",
      }} />
    </div>
  );
}

function TownScreen({ town, resources, onBuild, onRecruit, onClose }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel', serif",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a0e04 0%, #2d1a0a 50%, #1a0e04 100%)",
        border: "3px solid #8b6914",
        borderRadius: 12,
        padding: 24,
        width: 640,
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 0 60px rgba(139,105,20,0.4)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: "#ffd700", margin: 0, fontSize: 22, textShadow: "0 2px 8px rgba(255,215,0,0.3)" }}>🏰 Castle Town</h2>
          <button onClick={onClose} style={{
            background: "#8b2020", color: "#fff", border: "2px solid #cc4444",
            borderRadius: 6, padding: "4px 14px", cursor: "pointer",
            fontFamily: "'Cinzel', serif", fontSize: 13,
          }}>Close ✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(BUILDINGS).map(([key, b]) => {
            const isBuilt = town.buildings.includes(key);
            const canAfford = Object.entries(b.cost).every(([r, c]) => resources[r] >= c);
            return (
              <div key={key} style={{
                background: isBuilt ? "rgba(40,80,40,0.4)" : "rgba(30,20,10,0.6)",
                border: `1px solid ${isBuilt ? "#4a8b4a" : "#5a4020"}`,
                borderRadius: 8, padding: 12,
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon} <span style={{ color: "#e8d5a3", fontSize: 14 }}>{b.name}</span></div>
                <div style={{ color: "#a89060", fontSize: 11, marginBottom: 6 }}>{b.desc}</div>
                {!isBuilt ? (
                  <div>
                    <div style={{ color: "#888", fontSize: 10, marginBottom: 4 }}>
                      {Object.entries(b.cost).map(([r, c]) => `${RESOURCE_ICONS[r]}${c}`).join("  ")}
                    </div>
                    <button disabled={!canAfford} onClick={() => onBuild(key)} style={{
                      background: canAfford ? "linear-gradient(180deg, #5a8a2a, #3a6a1a)" : "#333",
                      color: canAfford ? "#fff" : "#666",
                      border: `1px solid ${canAfford ? "#6a9a3a" : "#444"}`,
                      borderRadius: 4, padding: "3px 12px", cursor: canAfford ? "pointer" : "default",
                      fontFamily: "'Cinzel', serif", fontSize: 11,
                    }}>Build</button>
                  </div>
                ) : b.recruits ? (
                  <div>
                    <span style={{ color: "#aaa", fontSize: 11 }}>
                      {UNIT_TYPES[b.recruits].icon} {UNIT_TYPES[b.recruits].name} — {RESOURCE_ICONS.gold}{UNIT_TYPES[b.recruits].cost.gold}
                    </span>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {[1, 5, 10].map(n => (
                        <button key={n} onClick={() => onRecruit(b.recruits, n)} style={{
                          background: "linear-gradient(180deg, #2a5a8a, #1a3a5a)",
                          color: "#cde", border: "1px solid #3a6a9a",
                          borderRadius: 4, padding: "2px 8px", cursor: "pointer",
                          fontFamily: "'Cinzel', serif", fontSize: 10,
                        }}>+{n}</button>
                      ))}
                    </div>
                  </div>
                ) : <span style={{ color: "#5a5", fontSize: 11 }}>✓ Built</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CombatScreen({ playerArmy, enemyArmy, onFinish }) {
  const [log, setLog] = useState(null);
  const [result, setResult] = useState(null);
  const logRef = useRef(null);

  const startCombat = () => {
    const res = runCombat(playerArmy, enemyArmy);
    setLog(res.log);
    setResult(res);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel', serif",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a0a 100%)",
        border: "3px solid #8b2020",
        borderRadius: 12, padding: 24, width: 580,
        boxShadow: "0 0 60px rgba(139,32,32,0.4)",
      }}>
        <h2 style={{ color: "#ff4444", margin: "0 0 16px", fontSize: 20, textAlign: "center", textShadow: "0 0 10px rgba(255,0,0,0.5)" }}>⚔️ BATTLE ⚔️</h2>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ color: "#6af", fontSize: 12, marginBottom: 6 }}>Your Army</div>
            {playerArmy.map((s, i) => (
              <div key={i} style={{ color: "#aac", fontSize: 12 }}>
                {UNIT_TYPES[s.type].icon} {UNIT_TYPES[s.type].name} ×{s.count}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#f66", fontSize: 12, marginBottom: 6 }}>Enemy</div>
            {enemyArmy.map((s, i) => (
              <div key={i} style={{ color: "#caa", fontSize: 12 }}>
                {UNIT_TYPES[s.type].icon} {UNIT_TYPES[s.type].name} ×{s.count}
              </div>
            ))}
          </div>
        </div>

        {!log ? (
          <div style={{ textAlign: "center" }}>
            <button onClick={startCombat} style={{
              background: "linear-gradient(180deg, #8b2020, #5a1010)",
              color: "#fff", border: "2px solid #bb4444",
              borderRadius: 8, padding: "10px 40px", cursor: "pointer",
              fontFamily: "'Cinzel', serif", fontSize: 16,
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}>⚔️ Fight!</button>
          </div>
        ) : (
          <div>
            <div ref={logRef} style={{
              background: "#0a0a0a", border: "1px solid #333",
              borderRadius: 6, padding: 10, maxHeight: 200, overflow: "auto",
              fontFamily: "monospace", fontSize: 11, color: "#ccc",
              lineHeight: 1.6,
            }}>
              {log.map((l, i) => (
                <div key={i} style={{
                  color: l.startsWith("──") ? "#888" : l.includes("DESTROYED") ? "#ff4444" : "#ddd",
                  fontWeight: l.startsWith("──") ? 700 : 400,
                }}>{l}</div>
              ))}
            </div>
            <div style={{
              textAlign: "center", marginTop: 16,
              color: result.won ? "#4f4" : "#f44",
              fontSize: 20, fontWeight: 700,
              textShadow: result.won ? "0 0 10px rgba(0,255,0,0.5)" : "0 0 10px rgba(255,0,0,0.5)",
            }}>
              {result.won ? "🎉 VICTORY!" : "💀 DEFEAT..."}
            </div>
            {result.won && result.surviving.length > 0 && (
              <div style={{ textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 4 }}>
                Survivors: {result.surviving.map(s => `${UNIT_TYPES[s.type].icon}×${s.count}`).join(" ")}
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => onFinish(result)} style={{
                background: "linear-gradient(180deg, #2a5a2a, #1a3a1a)",
                color: "#cfc", border: "2px solid #4a8a4a",
                borderRadius: 6, padding: "6px 24px", cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontSize: 13,
              }}>Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Game ─────────────────────────────────────────────────
export default function HeroesGame() {
  const [map] = useState(() => generateMap());
  const [objects, setObjects] = useState(() => generateMapObjects(map));
  const [hero, setHero] = useState({ x: 1, y: 1, movement: 12, maxMovement: 12, level: 1, xp: 0, atk: 2, def: 2 });
  const [army, setArmy] = useState([
    { type: "peasant", count: 20 },
    { type: "archer", count: 6 },
  ]);
  const [resources, setResources] = useState({ gold: 2000, wood: 10, ore: 5, gems: 2 });
  const [town, setTown] = useState({ buildings: ["guardhouse"], x: 0, y: 0 });
  const [day, setDay] = useState(1);
  const [showTown, setShowTown] = useState(false);
  const [combat, setCombat] = useState(null);
  const [messages, setMessages] = useState(["Welcome, Hero! Explore the land, gather resources, and build your army."]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  const addMsg = useCallback((m) => setMessages(prev => [...prev.slice(-30), m]), []);

  const isPassable = useCallback((x, y) => {
    if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
    const t = map[y][x];
    return t !== TERRAIN.WATER && t !== TERRAIN.MOUNTAIN;
  }, [map]);

  const movementCost = useCallback((x, y) => {
    const t = map[y][x];
    if (t === TERRAIN.FOREST) return 2;
    if (t === TERRAIN.SAND) return 2;
    if (t === TERRAIN.ROAD) return 0.5;
    return 1;
  }, [map]);

  const moveHero = useCallback((dx, dy) => {
    if (showTown || combat) return;
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (!isPassable(nx, ny)) return;
    const cost = movementCost(nx, ny);
    if (hero.movement < cost) {
      addMsg("No movement left! End your turn.");
      return;
    }
    setHero(h => ({ ...h, x: nx, y: ny, movement: h.movement - cost }));

    // Check map objects
    const obj = objects.find(o => o.x === nx && o.y === ny);
    if (obj) {
      if (obj.type === "resource") {
        setResources(r => ({ ...r, [obj.resource]: r[obj.resource] + obj.amount }));
        addMsg(`Found ${RESOURCE_ICONS[obj.resource]} ${obj.amount} ${obj.resource}!`);
        setObjects(prev => prev.filter(o => o.id !== obj.id));
      } else if (obj.type === "chest") {
        setResources(r => ({ ...r, gold: r.gold + obj.gold }));
        addMsg(`Opened chest: 💰 ${obj.gold} gold!`);
        setObjects(prev => prev.filter(o => o.id !== obj.id));
      } else if (obj.type === "enemy") {
        setCombat({ enemy: obj });
      }
    }

    // Town
    if (nx === town.x && ny === town.y) {
      setShowTown(true);
    }
  }, [hero, showTown, combat, isPassable, movementCost, objects, town, addMsg]);

  const endTurn = useCallback(() => {
    if (combat || showTown) return;
    setDay(d => d + 1);
    setHero(h => ({ ...h, movement: h.maxMovement }));
    // Daily income
    setResources(r => ({
      ...r,
      gold: r.gold + 500,
      wood: r.wood + 2,
      ore: r.ore + 1,
    }));
    addMsg(`Day ${day + 1} begins. +500💰 +2🪵 +1⛏️`);
  }, [combat, showTown, day, addMsg]);

  useEffect(() => {
    const handler = (e) => {
      const keyMap = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
        W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        moveHero(...keyMap[e.key]);
      }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        e.preventDefault();
        endTurn();
      }
      if (e.key === "t" || e.key === "T") {
        if (hero.x === town.x && hero.y === town.y) setShowTown(true);
      }
      if (e.key === "Escape") {
        setShowTown(false);
        setSelectedTile(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveHero, endTurn, hero, town]);

  // Camera follow
  useEffect(() => {
    const viewW = Math.min(MAP_W, 16);
    const viewH = Math.min(MAP_H, 12);
    setCameraX(Math.max(0, Math.min(hero.x - Math.floor(viewW / 2), MAP_W - viewW)));
    setCameraY(Math.max(0, Math.min(hero.y - Math.floor(viewH / 2), MAP_H - viewH)));
  }, [hero.x, hero.y]);

  const handleBuild = (key) => {
    const b = BUILDINGS[key];
    const canAfford = Object.entries(b.cost).every(([r, c]) => resources[r] >= c);
    if (!canAfford) return;
    setResources(r => {
      const nr = { ...r };
      Object.entries(b.cost).forEach(([res, c]) => nr[res] -= c);
      return nr;
    });
    setTown(t => ({ ...t, buildings: [...t.buildings, key] }));
    addMsg(`Built ${b.icon} ${b.name}!`);
  };

  const handleRecruit = (unitType, count) => {
    const unit = UNIT_TYPES[unitType];
    const totalCost = unit.cost.gold * count;
    if (resources.gold < totalCost) {
      addMsg("Not enough gold!");
      return;
    }
    setResources(r => ({ ...r, gold: r.gold - totalCost }));
    setArmy(a => {
      const existing = a.find(s => s.type === unitType);
      if (existing) return a.map(s => s.type === unitType ? { ...s, count: s.count + count } : s);
      return [...a, { type: unitType, count }];
    });
    addMsg(`Recruited ${count}× ${unit.icon} ${unit.name}!`);
  };

  const handleCombatFinish = (result) => {
    if (result.won) {
      setArmy(result.surviving);
      setObjects(prev => prev.filter(o => o.id !== combat.enemy.id));
      const xpGain = 50 + Math.floor(Math.random() * 50);
      const goldReward = 100 + Math.floor(Math.random() * 300);
      setHero(h => {
        const newXp = h.xp + xpGain;
        const levelUp = newXp >= h.level * 100;
        if (levelUp) addMsg(`⬆️ Hero leveled up to ${h.level + 1}!`);
        return {
          ...h,
          xp: levelUp ? newXp - h.level * 100 : newXp,
          level: levelUp ? h.level + 1 : h.level,
          atk: levelUp ? h.atk + 1 : h.atk,
          def: levelUp ? h.def + 1 : h.def,
        };
      });
      setResources(r => ({ ...r, gold: r.gold + goldReward }));
      addMsg(`Victory! +${xpGain} XP, +${goldReward} 💰`);
    } else {
      addMsg("Your hero was defeated... But the adventure continues!");
      setArmy([{ type: "peasant", count: 10 }]);
      setHero(h => ({ ...h, x: town.x, y: town.y, movement: 0 }));
    }
    setCombat(null);
  };

  const handleTileClick = (x, y) => {
    const dx = x - hero.x;
    const dy = y - hero.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      moveHero(dx, dy);
    } else if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
      moveHero(dx, dy);
    }
  };

  const viewW = Math.min(MAP_W, 16);
  const viewH = Math.min(MAP_H, 12);

  const visibleTiles = useMemo(() => {
    const tiles = [];
    for (let vy = 0; vy < viewH; vy++) {
      for (let vx = 0; vx < viewW; vx++) {
        const mx = cameraX + vx;
        const my = cameraY + vy;
        if (mx >= MAP_W || my >= MAP_H) continue;
        tiles.push({ vx, vy, mx, my, terrain: map[my][mx] });
      }
    }
    return tiles;
  }, [cameraX, cameraY, viewW, viewH, map]);

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "linear-gradient(180deg, #0a0a12 0%, #141420 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Cinzel', serif",
      overflow: "hidden",
      userSelect: "none",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 16px",
        background: "linear-gradient(180deg, #1a0e04 0%, #2d1a0a 100%)",
        borderBottom: "3px solid #8b6914",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 20 }}>🏰</span>
          <span style={{ color: "#ffd700", fontSize: 16, fontWeight: 900, letterSpacing: 2, textShadow: "0 2px 8px rgba(255,215,0,0.3)" }}>
            HEROES
          </span>
        </div>
        <div style={{ color: "#e8d5a3", fontSize: 13 }}>
          📅 Day {day} &nbsp;|&nbsp; 🧙 Lv.{hero.level} &nbsp;|&nbsp; ⚔️{hero.atk} 🛡️{hero.def} &nbsp;|&nbsp; 🏃 {Math.floor(hero.movement)}/{hero.maxMovement}
        </div>
      </div>

      <ResourceBar resources={resources} />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Map */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "relative",
            width: viewW * TILE,
            height: viewH * TILE,
            border: "2px solid #5a4020",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(0,0,0,0.5)",
          }}>
            {/* Terrain */}
            {visibleTiles.map(({ vx, vy, mx, my, terrain }) => (
              <div
                key={`${mx}-${my}`}
                onClick={() => handleTileClick(mx, my)}
                style={{
                  position: "absolute",
                  left: vx * TILE, top: vy * TILE,
                  width: TILE, height: TILE,
                  background: TERRAIN_COLORS[terrain],
                  borderRight: "1px solid rgba(0,0,0,0.15)",
                  borderBottom: "1px solid rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: terrain === TERRAIN.MOUNTAIN ? 20 : 16,
                  opacity: 0.9,
                  transition: "filter 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
                onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
              >
                {TERRAIN_ICONS[terrain] || ""}
              </div>
            ))}

            {/* Town */}
            {town.x >= cameraX && town.x < cameraX + viewW && town.y >= cameraY && town.y < cameraY + viewH && (
              <div style={{
                position: "absolute",
                left: (town.x - cameraX) * TILE, top: (town.y - cameraY) * TILE,
                width: TILE, height: TILE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, zIndex: 5,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                animation: "pulse 3s infinite",
              }}>🏰</div>
            )}

            {/* Objects */}
            {objects.filter(o => o.x >= cameraX && o.x < cameraX + viewW && o.y >= cameraY && o.y < cameraY + viewH).map(o => (
              <div key={o.id} style={{
                position: "absolute",
                left: (o.x - cameraX) * TILE, top: (o.y - cameraY) * TILE,
                width: TILE, height: TILE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, zIndex: 5,
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
              }}>
                {o.type === "resource" ? RESOURCE_ICONS[o.resource] : o.type === "chest" ? "📦" : o.icon}
              </div>
            ))}

            {/* Hero */}
            {hero.x >= cameraX && hero.x < cameraX + viewW && hero.y >= cameraY && hero.y < cameraY + viewH && (
              <div style={{
                position: "absolute",
                left: (hero.x - cameraX) * TILE, top: (hero.y - cameraY) * TILE,
                width: TILE, height: TILE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, zIndex: 10,
                filter: "drop-shadow(0 0 8px rgba(100,180,255,0.6))",
                transition: "left 0.15s, top 0.15s",
              }}>🧙</div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div style={{
          width: 220,
          background: "linear-gradient(180deg, #1a0e04 0%, #0d0804 100%)",
          borderLeft: "2px solid #5a4020",
          display: "flex", flexDirection: "column",
          padding: 10, gap: 10,
          overflow: "auto",
        }}>
          <MiniMap map={map} hero={hero} objects={objects} />

          {/* Army */}
          <div style={{
            background: "rgba(20,15,8,0.8)", border: "1px solid #3a2a15",
            borderRadius: 6, padding: 8,
          }}>
            <div style={{ color: "#8b6914", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>YOUR ARMY</div>
            {army.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "#c8b88a", fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontSize: 16 }}>{UNIT_TYPES[s.type].icon}</span>
                <span>{UNIT_TYPES[s.type].name}</span>
                <span style={{ color: "#ffd700", marginLeft: "auto" }}>×{s.count}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={endTurn} style={{
              background: "linear-gradient(180deg, #5a8a2a, #3a6a1a)",
              color: "#fff", border: "2px solid #6a9a3a",
              borderRadius: 6, padding: "8px 0", cursor: "pointer",
              fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700,
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}>End Turn (E)</button>

            {hero.x === town.x && hero.y === town.y && (
              <button onClick={() => setShowTown(true)} style={{
                background: "linear-gradient(180deg, #8a6a2a, #6a4a1a)",
                color: "#fff", border: "2px solid #9a7a3a",
                borderRadius: 6, padding: "8px 0", cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700,
              }}>Enter Town (T)</button>
            )}
          </div>

          {/* Controls hint */}
          <div style={{
            color: "#554830", fontSize: 10, lineHeight: 1.6,
            borderTop: "1px solid #2a1a0a", paddingTop: 8,
          }}>
            WASD / Arrows — Move<br />
            E / Enter — End Turn<br />
            T — Enter Town<br />
            Click — Move to tile
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, minHeight: 100,
            background: "rgba(10,8,4,0.8)", border: "1px solid #2a1a0a",
            borderRadius: 6, padding: 6,
            overflow: "auto",
          }}>
            <div style={{ color: "#5a4020", fontSize: 10, fontWeight: 700, marginBottom: 4 }}>LOG</div>
            {messages.slice(-10).map((m, i) => (
              <div key={i} style={{ color: "#a89060", fontSize: 10, marginBottom: 3, lineHeight: 1.4 }}>{m}</div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {showTown && (
          <TownScreen
            town={town}
            resources={resources}
            onBuild={handleBuild}
            onRecruit={handleRecruit}
            onClose={() => setShowTown(false)}
          />
        )}

        {combat && (
          <CombatScreen
            playerArmy={army}
            enemyArmy={combat.enemy.army}
            onFinish={handleCombatFinish}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a0e04; }
        ::-webkit-scrollbar-thumb { background: #5a4020; border-radius: 2px; }
      `}</style>
    </div>
  );
}
