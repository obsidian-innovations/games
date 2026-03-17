import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
`;

// ─── Game Data ───────────────────────────────────────────────────────────
const CLASSES = [
  {
    name: "Knight",
    icon: "⚔️",
    desc: "A stalwart defender clad in heavy armor",
    stats: { hp: 120, maxHp: 120, atk: 14, def: 12, spd: 6, mana: 30, maxMana: 30 },
    abilities: [
      { name: "Slash", cost: 0, type: "damage", power: 1.0, desc: "A powerful sword strike" },
      { name: "Shield Bash", cost: 8, type: "damage", power: 1.4, desc: "Stun with your shield", effect: "stun" },
      { name: "Fortify", cost: 10, type: "buff", stat: "def", amount: 5, desc: "Raise defense by 5" },
      { name: "Heal", cost: 12, type: "heal", power: 0.4, desc: "Minor healing prayer" },
    ],
  },
  {
    name: "Mage",
    icon: "🔮",
    desc: "Master of arcane arts and elemental fury",
    stats: { hp: 75, maxHp: 75, atk: 18, def: 5, spd: 8, mana: 80, maxMana: 80 },
    abilities: [
      { name: "Staff Strike", cost: 0, type: "damage", power: 0.6, desc: "A weak staff hit" },
      { name: "Fireball", cost: 15, type: "damage", power: 1.8, desc: "Hurl a ball of fire" },
      { name: "Ice Storm", cost: 20, type: "damage", power: 2.0, desc: "Freezing winds", effect: "slow" },
      { name: "Arcane Shield", cost: 12, type: "buff", stat: "def", amount: 8, desc: "Magical barrier" },
    ],
  },
  {
    name: "Ranger",
    icon: "🏹",
    desc: "Swift hunter who strikes from the shadows",
    stats: { hp: 90, maxHp: 90, atk: 16, def: 8, spd: 14, mana: 50, maxMana: 50 },
    abilities: [
      { name: "Quick Shot", cost: 0, type: "damage", power: 0.9, desc: "A swift arrow" },
      { name: "Poison Arrow", cost: 10, type: "damage", power: 1.2, desc: "Venomous tip", effect: "poison" },
      { name: "Evade", cost: 8, type: "buff", stat: "spd", amount: 6, desc: "Heighten reflexes" },
      { name: "Snipe", cost: 18, type: "damage", power: 2.2, desc: "Aimed critical shot" },
    ],
  },
  {
    name: "Cleric",
    icon: "✨",
    desc: "Divine healer blessed by the gods",
    stats: { hp: 95, maxHp: 95, atk: 10, def: 10, spd: 7, mana: 70, maxMana: 70 },
    abilities: [
      { name: "Smite", cost: 0, type: "damage", power: 0.8, desc: "Holy strike" },
      { name: "Divine Light", cost: 15, type: "heal", power: 0.6, desc: "Powerful healing" },
      { name: "Holy Fire", cost: 18, type: "damage", power: 1.6, desc: "Sacred flames" },
      { name: "Blessing", cost: 12, type: "buff", stat: "atk", amount: 6, desc: "Empower attacks" },
    ],
  },
];

const ENEMIES_BY_TIER = {
  1: [
    { name: "Goblin Scout", icon: "👺", stats: { hp: 40, maxHp: 40, atk: 8, def: 3, spd: 10 }, xp: 20, gold: 8 },
    { name: "Giant Rat", icon: "🐀", stats: { hp: 30, maxHp: 30, atk: 6, def: 2, spd: 12 }, xp: 15, gold: 5 },
    { name: "Skeleton", icon: "💀", stats: { hp: 35, maxHp: 35, atk: 9, def: 4, spd: 7 }, xp: 18, gold: 7 },
  ],
  2: [
    { name: "Orc Warrior", icon: "👹", stats: { hp: 70, maxHp: 70, atk: 14, def: 8, spd: 6 }, xp: 40, gold: 18 },
    { name: "Dark Elf", icon: "🧝", stats: { hp: 55, maxHp: 55, atk: 16, def: 6, spd: 12 }, xp: 45, gold: 22 },
    { name: "Wraith", icon: "👻", stats: { hp: 50, maxHp: 50, atk: 18, def: 4, spd: 14 }, xp: 42, gold: 20 },
  ],
  3: [
    { name: "Troll", icon: "🧌", stats: { hp: 110, maxHp: 110, atk: 20, def: 12, spd: 5 }, xp: 70, gold: 35 },
    { name: "Basilisk", icon: "🐍", stats: { hp: 90, maxHp: 90, atk: 22, def: 10, spd: 9 }, xp: 75, gold: 40 },
    { name: "Vampire Lord", icon: "🧛", stats: { hp: 85, maxHp: 85, atk: 24, def: 8, spd: 13 }, xp: 80, gold: 45 },
  ],
  4: [
    { name: "Ancient Dragon", icon: "🐉", stats: { hp: 200, maxHp: 200, atk: 30, def: 18, spd: 10 }, xp: 150, gold: 100 },
    { name: "Lich King", icon: "🦴", stats: { hp: 160, maxHp: 160, atk: 35, def: 14, spd: 8 }, xp: 160, gold: 120 },
    { name: "Demon Lord", icon: "😈", stats: { hp: 180, maxHp: 180, atk: 32, def: 16, spd: 11 }, xp: 170, gold: 110 },
  ],
};

const EVENTS = [
  { type: "battle", weight: 50 },
  { type: "treasure", weight: 15, text: "You discover a hidden chest!", gold: [10, 40] },
  { type: "rest", weight: 10, text: "You find a tranquil spring.", healPercent: 0.3 },
  { type: "shrine", weight: 10, text: "A glowing shrine hums with power.", manaPercent: 0.5 },
  { type: "merchant", weight: 15 },
];

const SHOP_ITEMS = [
  { name: "Health Potion", cost: 15, type: "heal", power: 30, desc: "Restore 30 HP", icon: "🧪" },
  { name: "Mana Elixir", cost: 20, type: "mana", power: 25, desc: "Restore 25 Mana", icon: "💧" },
  { name: "Whetstone", cost: 25, type: "buff", stat: "atk", amount: 2, desc: "+2 ATK permanently", icon: "🪨" },
  { name: "Iron Plate", cost: 30, type: "buff", stat: "def", amount: 2, desc: "+2 DEF permanently", icon: "🛡️" },
  { name: "Swift Boots", cost: 28, type: "buff", stat: "spd", amount: 2, desc: "+2 SPD permanently", icon: "👢" },
  { name: "Full Heal", cost: 50, type: "fullheal", desc: "Fully restore HP & Mana", icon: "⭐" },
];

const LOCATIONS = [
  "the Whispering Woods", "the Cursed Ruins", "a dim cavern", "the Blighted Marsh",
  "the Dragon's Pass", "an abandoned fortress", "the Crystal Caves", "the Shadowed Vale",
  "the Bone Fields", "a crumbling tower", "the Frozen Wastes", "the Ember Plains",
];

// ─── Utilities ───────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function pickWeighted(events) {
  const total = events.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of events) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return events[0];
}

function getTier(level) {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  return 4;
}

// ─── Components ──────────────────────────────────────────────────────────

function HealthBar({ current, max, color = "#c0392b", label, height = 14 }) {
  const pct = clamp((current / max) * 100, 0, 100);
  return (
    <div style={{ width: "100%", marginBottom: 4 }}>
      {label && <div style={{ fontSize: 11, fontFamily: "'Cormorant Garamond', serif", color: "#b8a88a", marginBottom: 2 }}>{label}</div>}
      <div style={{ width: "100%", height, background: "#1a1510", borderRadius: 3, overflow: "hidden", border: "1px solid #3a2f20" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: `linear-gradient(180deg, ${color}, ${color}88)`,
          transition: "width 0.6s ease", borderRadius: 3, boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
    </div>
  );
}

function StatBadge({ label, value, icon }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px",
      background: "#1a150e", border: "1px solid #3a2f20", borderRadius: 4, fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace", color: "#d4c4a0",
    }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span style={{ color: "#8a7a5a", fontSize: 10 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function CombatLog({ log }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  return (
    <div ref={ref} style={{
      maxHeight: 120, overflowY: "auto", padding: "8px 12px", background: "#0d0a06",
      border: "1px solid #2a2010", borderRadius: 6, fontFamily: "'Cormorant Garamond', serif",
      fontSize: 13, color: "#9a8a6a", lineHeight: 1.6,
    }}>
      {log.map((entry, i) => (
        <div key={i} style={{
          color: entry.type === "damage" ? "#e74c3c" : entry.type === "heal" ? "#2ecc71" :
            entry.type === "buff" ? "#f39c12" : entry.type === "info" ? "#3498db" : "#9a8a6a",
          opacity: i < log.length - 3 ? 0.5 : 1,
        }}>
          {entry.icon} {entry.text}
        </div>
      ))}
    </div>
  );
}

// ─── Main Game ───────────────────────────────────────────────────────────
export default function FantasyRPG() {
  const [screen, setScreen] = useState("title");
  const [player, setPlayer] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [turn, setTurn] = useState("player");
  const [gold, setGold] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpToLevel, setXpToLevel] = useState(50);
  const [step, setStep] = useState(0);
  const [eventData, setEventData] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(null);
  const [flashColor, setFlashColor] = useState(null);
  const [victories, setVictories] = useState(0);
  const [statusEffects, setStatusEffects] = useState({ player: [], enemy: [] });

  const addLog = useCallback((entry) => {
    setCombatLog((prev) => [...prev.slice(-30), entry]);
  }, []);

  function selectClass(cls) {
    setPlayer({ ...cls, stats: { ...cls.stats }, className: cls.name });
    setGold(20);
    setXp(0);
    setLevel(1);
    setXpToLevel(50);
    setStep(0);
    setVictories(0);
    setCombatLog([]);
    setStatusEffects({ player: [], enemy: [] });
    setScreen("adventure");
  }

  function explore() {
    setStep((s) => s + 1);
    const event = pickWeighted(EVENTS);

    if (event.type === "battle") {
      const tier = getTier(level);
      const template = pick(ENEMIES_BY_TIER[tier]);
      const scaling = 1 + (level - 1) * 0.12;
      const e = {
        ...template,
        stats: {
          ...template.stats,
          hp: Math.floor(template.stats.hp * scaling),
          maxHp: Math.floor(template.stats.maxHp * scaling),
          atk: Math.floor(template.stats.atk * scaling),
          def: Math.floor(template.stats.def * scaling),
        },
        xp: Math.floor(template.xp * scaling),
        gold: Math.floor(template.gold * scaling),
      };
      setEnemy(e);
      setCombatLog([]);
      setTurn("player");
      setStatusEffects((s) => ({ ...s, enemy: [] }));
      setScreen("battle");
      addLog({ icon: "⚔️", text: `A ${e.name} appears in ${pick(LOCATIONS)}!`, type: "info" });
    } else if (event.type === "merchant") {
      setEventData({ type: "merchant" });
      setScreen("event");
    } else {
      setEventData(event);
      setScreen("event");
    }
  }

  function handleEvent() {
    if (!eventData) return;
    if (eventData.type === "treasure") {
      const g = rand(eventData.gold[0], eventData.gold[1]);
      setGold((prev) => prev + g);
      setEventData({ ...eventData, result: `You found ${g} gold!` });
    } else if (eventData.type === "rest") {
      const heal = Math.floor(player.stats.maxHp * eventData.healPercent);
      setPlayer((p) => ({ ...p, stats: { ...p.stats, hp: Math.min(p.stats.maxHp, p.stats.hp + heal) } }));
      setEventData({ ...eventData, result: `You recovered ${heal} HP.` });
    } else if (eventData.type === "shrine") {
      const mana = Math.floor(player.stats.maxMana * eventData.manaPercent);
      setPlayer((p) => ({ ...p, stats: { ...p.stats, mana: Math.min(p.stats.maxMana, p.stats.mana + mana) } }));
      setEventData({ ...eventData, result: `You restored ${mana} Mana.` });
    }
  }

  function buyItem(item) {
    if (gold < item.cost) return;
    setGold((g) => g - item.cost);
    if (item.type === "heal") {
      setPlayer((p) => ({ ...p, stats: { ...p.stats, hp: Math.min(p.stats.maxHp, p.stats.hp + item.power) } }));
    } else if (item.type === "mana") {
      setPlayer((p) => ({ ...p, stats: { ...p.stats, mana: Math.min(p.stats.maxMana, p.stats.mana + item.power) } }));
    } else if (item.type === "buff") {
      setPlayer((p) => ({ ...p, stats: { ...p.stats, [item.stat]: p.stats[item.stat] + item.amount } }));
    } else if (item.type === "fullheal") {
      setPlayer((p) => ({ ...p, stats: { ...p.stats, hp: p.stats.maxHp, mana: p.stats.maxMana } }));
    }
  }

  function checkLevelUp(currentXp) {
    let cx = currentXp, lv = level, xpReq = xpToLevel;
    while (cx >= xpReq) {
      cx -= xpReq;
      lv++;
      xpReq = Math.floor(xpReq * 1.5);
      setPlayer((p) => ({
        ...p,
        stats: {
          ...p.stats,
          maxHp: p.stats.maxHp + 8, hp: p.stats.hp + 8,
          maxMana: p.stats.maxMana + 5, mana: Math.min(p.stats.maxMana + 5, p.stats.mana + 5),
          atk: p.stats.atk + 1, def: p.stats.def + 1, spd: p.stats.spd + 1,
        },
      }));
      addLog({ icon: "🌟", text: `LEVEL UP! You are now level ${lv}!`, type: "buff" });
    }
    setLevel(lv);
    setXp(cx);
    setXpToLevel(xpReq);
  }

  function doPlayerAction(ability) {
    if (animating || turn !== "player") return;
    if (ability.cost > player.stats.mana) return;

    setAnimating(true);
    setPlayer((p) => ({ ...p, stats: { ...p.stats, mana: p.stats.mana - ability.cost } }));

    if (ability.type === "damage") {
      const variance = 0.85 + Math.random() * 0.3;
      const dodge = Math.random() * 100 < (enemy.stats.spd * 1.5) ? true : false;
      if (dodge) {
        addLog({ icon: "💨", text: `${enemy.name} dodged your ${ability.name}!`, type: "info" });
      } else {
        const raw = Math.floor(player.stats.atk * ability.power * variance);
        const dmg = Math.max(1, raw - Math.floor(enemy.stats.def * 0.4));
        setEnemy((e) => ({ ...e, stats: { ...e.stats, hp: Math.max(0, e.stats.hp - dmg) } }));
        setShakeTarget("enemy");
        setFlashColor("#e74c3c");
        setTimeout(() => { setShakeTarget(null); setFlashColor(null); }, 400);
        addLog({ icon: "⚔️", text: `${ability.name} hits ${enemy.name} for ${dmg} damage!`, type: "damage" });

        if (ability.effect === "poison") {
          setStatusEffects((s) => ({ ...s, enemy: [...s.enemy.filter(e => e !== "poison"), "poison"] }));
          addLog({ icon: "☠️", text: `${enemy.name} is poisoned!`, type: "damage" });
        }
        if (ability.effect === "stun") {
          setStatusEffects((s) => ({ ...s, enemy: [...s.enemy.filter(e => e !== "stun"), "stun"] }));
          addLog({ icon: "💫", text: `${enemy.name} is stunned!`, type: "buff" });
        }
      }
    } else if (ability.type === "heal") {
      const heal = Math.floor(player.stats.atk * ability.power);
      setPlayer((p) => ({ ...p, stats: { ...p.stats, hp: Math.min(p.stats.maxHp, p.stats.hp + heal) } }));
      setFlashColor("#2ecc71");
      setTimeout(() => setFlashColor(null), 400);
      addLog({ icon: "💚", text: `${ability.name} heals you for ${heal} HP!`, type: "heal" });
    } else if (ability.type === "buff") {
      setPlayer((p) => ({ ...p, stats: { ...p.stats, [ability.stat]: p.stats[ability.stat] + ability.amount } }));
      addLog({ icon: "✨", text: `${ability.name}: +${ability.amount} ${ability.stat.toUpperCase()}!`, type: "buff" });
    }

    setTimeout(() => {
      setEnemy((currentEnemy) => {
        if (currentEnemy.stats.hp <= 0) {
          const earnedXp = currentEnemy.xp;
          const earnedGold = currentEnemy.gold;
          setGold((g) => g + earnedGold);
          setXp((prevXp) => {
            const newXp = prevXp + earnedXp;
            setTimeout(() => checkLevelUp(newXp), 100);
            return newXp;
          });
          setVictories((v) => v + 1);
          addLog({ icon: "🏆", text: `Victory! Earned ${earnedXp} XP and ${earnedGold} gold!`, type: "buff" });
          setTimeout(() => setScreen("adventure"), 1500);
          setAnimating(false);
          return currentEnemy;
        }
        setTimeout(() => doEnemyTurn(currentEnemy), 800);
        return currentEnemy;
      });
    }, 500);
  }

  function doEnemyTurn(currentEnemy) {
    // Check stun
    if (statusEffects.enemy.includes("stun")) {
      addLog({ icon: "💫", text: `${currentEnemy.name} is stunned and can't act!`, type: "info" });
      setStatusEffects((s) => ({ ...s, enemy: s.enemy.filter((e) => e !== "stun") }));
      setTurn("player");
      setAnimating(false);
      return;
    }

    // Poison tick
    if (statusEffects.enemy.includes("poison")) {
      const poisonDmg = Math.floor(currentEnemy.stats.maxHp * 0.08);
      setEnemy((e) => ({ ...e, stats: { ...e.stats, hp: Math.max(0, e.stats.hp - poisonDmg) } }));
      addLog({ icon: "☠️", text: `Poison deals ${poisonDmg} to ${currentEnemy.name}!`, type: "damage" });
    }

    const dodge = Math.random() * 100 < (player.stats.spd * 1.2) ? true : false;
    if (dodge) {
      addLog({ icon: "💨", text: `You dodged ${currentEnemy.name}'s attack!`, type: "info" });
    } else {
      const variance = 0.85 + Math.random() * 0.3;
      const raw = Math.floor(currentEnemy.stats.atk * variance);
      const dmg = Math.max(1, raw - Math.floor(player.stats.def * 0.4));
      setPlayer((p) => {
        const newHp = Math.max(0, p.stats.hp - dmg);
        if (newHp <= 0) {
          addLog({ icon: "💀", text: `You have been slain by ${currentEnemy.name}...`, type: "damage" });
          setTimeout(() => setScreen("gameover"), 1200);
        }
        return { ...p, stats: { ...p.stats, hp: newHp } };
      });
      setShakeTarget("player");
      setTimeout(() => setShakeTarget(null), 400);
      addLog({ icon: "🩸", text: `${currentEnemy.name} attacks for ${dmg} damage!`, type: "damage" });
    }

    setTurn("player");
    setAnimating(false);
  }

  function flee() {
    if (Math.random() < 0.6) {
      addLog({ icon: "🏃", text: "You fled successfully!", type: "info" });
      setScreen("adventure");
    } else {
      addLog({ icon: "❌", text: "Failed to flee!", type: "damage" });
      setTimeout(() => doEnemyTurn(enemy), 600);
    }
  }

  // ─── Styles ──────────────────────────────────────────────────────────
  const baseStyle = {
    minHeight: "100vh", width: "100%", background: "#0d0a06",
    fontFamily: "'Cormorant Garamond', serif", color: "#d4c4a0",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  };

  const panelStyle = {
    background: "linear-gradient(145deg, #1a150e, #0d0a06)",
    border: "1px solid #3a2f20", borderRadius: 12, padding: 20,
    boxShadow: "0 0 40px #0005, inset 0 1px 0 #3a2f2044",
  };

  const btnStyle = (color = "#8b6914") => ({
    padding: "10px 20px", background: `linear-gradient(180deg, ${color}, ${color}88)`,
    border: `1px solid ${color}`, borderRadius: 8, color: "#f0e6cc",
    fontFamily: "'Cinzel Decorative', serif", fontSize: 13, cursor: "pointer",
    transition: "all 0.2s", fontWeight: 700, letterSpacing: 1,
    boxShadow: `0 2px 12px ${color}33`,
  });

  const shakeAnim = `@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`;
  const pulseAnim = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`;
  const floatAnim = `@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`;
  const fadeIn = `@keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`;

  // ─── Screens ─────────────────────────────────────────────────────────

  // TITLE
  if (screen === "title") {
    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}{floatAnim}{pulseAnim}
          {`.title-btn:hover{transform:scale(1.05);filter:brightness(1.3)}`}
        </style>
        <div style={{
          textAlign: "center", animation: "fadeIn 1s ease",
          background: "radial-gradient(ellipse at center, #2a1f0a22 0%, transparent 70%)",
          padding: 60,
        }}>
          <div style={{ fontSize: 60, marginBottom: 10, animation: "float 3s ease-in-out infinite" }}>🗡️</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: 42, fontWeight: 900,
            background: "linear-gradient(180deg, #f0d070, #8b6914)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", marginBottom: 8, letterSpacing: 3,
          }}>
            Realms of Shadow
          </h1>
          <p style={{ fontSize: 18, color: "#8a7a5a", fontStyle: "italic", marginBottom: 40 }}>
            A turn-based fantasy adventure
          </p>
          <button className="title-btn" style={btnStyle()} onClick={() => setScreen("classSelect")}>
            ⚔ BEGIN QUEST ⚔
          </button>
        </div>
      </div>
    );
  }

  // CLASS SELECT
  if (screen === "classSelect") {
    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}
          {`.cls-card:hover{transform:translateY(-4px);border-color:#8b6914;box-shadow:0 8px 30px #8b691422}`}
        </style>
        <div style={{ animation: "fadeIn 0.6s ease", maxWidth: 700, width: "90%", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: 26, marginBottom: 30,
            color: "#f0d070", letterSpacing: 2,
          }}>Choose Your Class</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
            {CLASSES.map((cls) => (
              <div key={cls.name} className="cls-card" onClick={() => selectClass(cls)} style={{
                ...panelStyle, cursor: "pointer", transition: "all 0.3s", padding: 18, textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>{cls.icon}</div>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 15, color: "#f0d070", fontWeight: 700, marginBottom: 6 }}>{cls.name}</div>
                <div style={{ fontSize: 12, color: "#8a7a5a", marginBottom: 10, fontStyle: "italic" }}>{cls.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                  <StatBadge label="HP" value={cls.stats.hp} icon="❤️" />
                  <StatBadge label="ATK" value={cls.stats.atk} icon="⚔️" />
                  <StatBadge label="DEF" value={cls.stats.def} icon="🛡️" />
                  <StatBadge label="SPD" value={cls.stats.spd} icon="💨" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ADVENTURE (Overworld)
  if (screen === "adventure" && player) {
    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}{`.adv-btn:hover{transform:scale(1.05);filter:brightness(1.2)}`}</style>
        <div style={{ animation: "fadeIn 0.5s ease", maxWidth: 480, width: "90%" }}>
          <div style={{ ...panelStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 28, marginRight: 8 }}>{player.icon}</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: "#f0d070" }}>{player.className}</span>
                <span style={{ fontSize: 12, color: "#8a7a5a", marginLeft: 8 }}>Lv.{level}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#f0d070" }}>💰 {gold}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a7a5a" }}>🏆 {victories} victories</div>
              </div>
            </div>
            <HealthBar current={player.stats.hp} max={player.stats.maxHp} color="#c0392b" label={`HP ${player.stats.hp}/${player.stats.maxHp}`} />
            <HealthBar current={player.stats.mana} max={player.stats.maxMana} color="#2980b9" label={`Mana ${player.stats.mana}/${player.stats.maxMana}`} />
            <HealthBar current={xp} max={xpToLevel} color="#8b6914" label={`XP ${xp}/${xpToLevel}`} height={8} />
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <StatBadge label="ATK" value={player.stats.atk} icon="⚔️" />
              <StatBadge label="DEF" value={player.stats.def} icon="🛡️" />
              <StatBadge label="SPD" value={player.stats.spd} icon="💨" />
            </div>
          </div>

          <div style={{ ...panelStyle, textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 14, color: "#8a7a5a", marginBottom: 6 }}>Step {step} — {pick(LOCATIONS)}</div>
            <p style={{ fontSize: 16, color: "#b8a88a", marginBottom: 20 }}>
              The path stretches before you, shrouded in mist. What lies ahead?
            </p>
            <button className="adv-btn" style={btnStyle()} onClick={explore}>
              ⚔ VENTURE FORTH ⚔
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BATTLE
  if (screen === "battle" && player && enemy) {
    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}{shakeAnim}{pulseAnim}
          {`.abl-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.2)}
            .abl-btn:disabled{opacity:0.35;cursor:not-allowed}`}
        </style>
        <div style={{ animation: "fadeIn 0.4s ease", maxWidth: 520, width: "90%" }}>
          {/* Enemy panel */}
          <div style={{
            ...panelStyle, marginBottom: 12,
            animation: shakeTarget === "enemy" ? "shake 0.3s ease" : undefined,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 36 }}>{enemy.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: "#e74c3c" }}>{enemy.name}</div>
                <HealthBar current={enemy.stats.hp} max={enemy.stats.maxHp} color="#c0392b"
                  label={`HP ${enemy.stats.hp}/${enemy.stats.maxHp}`} />
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <StatBadge label="ATK" value={enemy.stats.atk} icon="⚔️" />
                  <StatBadge label="DEF" value={enemy.stats.def} icon="🛡️" />
                  {statusEffects.enemy.map((e) => (
                    <span key={e} style={{
                      fontSize: 10, padding: "2px 6px", background: "#3a1010", border: "1px solid #c0392b44",
                      borderRadius: 4, color: "#e74c3c",
                    }}>{e === "poison" ? "☠️ PSN" : e === "stun" ? "💫 STN" : e === "slow" ? "🧊 SLW" : e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player panel */}
          <div style={{
            ...panelStyle, marginBottom: 12,
            animation: shakeTarget === "player" ? "shake 0.3s ease" : undefined,
            borderColor: flashColor || "#3a2f20", transition: "border-color 0.3s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 32 }}>{player.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 15, color: "#f0d070" }}>
                  {player.className} <span style={{ fontSize: 11, color: "#8a7a5a" }}>Lv.{level}</span>
                </div>
                <HealthBar current={player.stats.hp} max={player.stats.maxHp} color="#c0392b"
                  label={`HP ${player.stats.hp}/${player.stats.maxHp}`} />
                <HealthBar current={player.stats.mana} max={player.stats.maxMana} color="#2980b9"
                  label={`Mana ${player.stats.mana}/${player.stats.maxMana}`} height={10} />
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <CombatLog log={combatLog} />

          {/* Abilities */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {player.abilities.map((ab) => (
              <button key={ab.name} className="abl-btn"
                disabled={animating || turn !== "player" || ab.cost > player.stats.mana || player.stats.hp <= 0 || enemy.stats.hp <= 0}
                onClick={() => doPlayerAction(ab)}
                style={{
                  ...btnStyle(ab.type === "heal" ? "#27ae60" : ab.type === "buff" ? "#d4880f" : "#8b1a1a"),
                  padding: "8px 10px", fontSize: 12, textAlign: "left", transition: "all 0.2s",
                  display: "flex", flexDirection: "column",
                }}>
                <span style={{ fontWeight: 700 }}>{ab.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7, fontFamily: "'Cormorant Garamond', serif" }}>
                  {ab.desc} {ab.cost > 0 ? `· ${ab.cost} MP` : "· Free"}
                </span>
              </button>
            ))}
          </div>
          <button className="abl-btn" onClick={flee}
            disabled={animating || turn !== "player"}
            style={{ ...btnStyle("#4a3a1a"), width: "100%", marginTop: 8, fontSize: 12 }}>
            🏃 Attempt to Flee
          </button>
        </div>
      </div>
    );
  }

  // EVENT (treasure, rest, shrine, merchant)
  if (screen === "event" && eventData) {
    if (eventData.type === "merchant") {
      return (
        <div style={baseStyle}>
          <style>{FONTS}{fadeIn}{`.shop-btn:hover:not(:disabled){transform:scale(1.03);filter:brightness(1.15)} .shop-btn:disabled{opacity:0.3;cursor:not-allowed}`}</style>
          <div style={{ animation: "fadeIn 0.5s ease", maxWidth: 480, width: "90%" }}>
            <div style={{ ...panelStyle, textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
              <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: "#f0d070", fontSize: 20, margin: 0 }}>Wandering Merchant</h3>
              <p style={{ color: "#8a7a5a", fontSize: 13 }}>💰 Gold: {gold}</p>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {SHOP_ITEMS.map((item) => (
                <button key={item.name} className="shop-btn" disabled={gold < item.cost}
                  onClick={() => buyItem(item)}
                  style={{
                    ...panelStyle, display: "flex", alignItems: "center", gap: 12, cursor: gold >= item.cost ? "pointer" : "not-allowed",
                    padding: 14, transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, color: "#f0d070" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#8a7a5a" }}>{item.desc}</div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
                    color: gold >= item.cost ? "#f0d070" : "#5a4a3a",
                  }}>💰 {item.cost}</div>
                </button>
              ))}
            </div>
            <button className="shop-btn" style={{ ...btnStyle(), width: "100%", marginTop: 14 }}
              onClick={() => setScreen("adventure")}>
              Continue Journey
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}{`.ev-btn:hover{transform:scale(1.05);filter:brightness(1.2)}`}</style>
        <div style={{ animation: "fadeIn 0.5s ease", maxWidth: 420, width: "90%", textAlign: "center" }}>
          <div style={panelStyle}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>
              {eventData.type === "treasure" ? "💎" : eventData.type === "rest" ? "⛲" : "🔮"}
            </div>
            <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: "#f0d070", fontSize: 20, marginBottom: 10 }}>
              {eventData.text}
            </h3>
            {eventData.result ? (
              <>
                <p style={{ fontSize: 16, color: "#2ecc71", marginBottom: 20 }}>{eventData.result}</p>
                <button className="ev-btn" style={btnStyle()} onClick={() => setScreen("adventure")}>
                  Continue
                </button>
              </>
            ) : (
              <button className="ev-btn" style={btnStyle("#27ae60")} onClick={handleEvent}>
                {eventData.type === "treasure" ? "Open Chest" : eventData.type === "rest" ? "Rest Here" : "Touch Shrine"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (screen === "gameover") {
    return (
      <div style={baseStyle}>
        <style>{FONTS}{fadeIn}{`.go-btn:hover{transform:scale(1.05);filter:brightness(1.2)}`}</style>
        <div style={{ animation: "fadeIn 0.8s ease", textAlign: "center", ...panelStyle, maxWidth: 420, width: "90%" }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>💀</div>
          <h2 style={{ fontFamily: "'Cinzel Decorative', serif", color: "#c0392b", fontSize: 28, marginBottom: 8 }}>
            YOU HAVE FALLEN
          </h2>
          <p style={{ color: "#8a7a5a", fontSize: 15, marginBottom: 6 }}>
            Your journey ends after {step} steps.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#f0d070" }}>{victories}</div>
              <div style={{ fontSize: 11, color: "#8a7a5a" }}>Victories</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#f0d070" }}>{level}</div>
              <div style={{ fontSize: 11, color: "#8a7a5a" }}>Level</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#f0d070" }}>{gold}</div>
              <div style={{ fontSize: 11, color: "#8a7a5a" }}>Gold</div>
            </div>
          </div>
          <button className="go-btn" style={btnStyle()} onClick={() => setScreen("classSelect")}>
            ⚔ TRY AGAIN ⚔
          </button>
        </div>
      </div>
    );
  }

  return <div style={baseStyle}><p>Loading...</p></div>;
}
