import { Link } from 'react-router-dom';

const GAMES = [
  {
    path: '/heroes',
    title: 'Heroes of Might',
    genre: 'Strategic army battles',
    icon: '\u2694\uFE0F',
    gradient: 'linear-gradient(135deg, #2a1a08 0%, #c8a44e 100%)',
    cardBg: 'linear-gradient(145deg, #1a1008, #2a1a08)',
    border: '#c8a44e',
    accent: '#ffd700',
  },
  {
    path: '/realms',
    title: 'Realms of Shadow',
    genre: 'Turn-based dungeon crawler',
    icon: '\uD83D\uDD2E',
    gradient: 'linear-gradient(135deg, #1a0a1e 0%, #c0392b 100%)',
    cardBg: 'linear-gradient(145deg, #1a0a12, #1a0a1e)',
    border: '#c0392b',
    accent: '#ff6b6b',
  },
  {
    path: '/shadows',
    title: 'Shadows of the Deep',
    genre: 'Pixel art dungeon explorer',
    icon: '\uD83D\uDC80',
    gradient: 'linear-gradient(135deg, #0a0a12 0%, #a040e0 100%)',
    cardBg: 'linear-gradient(145deg, #0d0a14, #1a1030)',
    border: '#a040e0',
    accent: '#c878ff',
  },
];

export default function Gallery() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a12 0%, #1a1040 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .game-card {
          transition: transform 0.3s, box-shadow 0.3s;
          animation: fadeInUp 0.6s ease both;
        }
        .game-card:nth-child(1) { animation-delay: 0.1s; }
        .game-card:nth-child(2) { animation-delay: 0.25s; }
        .game-card:nth-child(3) { animation-delay: 0.4s; }
        .game-card:hover { transform: translateY(-8px) scale(1.02); }
        .play-btn {
          transition: all 0.2s;
        }
        .play-btn:hover {
          filter: brightness(1.3);
          transform: scale(1.05);
        }
      `}</style>

      {/* Star field */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4), transparent)',
          'radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5), transparent)',
          'radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,0.4), transparent)',
          'radial-gradient(1px 1px at 15% 75%, rgba(255,255,255,0.2), transparent)',
          'radial-gradient(1px 1px at 40% 85%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 60% 35%, rgba(255,255,255,0.25), transparent)',
          'radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.35), transparent)',
          'radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.2), transparent)',
          'radial-gradient(1px 1px at 35% 20%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 75% 90%, rgba(255,255,255,0.25), transparent)',
        ].join(','),
        animation: 'twinkle 4s ease-in-out infinite alternate',
      }} />

      {/* Title */}
      <div style={{
        textAlign: 'center', marginBottom: 50, zIndex: 1,
        animation: 'fadeInUp 0.5s ease both',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>
          &#x2694;&#xFE0F;&#x1F3F0;&#x2694;&#xFE0F;
        </div>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(16px, 4vw, 28px)',
          color: '#f0c040',
          textShadow: '0 0 30px rgba(240,192,64,0.5), 0 4px 0 #a08020',
          letterSpacing: 4,
          lineHeight: 1.6,
        }}>
          DARK REALMS ARCADE
        </h1>
        <p style={{
          fontFamily: "'Silkscreen', monospace",
          fontSize: 12, color: '#6a6a8a', marginTop: 12,
          letterSpacing: 6,
        }}>
          CHOOSE YOUR ADVENTURE
        </p>
      </div>

      {/* Game Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 24, maxWidth: 960, width: '100%', zIndex: 1,
      }}>
        {GAMES.map(game => (
          <div key={game.path} className="game-card" style={{
            background: game.cardBg,
            border: `2px solid ${game.border}33`,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: `0 4px 30px ${game.border}15`,
          }}>
            {/* Card Header */}
            <div style={{
              background: game.gradient,
              padding: '28px 20px', textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.1,
                background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)',
              }} />
              <div style={{ fontSize: 48, marginBottom: 8, position: 'relative' }}>
                {game.icon}
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '20px' }}>
              <h2 style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11, color: game.accent,
                marginBottom: 8, lineHeight: 1.6,
              }}>
                {game.title}
              </h2>
              <p style={{
                fontFamily: "'Silkscreen', monospace",
                fontSize: 12, color: '#6a6a8a', marginBottom: 20,
              }}>
                {game.genre}
              </p>
              <Link to={game.path} style={{ textDecoration: 'none' }}>
                <button className="play-btn" style={{
                  width: '100%', padding: '12px 0',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11, letterSpacing: 3,
                  background: `linear-gradient(180deg, ${game.border}, ${game.border}88)`,
                  color: '#fff', border: 'none',
                  borderRadius: 6, cursor: 'pointer',
                  boxShadow: `0 2px 15px ${game.border}33`,
                }}>
                  PLAY
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 50, zIndex: 1,
        fontFamily: "'Silkscreen', monospace",
        fontSize: 10, color: '#3a3a5a', letterSpacing: 2,
      }}>
        DARK REALMS ARCADE &copy; 2026
      </div>
    </div>
  );
}
