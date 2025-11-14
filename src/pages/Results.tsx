import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import Confetti from '../components/Confetti';

const Results = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const currentSession = useGameStore((state) => state.currentSession);

  if (!profile || !currentSession) {
    navigate('/home');
    return null;
  }

  const totalProblems = currentSession.answers.length;
  const correctAnswers = currentSession.answers.filter((a) => a.isCorrect).length;
  const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;
  const totalTime = currentSession.answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const averageTime = totalProblems > 0 ? totalTime / totalProblems : 0;

  // 별 계산
  let stars = 0;
  if (accuracy >= 90) stars = 3;
  else if (accuracy >= 70) stars = 2;
  else if (accuracy >= 50) stars = 1;

  // 코인 계산
  const coinsEarned = correctAnswers * 10 + stars * 50;

  // 경험치 계산
  const expEarned = correctAnswers * 5;

  // 격려 메시지
  const getMessage = () => {
    if (accuracy === 100) return '완벽해요! 정말 대단해요! 🏆';
    if (accuracy >= 90) return '훌륭해요! 거의 완벽해요! 🌟';
    if (accuracy >= 70) return '잘했어요! 계속 연습하면 더 잘할 수 있어요! 👍';
    if (accuracy >= 50) return '좋아요! 조금만 더 노력하면 돼요! 💪';
    return '괜찮아요! 다음엔 더 잘할 수 있어요! 화이팅! 🔥';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {stars >= 3 && <Confetti />}
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center"
        >
          {/* 별 표시 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="flex justify-center gap-4 mb-4">
              {[1, 2, 3].map((star) => (
                <motion.span
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: star <= stars ? 1 : 0.3,
                    rotate: 0,
                    opacity: star <= stars ? 1 : 0.3,
                  }}
                  transition={{ delay: 0.3 + star * 0.1 }}
                  className="text-8xl"
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-primary-600 mb-2">
              {getMessage()}
            </h1>
          </motion.div>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-2xl p-4"
            >
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-blue-600">{totalProblems}</div>
              <div className="text-sm text-gray-600">문제 수</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-50 rounded-2xl p-4"
            >
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">정답 수</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-50 rounded-2xl p-4"
            >
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-purple-600">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">정답률</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-orange-50 rounded-2xl p-4"
            >
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-orange-600">{averageTime.toFixed(1)}초</div>
              <div className="text-sm text-gray-600">평균 시간</div>
            </motion.div>
          </div>

          {/* 보상 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-yellow-900 mb-4">보상 🎁</h2>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-5xl mb-2">🪙</div>
                <div className="text-3xl font-bold text-yellow-700">+{coinsEarned}</div>
                <div className="text-sm text-yellow-800">코인</div>
              </div>
              <div>
                <div className="text-5xl mb-2">✨</div>
                <div className="text-3xl font-bold text-purple-700">+{expEarned}</div>
                <div className="text-sm text-purple-800">경험치</div>
              </div>
            </div>
          </motion.div>

          {/* 문제별 결과 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">문제별 결과</h2>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="grid gap-2">
                {currentSession.problems.map((problem, index) => {
                  const answer = currentSession.answers[index];
                  return (
                    <div
                      key={problem.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        answer?.isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{answer?.isCorrect ? '✅' : '❌'}</span>
                        <span className="font-semibold text-gray-800">
                          문제 {index + 1}: {problem.question}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-700">
                          정답: {problem.answer}
                          {problem.remainder !== undefined && problem.remainder > 0 && ` (나머지 ${problem.remainder})`}
                        </div>
                        {answer && (
                          <div className="text-sm text-gray-600">
                            내 답: {answer.answer}
                            {answer.remainder !== undefined && ` (나머지 ${answer.remainder})`} • {answer.timeSpent}초
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* 버튼들 */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/practice')}
              className="btn-primary flex-1 text-xl py-4"
            >
              다시 하기 🔄
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/home')}
              className="btn-secondary flex-1 text-xl py-4"
            >
              홈으로 🏠
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;


