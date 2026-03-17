import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Gallery = lazy(() => import('./pages/Gallery'));
const HeroesGame = lazy(() => import('./games/HeroesGame'));
const RealmsOfShadow = lazy(() => import('./games/RealmsOfShadow'));
const ShadowsOfTheDeep = lazy(() => import('./games/ShadowsOfTheDeep'));

const Loading = () => (
  <div style={{
    width: '100%', height: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#0a0a12', color: '#f0c040',
    fontFamily: "'Press Start 2P', monospace", fontSize: 14,
  }}>
    Loading...
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/heroes" element={<HeroesGame />} />
        <Route path="/realms" element={<RealmsOfShadow />} />
        <Route path="/shadows" element={<ShadowsOfTheDeep />} />
      </Routes>
    </Suspense>
  );
}
