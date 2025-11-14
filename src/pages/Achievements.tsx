import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const Achievements = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);

  if (!profile) return null;

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;
  const totalCount = profile.achievements.length;
  const completionRate =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const starDisplay = Array.from({ length: unlockedCount }).map((_, index) => (
    <span key={`star-${index}`}>⭐</span>
  ));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <h1 className="text-4xl font-bold text-center text-primary-600 mb-4">
            업적 🏆
          </h1>
          
          <div className="text-center mb-2">
            <div className="text-6xl mb-3">{unlockedCount === totalCount ? '🎉' : '🌟'}</div>
            <p className="text-3xl font-bold text-gray-800 mb-2">{unlockedCount}개 달성!</p>
            <div className="text-3xl text-yellow-500 flex flex-wrap justify-center gap-1">
              {starDisplay.length > 0 ? starDisplay : <span className="text-gray-400">아직 없어요!</span>}
            </div>
          </div>
        </motion.div>

        {/* 업적 목록 */}
        <div className="space-y-4">
          {profile.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={
                    achievement.unlocked
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className={`text-6xl ${!achievement.unlocked && 'grayscale opacity-30'}`}
                >
                  {achievement.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {achievement.title}
                    {achievement.unlocked && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </h3>
                  <p className="text-gray-600 mb-2">{achievement.description}</p>

                  {/* 진행도 바 */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(achievement.progress / achievement.target) * 100}%`,
                        }}
                        className={`h-full ${
                          achievement.unlocked
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 min-w-[60px]">
                      {achievement.progress} / {achievement.target}
                    </span>
                  </div>

                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      달성일: {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>

                {achievement.unlocked && (
                  <div className="text-center bg-yellow-100 rounded-xl p-3">
                    <div className="text-2xl mb-1">🪙</div>
                    <div className="text-lg font-bold text-yellow-700">+100</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 격려 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">💪</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">계속 도전하세요!</h3>
              <p className="text-blue-800">
                {completionRate === 100
                  ? '모든 업적을 달성했어요! 정말 대단해요! 🎉'
                  : completionRate >= 50
                  ? '절반 이상 달성했어요! 조금만 더 힘내세요! 💪'
                  : '하나씩 차근차근 달성해나가요! 화이팅! 🔥'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Achievements;


