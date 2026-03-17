import BackButton from '../components/BackButton';
import rpgHtml from '../../rpg.html?raw';

export default function ShadowsOfTheDeep() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a12' }}>
      <BackButton />
      <iframe
        srcDoc={rpgHtml}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Shadows of the Deep"
      />
    </div>
  );
}
