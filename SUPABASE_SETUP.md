# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성합니다.
2. "New Project"를 클릭하여 새 프로젝트를 만듭니다.
3. 프로젝트 이름과 데이터베이스 비밀번호를 설정합니다.

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 "SQL Editor"로 이동합니다.
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행합니다.

또는 Supabase CLI를 사용할 수 있습니다:

```bash
supabase db push
```

## 3. 환경 변수 설정

1. Supabase 대시보드에서 "Settings" > "API"로 이동합니다.
2. 다음 정보를 확인합니다:
   - Project URL
   - anon/public key

3. 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Vercel 배포 시 환경 변수 설정

1. Vercel 대시보드에서 프로젝트 설정으로 이동합니다.
2. "Environment Variables" 섹션에서 다음 변수를 추가합니다:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 5. 이메일 인증 비활성화 (필수)

Supabase는 기본적으로 이메일 인증을 요구합니다. 아이디만 사용하려면 반드시 비활성화해야 합니다:

1. Supabase 대시보드에서 "Authentication" > "Settings"로 이동합니다.
2. **"Enable email confirmations"를 비활성화합니다.** (이것이 중요합니다!)
3. "Enable sign ups"는 활성화 상태로 유지합니다.

또는 SQL Editor에서 다음을 실행합니다:

```sql
-- 이메일 인증 비활성화
UPDATE auth.config SET enable_email_confirmations = false;
```

**중요**: 이메일 인증을 비활성화하지 않으면 회원가입 후 이메일 확인을 해야 로그인할 수 있습니다.

## 6. 테스트

1. 로컬에서 개발 서버를 실행합니다:
```bash
npm run dev
```

2. 회원가입 및 로그인 기능을 테스트합니다.

## 문제 해결

### "relation user_profiles does not exist" 오류
- SQL 스키마가 제대로 실행되었는지 확인하세요.
- Supabase SQL Editor에서 테이블이 생성되었는지 확인하세요.

### 인증 오류
- 환경 변수가 올바르게 설정되었는지 확인하세요.
- Supabase 프로젝트의 API 키가 올바른지 확인하세요.

