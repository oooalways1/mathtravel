import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { apiClient } from '../utils/api';
import Leaderboard from '../components/Leaderboard';
import { useAutoplayUnlock } from '../hooks/useAutoplayUnlock';

type AuthMode = 'login' | 'register' | 'leaderboard';

const Welcome = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loadProfileFromServer } = useGameStore();
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const autoplayReady = useAutoplayUnlock();
  const youtubeVideoId = 'Unfqj83RUOQ';

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login({ username: username.trim(), password });
      
      if (response.success && response.user) {
        // 서버에서 프로필 로드
        await loadProfileFromServer();
        navigate('/home');
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    if (username.length < 3) {
      setError('아이디는 최소 3자 이상이어야 합니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.register({
        username: username.trim(),
        password,
        name: name.trim(),
      });

      if (response.success && response.user) {
        // 회원가입 후 자동 로그인
        await loadProfileFromServer();
        navigate('/home');
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      {musicEnabled && autoplayReady && (
        <iframe
          title="메인 화면 BGM"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0`}
          allow="autoplay; encrypted-media"
          style={{ position: 'absolute', width: 0, height: 0, border: 0 }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card w-full ${mode === 'leaderboard' ? 'max-w-5xl p-10' : 'max-w-2xl text-center p-10'}`}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="text-8xl mb-6"
        >
          🕹️
        </motion.div>
        
        <h1 className="text-4xl font-bold text-primary-600 mb-2 whitespace-nowrap">
          곱셈과 나눗셈 모험을 떠나요!
        </h1>
        
        <p className="text-gray-600 mb-8">
          문제풀이로 성장하는 수학 모험을 떠나요!
        </p>

        {/* 탭 전환 */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              (mode === 'login' || mode === 'register')
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            게임시작
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('leaderboard');
              setError('');
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              mode === 'leaderboard'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            랭킹
          </button>
        </div>

        {/* 폼 또는 랭킹 */}
        {mode === 'leaderboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <Leaderboard type="single" limit={10} showUserRank={false} />
              <Leaderboard type="battle" limit={10} showUserRank={false} />
              <Leaderboard type="minigame" limit={10} showUserRank={false} />
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-left text-sm font-semibold text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-left text-sm font-semibold text-gray-700 mb-2">
                  아이디
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                  disabled={loading}
                  minLength={3}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-left text-sm font-semibold text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '최소 6자 이상' : '비밀번호를 입력하세요'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                disabled={loading}
                className="btn-primary w-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : mode === 'login' ? '로그인 🚀' : '회원가입 🎉'}
              </motion.button>
            </form>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register');
                  setError('');
                }}
                className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
              >
                {mode === 'register' ? '로그인으로 돌아가기' : '회원가입'}
              </button>
            </div>
            
            <div className="mt-8 flex justify-center gap-4 text-4xl">
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }}>
                ✖️
              </motion.span>
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>
                ➗
              </motion.span>
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>
                🎯
              </motion.span>
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}>
                ⭐
              </motion.span>
            </div>
          </>
        )}
        <p className="mt-8 text-center text-sm font-semibold text-pink-500">
          made by 케이티조아
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
