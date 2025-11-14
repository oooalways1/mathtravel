import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  GameSession,
  Problem,
  UserAnswer,
  GameSettings,
  LearningStats,
  Achievement,
  Character,
  CharacterItem,
} from '../types';
import { apiClient } from '../utils/api';

interface GameState {
  // 사용자 프로필
  profile: UserProfile | null;
  
  // 현재 게임 세션
  currentSession: GameSession | null;
  
  // 게임 설정
  settings: GameSettings;
  
  // Actions
  initializeProfile: (name: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loadProfileFromServer: () => Promise<void>;
  syncProfileToServer: () => Promise<void>;
  logout: () => void;
  
  // 게임 세션 관리
  startSession: (session: GameSession) => void;
  endSession: () => void;
  submitAnswer: (answer: UserAnswer) => void;
  nextProblem: () => void;
  
  // 캐릭터 관리
  updateCharacter: (updates: Partial<Character>) => void;
  equipItem: (itemId: string) => void;
  purchaseItem: (item: CharacterItem) => void;
  
  // 통계 업데이트
  updateStats: (answer: UserAnswer, problem: Problem) => void;
  
  // 업적
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  
  // 설정
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // 오답 노트
  addToWrongAnswers: (problem: Problem) => void;
  removeFromWrongAnswers: (problemId: string) => void;
  
  // 코인
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addMiniGameScore: (score: number) => void;
}

const defaultCharacter: Character = {
  id: 'char_1',
  name: '수학 탐험가',
  avatar: '🙂',
  level: 1,
  experience: 0,
  items: [],
};

const defaultStats: LearningStats = {
  totalProblems: 0,
  correctAnswers: 0,
  totalTime: 0,
  averageTime: 0,
  multiplicationStats: {
    total: 0,
    correct: 0,
    averageTime: 0,
    byDifficulty: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    },
  },
  divisionStats: {
    total: 0,
    correct: 0,
    averageTime: 0,
    byDifficulty: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    },
  },
  dailyStreak: 0,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  miniGameScore: 0,
};

const defaultAchievements: Achievement[] = [
  {
    id: 'first_problem',
    title: '첫 걸음',
    description: '첫 문제를 풀었어요!',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: 'ten_problems',
    title: '열심히 공부',
    description: '문제 10개를 풀었어요!',
    icon: '📚',
    unlocked: false,
    progress: 0,
    target: 10,
  },
  {
    id: 'perfect_score',
    title: '완벽해요!',
    description: '10문제를 연속으로 맞췄어요!',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    target: 10,
  },
  {
    id: 'week_streak',
    title: '꾸준함의 힘',
    description: '7일 연속 학습했어요!',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: 'multiplication_master',
    title: '곱셈 마스터',
    description: '곱셈 문제 50개를 풀었어요!',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: 'division_master',
    title: '나눗셈 마스터',
    description: '나눗셈 문제 50개를 풀었어요!',
    icon: '➗',
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: 'division_expert_100',
    title: '나눗셈 고수',
    description: '나눗셈 문제 100개를 풀었어요!',
    icon: '➗',
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: 'division_master_150',
    title: '나눗셈 달인',
    description: '나눗셈 문제 150개를 풀었어요!',
    icon: '➗',
    unlocked: false,
    progress: 0,
    target: 150,
  },
  {
    id: 'division_grandmaster_200',
    title: '나눗셈 그랜드마스터',
    description: '나눗셈 문제 200개를 풀었어요!',
    icon: '➗',
    unlocked: false,
    progress: 0,
    target: 200,
  },
  {
    id: 'division_champion_300',
    title: '나눗셈 챔피언',
    description: '나눗셈 문제 300개를 풀었어요!',
    icon: '➗',
    unlocked: false,
    progress: 0,
    target: 300,
  },
  {
    id: 'multiplication_expert_100',
    title: '곱셈 고수',
    description: '곱셈 문제 100개를 풀었어요!',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: 'multiplication_master_150',
    title: '곱셈 달인',
    description: '곱셈 문제 150개를 풀었어요!',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    target: 150,
  },
  {
    id: 'multiplication_grandmaster_200',
    title: '곱셈 그랜드마스터',
    description: '곱셈 문제 200개를 풀었어요!',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    target: 200,
  },
  {
    id: 'multiplication_champion_300',
    title: '곱셈 챔피언',
    description: '곱셈 문제 300개를 풀었어요!',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    target: 300,
  },
];

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  showVisualHelp: true,
  timeLimit: false,
  timeLimitSeconds: 60,
  difficulty: 'easy',
};

