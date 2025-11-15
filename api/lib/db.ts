import type { UserProfile } from '../../src/types/index.js';

// ê°„ë‹¨???¸ë©”ëª¨ë¦¬ ?°ì´?°ë² ?´ìŠ¤ (?¤ì œ ?„ë¡œ?•ì…˜?ì„œ??PostgreSQL, MongoDB ???¬ìš©)
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

interface UserData {
  [userId: string]: UserProfile;
}

const users: Map<string, User> = new Map();
const userProfiles: UserData = {};

// ê¸°ë³¸ ?„ë¡œ???ì„± ?¨ìˆ˜
function createDefaultProfile(userId: string, userName: string): UserProfile {
  return {
    id: userId,
    name: userName,
    character: {
      id: 'char_1',
      name: '?˜í•™ ?í—˜ê°€',
      avatar: '?§‘?ğŸ?,
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
        title: 'ì²?ê±¸ìŒ',
        description: 'ì²?ë¬¸ì œë¥??€?ˆì–´??',
        icon: '?¯',
        unlocked: false,
        progress: 0,
        target: 1,
      },
      {
        id: 'ten_problems',
        title: '?´ì‹¬??ê³µë?',
        description: 'ë¬¸ì œ 10ê°œë? ?€?ˆì–´??',
        icon: '?“š',
        unlocked: false,
        progress: 0,
        target: 10,
      },
      {
        id: 'perfect_score',
        title: '?„ë²½?´ìš”!',
        description: '10ë¬¸ì œë¥??°ì†?¼ë¡œ ë§ì·„?´ìš”!',
        icon: 'â­?,
        unlocked: false,
        progress: 0,
        target: 10,
      },
      {
        id: 'week_streak',
        title: 'ê¾¸ì??¨ì˜ ??,
        description: '7???°ì† ?™ìŠµ?ˆì–´??',
        icon: '?”¥',
        unlocked: false,
        progress: 0,
        target: 7,
      },
      {
        id: 'multiplication_master',
        title: 'ê³±ì…ˆ ë§ˆìŠ¤??,
        description: 'ê³±ì…ˆ ë¬¸ì œ 50ê°œë? ?€?ˆì–´??',
        icon: '?–ï¸',
        unlocked: false,
        progress: 0,
        target: 50,
      },
      {
        id: 'division_master',
        title: '?˜ëˆ—??ë§ˆìŠ¤??,
        description: '?˜ëˆ—??ë¬¸ì œ 50ê°œë? ?€?ˆì–´??',
        icon: '??,
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
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  async createUser(data: { email: string; password: string; name: string }): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: Date.now(),
    };
    users.set(user.id, user);
    
    // ê¸°ë³¸ ?„ë¡œ???ì„±
    userProfiles[user.id] = createDefaultProfile(user.id, user.name);
    
    return user;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return userProfiles[userId] || null;
  },

  async createUserProfile(userId: string): Promise<UserProfile> {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const profile = createDefaultProfile(userId, user.name);
    userProfiles[userId] = profile;
    return profile;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = userProfiles[userId] || await this.createUserProfile(userId);
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      id: userId, // ID??ë³€ê²?ë¶ˆê?
      updatedAt: Date.now(),
    };
    userProfiles[userId] = updatedProfile;
    return updatedProfile;
  },
};

