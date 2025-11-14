// 게임 모드
export type GameMode = 'adventure' | 'practice' | 'challenge' | 'single' | 'battle' | 'minigame';

// 연산 타입
export type OperationType = 'multiplication' | 'division';

// 난이도
export type Difficulty = 'easy' | 'medium' | 'hard';

// 문제 타입
export interface Problem {
  id: string;
  type: OperationType;
  operand1: number;
  operand2: number;
  answer: number;
  remainder?: number; // 나눗셈의 나머지
  question: string;
  visualHelp?: VisualHelp;
  difficulty: Difficulty;
}

// 시각적 도움
export interface VisualHelp {
  type: 'blocks' | 'fruits' | 'animals';
  count: number;
  groups?: number;
}

// 사용자 답안
export interface UserAnswer {
  problemId: string;
  answer: number;
  remainder?: number;
  isCorrect: boolean;
  timeSpent: number; // 초 단위
  hintsUsed: number;
}

// 게임 세션
export interface GameSession {
  id: string;
  mode: GameMode;
  type: OperationType;
  difficulty: Difficulty;
  problems: Problem[];
  currentProblemIndex: number;
  answers: UserAnswer[];
  startTime: number;
  endTime?: number;
  score: number;
  stars: number;
}

// 캐릭터
export interface Character {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  items: CharacterItem[];
}

// 캐릭터 아이템
export interface CharacterItem {
  id: string;
  type: 'hat' | 'clothes' | 'accessory' | 'character';
  name: string;
  image: string;
  price: number;
  owned: boolean;
  equipped: boolean;
}

// 업적
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
}

// 학습 통계
export interface LearningStats {
  totalProblems: number;
  correctAnswers: number;
  totalTime: number; // 초 단위
  averageTime: number;
  multiplicationStats: OperationStats;
  divisionStats: OperationStats;
  dailyStreak: number;
  lastPlayedDate: string;
  singleModeScore?: number; // 싱글 모드 누적 점수
  battleModeScore?: number; // 대전 모드 누적 점수
  miniGameScore?: number; // 미니게임 최고 점수
}

// 연산별 통계
export interface OperationStats {
  total: number;
  correct: number;
  averageTime: number;
  byDifficulty: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
}

// 사용자 프로필
export interface UserProfile {
  id: string;
  name: string;
  character: Character;
  coins: number;
  stats: LearningStats;
  achievements: Achievement[];
  wrongAnswers: Problem[]; // 오답 노트
  createdAt: number;
  updatedAt: number;
}

// 게임 설정
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  showVisualHelp: boolean;
  timeLimit: boolean;
  timeLimitSeconds: number;
  difficulty: Difficulty;
}

// 힌트
export interface Hint {
  level: number;
  text: string;
  visualAid?: string;
}

// 인증 관련
export interface AuthUser {
  id: string;
  username: string;
  name: string;
  createdAt: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
}

// 랭킹 관련
export interface LeaderboardEntry {
  id: string;
  username: string;
  name: string;
  coins: number;
  level: number;
  totalProblems: number;
  totalTime: number;
  correctAnswers: number;
  singleModeScore: number;
  battleModeScore: number;
  miniGameScore?: number;
  createdAt: number;
}

export type LeaderboardType = 'single' | 'battle' | 'minigame';

// 대전 모드 관련
export interface BattleSession {
  id: string;
  roomCode: string;
  hostId?: string;
  createdAt: number;
  endedAt?: number;
  status: 'waiting' | 'playing' | 'ended';
  maxPlayers: number;
  currentPlayers: number;
}

export interface BattleParticipant {
  id: string;
  battleSessionId: string;
  userId: string;
  username: string;
  name: string;
  score: number;
  correctCount: number;
  joinedAt: number;
}

export interface FallingProblem extends Problem {
  x: number; // 화면상 x 위치 (0-100%)
  y?: number; // 화면상 y 위치 (px)
  speed: number; // 떨어지는 속도
  spawnTime: number; // 생성 시간
}


