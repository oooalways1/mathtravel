import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import type { UserProfile } from '../../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(req: VercelRequest): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyToken(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
  }

  try {
    if (req.method === 'GET') {
      // 프로필 조회
      const profile = await db.getUserProfile(auth.userId);
      if (!profile) {
        // 프로필이 없으면 기본 프로필 생성
        const defaultProfile = await db.createUserProfile(auth.userId);
        return res.json(defaultProfile);
      }
      return res.json(profile);
    } else if (req.method === 'PUT') {
      // 프로필 업데이트
      const profileData: Partial<UserProfile> = req.body;
      const updatedProfile = await db.updateUserProfile(auth.userId, profileData);
      return res.json(updatedProfile);
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
}

