-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (이미 존재하면 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능 (이미 존재하면 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 랭킹 데이터를 위한 뷰 생성 (모든 사용자가 조회 가능)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  up.id,
  up.username,
  up.name,
  (up.profile->>'coins')::int as coins,
  (up.profile->'character'->>'level')::int as level,
  (up.profile->'stats'->>'totalProblems')::int as total_problems,
  (up.profile->'stats'->>'totalTime')::int as total_time,
  (up.profile->'stats'->>'correctAnswers')::int as correct_answers,
  COALESCE((up.profile->'stats'->>'singleModeScore')::int, 0) as single_mode_score,
  COALESCE((up.profile->'stats'->>'battleModeScore')::int, 0) as battle_mode_score,
  COALESCE((up.profile->'stats'->>'miniGameScore')::int, 0) as mini_game_score,
  up.created_at
FROM user_profiles up
WHERE up.profile IS NOT NULL;

-- 랭킹 뷰에 대한 RLS 정책 (모든 사용자가 조회 가능)
ALTER VIEW public.leaderboard OWNER TO postgres;
GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- 대전 모드 세션 테이블 (기존 테이블이 있으면 삭제 후 재생성)
DROP TABLE IF EXISTS battle_participants CASCADE;
DROP TABLE IF EXISTS battle_sessions CASCADE;

CREATE TABLE battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'ended')),
  max_players INT DEFAULT 10,
  current_players INT DEFAULT 0
);

-- 대전 모드 참가자 테이블
CREATE TABLE IF NOT EXISTS battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_session_id UUID REFERENCES battle_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_session_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_battle_participants_session ON battle_participants(battle_session_id);
CREATE INDEX IF NOT EXISTS idx_battle_participants_user ON battle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_status ON battle_sessions(status);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_room_code ON battle_sessions(room_code);

-- RLS 정책 설정
ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 대전 세션 조회 가능 (이미 존재하면 삭제 후 재생성)
DROP POLICY IF EXISTS "Anyone can view battle sessions" ON battle_sessions;
CREATE POLICY "Anyone can view battle sessions"
  ON battle_sessions FOR SELECT
  USING (true);

-- 인증된 사용자는 대전 세션 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create battle sessions" ON battle_sessions;
CREATE POLICY "Authenticated users can create battle sessions"
  ON battle_sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 모든 사용자가 참가자 정보 조회 가능
DROP POLICY IF EXISTS "Anyone can view battle participants" ON battle_participants;
CREATE POLICY "Anyone can view battle participants"
  ON battle_participants FOR SELECT
  USING (true);

-- 인증된 사용자는 참가 가능
DROP POLICY IF EXISTS "Authenticated users can join battles" ON battle_participants;
CREATE POLICY "Authenticated users can join battles"
  ON battle_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 자신의 점수만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own battle score" ON battle_participants;
CREATE POLICY "Users can update own battle score"
  ON battle_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- 대전 세션 참가자 수 증가 함수
CREATE OR REPLACE FUNCTION increment_battle_players(session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE battle_sessions
  SET current_players = current_players + 1
  WHERE id = session_id AND current_players < max_players;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
