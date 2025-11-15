import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types';
import { supabase } from './supabase';

// API 클라이언트 클래스
class ApiClient {
  private token: string | null = null;

  constructor() {
    // 로컬 스토리지에서 토큰 로드
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    // 로컬 스토리지에서 토큰 가져오기
    return this.token || localStorage.getItem('auth_token');
  }

  // 회원가입 (Supabase 사용)
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // 유효한 이메일 형식으로 변환 (Supabase는 이메일 형식 검증을 하므로)
      // 사용자에게는 아이디만 보이지만 내부적으로는 이메일 형식 사용
      const email = `${data.username}@mathadventure.app`;
      
      // Supabase에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            name: data.name,
          },
          emailRedirectTo: undefined, // 이메일 인증 비활성화
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('사용자 생성에 실패했습니다.');
      }

      // 프로필 데이터 저장
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: data.username,
          name: data.name,
          profile: this.createDefaultProfile(authData.user.id, data.name),
        });

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
        // 프로필 생성 실패해도 계정은 생성됨
      }

      // 세션 가져오기 (회원가입 후 자동 로그인)
      const { data: sessionData } = await supabase.auth.getSession();
      
      // 회원가입 직후에는 세션이 없을 수 있으므로, 다시 로그인 시도
      if (!sessionData.session) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: data.password,
        });
        
        if (loginError || !loginData.session) {
          throw new Error('자동 로그인에 실패했습니다. 다시 로그인해주세요.');
        }
        
        this.setToken(loginData.session.access_token);
        return {
          success: true,
          token: loginData.session.access_token,
          user: {
            id: authData.user.id,
            username: data.username,
            name: data.name,
            createdAt: Date.now(),
          },
        };
      }

      this.setToken(sessionData.session.access_token);
      return {
        success: true,
        token: sessionData.session.access_token,
        user: {
          id: authData.user.id,
          username: data.username,
          name: data.name,
          createdAt: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      };
    }
  }

  // 로그인 (Supabase 사용)
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // 유효한 이메일 형식으로 변환
      const email = `${data.username}@mathadventure.app`;
      
      // Supabase 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: data.password,
      });

      if (authError) {
        return {
          success: false,
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: '로그인에 실패했습니다.',
        };
      }

      // 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('username, name')
        .eq('id', authData.user.id)
        .single();

      this.setToken(authData.session.access_token);

      return {
        success: true,
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          username: profileData?.username || data.username,
          name: profileData?.name || '사용자',
          createdAt: authData.user.created_at ? new Date(authData.user.created_at).getTime() : Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      };
    }
  }

  // 기본 프로필 생성 헬퍼
  private createDefaultProfile(userId: string, userName: string): UserProfile {
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

  // 로그아웃 (Supabase 사용)
  async logout() {
    await supabase.auth.signOut();
    this.setToken(null);
  }

  // 프로필 조회 (Supabase 사용)
  async getProfile(): Promise<UserProfile> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) {
        // 프로필이 없으면 기본 프로필 생성
        if (error.code === 'PGRST116') {
          const defaultProfile = this.createDefaultProfile(sessionData.session.user.id, '사용자');
          const { data: userData } = await supabase.auth.getUser();
          const username = userData.user?.user_metadata?.username || 'user';
          const name = userData.user?.user_metadata?.name || '사용자';
          
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: sessionData.session.user.id,
              username: username,
              name: name,
              profile: defaultProfile,
            });

          if (insertError) {
            throw insertError;
          }

          return defaultProfile;
        }
        throw error;
      }

      return data.profile as UserProfile;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '프로필을 불러올 수 없습니다.');
    }
  }

  // 프로필 업데이트 (Supabase 사용)
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.saveProfile(profile as UserProfile);
  }

  // 프로필 저장 (전체 프로필 동기화) - Supabase 사용
  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          profile: profile,
        })
        .eq('id', sessionData.session.user.id)
        .select('profile')
        .single();

      if (error) {
        throw error;
      }

      return data.profile as UserProfile;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '프로필 저장에 실패했습니다.');
    }
  }
}

export const apiClient = new ApiClient();