// 프로필 동기화를 위한 debounce 타이머
let syncTimer: NodeJS.Timeout | null = null;

const debouncedSync = (syncFn: () => Promise<void>) => {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
  syncTimer = setTimeout(() => {
    syncFn().catch(() => {
      // 동기화 실패는 조용히 무시 (로컬 데이터는 유지됨)
    });
  }, 1000); // 1초 후 동기화
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profile: null,
      currentSession: null,
      settings: defaultSettings,

      initializeProfile: (name: string) => {
        const profile: UserProfile = {
          id: `user_${Date.now()}`,
          name,
          character: defaultCharacter,
          coins: 0,
          stats: defaultStats,
          achievements: defaultAchievements,
          wrongAnswers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ profile });
      },

      updateProfile: async (updates) => {
        set((state) => {
          const newProfile = state.profile ? { ...state.profile, ...updates, updatedAt: Date.now() } : null;
          return { profile: newProfile };
        });
        
        // 서버에 동기화 (비동기, 에러는 무시)
        const state = get();
        if (state.profile && apiClient.getToken()) {
          get().syncProfileToServer().catch(() => {
            // 동기화 실패해도 로컬은 업데이트됨
          });
        }
      },

      loadProfileFromServer: async () => {
        try {
          if (!apiClient.getToken()) {
            return;
          }
          
          const serverProfile = await apiClient.getProfile();
          set({ profile: serverProfile });
        } catch (error) {
          console.error('프로필 로드 실패:', error);
          // 서버에서 로드 실패 시 로컬 프로필 유지
        }
      },

      syncProfileToServer: async () => {
        try {
          const state = get();
          if (!state.profile || !apiClient.getToken()) {
            return;
          }
          
          await apiClient.saveProfile(state.profile);
        } catch (error) {
          console.error('프로필 동기화 실패:', error);
          throw error;
        }
      },

      logout: async () => {
        await apiClient.logout();
        set({ profile: null, currentSession: null });
      },

      startSession: (session) => {
        set({ currentSession: session });
      },

      endSession: () => {
        const state = get();
        if (state.currentSession) {
          const session = state.currentSession;
          const correctAnswers = session.answers.filter((a) => a.isCorrect).length;
          const totalProblems = session.answers.length;
          const accuracy = totalProblems > 0 ? correctAnswers / totalProblems : 0;
          
          // 별 계산 (정답률에 따라)
          let stars = 0;
          if (accuracy >= 0.9) stars = 3;
          else if (accuracy >= 0.7) stars = 2;
          else if (accuracy >= 0.5) stars = 1;
          
          // 코인 지급
          const coinsEarned = correctAnswers * 10 + stars * 50;
          get().addCoins(coinsEarned);
          
          // 경험치 추가
          const expEarned = correctAnswers * 5;
          if (state.profile) {
            const newExp = state.profile.character.experience + expEarned;
            const newLevel = Math.floor(newExp / 100) + 1;
            
            get().updateCharacter({
              experience: newExp,
              level: newLevel,
            });

            // 싱글 모드 점수 계산 및 추가 (세션 점수 기반)
            const sessionScore = session.score || 0;
            const currentSingleScore = state.profile.stats.singleModeScore || 0;
            const newSingleScore = currentSingleScore + sessionScore;
            
            get().updateProfile({
              stats: {
                ...state.profile.stats,
                singleModeScore: newSingleScore,
              },
            });
          }
          
          // 업적 확인
          get().checkAchievements();
        }
        
        set({ currentSession: null });
      },

      submitAnswer: (answer) => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const session = state.currentSession;
          const problem = session.problems[session.currentProblemIndex];
          
          // 오답인 경우 오답 노트에 추가
          if (!answer.isCorrect) {
            get().addToWrongAnswers(problem);
          }
          
          // 통계 업데이트
          get().updateStats(answer, problem);
          
          return {
            currentSession: {
              ...session,
              answers: [...session.answers, answer],
              score: session.score + (answer.isCorrect ? 100 : 0),
            },
          };
        });
      },

      nextProblem: () => {
        set((state) => {
          if (!state.currentSession) return state;
          
          return {
            currentSession: {
              ...state.currentSession,
              currentProblemIndex: state.currentSession.currentProblemIndex + 1,
            },
          };
        });
      },

      updateCharacter: (updates) => {
        set((state) => {
          if (!state.profile) return state;
          
          const newProfile = {
            ...state.profile,
            character: {
              ...state.profile.character,
              ...updates,
            },
            updatedAt: Date.now(),
          };
          
          // 서버 동기화
          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }
          
          return { profile: newProfile };
        });
      },

      equipItem: (itemId) => {
        set((state) => {
          if (!state.profile) return state;
          
          const targetItem = state.profile.character.items.find((i) => i.id === itemId);
          const items = state.profile.character.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, equipped: !item.equipped };
            }
            if (targetItem && item.type === targetItem.type && item.equipped) {
              return { ...item, equipped: false };
            }
            return item;
          });

          const isEquipping = targetItem ? !targetItem.equipped : false;
          const characterStyle = {
            hat: hatItemImage(state.profile.character.items, itemId, isEquipping),
            clothes: clothesItemImage(state.profile.character.items, itemId, isEquipping),
            accessory: accessoryItemImage(state.profile.character.items, itemId, isEquipping),
          };
          
          return {
            profile: {
              ...state.profile,
              character: {
                ...state.profile.character,
                items,
                avatar: state.profile.character.avatar,
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      purchaseItem: (item) => {
        const state = get();
        if (!state.profile || state.profile.coins < item.price) return;
        
        if (get().spendCoins(item.price)) {
          set((state) => {
            if (!state.profile) return state;

            const newItem = { ...item, owned: true, equipped: true };
            
            return {
              profile: {
                ...state.profile,
                character: {
                  ...state.profile.character,
                  items: [
                    ...state.profile.character.items
                      .filter((existing) => existing.id !== item.id)
                      .map((existing) =>
                        existing.type === item.type ? { ...existing, equipped: false } : existing
                      ),
                    newItem,
                  ],
                },
                updatedAt: Date.now(),
              },
            };
          });
        }
      },

      updateStats: (answer, problem) => {
        set((state) => {
          if (!state.profile) return state;
          
          const stats = state.profile.stats;
          const operationStats = problem.type === 'multiplication' ? stats.multiplicationStats : stats.divisionStats;
          
          // 전체 통계 업데이트
          const newTotalProblems = stats.totalProblems + 1;
          const newCorrectAnswers = stats.correctAnswers + (answer.isCorrect ? 1 : 0);
          const newTotalTime = stats.totalTime + answer.timeSpent;
          const newAverageTime = newTotalTime / newTotalProblems;
          
          // 연산별 통계 업데이트
          const newOperationTotal = operationStats.total + 1;
          const newOperationCorrect = operationStats.correct + (answer.isCorrect ? 1 : 0);
          const newOperationTime = operationStats.averageTime * operationStats.total + answer.timeSpent;
          const newOperationAverageTime = newOperationTime / newOperationTotal;
          
          // 난이도별 통계 업데이트
          const difficultyStats = operationStats.byDifficulty[problem.difficulty];
          const newDifficultyTotal = difficultyStats.total + 1;
          const newDifficultyCorrect = difficultyStats.correct + (answer.isCorrect ? 1 : 0);
          
          // 연속 학습일 업데이트
          const today = new Date().toISOString().split('T')[0];
          const lastPlayed = stats.lastPlayedDate;
          let newStreak = stats.dailyStreak;
          
          if (today !== lastPlayed) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastPlayed === yesterday) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }
          
          const newStats: LearningStats = {
            totalProblems: newTotalProblems,
            correctAnswers: newCorrectAnswers,
            totalTime: newTotalTime,
            averageTime: newAverageTime,
            multiplicationStats: problem.type === 'multiplication' ? {
              total: newOperationTotal,
              correct: newOperationCorrect,
              averageTime: newOperationAverageTime,
              byDifficulty: {
                ...operationStats.byDifficulty,
                [problem.difficulty]: {
                  total: newDifficultyTotal,
                  correct: newDifficultyCorrect,
                },
              },
            } : stats.multiplicationStats,
            divisionStats: problem.type === 'division' ? {
              total: newOperationTotal,
              correct: newOperationCorrect,
              averageTime: newOperationAverageTime,
              byDifficulty: {
                ...operationStats.byDifficulty,
                [problem.difficulty]: {
                  total: newDifficultyTotal,
                  correct: newDifficultyCorrect,
                },
              },
            } : stats.divisionStats,
            dailyStreak: newStreak,
            lastPlayedDate: today,
          };
          
          const newProfile = {
            ...state.profile,
            stats: newStats,
            updatedAt: Date.now(),
          };
          
          // 서버 동기화
          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }
          
          return { profile: newProfile };
        });
      },

      checkAchievements: () => {
        const state = get();
        if (!state.profile) return;
        
        const stats = state.profile.stats;
        const achievements = state.profile.achievements;
        
        achievements.forEach((achievement) => {
          if (achievement.unlocked) return;
          
          let progress = 0;
          
          switch (achievement.id) {
            case 'first_problem':
              progress = stats.totalProblems;
              break;
            case 'ten_problems':
              progress = stats.totalProblems;
              break;
            case 'perfect_score':
              // 최근 10문제 연속 정답 체크
              if (state.currentSession) {
                const recentAnswers = state.currentSession.answers.slice(-10);
                if (recentAnswers.length >= 10 && recentAnswers.every((a) => a.isCorrect)) {
                  progress = 10;
                }
              }
              break;
            case 'week_streak':
              progress = stats.dailyStreak;
              break;
            case 'multiplication_master':
              progress = stats.multiplicationStats.total;
              break;
            case 'division_master':
              progress = stats.divisionStats.total;
              break;
            case 'multiplication_expert_100':
              progress = stats.multiplicationStats.total;
              break;
            case 'multiplication_master_150':
              progress = stats.multiplicationStats.total;
              break;
            case 'multiplication_grandmaster_200':
              progress = stats.multiplicationStats.total;
              break;
            case 'multiplication_champion_300':
              progress = stats.multiplicationStats.total;
              break;
            case 'division_expert_100':
              progress = stats.divisionStats.total;
              break;
            case 'division_master_150':
              progress = stats.divisionStats.total;
              break;
            case 'division_grandmaster_200':
              progress = stats.divisionStats.total;
              break;
            case 'division_champion_300':
              progress = stats.divisionStats.total;
              break;
          }
          
          if (progress >= achievement.target) {
            get().unlockAchievement(achievement.id);
          } else {
            // 진행도 업데이트
            set((state) => {
              if (!state.profile) return state;
              
              return {
                profile: {
                  ...state.profile,
                  achievements: state.profile.achievements.map((a) =>
                    a.id === achievement.id ? { ...a, progress } : a
                  ),
                  updatedAt: Date.now(),
                },
              };
            });
          }
        });
      },

      unlockAchievement: (achievementId) => {
        set((state) => {
          if (!state.profile) return state;
          
          const achievement = state.profile.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;
          
          // 업적 해제 보상 (코인 100개)
          get().addCoins(100);
          
          const newProfile = {
            ...state.profile,
            achievements: state.profile.achievements.map((a) =>
              a.id === achievementId
                ? { ...a, unlocked: true, unlockedAt: Date.now(), progress: a.target }
                : a
            ),
            updatedAt: Date.now(),
          };
          
          // 서버 동기화
          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }
          
          return { profile: newProfile };
        });
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      addToWrongAnswers: (problem) => {
        set((state) => {
          if (!state.profile) return state;
          
          // 중복 체크 (같은 문제는 추가하지 않음)
          const exists = state.profile.wrongAnswers.some(
            (p) => p.operand1 === problem.operand1 && p.operand2 === problem.operand2 && p.type === problem.type
          );
          
          if (exists) return state;
          
          return {
            profile: {
              ...state.profile,
              wrongAnswers: [...state.profile.wrongAnswers, problem],
              updatedAt: Date.now(),
            },
          };
        });
      },

      removeFromWrongAnswers: (problemId) => {
        set((state) => {
          if (!state.profile) return state;
          
          return {
            profile: {
              ...state.profile,
              wrongAnswers: state.profile.wrongAnswers.filter((p) => p.id !== problemId),
              updatedAt: Date.now(),
            },
          };
        });
      },

      addCoins: (amount) => {
        set((state) => {
          if (!state.profile) return state;
          
          const newProfile = {
            ...state.profile,
            coins: state.profile.coins + amount,
            updatedAt: Date.now(),
          };
          
          // 서버 동기화
          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }
          
          return { profile: newProfile };
        });
      },

      spendCoins: (amount) => {
        const state = get();
        if (!state.profile || state.profile.coins < amount) return false;
        
        set((state) => {
          if (!state.profile) return state;
          
          const newProfile = {
            ...state.profile,
            coins: state.profile.coins - amount,
            updatedAt: Date.now(),
          };
          
          // 서버 동기화
          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }
          
          return { profile: newProfile };
        });
        
        return true;
      },

      addMiniGameScore: (score) => {
        set((state) => {
          if (!state.profile) return state;

          const currentBest = state.profile.stats.miniGameScore || 0;
          if (score <= currentBest) return state;

          const newProfile = {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              miniGameScore: score,
            },
            updatedAt: Date.now(),
          };

          if (apiClient.getToken()) {
            debouncedSync(() => get().syncProfileToServer());
          }

          return { profile: newProfile };
        });
      },
    }),
    {
      name: 'math-adventure-storage',
    }
  )
);

