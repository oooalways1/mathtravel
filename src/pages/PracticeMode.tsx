import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import type { OperationType, Difficulty, GameSession } from '../types';
import { generateProblems } from '../utils/problemGenerator';

const PracticeMode = () => {
  const navigate = useNavigate();
  const startSession = useGameStore((state) => state.startSession);
  const settings = useGameStore((state) => state.settings);
  
  const [selectedType, setSelectedType] = useState<OperationType>('multiplication');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.difficulty);
  const [problemCount, setProblemCount] = useState(10);
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    try {
      setStartError('');
      setStarting(true);

      const problems = generateProblems(selectedType, selectedDifficulty, problemCount);
      if (!problems.length) {
        throw new Error('문제를 불러오지 못했습니다. 다시 시도해주세요.');
      }
      
      const session: GameSession = {
        id: `session_${Date.now()}`,
        mode: 'practice',
        type: selectedType,
        difficulty: selectedDifficulty,
        problems,
        currentProblemIndex: 0,
        answers: [],
        startTime: Date.now(),
        score: 0,
        stars: 0,
      };
      
      startSession(session);
      sessionStorage.setItem('pending_practice_session', JSON.stringify(session));
      setTimeout(() => {
        const latestSession = useGameStore.getState().currentSession;
        if (!latestSession || latestSession.id !== session.id) {
          setStartError('세션 정보를 불러오지 못했습니다. 다시 시도해주세요.');
          setStarting(false);
          sessionStorage.removeItem('pending_practice_session');
          return;
        }

        navigate('/game');
        setStarting(false);
      }, 0);
    } catch (error) {
      setStarting(false);
      setStartError(error instanceof Error ? error.message : '문제를 시작할 수 없습니다.');
    }
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-4xl font-bold text-center text-primary-600 mb-2">
            연습 모드 🎯
          </h1>
          <p className="text-center text-gray-600 mb-8">
            원하는 설정으로 문제를 풀어보세요!
          </p>

          {/* 연산 타입 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">연산 타입</h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType('multiplication')}
                className={`p-6 rounded-2xl border-4 transition-all ${
                  selectedType === 'multiplication'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-5xl mb-2">✖️</div>
                <div className="text-xl font-bold">곱셈</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType('division')}
                className={`p-6 rounded-2xl border-4 transition-all ${
                  selectedType === 'division'
                    ? 'border-secondary-500 bg-secondary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-5xl mb-2">➗</div>
                <div className="text-xl font-bold">나눗셈</div>
              </motion.button>
            </div>
          </div>

          {/* 난이도 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">난이도</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'easy' as Difficulty, label: '쉬움', emoji: '😊', color: 'success' },
                { value: 'medium' as Difficulty, label: '보통', emoji: '🤔', color: 'warning' },
                { value: 'hard' as Difficulty, label: '어려움', emoji: '😤', color: 'red' },
              ].map((difficulty) => (
                <motion.button
                  key={difficulty.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={`p-4 rounded-2xl border-4 transition-all ${
                    selectedDifficulty === difficulty.value
                      ? `border-${difficulty.color}-500 bg-${difficulty.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{difficulty.emoji}</div>
                  <div className="text-lg font-bold">{difficulty.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 문제 수 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              문제 수: {problemCount}개
            </h2>
            <input
              type="range"
              min="5"
              max="20"
              step="5"
              value={problemCount}
              onChange={(e) => setProblemCount(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>5개</span>
              <span>10개</span>
              <span>15개</span>
              <span>20개</span>
            </div>
          </div>

          {/* 설명 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">선택한 설정</h3>
                <p className="text-blue-800">
                  <strong>{selectedType === 'multiplication' ? '곱셈' : '나눗셈'}</strong> 문제를{' '}
                  <strong>
                    {selectedDifficulty === 'easy' ? '쉬움' : selectedDifficulty === 'medium' ? '보통' : '어려움'}
                  </strong>{' '}
                  난이도로 <strong>{problemCount}개</strong> 풀게 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 시작 버튼 */}
          {startError && (
            <div className="mb-4 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {startError}
            </div>
          )}

          <motion.button
            whileHover={{ scale: starting ? 1 : 1.05 }}
            whileTap={{ scale: starting ? 1 : 0.95 }}
            onClick={handleStart}
            disabled={starting}
            className="btn-primary w-full text-2xl py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {starting ? '문제를 준비 중...' : '시작하기 🚀'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PracticeMode;

