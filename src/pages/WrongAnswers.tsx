import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import type { GameSession } from '../types';

const WrongAnswers = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const removeFromWrongAnswers = useGameStore((state) => state.removeFromWrongAnswers);
  const startSession = useGameStore((state) => state.startSession);

  if (!profile) return null;

  const wrongAnswers = profile.wrongAnswers;

  const handleRetry = () => {
    if (wrongAnswers.length === 0) return;

    // 오답 문제들로 새로운 세션 생성
    const session: GameSession = {
      id: `session_${Date.now()}`,
      mode: 'practice',
      type: wrongAnswers[0].type,
      difficulty: wrongAnswers[0].difficulty,
      problems: [...wrongAnswers],
      currentProblemIndex: 0,
      answers: [],
      startTime: Date.now(),
      score: 0,
      stars: 0,
    };

    startSession(session);
    navigate('/game');
  };

  const handleRemove = (problemId: string) => {
    removeFromWrongAnswers(problemId);
  };

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
          <h1 className="text-4xl font-bold text-center text-primary-600 mb-2">
            오답 노트 📔
          </h1>
          <p className="text-center text-gray-600">
            틀린 문제를 다시 풀어보고 실력을 키워요!
          </p>

          {wrongAnswers.length > 0 && (
            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="btn-primary text-xl"
              >
                모든 오답 다시 풀기 ({wrongAnswers.length}개) 🔄
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* 오답 목록 */}
        {wrongAnswers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12"
          >
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              완벽해요!
            </h2>
            <p className="text-xl text-gray-600">
              틀린 문제가 하나도 없어요!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {wrongAnswers.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card bg-red-50 border-2 border-red-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">
                        {problem.type === 'multiplication' ? '✖️' : '➗'}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {problem.question}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                            problem.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : problem.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {problem.difficulty === 'easy'
                            ? '쉬움'
                            : problem.difficulty === 'medium'
                            ? '보통'
                            : '어려움'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-700">정답:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {problem.answer}
                          {problem.remainder !== undefined && problem.remainder > 0 && (
                            <span className="text-lg ml-2">
                              (나머지 {problem.remainder})
                            </span>
                          )}
                        </span>
                      </div>

                      {/* 계산 과정 힌트 */}
                      <div className="text-sm text-gray-600 mt-2">
                        {problem.type === 'multiplication' ? (
                          <p>
                            💡 힌트: {problem.operand1} × {problem.operand2} = {problem.operand1}을(를){' '}
                            {problem.operand2}번 더하면 돼요!
                          </p>
                        ) : (
                          <p>
                            💡 힌트: {problem.operand1} ÷ {problem.operand2} ={' '}
                            {problem.operand2} × ? = {problem.operand1}을 생각해보세요!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 시각적 도움 */}
                    {problem.visualHelp && (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                        <p className="text-sm text-purple-800">
                          {problem.type === 'multiplication'
                            ? `${problem.visualHelp.count}개씩 ${problem.visualHelp.groups}묶음`
                            : `${problem.visualHelp.count}개를 ${problem.visualHelp.groups}개로 나누기`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 버튼들 */}
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const session: GameSession = {
                          id: `session_${Date.now()}`,
                          mode: 'practice',
                          type: problem.type,
                          difficulty: problem.difficulty,
                          problems: [problem],
                          currentProblemIndex: 0,
                          answers: [],
                          startTime: Date.now(),
                          score: 0,
                          stars: 0,
                        };
                        startSession(session);
                        navigate('/game');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl whitespace-nowrap"
                    >
                      다시 풀기 🔄
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(problem.id)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-xl whitespace-nowrap"
                    >
                      삭제 🗑️
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 학습 팁 */}
        {wrongAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">학습 팁</h3>
                <ul className="space-y-1 text-blue-800">
                  <li>• 틀린 문제는 여러 번 반복해서 풀어보세요.</li>
                  <li>• 시각적 도움 기능을 활용하면 더 쉽게 이해할 수 있어요.</li>
                  <li>• 비슷한 유형의 문제를 많이 풀어보면 실력이 늘어요!</li>
                  <li>• 천천히 차근차근 풀면 실수를 줄일 수 있어요.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WrongAnswers;

