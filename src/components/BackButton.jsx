import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/')}
      style={{
        position: 'fixed', top: 12, left: 12, zIndex: 9999,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(10, 10, 18, 0.7)',
        border: '2px solid rgba(240, 192, 64, 0.4)',
        color: '#f0c040', fontSize: 18,
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(240, 192, 64, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(240, 192, 64, 0.8)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(10, 10, 18, 0.7)';
        e.currentTarget.style.borderColor = 'rgba(240, 192, 64, 0.4)';
      }}
      title="Back to Arcade"
    >
      &#9664;
    </button>
  );
}
