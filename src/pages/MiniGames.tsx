import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const miniGames = [
  {
    id: 'acid-rain',
    title: '산성비 게임',
    description: '떨어지는 곱셈/나눗셈 문제를 빠르게 풀어 산성비를 막아요!',
    icon: '🌧️',
    path: '/mini-games/acid-rain',
    difficulty: '싱글 모드 전용',
  },
];

const MiniGames = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
        >
          <span className="text-2xl">←</span>
          <span>돌아가기</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-2">미니게임 모드 🎮</h1>
          <p className="text-gray-600">
            집중력과 계산력을 시험하는 특별 게임들을 즐겨보세요. 현재는 산성비 게임을
            플레이할 수 있어요!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {miniGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="card flex flex-col justify-between"
            >
              <div>
                <div className="text-6xl mb-4">{game.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{game.title}</h2>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                  {game.difficulty}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(game.path)}
                className="btn-primary w-full mt-6"
              >
                플레이하기
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniGames;


