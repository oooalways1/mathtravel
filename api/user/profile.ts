import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import type { UserProfile } from '../../src/types/index.js';

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
    return res.status(401).json({ success: false, message: '?∏Ï¶ù???ÑÏöî?©Îãà??' });
  }

  try {
    if (req.method === 'GET') {
      // ?ÑÎ°ú??Ï°∞Ìöå
      const profile = await db.getUserProfile(auth.userId);
      if (!profile) {
        // ?ÑÎ°ú?ÑÏù¥ ?ÜÏúºÎ©?Í∏∞Î≥∏ ?ÑÎ°ú???ùÏÑ±
        const defaultProfile = await db.createUserProfile(auth.userId);
        return res.json(defaultProfile);
      }
      return res.json(profile);
    } else if (req.method === 'PUT') {
      // ?ÑÎ°ú???ÖÎç∞?¥Ìä∏
      const profileData: Partial<UserProfile> = req.body;
      const updatedProfile = await db.updateUserProfile(auth.userId, profileData);
      return res.json(updatedProfile);
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: '?úÎ≤Ñ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
  }
}

