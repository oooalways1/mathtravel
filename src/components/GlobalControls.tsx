import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const GlobalControls = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const handleToggle = () => {
    updateSettings({ musicEnabled: !musicEnabled });
  };

  const goHome = () => {
    navigate('/home');
  };

  const isHome = location.pathname === '/home';

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute top-4 left-4 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isHome}
          onClick={goHome}
          className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow text-gray-700 font-semibold disabled:opacity-50"
        >
          🏠 홈으로
        </motion.button>
      </div>

      <div className="absolute top-4 right-4 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow text-gray-700 font-semibold"
        >
          {musicEnabled ? '🔊 ON' : '🔇 OFF'}
        </motion.button>
      </div>
    </div>
  );
};

export default GlobalControls;



