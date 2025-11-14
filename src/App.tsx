import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import { supabase } from './utils/supabase';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import PracticeMode from './pages/PracticeMode';
import GamePlay from './pages/GamePlay';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Achievements from './pages/Achievements';
import WrongAnswers from './pages/WrongAnswers';
import BattleMode from './pages/BattleMode';
import MiniGames from './pages/MiniGames';
import MiniGameAcidRain from './pages/MiniGameAcidRain';
import GlobalControls from './components/GlobalControls';

function App() {
  const profile = useGameStore((state) => state.profile);
  const loadProfileFromServer = useGameStore((state) => state.loadProfileFromServer);

  // 앱 시작 시 Supabase 세션 확인 및 프로필 로드
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !profile) {
        await loadProfileFromServer();
      }
    };
    
    checkSession();

    // Supabase 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && !profile) {
        await loadProfileFromServer();
      } else if (!session && profile) {
        // 로그아웃 시 프로필 초기화
        useGameStore.getState().logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [profile, loadProfileFromServer]);

  return (
    <Router basename={import.meta.env.PROD ? '/251106-vibe' : ''}>
      <GlobalControls />
      <Routes>
        <Route path="/" element={profile ? <Navigate to="/home" /> : <Welcome />} />
        <Route path="/home" element={profile ? <Home /> : <Navigate to="/" />} />
        <Route path="/practice" element={profile ? <PracticeMode /> : <Navigate to="/" />} />
        <Route path="/battle" element={profile ? <BattleMode /> : <Navigate to="/" />} />
        <Route path="/game" element={profile ? <GamePlay /> : <Navigate to="/" />} />
        <Route path="/results" element={profile ? <Results /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={profile ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/shop" element={profile ? <Shop /> : <Navigate to="/" />} />
        <Route path="/achievements" element={profile ? <Achievements /> : <Navigate to="/" />} />
        <Route path="/wrong-answers" element={profile ? <WrongAnswers /> : <Navigate to="/" />} />
        <Route path="/mini-games" element={profile ? <MiniGames /> : <Navigate to="/" />} />
        <Route path="/mini-games/acid-rain" element={profile ? <MiniGameAcidRain /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
