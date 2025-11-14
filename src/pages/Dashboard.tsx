import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);

  if (!profile) return null;

  const { stats } = profile;
  const multiplicationAccuracy = stats.multiplicationStats.total > 0
    ? (stats.multiplicationStats.correct / stats.multiplicationStats.total) * 100
    : 0;
  const divisionAccuracy = stats.divisionStats.total > 0
    ? (stats.divisionStats.correct / stats.divisionStats.total) * 100
    : 0;
  const overallAccuracy = stats.totalProblems > 0
    ? (stats.correctAnswers / stats.totalProblems) * 100
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <h1 className="text-4xl font-bold text-center text-primary-600 mb-2">
            학습 대시보드 📊
          </h1>
          <p className="text-center text-gray-600">
            {profile.name}님의 학습 기록을 확인해보세요!
          </p>
        </motion.div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white"
          >
            <div className="text-5xl mb-3">📝</div>
            <div className="text-4xl font-bold mb-1">{stats.totalProblems}</div>
            <div className="text-blue-100">총 문제 수</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-400 to-green-600 text-white"
          >
            <div className="text-5xl mb-3">✅</div>
            <div className="text-4xl font-bold mb-1">{stats.correctAnswers}</div>
            <div className="text-green-100">정답 수</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-400 to-purple-600 text-white"
          >
            <div className="text-5xl mb-3">🎯</div>
            <div className="text-4xl font-bold mb-1">{overallAccuracy.toFixed(0)}%</div>
            <div className="text-purple-100">전체 정답률</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-red-400 to-red-600 text-white"
          >
            <div className="text-5xl mb-3">🔥</div>
            <div className="text-4xl font-bold mb-1">{stats.dailyStreak}</div>
            <div className="text-red-100">연속 학습일</div>
          </motion.div>
        </div>

        {/* 곱셈 vs 나눗셈 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 곱셈 통계 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">✖️</span>
              곱셈 통계
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">총 문제 수</span>
                <span className="text-2xl font-bold text-primary-600">
                  {stats.multiplicationStats.total}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">정답 수</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.multiplicationStats.correct}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">정답률</span>
                <span className="text-2xl font-bold text-purple-600">
                  {multiplicationAccuracy.toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">평균 시간</span>
                <span className="text-2xl font-bold text-orange-600">
                  {stats.multiplicationStats.averageTime.toFixed(1)}초
                </span>
              </div>

              {/* 난이도별 */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3">난이도별</h3>
                <div className="space-y-2">
                  {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                    const diff = stats.multiplicationStats.byDifficulty[difficulty];
                    const acc = diff.total > 0 ? (diff.correct / diff.total) * 100 : 0;
                    return (
                      <div key={difficulty} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-16">
                          {difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full flex items-center justify-center text-xs text-white font-bold"
                            style={{ width: `${acc}%` }}
                          >
                            {acc > 0 && `${acc.toFixed(0)}%`}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-20">
                          {diff.correct}/{diff.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 나눗셈 통계 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">➗</span>
              나눗셈 통계
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">총 문제 수</span>
                <span className="text-2xl font-bold text-secondary-600">
                  {stats.divisionStats.total}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">정답 수</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.divisionStats.correct}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">정답률</span>
                <span className="text-2xl font-bold text-purple-600">
                  {divisionAccuracy.toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">평균 시간</span>
                <span className="text-2xl font-bold text-orange-600">
                  {stats.divisionStats.averageTime.toFixed(1)}초
                </span>
              </div>

              {/* 난이도별 */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3">난이도별</h3>
                <div className="space-y-2">
                  {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                    const diff = stats.divisionStats.byDifficulty[difficulty];
                    const acc = diff.total > 0 ? (diff.correct / diff.total) * 100 : 0;
                    return (
                      <div key={difficulty} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-16">
                          {difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-secondary-400 to-secondary-600 h-full flex items-center justify-center text-xs text-white font-bold"
                            style={{ width: `${acc}%` }}
                          >
                            {acc > 0 && `${acc.toFixed(0)}%`}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-20">
                          {diff.correct}/{diff.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 학습 팁 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            학습 팁
          </h2>
          <div className="space-y-3">
            {overallAccuracy < 70 && (
              <p className="text-gray-700">
                • 시각적 도움 기능을 활용해보세요! 그림으로 보면 더 쉽게 이해할 수 있어요.
              </p>
            )}
            {stats.averageTime > 30 && (
              <p className="text-gray-700">
                • 구구단을 외우면 더 빠르게 풀 수 있어요!
              </p>
            )}
            {stats.dailyStreak < 3 && (
              <p className="text-gray-700">
                • 매일 조금씩 연습하면 실력이 쑥쑥 늘어요! 연속 학습 기록을 만들어보세요.
              </p>
            )}
            {multiplicationAccuracy < divisionAccuracy && stats.multiplicationStats.total > 5 && (
              <p className="text-gray-700">
                • 곱셈을 더 연습해보세요. 곱셈을 잘하면 나눗셈도 쉬워져요!
              </p>
            )}
            {divisionAccuracy < multiplicationAccuracy && stats.divisionStats.total > 5 && (
              <p className="text-gray-700">
                • 나눗셈을 더 연습해보세요. 나눗셈은 곱셈의 반대라는 걸 기억하세요!
              </p>
            )}
            {overallAccuracy >= 90 && (
              <p className="text-gray-700">
                • 정말 잘하고 있어요! 더 어려운 난이도에 도전해보는 건 어떨까요? 🌟
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;


