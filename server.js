import express from 'express';
import cors from 'cors';
import { registerHandler } from './api/auth/register.js';
import { loginHandler } from './api/auth/login.js';
import { profileHandler } from './api/user/profile.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 라우트
app.post('/api/auth/register', async (req, res) => {
  await registerHandler(req, res);
});

app.post('/api/auth/login', async (req, res) => {
  await loginHandler(req, res);
});

app.get('/api/user/profile', async (req, res) => {
  await profileHandler(req, res);
});

app.put('/api/user/profile', async (req, res) => {
  await profileHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

