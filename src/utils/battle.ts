import { supabase } from './supabase';
import type { BattleSession, BattleParticipant } from '../types';

// 대전 세션 생성
export async function createBattleSession(
  roomCode: string,
  hostId: string
): Promise<BattleSession | null> {
  try {
    const { data, error } = await supabase
      .from('battle_sessions')
      .insert({
        room_code: roomCode,
        host_id: hostId,
        status: 'waiting',
        max_players: 10,
        current_players: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      roomCode: data.room_code,
      hostId: data.host_id,
      createdAt: new Date(data.created_at).getTime(),
      endedAt: data.ended_at ? new Date(data.ended_at).getTime() : undefined,
      status: data.status as 'waiting' | 'playing' | 'ended',
      maxPlayers: data.max_players,
      currentPlayers: data.current_players,
    };
  } catch (error) {
    console.error('대전 세션 생성 오류:', error);
    return null;
  }
}

// 방 코드로 대전 세션 조회
export async function getBattleSessionByCode(roomCode: string): Promise<BattleSession | null> {
  try {
    const { data, error } = await supabase
      .from('battle_sessions')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      roomCode: data.room_code,
      hostId: data.host_id,
      createdAt: new Date(data.created_at).getTime(),
      endedAt: data.ended_at ? new Date(data.ended_at).getTime() : undefined,
      status: data.status as 'waiting' | 'playing' | 'ended',
      maxPlayers: data.max_players,
      currentPlayers: data.current_players,
    };
  } catch (error) {
    console.error('대전 세션 조회 오류:', error);
    return null;
  }
}

// 방 코드로 대전 세션 참가
export async function joinBattleSessionByCode(
  roomCode: string,
  userId: string
): Promise<boolean> {
  try {
    const session = await getBattleSessionByCode(roomCode);
    if (!session) {
      return false;
    }

    return await joinBattleSession(session.id, userId);
  } catch (error) {
    console.error('방 코드로 참가 오류:', error);
    return false;
  }
}

// 대전 세션 조회 (대기 중인 세션)
export async function getWaitingBattleSession(): Promise<BattleSession | null> {
  try {
    const { data, error } = await supabase
      .from('battle_sessions')
      .select('*')
      .eq('status', 'waiting')
      .lt('current_players', 10)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      roomCode: data.room_code,
      hostId: data.host_id,
      createdAt: new Date(data.created_at).getTime(),
      endedAt: data.ended_at ? new Date(data.ended_at).getTime() : undefined,
      status: data.status as 'waiting' | 'playing' | 'ended',
      maxPlayers: data.max_players,
      currentPlayers: data.current_players,
    };
  } catch (error) {
    console.error('대전 세션 조회 오류:', error);
    return null;
  }
}

// 대전 세션 참가
export async function joinBattleSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    // 세션 참가자 추가
    const { error: joinError } = await supabase
      .from('battle_participants')
      .insert({
        battle_session_id: sessionId,
        user_id: userId,
        score: 0,
        correct_count: 0,
      });

    if (joinError) {
      // 이미 참가한 경우 무시
      if (joinError.code !== '23505') {
        throw joinError;
      }
      return true;
    }

    // 세션의 현재 참가자 수 증가
    const { error: updateError } = await supabase.rpc('increment_battle_players', {
      session_id: sessionId,
    });

    if (updateError) {
      console.error('참가자 수 업데이트 오류:', updateError);
    }

    return true;
  } catch (error) {
    console.error('대전 세션 참가 오류:', error);
    return false;
  }
}

// 대전 세션의 참가자 목록 조회
export async function getBattleParticipants(
  sessionId: string
): Promise<BattleParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('battle_participants')
      .select(`
        *,
        user_profiles:user_id (
          username,
          name
        )
      `)
      .eq('battle_session_id', sessionId)
      .order('score', { ascending: false });

    if (error) throw error;

    return (data || []).map((participant: any) => ({
      id: participant.id,
      battleSessionId: participant.battle_session_id,
      userId: participant.user_id,
      username: participant.user_profiles?.username || '알 수 없음',
      name: participant.user_profiles?.name || '알 수 없음',
      score: participant.score || 0,
      correctCount: participant.correct_count || 0,
      joinedAt: new Date(participant.joined_at).getTime(),
    }));
  } catch (error) {
    console.error('참가자 목록 조회 오류:', error);
    return [];
  }
}

// 점수 업데이트
export async function updateBattleScore(
  sessionId: string,
  userId: string,
  score: number,
  correctCount: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('battle_participants')
      .update({
        score: score,
        correct_count: correctCount,
      })
      .eq('battle_session_id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('점수 업데이트 오류:', error);
    return false;
  }
}

// 대전 세션 시작
export async function startBattleSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('battle_sessions')
      .update({ status: 'playing' })
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('대전 세션 시작 오류:', error);
    return false;
  }
}

// 대전 세션 종료
export async function endBattleSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('battle_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('대전 세션 종료 오류:', error);
    return false;
  }
}

