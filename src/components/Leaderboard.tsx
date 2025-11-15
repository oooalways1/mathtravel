import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard, getUserRank } from '../utils/leaderboard';
import type { LeaderboardEntry, LeaderboardType } from '../types';
import { useGameStore } from '../store/useGameStore';

interface LeaderboardProps {
  type: LeaderboardType;
  limit?: number;
  showUserRank?: boolean;
}

const Leaderboard = ({ type, limit = 10, showUserRank = true }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const profile = useGameStore((state) => state.profile);

  const getPrimaryScore = (entry: LeaderboardEntry) => {
    if (type === 'single') return entry.singleModeScore;
    if (type === 'battle') return entry.battleModeScore;
    return entry.miniGameScore ?? 0;
  };

  const sortEntries = (list: LeaderboardEntry[]) => {
    return [...list].sort((a, b) => {
      const scoreDiff = getPrimaryScore(b) - getPrimaryScore(a);
      if (scoreDiff !== 0) return scoreDiff;

      const problemsDiff = b.totalProblems - a.totalProblems;
      if (problemsDiff !== 0) return problemsDiff;

      const accuracyA = a.totalProblems > 0 ? a.correctAnswers / a.totalProblems : 0;
      const accuracyB = b.totalProblems > 0 ? b.correctAnswers / b.totalProblems : 0;
      if (accuracyA !== accuracyB) return accuracyB - accuracyA;

      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  };

  const buildLocalEntry = (): LeaderboardEntry | null => {
    if (!profile) return null;

    const character = profile.character ?? {
      level: 1,
      experience: 0,
      avatar: '🙂',
      items: [],
    };
    const stats = profile.stats ?? {
      totalProblems: 0,
      totalTime: 0,
      correctAnswers: 0,
      singleModeScore: 0,
      battleModeScore: 0,
      miniGameScore: 0,
    };

    return {
      id: profile.id,
      username: profile.name,
      name: profile.name,
      coins: profile.coins ?? 0,
      level: character.level ?? 1,
      totalProblems: stats.totalProblems ?? 0,
      totalTime: stats.totalTime ?? 0,
      correctAnswers: stats.correctAnswers ?? 0,
      singleModeScore: stats.singleModeScore ?? (stats.correctAnswers ?? 0) * 100,
      battleModeScore: stats.battleModeScore ?? 0,
      miniGameScore: stats.miniGameScore ?? 0,
      createdAt: profile.createdAt,
    };
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(type, Math.max(limit, 25));
        let combinedEntries = [...data];

        const localEntry = buildLocalEntry();
        if (localEntry) {
          const existingIndex = combinedEntries.findIndex((entry) => entry.id === localEntry.id);
          if (existingIndex >= 0) {
            const existing = combinedEntries[existingIndex];
            combinedEntries[existingIndex] = {
              ...existing,
              coins: Math.max(existing.coins, localEntry.coins),
              level: Math.max(existing.level, localEntry.level),
              totalProblems: Math.max(existing.totalProblems, localEntry.totalProblems),
              totalTime: Math.max(existing.totalTime, localEntry.totalTime),
              correctAnswers: Math.max(existing.correctAnswers, localEntry.correctAnswers),
              singleModeScore: Math.max(existing.singleModeScore, localEntry.singleModeScore),
              battleModeScore: Math.max(existing.battleModeScore, localEntry.battleModeScore),
              createdAt: existing.createdAt || localEntry.createdAt,
            };
          } else {
            combinedEntries.push(localEntry);
          }
        }

        combinedEntries = sortEntries(combinedEntries);
        setEntries(combinedEntries.slice(0, limit));

        if (showUserRank && profile) {
          const rankIndex = combinedEntries.findIndex((entry) => entry.id === profile.id);
          setUserRank(rankIndex >= 0 ? rankIndex + 1 : 0);
        } else if (showUserRank && profile?.id) {
          const rank = await getUserRank(profile.id, type);
          setUserRank(rank);
        } else {
          setUserRank(0);
        }
      } catch (error) {
        console.error('랭킹 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
    // 30초마다 랭킹 갱신
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [type, limit, showUserRank, profile]);

  const getRankIcon = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getScore = (entry: LeaderboardEntry): number => {
    return getPrimaryScore(entry);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-gray-600">랭킹을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>{type === 'single' ? '📝' : type === 'battle' ? '⚔️' : '🎯'}</span>
          {type === 'single' ? '싱글 모드' : type === 'battle' ? '대전 모드' : '미니게임 모드'} 랭킹
        </h2>
        {showUserRank && userRank > 0 && (
          <div className="text-sm text-gray-600">
            내 순위: <span className="font-bold text-primary-600">{userRank}위</span>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          아직 랭킹 데이터가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                profile?.id === entry.id
                  ? 'bg-primary-100 border-2 border-primary-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-gray-700 w-8 text-center">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {entry.name}
                  {profile?.id === entry.id && (
                    <span className="ml-2 text-xs text-primary-600">(나)</span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  레벨 {entry.level} • 문제 {entry.totalProblems}개 • 정답률{' '}
                  {entry.totalProblems > 0
                    ? Math.round((entry.correctAnswers / entry.totalProblems) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  {getScore(entry).toLocaleString()}점
                </div>
                <div className="text-xs text-gray-500">
                  코인 {entry.coins.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

