import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'ëª¨ë“  ?„ë“œë¥??…ë ¥?´ì£¼?¸ìš”.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'ë¹„ë?ë²ˆí˜¸??ìµœì†Œ 6???´ìƒ?´ì–´???©ë‹ˆ??' });
    }

    // ?´ë©”??ì¤‘ë³µ ì²´í¬
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '?´ë? ?¬ìš© ì¤‘ì¸ ?´ë©”?¼ìž…?ˆë‹¤.' });
    }

    // ë¹„ë?ë²ˆí˜¸ ?´ì‹œ
    const hashedPassword = await bcrypt.hash(password, 10);

    // ?¬ìš©???ì„±
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
    });

    // JWT ? í° ?ì„±
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' });
  }
}

