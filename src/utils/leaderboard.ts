import { supabase } from './supabase';
import type { LeaderboardEntry, LeaderboardType } from '../types';

export async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    let orderBy: string;
    if (type === 'single') {
      orderBy = 'single_mode_score';
    } else if (type === 'battle') {
      orderBy = 'battle_mode_score';
    } else {
      orderBy = 'mini_game_score';
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []).map((entry: any) => ({
      id: entry.id,
      username: entry.username,
      name: entry.name,
      coins: entry.coins || 0,
      level: entry.level || 1,
      totalProblems: entry.total_problems || 0,
      totalTime: entry.total_time || 0,
      correctAnswers: entry.correct_answers || 0,
      singleModeScore: entry.single_mode_score || 0,
      battleModeScore: entry.battle_mode_score || 0,
      createdAt: new Date(entry.created_at).getTime(),
      miniGameScore: entry.mini_game_score || 0,
    }));
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    return [];
  }
}

export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<number> {
  try {
    const leaderboard = await getLeaderboard(type, 1000);
    const userIndex = leaderboard.findIndex((entry) => entry.id === userId);
    return userIndex >= 0 ? userIndex + 1 : 0;
  } catch (error) {
    console.error('랭크 조회 오류:', error);
    return 0;
  }
}

