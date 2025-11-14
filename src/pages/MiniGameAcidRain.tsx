import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import type { Problem } from '../types';
import { generateProblem } from '../utils/problemGenerator';

interface RainDrop {
  id: string;
  problem: Problem;
  progress: number;
  speed: number;
}

const GAME_DURATION = 90; // seconds
const SPAWN_INTERVAL = 2000; // ms
const MAX_LIVES = 3;

const MiniGameAcidRain = () => {
  const navigate = useNavigate();
  const addCoins = useGameStore((state) => state.addCoins);
  const addMiniGameScore = useGameStore((state) => state.addMiniGameScore);
  const bestScore = useGameStore((state) => state.profile?.stats.miniGameScore ?? 0);

  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [answer, setAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const lastTimestampRef = useRef<number>(0);

  const resetGame = () => {
    setDrops([]);
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(GAME_DURATION);
    setAnswer('');
  };

  const createDrop = (): RainDrop => {
    const operation = Math.random() > 0.4 ? 'multiplication' : 'division';
    let problem = generateProblem(operation, difficulty);
    if (operation === 'division' && problem.remainder && problem.remainder > 0) {
      problem = generateProblem('division', 'easy');
    }
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `drop_${Date.now()}_${Math.random()}`;
    return {
      id,
      problem,
      progress: 0,
      speed: 0.025 + Math.random() * 0.04,
    };
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  const endGame = (interrupted = false) => {
    setIsPlaying(false);
    setDrops([]);
    clearInterval(spawnTimerRef.current);
    cancelAnimationFrame(animationRef.current || 0);
    if (!interrupted && score > 0) {
      addMiniGameScore(score);
      addCoins(Math.floor(score / 50));
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    spawnTimerRef.current = setInterval(() => {
      setDrops((prev) => [...prev, createDrop()]);
    }, SPAWN_INTERVAL);

    const handleAnimation = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setDrops((prev) =>
        prev
          .map((drop) => ({ ...drop, progress: drop.progress + drop.speed * delta }))
          .filter((drop) => {
            if (drop.progress >= 1) {
              setLives((l) => Math.max(0, l - 1));
              return false;
            }
            return true;
          })
      );

      animationRef.current = requestAnimationFrame(handleAnimation);
    };

    animationRef.current = requestAnimationFrame(handleAnimation);

    return () => {
      clearInterval(spawnTimerRef.current);
      cancelAnimationFrame(animationRef.current || 0);
      lastTimestampRef.current = 0;
    };
  }, [isPlaying, difficulty]);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0 || lives <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, lives, isPlaying]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const value = parseInt(answer);
    setAnswer('');

    setDrops((prev) => {
      const index = prev.findIndex((drop) => drop.problem.answer === value);
      if (index === -1) return prev;

      const newDrops = [...prev];
      newDrops.splice(index, 1);
      setScore((s) => s + 100);
      return newDrops;
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (isPlaying ? endGame(true) : navigate('/mini-games'))}
            className="text-white/80 hover:text-white text-lg flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            {isPlaying ? '그만하기' : '돌아가기'}
          </button>
          {!isPlaying && (
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    difficulty === level ? 'bg-white text-slate-900' : 'bg-white/20'
                  }`}
                >
                  {level === 'easy' ? '쉬움' : level === 'medium' ? '보통' : '어려움'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card bg-white/10 backdrop-blur border border-white/20 h-[520px] relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-slate-900/40" />
              {!isPlaying ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                  <div className="text-7xl">🌧️</div>
                  <h1 className="text-4xl font-bold">산성비 게임</h1>
                  <p className="text-white/80 max-w-md">
                    떨어지는 곱셈/나눗셈 문제를 빠르게 풀어 산성비를 막아보세요!
                    연속으로 맞힐수록 더 높은 점수를 얻을 수 있어요.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="btn-primary text-xl px-10 py-4"
                  >
                    시작하기
                  </motion.button>
                </div>
              ) : (
                <div className="h-full relative">
                  {drops.map((drop) => (
                    <motion.div
                      key={drop.id}
                      className="absolute left-0 right-0 mx-auto max-w-xs bg-white/90 text-slate-900 rounded-2xl shadow-xl p-4"
                      style={{ top: `${drop.progress * 85}%` }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-2xl font-bold text-center">
                        {drop.problem.type === 'multiplication'
                          ? `${drop.problem.operand1} × ${drop.problem.operand2}`
                          : `${drop.problem.operand1} ÷ ${drop.problem.operand2}`}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card bg-white/10 border border-white/20 backdrop-blur">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>남은 시간</span>
                <span>{timeLeft}s</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                />
              </div>
            </div>

            <div className="card bg-white/10 border border-white/20 backdrop-blur">
              <div className="text-sm text-white/70 mb-1">점수</div>
              <div className="text-4xl font-bold">{score}</div>
              {bestScore > 0 && (
                <p className="text-xs text-white/60 mt-1">최고 점수 {bestScore}</p>
              )}
            </div>

            <div className="card bg-white/10 border border-white/20 backdrop-blur">
              <div className="text-sm text-white/70 mb-2">기회</div>
              <div className="flex gap-2">
                {Array.from({ length: MAX_LIVES }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-3 rounded-full ${
                      index < lives ? 'bg-pink-400' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isPlaying && (
              <form onSubmit={handleSubmit} className="card bg-white/10 border border-white/20 backdrop-blur">
                <label className="block text-sm text-white/70 mb-2">정답 입력</label>
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 font-bold text-2xl"
                  placeholder="정답을 입력하세요"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-success w-full mt-4"
                  type="submit"
                >
                  입력하기
                </motion.button>
              </form>
            )}

            {!isPlaying && score > 0 && (
              <div className="card bg-white/10 border border-white/20 backdrop-blur text-center">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-white/80 mb-2">최고 점수</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGameAcidRain;


