import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../utils/supabase';
import { useBgm } from '../hooks/useBgm';
import {
  createBattleSession,
  joinBattleSessionByCode,
  getBattleSessionByCode,
  getBattleParticipants,
  updateBattleScore,
  startBattleSession,
  endBattleSession,
} from '../utils/battle';
import { generateProblem } from '../utils/problemGenerator';
import { checkAnswer } from '../utils/problemGenerator';
import type { FallingProblem, BattleParticipant, BattleSession } from '../types';
import { apiClient } from '../utils/api';

const BATTLE_DURATION = 120; // 2분 (120초)
const PROBLEM_SPAWN_INTERVAL = 2000; // 2초마다 문제 생성
const PROBLEM_FALL_SPEED = 2; // 떨어지는 속도 (px/frame)

type BattleModeState = 'menu' | 'create' | 'join' | 'waiting' | 'playing' | 'ended';

const BattleMode = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const [mode, setMode] = useState<BattleModeState>('menu');
  const [battleSession, setBattleSession] = useState<BattleSession | null>(null);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const [fallingProblems, setFallingProblems] = useState<FallingProblem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');
  useBgm(
    'https://cdn.pixabay.com/download/audio/2022/10/09/audio_fbb99d9db0.mp3?filename=epic-battle-music-121123.mp3',
    {
      play: mode === 'playing',
      volume: 0.25,
    }
  );
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!profile) {
      navigate('/home');
      return;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [profile, navigate]);

  // 참여 코드 생성 함수 (랜덤 6자리 영숫자)
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    // 중복 방지를 위해 더 많은 랜덤성 확보
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars.charAt(randomIndex);
    }
    return code;
  };

  // 방 만들기
  const handleCreateRoom = async () => {
    if (!profile) return;

    setError('');
    try {
      // 중복 방지를 위해 최대 5번 시도
      let roomCode = '';
      let session = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!session && attempts < maxAttempts) {
        roomCode = generateRoomCode();
        session = await createBattleSession(roomCode, profile.id);
        attempts++;
        
        // 세션이 null이면 코드 중복일 수 있으므로 재시도
        if (!session && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 짧은 대기
        }
      }
      
      if (!session) {
        setError('방 생성에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // 방장으로 참가
      const joined = await joinBattleSessionByCode(roomCode, profile.id);
      if (!joined) {
        setError('방 참가에 실패했습니다.');
        return;
      }

      setBattleSession(session);
      setIsHost(true);
      setMode('waiting');
      loadParticipants(session.id);
      setupRealtimeSubscription(session.id);
    } catch (error) {
      console.error('방 생성 오류:', error);
      setError('방 생성 중 오류가 발생했습니다.');
    }
  };

  // 게임 참여하기
  const handleJoinRoom = async () => {
    if (!profile || !roomCodeInput.trim()) {
      setError('참여 코드를 입력해주세요.');
      return;
    }

    setError('');
    try {
      const code = roomCodeInput.trim().toUpperCase();
      const session = await getBattleSessionByCode(code);
      
      if (!session) {
        setError('존재하지 않는 방 코드입니다.');
        return;
      }

      if (session.status !== 'waiting') {
        setError('이미 시작된 게임입니다.');
        return;
      }

      if (session.currentPlayers >= session.maxPlayers) {
        setError('방이 가득 찼습니다.');
        return;
      }

      const joined = await joinBattleSessionByCode(code, profile.id);
      if (!joined) {
        setError('방 참가에 실패했습니다.');
        return;
      }

      setBattleSession(session);
      setIsHost(session.hostId === profile.id);
      setMode('waiting');
      loadParticipants(session.id);
      setupRealtimeSubscription(session.id);
    } catch (error) {
      console.error('방 참가 오류:', error);
      setError('방 참가 중 오류가 발생했습니다.');
    }
  };

  // 실시간 구독 설정
  const setupRealtimeSubscription = (sessionId: string) => {
    const channel = supabase
      .channel(`battle:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_participants',
          filter: `battle_session_id=eq.${sessionId}`,
        },
        () => {
          loadParticipants(sessionId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new.status === 'playing' && mode === 'waiting') {
            setMode('playing');
            startGame(sessionId);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  // 방장이 게임 시작
  const handleStartGame = async () => {
    if (!battleSession || !isHost) return;
    
    if (participants.length < 2) {
      setError('최소 2명 이상 필요합니다.');
      return;
    }

    await startBattleSession(battleSession.id);
    setMode('playing');
    startGame(battleSession.id);
  };

  const loadParticipants = async (sessionId: string) => {
    const data = await getBattleParticipants(sessionId);
    setParticipants(data);
  };

  const startGame = async (sessionId: string) => {
    setTimeLeft(BATTLE_DURATION);
    setScore(0);
    setCorrectCount(0);
    setFallingProblems([]);
    lastSpawnTimeRef.current = Date.now();

    // 타이머 시작
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          endGame(sessionId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 게임 루프 시작
    gameLoop(sessionId);
  };

  const gameLoop = (sessionId: string) => {
    const animate = () => {
      if (mode !== 'playing') return;

      const now = Date.now();
      
      // 문제 생성
      if (now - lastSpawnTimeRef.current >= PROBLEM_SPAWN_INTERVAL) {
        spawnProblem();
        lastSpawnTimeRef.current = now;
      }

      // 문제 이동
      setFallingProblems((prev) => {
        return prev
          .map((problem) => ({
            ...problem,
            y: (problem.y || 0) + PROBLEM_FALL_SPEED,
          }))
          .filter((problem) => {
            const y = problem.y || 0;
            if (y > window.innerHeight) {
              return false;
            }
            return true;
          });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const spawnProblem = () => {
    const problem = generateProblem('multiplication', 'medium');
    const fallingProblem: FallingProblem = {
      ...problem,
      x: Math.random() * 80 + 10,
      speed: PROBLEM_FALL_SPEED,
      spawnTime: Date.now(),
      y: 0,
    } as FallingProblem;
    setFallingProblems((prev) => [...prev, fallingProblem]);
  };

  const handleAnswer = async (problem: FallingProblem) => {
    const answer = parseInt(userInput);
    if (isNaN(answer)) return;

    const isCorrect = checkAnswer(problem, answer);
    
    if (isCorrect) {
      const newScore = score + 100;
      const newCorrectCount = correctCount + 1;
      
      setScore(newScore);
      setCorrectCount(newCorrectCount);
      setShowFeedback('correct');
      
      setFallingProblems((prev) => prev.filter((p) => p.id !== problem.id));

      if (battleSession) {
        await updateBattleScore(battleSession.id, profile!.id, newScore, newCorrectCount);
      }
    } else {
      setShowFeedback('wrong');
    }

    setUserInput('');
    setTimeout(() => setShowFeedback(null), 1000);
  };

  const endGame = async (sessionId: string) => {
    setMode('ended');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (profile) {
      const currentProfile = await apiClient.getProfile();
      const newBattleScore = (currentProfile.stats.battleModeScore || 0) + score;
      
      await apiClient.updateProfile({
        stats: {
          ...currentProfile.stats,
          battleModeScore: newBattleScore,
        },
      });
    }

    await endBattleSession(sessionId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput && fallingProblems.length > 0 && mode === 'playing') {
      handleAnswer(fallingProblems[0]);
    }
  };

  // 시간 게이지 계산
  const timeProgress = (timeLeft / BATTLE_DURATION) * 100;

  // 메뉴 화면
  if (mode === 'menu') {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-8">⚔️ 대전 모드</h1>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateRoom}
                className="w-full btn-primary text-xl py-4"
              >
                🏠 방 만들기
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('join')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-xl"
              >
                🎮 게임 참여하기
              </motion.button>
            </div>

            <button
              onClick={() => navigate('/home')}
              className="mt-6 text-gray-600 hover:text-gray-800"
            >
              ← 홈으로 돌아가기
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 참여 코드 입력 화면
  if (mode === 'join') {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              참여 코드 입력
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => {
                  setRoomCodeInput(e.target.value.toUpperCase().slice(0, 6));
                  setError('');
                }}
                placeholder="6자리 코드 입력"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 text-center text-2xl font-bold tracking-widest"
                maxLength={6}
                autoFocus
              />
              
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('menu')}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                >
                  참여하기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 게임 화면
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">⚔️ 대전 모드</h1>
              {battleSession && (
                <div className="text-sm text-gray-600 mt-1">
                  방 코드: <span className="font-bold text-primary-600">{battleSession.roomCode}</span>
                  {isHost && <span className="ml-2 text-green-600">(방장)</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{score}</div>
                <div className="text-xs text-gray-600">점수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-gray-600">정답</div>
              </div>
              <div className="text-center min-w-[80px]">
                <div className="text-2xl font-bold text-red-600">{timeLeft}초</div>
                <div className="text-xs text-gray-600">남은 시간</div>
              </div>
            </div>
          </div>
          
          {/* 시간 게이지 */}
          {mode === 'playing' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${timeProgress}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 게임 영역 */}
          <div className="lg:col-span-2">
            <div className="card relative overflow-hidden" style={{ height: '600px' }} ref={gameAreaRef}>
              {mode === 'waiting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <div className="text-2xl font-bold mb-2">대기 중...</div>
                    {battleSession && (
                      <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-2">참여 코드</div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-4xl font-bold text-primary-600 mb-4 tracking-widest"
                        >
                          {battleSession.roomCode}
                        </motion.div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(battleSession.roomCode);
                            alert('코드가 복사되었습니다!');
                          }}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold text-sm"
                        >
                          📋 코드 복사하기
                        </motion.button>
                      </div>
                    )}
                    <div className="text-gray-600 mb-4">
                      참가자: {participants.length}명 / 최대 10명
                    </div>
                    {isHost && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartGame}
                        disabled={participants.length < 2}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        게임 시작하기
                      </motion.button>
                    )}
                    {!isHost && (
                      <div className="text-sm text-gray-500">
                        방장이 게임을 시작할 때까지 기다려주세요
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'ended' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-2xl font-bold mb-4">게임 종료!</div>
                    <div className="text-xl mb-2">최종 점수: {score}점</div>
                    <div className="text-lg text-gray-600 mb-6">정답 수: {correctCount}개</div>
                    <button
                      onClick={() => navigate('/home')}
                      className="btn-primary"
                    >
                      홈으로 돌아가기
                    </button>
                  </div>
                </div>
              )}

              {/* 떨어지는 문제 */}
              <AnimatePresence>
                {fallingProblems.map((problem) => (
                  <motion.div
                    key={problem.id}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: problem.y || 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      left: `${problem.x}%`,
                      top: `${problem.y || 0}px`,
                      transform: 'translateX(-50%)',
                    }}
                    className="bg-white border-2 border-primary-500 rounded-lg p-4 shadow-lg min-w-[120px] text-center"
                  >
                    <div className="text-2xl font-bold text-primary-600">
                      {problem.question}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* 입력 영역 */}
              {mode === 'playing' && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-primary-500">
                    <input
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="답을 입력하세요"
                      className="text-2xl text-center border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 w-48"
                      autoFocus
                    />
                    {showFeedback === 'correct' && (
                      <div className="text-green-500 text-center mt-2 font-bold">✓ 정답!</div>
                    )}
                    {showFeedback === 'wrong' && (
                      <div className="text-red-500 text-center mt-2 font-bold">✗ 오답</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 실시간 순위 */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">실시간 순위</h2>
            <div className="space-y-2">
              {participants
                .sort((a, b) => b.score - a.score)
                .map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      participant.userId === profile?.id
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{index + 1}위</span>
                      <span className={participant.userId === profile?.id ? 'font-bold' : ''}>
                        {participant.name}
                      </span>
                    </div>
                    <div className="font-bold text-primary-600">{participant.score}점</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleMode;

