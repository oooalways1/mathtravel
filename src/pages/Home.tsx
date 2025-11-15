import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import Leaderboard from '../components/Leaderboard';
import { useAutoplayUnlock } from '../hooks/useAutoplayUnlock';

const Home = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const logout = useGameStore((state) => state.logout);
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const autoplayReady = useAutoplayUnlock();

  if (!profile) return null;

  const character = profile.character ?? {
    avatar: '🙂',
    level: 1,
    experience: 0,
    items: [],
  };

  const characterItems = Array.isArray(character.items) ? character.items : [];
  const equippedItems = characterItems.filter((item) => item?.equipped);
  const getEquippedItem = (type: 'hat' | 'clothes' | 'accessory' | 'character') =>
    equippedItems.find((item) => item.type === type);

  const hatItem = getEquippedItem('hat');
  const clothesItem = getEquippedItem('clothes');
  const accessoryItem = getEquippedItem('accessory');
  const baseAvatar = character.avatar || '🙂';
  const homeBgmId = 'oj4OGAAcBb4';

  const handleLogout = async () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      await logout();
      navigate('/');
    }
  };

  const handleNewUser = async () => {
    if (window.confirm('새로운 사용자로 시작하시겠습니까?')) {
      await logout();
      localStorage.removeItem('math-adventure-storage');
      window.location.href = '/';
    }
  };

  const menuItems = [
    {
      title: '싱글 모드',
      description: '곱셈과 나눗셈을 자유롭게 연습해요',
      icon: '📝',
      color: 'from-blue-400 to-blue-600',
      path: '/practice',
    },
    {
      title: '대전 모드',
      description: '여러 플레이어와 실시간 대전해요',
      icon: '⚔️',
      color: 'from-red-400 to-red-600',
      path: '/battle',
    },
    {
      title: '미니게임 모드',
      description: '다양한 미니게임을 즐겨보세요',
      icon: '🎮',
      color: 'from-orange-400 to-pink-500',
      path: '/mini-games',
    },
    {
      title: '학습 대시보드',
      description: '내 학습 기록을 확인해요',
      icon: '📊',
      color: 'from-green-400 to-green-600',
      path: '/dashboard',
    },
    {
      title: '아이템 상점',
      description: '코인으로 아이템을 구매해요',
      icon: '🛒',
      color: 'from-purple-400 to-purple-600',
      path: '/shop',
    },
    {
      title: '업적',
      description: '달성한 업적을 확인해요',
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-600',
      path: '/achievements',
    },
    {
      title: '오답 노트',
      description: '틀린 문제를 다시 풀어봐요',
      icon: '📔',
      color: 'from-red-400 to-red-600',
      path: '/wrong-answers',
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {musicEnabled && autoplayReady && (
        <iframe
          title="홈 화면 BGM"
          src={`https://www.youtube.com/embed/${homeBgmId}?autoplay=1&loop=1&playlist=${homeBgmId}&controls=0&showinfo=0`}
          allow="autoplay; encrypted-media"
          style={{ position: 'absolute', width: 0, height: 0, border: 0 }}
        />
      )}
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-3xl border-4 bg-white border-gray-200">
                <div className="text-6xl relative">{baseAvatar}</div>
                {hatItem && (
                  <div className="absolute -top-2 text-3xl drop-shadow-sm">{hatItem.image}</div>
                )}
                {accessoryItem && (
                  <div className="absolute -right-2 text-3xl drop-shadow-sm">
                    {accessoryItem.image}
                  </div>
                )}
                {clothesItem && (
                  <div className="absolute -bottom-2 text-3xl drop-shadow-sm">
                    {clothesItem.image}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  곱셈과 나눗셈 모험을 떠나요!
                </h1>
                <p className="text-gray-600 mt-1">
                  안녕하세요, {profile.name}님! 레벨 {character.level} • 경험치 {character.experience}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl mb-1">🪙</div>
                <div className="text-2xl font-bold text-yellow-600">{profile.coins}</div>
                <div className="text-xs text-gray-500">코인</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-2xl font-bold text-primary-600">
                  {profile.stats.correctAnswers}
                </div>
                <div className="text-xs text-gray-500">정답 수</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-1">🔥</div>
                <div className="text-2xl font-bold text-red-600">
                  {profile.stats.dailyStreak}
                </div>
                <div className="text-xs text-gray-500">연속 학습</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
              >
                로그아웃
              </motion.button>
            </div>
          </div>
          
          {/* 진행 바 */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>레벨 {character.level}</span>
              <span>레벨 {character.level + 1}까지 {100 - (character.experience % 100)} EXP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(character.experience % 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="cursor-pointer"
            >
              <div className={`card bg-gradient-to-br ${item.color} text-white h-full`}>
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/90">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 랭킹 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Leaderboard type="single" limit={5} showUserRank={true} />
          <Leaderboard type="battle" limit={5} showUserRank={true} />
          <Leaderboard type="minigame" limit={5} showUserRank={true} />
        </motion.div>

        {/* 최근 업적 */}
        {profile.achievements.filter((a) => a.unlocked).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="card mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏆</span>
              최근 달성한 업적
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profile.achievements
                .filter((a) => a.unlocked)
                .slice(-5)
                .map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center min-w-[120px]"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-sm font-bold text-gray-800">{achievement.title}</div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* 새로운 사용자로 시작하기 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card mt-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300"
        >
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              다른 사람이 사용하시나요? 👥
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewUser}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all duration-200"
            >
              🔄 새로운 사용자로 시작하기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;


