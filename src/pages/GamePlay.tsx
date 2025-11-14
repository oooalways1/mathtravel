import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import type { UserAnswer, GameSession } from '../types';
import { checkAnswer, generateHints } from '../utils/problemGenerator';
import VisualHelp from '../components/VisualHelp';
import Confetti from '../components/Confetti';
import { useBgm } from '../hooks/useBgm';

const GamePlay = () => {
  const navigate = useNavigate();
  const currentSession = useGameStore((state) => state.currentSession);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const nextProblem = useGameStore((state) => state.nextProblem);
  const endSession = useGameStore((state) => state.endSession);
  const startSessionFromStore = useGameStore((state) => state.startSession);
  const settings = useGameStore((state) => state.settings);

  const [userInput, setUserInput] = useState('');
  const [remainderInput, setRemainderInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showVisualHelp, setShowVisualHelp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeInput, setActiveInput] = useState<'answer' | 'remainder'>('answer');
  const isPracticeSession = currentSession?.mode === 'practice';
  useBgm(
    isPracticeSession
      ? 'https://cdn.pixabay.com/download/audio/2023/12/07/audio_9e640bf29c.mp3?filename=playful-ambience-168008.mp3'
      : null,
    {
      play: Boolean(isPracticeSession),
      volume: 0.2,
    }
  );

  const currentProblem = currentSession?.problems[currentSession?.currentProblemIndex ?? 0];
  const hasRemainder =
    currentProblem?.type === 'division' &&
    currentProblem.remainder !== undefined &&
    currentProblem.remainder > 0;

  useEffect(() => {
    if (!currentSession) {
      const pending = sessionStorage.getItem('pending_practice_session');
      if (pending) {
        try {
          const session = JSON.parse(pending) as GameSession;
          startSessionFromStore(session);
          return;
        } catch (error) {
          console.error('세션 복원 실패:', error);
        } finally {
          sessionStorage.removeItem('pending_practice_session');
        }
      }
      navigate('/home');
    } else {
      sessionStorage.removeItem('pending_practice_session');
    }
  }, [currentSession, navigate, startSessionFromStore]);

  useEffect(() => {
    setActiveInput('answer');
  }, [currentSession?.id]);

  useEffect(() => {
    if (!hasRemainder && activeInput === 'remainder') {
      setActiveInput('answer');
    }
  }, [hasRemainder, activeInput]);

  if (!currentSession || !currentProblem) return null;

  const isLastProblem = currentSession.currentProblemIndex === currentSession.problems.length - 1;
  const progress = ((currentSession.currentProblemIndex + 1) / currentSession.problems.length) * 100;

  const hints = generateHints(currentProblem);

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const answer = parseInt(userInput);
    const remainder = hasRemainder && remainderInput ? parseInt(remainderInput) : undefined;
    const correct = checkAnswer(currentProblem, answer, remainder);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const userAnswer: UserAnswer = {
      problemId: currentProblem.id,
      answer,
      remainder,
      isCorrect: correct,
      timeSpent,
      hintsUsed,
    };

    submitAnswer(userAnswer);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // 2초 후 다음 문제로 또는 결과 화면으로
    setTimeout(() => {
      setShowFeedback(false);
      if (isLastProblem) {
        endSession();
        navigate('/results');
      } else {
        nextProblem();
        setUserInput('');
        setRemainderInput('');
        setStartTime(Date.now());
        setHintsUsed(0);
        setShowHint(false);
        setActiveInput('answer');
      }
    }, 2000);
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  const handleNumberClick = (num: string) => {
    if (hasRemainder && activeInput === 'remainder') {
      if (remainderInput.length < 2) {
        setRemainderInput((prev) => prev + num);
      }
      return;
    }

    if (userInput.length < 5) {
      setUserInput((prev) => prev + num);
      if (hasRemainder && activeInput !== 'remainder') {
        // 입력을 시작하면 몫 입력으로 고정
        setActiveInput('answer');
      }
    }
  };

  const handleBackspace = () => {
    if (hasRemainder && activeInput === 'remainder') {
      setRemainderInput((prev) => prev.slice(0, -1));
    } else {
      setUserInput((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (hasRemainder && activeInput === 'remainder') {
      setRemainderInput('');
    } else {
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {showConfetti && <Confetti />}
      
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (window.confirm('게임을 종료하시겠습니까?')) {
                endSession();
                navigate('/home');
              }
            }}
            className="text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
          >
            <span className="text-2xl">✕</span>
            <span>나가기</span>
          </motion.button>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              문제 {currentSession.currentProblemIndex + 1} / {currentSession.problems.length}
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl">⭐</div>
              <div className="text-sm font-bold">{currentSession.score}</div>
            </div>
          </div>
        </div>

        {/* 메인 게임 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 문제 영역 */}
          <motion.div
            key={currentProblem.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">
                {currentProblem.type === 'multiplication' ? '✖️' : '➗'}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {currentProblem.question}
              </h2>
            </div>

            {/* 시각적 도움 */}
            {showVisualHelp && (
              <div className="mb-6">
                <VisualHelp problem={currentProblem} />
              </div>
            )}

            {/* 답안 입력 */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-4">
              <div className="text-center mb-4">
                <label className="text-lg font-semibold text-gray-700 block mb-2">
                  {hasRemainder ? '몫' : '답'}
                </label>
                <div
                  className={`text-6xl font-bold min-h-[80px] flex items-center justify-center rounded-2xl border-4 ${
                    activeInput === 'answer'
                      ? 'text-primary-600 border-primary-300 bg-white'
                      : 'text-primary-400 border-transparent bg-transparent'
                  }`}
                  onClick={() => setActiveInput('answer')}
                >
                  {userInput || '_'}
                </div>
              </div>

              {hasRemainder && (
                <div className="text-center">
                  <label className="text-lg font-semibold text-gray-700 block mb-2">
                    나머지
                  </label>
                  <div
                    className={`text-5xl font-bold min-h-[70px] flex items-center justify-center rounded-2xl border-4 ${
                      activeInput === 'remainder'
                        ? 'text-secondary-600 border-secondary-300 bg-white'
                        : 'text-secondary-400 border-transparent bg-transparent'
                    }`}
                    onClick={() => setActiveInput('remainder')}
                  >
                    {remainderInput || '_'}
                  </div>
                </div>
              )}
            </div>

            {hasRemainder && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveInput('answer')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    activeInput === 'answer'
                      ? 'bg-primary-100 border-primary-400 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  몫 입력 중
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInput('remainder')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    activeInput === 'remainder'
                      ? 'bg-secondary-100 border-secondary-400 text-secondary-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  나머지 입력 중
                </button>
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVisualHelp(!showVisualHelp)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl"
              >
                {showVisualHelp ? '그림 숨기기 👁️' : '그림 보기 👁️'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHint}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl"
              >
                힌트 💡 ({hintsUsed})
              </motion.button>
            </div>

            {/* 힌트 표시 */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">힌트:</p>
                      {hints.slice(0, hintsUsed).map((hint, index) => (
                        <p key={index} className="text-yellow-800 mb-1">
                          {index + 1}. {hint}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 오른쪽: 숫자 키패드 */}
          <div className="card">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumberClick(num.toString())}
                  className="game-button"
                >
                  {num}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="game-button bg-red-100 hover:bg-red-200 text-red-700"
              >
                C
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNumberClick('0')}
                className="game-button"
              >
                0
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBackspace}
                className="game-button bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
              >
                ⌫
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!userInput || (hasRemainder && !remainderInput)}
              className="btn-success w-full mt-4 text-2xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              확인 ✓
            </motion.button>
          </div>
        </div>
      </div>

      {/* 피드백 모달 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`card max-w-md w-full text-center ${
                isCorrect ? 'bg-green-50 border-4 border-green-400' : 'bg-red-50 border-4 border-red-400'
              }`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: isCorrect ? [0, 10, -10, 0] : [0, -5, 5, 0],
                }}
                transition={{ duration: 0.5 }}
                className="text-9xl mb-4"
              >
                {isCorrect ? '🎉' : '😅'}
              </motion.div>

              <h2 className={`text-4xl font-bold mb-4 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '정답이에요!' : '아쉬워요!'}
              </h2>

              <p className={`text-2xl mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? (
                  <>훌륭해요! 계속 잘하고 있어요! 🌟</>
                ) : (
                  <>
                    정답은 <strong>{currentProblem.answer}</strong>
                    {hasRemainder && <> (나머지 {currentProblem.remainder})</>}
                    이에요. 다음엔 맞출 수 있어요! 💪
                  </>
                )}
              </p>

              {isCorrect && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: star * 0.1 }}
                      className="text-5xl"
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePlay;

