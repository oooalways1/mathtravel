# GitHub Pages 배포 가이드 🚀

## 준비사항

1. **Git 설치 확인**
   - Git이 설치되어 있지 않다면 [Git 다운로드](https://git-scm.com/downloads)에서 설치하세요.
   - 또는 [GitHub Desktop](https://desktop.github.com/)을 사용할 수 있습니다.

2. **GitHub 계정**
   - GitHub 계정이 필요합니다.
   - 저장소: https://github.com/oooalways1/251106-vibe.git

## 배포 방법

### 방법 1: Git 명령어 사용 (권장)

#### 1단계: Git 저장소 초기화

PowerShell 또는 Git Bash에서 math-adventure 폴더로 이동:

```bash
cd math-adventure
git init
```

#### 2단계: 모든 파일 추가

```bash
git add .
```

#### 3단계: 첫 커밋

```bash
git commit -m "Initial commit: 수학 모험 게임"
```

#### 4단계: 메인 브랜치 설정

```bash
git branch -M main
```

#### 5단계: 원격 저장소 연결

```bash
git remote add origin https://github.com/oooalways1/251106-vibe.git
```

#### 6단계: GitHub에 푸시

```bash
git push -u origin main
```

### 방법 2: GitHub Desktop 사용

1. **GitHub Desktop 열기**
   - File → Add Local Repository 선택
   - `math-adventure` 폴더 선택

2. **저장소 생성**
   - "Create a repository" 클릭
   - Repository name: `251106-vibe`
   - 나머지는 기본값 유지

3. **커밋**
   - 왼쪽 하단에 커밋 메시지 입력: "Initial commit: 수학 모험 게임"
   - "Commit to main" 클릭

4. **GitHub에 발행**
   - "Publish repository" 클릭
   - Organization: oooalways1
   - Repository name: 251106-vibe
   - "Publish repository" 클릭

## GitHub Pages 설정

### 1단계: GitHub 저장소 설정

1. 브라우저에서 https://github.com/oooalways1/251106-vibe 접속
2. 상단 메뉴에서 **Settings** 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭

### 2단계: GitHub Actions 활성화

1. **Source** 섹션에서:
   - Source: **GitHub Actions** 선택

2. 자동으로 `.github/workflows/deploy.yml` 파일이 감지됩니다.

### 3단계: 배포 확인

1. 상단 메뉴에서 **Actions** 탭 클릭
2. "Deploy to GitHub Pages" 워크플로우가 실행 중인지 확인
3. 초록색 체크 표시가 나타나면 배포 완료!

### 4단계: 사이트 접속

배포가 완료되면 다음 주소에서 게임을 플레이할 수 있습니다:

**https://oooalways1.github.io/251106-vibe/**

## 업데이트 배포

코드를 수정한 후 다시 배포하려면:

```bash
git add .
git commit -m "업데이트 내용 설명"
git push
```

GitHub Actions가 자동으로 새 버전을 배포합니다!

## 문제 해결

### Git이 인식되지 않는 경우

**증상**: `'git'은(는) 내부 또는 외부 명령... 아닙니다`

**해결 방법**:
1. Git 설치: https://git-scm.com/downloads
2. 설치 후 PowerShell/터미널 재시작
3. `git --version` 명령어로 설치 확인

### 푸시 권한 오류

**증상**: `Permission denied` 또는 `Authentication failed`

**해결 방법**:
1. GitHub에 로그인되어 있는지 확인
2. Personal Access Token 생성:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - repo 권한 선택
   - 생성된 토큰을 비밀번호 대신 사용

### 배포가 실패하는 경우

**확인 사항**:
1. GitHub Actions 탭에서 에러 로그 확인
2. Settings → Pages에서 GitHub Actions가 선택되어 있는지 확인
3. `.github/workflows/deploy.yml` 파일이 있는지 확인

### 사이트가 표시되지 않는 경우

**확인 사항**:
1. 배포가 완료되었는지 확인 (Actions 탭에서 초록색 체크)
2. 5-10분 정도 기다린 후 다시 시도
3. 브라우저 캐시 삭제 후 새로고침 (Ctrl + Shift + R)
4. Settings → Pages에서 "Your site is live at..." 메시지 확인

## 로컬에서 테스트

배포 전에 로컬에서 빌드를 테스트하려면:

```bash
npm run build
npm run preview
```

브라우저에서 표시되는 주소(보통 http://localhost:4173)로 접속하여 확인

## 추가 정보

### 프로젝트 구조

```
math-adventure/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 배포 설정
├── dist/                     # 빌드 결과물 (자동 생성)
├── src/                      # 소스 코드
├── public/                   # 정적 파일
├── index.html
├── package.json
├── vite.config.ts           # Vite 설정 (base path 포함)
└── tailwind.config.js
```

### 중요 파일

1. **vite.config.ts**
   ```typescript
   base: '/251106-vibe/'  // GitHub Pages 경로 설정
   ```

2. **.github/workflows/deploy.yml**
   - GitHub Actions 자동 배포 설정
   - main 브랜치에 푸시하면 자동 배포

### 커스텀 도메인 (선택사항)

커스텀 도메인을 사용하려면:

1. Settings → Pages → Custom domain에 도메인 입력
2. DNS 설정에서 CNAME 레코드 추가:
   ```
   CNAME: oooalways1.github.io
   ```

## 도움말

더 자세한 정보는 다음을 참고하세요:
- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

**배포 후 게임을 즐겨보세요! 🎮✨**


