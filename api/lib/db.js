// 간단한 인메모리 데이터베이스 (실제 프로덕션에서는 PostgreSQL, MongoDB 등 사용)
const users = new Map();
const userProfiles = {};

// 기본 프로필 생성 함수
function createDefaultProfile(userId, userName) {
  return {
    id: userId,
    name: userName,
    character: {
      id: 'char_1',
      name: '수학 탐험가',
      avatar: '🧑‍🎓',
      level: 1,
      experience: 0,
      items: [],
    },
    coins: 0,
    stats: {
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
    },
    achievements: [
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
    ],
    wrongAnswers: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const db = {
  async getUserByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  async createUser(data) {
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: Date.now(),
    };
    users.set(user.id, user);
    
    // 기본 프로필 생성
    userProfiles[user.id] = createDefaultProfile(user.id, user.name);
    
    return user;
  },

  async getUserProfile(userId) {
    return userProfiles[userId] || null;
  },

  async createUserProfile(userId) {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const profile = createDefaultProfile(userId, user.name);
    userProfiles[userId] = profile;
    return profile;
  },

  async updateUserProfile(userId, updates) {
    const currentProfile = userProfiles[userId] || await this.createUserProfile(userId);
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      id: userId, // ID는 변경 불가
      updatedAt: Date.now(),
    };
    userProfiles[userId] = updatedProfile;
    return updatedProfile;
  },
};

