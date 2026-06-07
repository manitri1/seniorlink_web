# 기술 문서: Seniorlink Web

## 런타임 및 플랫폼

### Node.js
- **버전**: 20 LTS 이상 (권장: 22 LTS)
- **사용 용도**: Next.js 서버, Server Actions, Build 시간
- **확인 명령**: `node --version`

### Next.js (프런트엔드 및 백엔드)
- **버전**: 15.1.0
- **렌더링**: App Router (파일 기반 라우팅)
- **서버 기능**: Server Components, Server Actions, Middleware, Route Handlers
- **빌드**: 정적 + 동적 페이지 (SSR, ISR, SSG 지원)

### React
- **버전**: 19.0.0
- **주요 기능**: use 훅, Server Components, Concurrent Rendering
- **클라이언트 마킹**: `'use client'` 지시어로 명시적 표시

### 데이터베이스 (Supabase PostgreSQL)
- **호스팅**: Supabase Cloud (PostgreSQL 13+)
- **접근**: Supabase JS SDK (`@supabase/supabase-js`)
- **인증**: Row Level Security (RLS) 정책
- **유형**: 클라우드 기반 관계형 데이터베이스

---

## npm 의존성

### 주요 의존성 (Production)

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| `next` | ^15.1.0 | 웹 프레임워크 | App Router, SSR, Middleware |
| `react` | ^19.0.0 | UI 라이브러리 | Server Components, use 훅 |
| `react-dom` | ^19.0.0 | DOM 렌더링 | React와 함께 설치 |
| `@supabase/supabase-js` | ^2.105.4 | 데이터베이스 클라이언트 | REST API, Auth, RLS |
| `@supabase/ssr` | ^0.10.3 | SSR 세션 관리 | 쿠키 기반 세션 (Next.js 전용) |

### 개발 의존성 (Development)

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| `typescript` | ^5.7.0 | 타입 체킹 | 엄격한 모드 활성화 |
| `@types/react` | ^19.0.0 | React 타입 정의 | JSX, Props 타입 |
| `@types/react-dom` | ^19.0.0 | React DOM 타입 | DOM API 타입 |
| `@types/node` | ^20.17.0 | Node.js 타입 | 서버 코드 타입 |
| `eslint` | ^9.15.0 | 코드 린팅 | ES2024+ 지원 |
| `eslint-config-next` | ^15.1.0 | Next.js ESLint 설정 | 프레임워크 기본 규칙 |
| `@playwright/test` | ^1.60.0 | E2E 테스트 | 브라우저 자동화 테스트 |

### 미설치 의존성 (Out of Scope)

다음은 의도적으로 **제외**된 라이브러리들입니다:

- ❌ **UI 프레임워크**: shadcn/ui, Chakra UI (현재: Tailwind CSS만)
- ❌ **상태 관리**: Redux, Zustand, Jotai (Props + Server Actions)
- ❌ **API 클라이언트**: tRPC, GraphQL (Supabase REST API만 사용)
- ❌ **ORM**: Prisma, TypeORM (Supabase 마이그레이션만 사용)
- ❌ **인증 라이브러리**: NextAuth.js (Supabase Auth만 사용)
- ❌ **백엔드 프레임워크**: Express, Fastify, Nest.js (Next.js Server Actions만 사용)

---

## TypeScript 설정

### tsconfig.json 주요 옵션

```json
{
  "compilerOptions": {
    "target": "ES2017",                 // 컴파일 대상 (레거시 호환성)
    "lib": ["dom", "dom.iterable", "esnext"],  // 포함된 타입 라이브러리
    "allowJs": true,                   // .js 파일 컴파일 허용
    "skipLibCheck": true,               // .d.ts 파일 검사 스킵 (속도)
    "strict": true,                    // 엄격한 타입 체킹 활성화 (권장)
    "noEmit": true,                    // 아웃풋 생성 안 함 (검사만)
    "esModuleInterop": true,           // CommonJS ↔ ESM 호환성
    "module": "esnext",                // 모듈 형식 (Next.js가 변환)
    "moduleResolution": "bundler",     // 번들러 호환 모듈 해석
    "resolveJsonModule": true,         // JSON import 지원
    "isolatedModules": true,           // 독립 파일 컴파일 (번들러 호환)
    "jsx": "preserve",                 // JSX 변환 안 함 (Next.js가 처리)
    "incremental": true,               // 증분 컴파일 활성화
    "plugins": [{ "name": "next" }],   // Next.js 플러그인
    "paths": { "@/*": ["./src/*"] }    // 경로 별칭 (@/ = ./src/)
  }
}
```

### 타입 엄격성 (Strict Mode)

- ✅ `strict: true` — 모든 타입 체킹 활성화
- ✅ `noImplicitAny` — 암묵적 `any` 타입 금지
- ✅ `strictNullChecks` — Null/Undefined 명시적 처리
- ✅ `strictFunctionTypes` — 함수 매개변수 타입 강화
- ✅ `strictBindCallApply` — 바인드/콜/적용 타입 체킹

### 경로 별칭 (Path Alias)

```typescript
// tsconfig.json의 "paths" 설정
"@/*": ["./src/*"]

// 사용 예
import { Button } from '@/components/ui/Button';
import { getActiveContracts } from '@/lib/dashboard-server';
```

---

## 환경 변수

### 환경 변수 파일

- **`.env.local`** (로컬 개발용, git 무시)
- **`.env.example`** (템플릿, git 추적) — 실제 값 없음
- **배포 환경**: Vercel 대시보드 또는 호스팅 플랫폼에서 설정

### 필수 환경 변수 (클라이언트)

| 변수 | 예시 | 설명 | 공개 여부 |
|------|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | Supabase 프로젝트 URL | ✅ 공개 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` | 클라이언트 공개 키 | ✅ 공개 |

**참고**:
- (A) Legacy API Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (JWT)
- (B) Publishable Key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (최신, `sb_publishable_` 접두어)
- 둘 중 하나만 있으면 동작

### 선택 환경 변수 (클라이언트)

| 변수 | 예시 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 이메일 확인 리다이렉트 URL |

### 필수 환경 변수 (서버 전용)

| 변수 | 예시 | 설명 | 노출 금지 |
|------|------|------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Admin 키 (서버만) | ❌ 클라이언트 금지 |

**경고**: Service Role Key는 **절대** `NEXT_PUBLIC_*` 접두어를 붙이면 안 됩니다. 클라이언트 번들에 노출되면 보안 침해입니다.

### 환경 변수 검증 (src/lib/supabase/env.ts)

```typescript
export function validateEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server only)');
  
  return { url, anonKey, serviceRoleKey };
}
```

---

## 빌드 및 배포 명령

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (localhost:3000, 핫 리로드)
npm run dev

# TypeScript 타입 검사 (무배포)
npx tsc --noEmit

# ESLint 린팅 검사
npm run lint
```

### 프로덕션 빌드

```bash
# 전체 빌드 및 검사 (CI/CD 파이프라인에서 사용)
npm run ci
# 실행 내용:
#  1. npm run lint — ESLint 검사
#  2. npm run build — Next.js 프로덕션 빌드
#  3. npm audit --audit-level=high — 보안 취약점 검사 (high 레벨 이상)

# 프로덕션 서버 시작
npm run start

# 프로덕션 빌드만
npm run build
```

### E2E 테스트

```bash
# Playwright E2E 테스트 실행 (포트 3005 필요)
npm run test:e2e

# 특정 설정으로 테스트 (로그인 문서 테스트)
npm run test:e2e:doc-login

# 테스트 UI 모드 (브라우저에서 상호작용)
npx playwright test --ui
```

---

## 데이터베이스

### PostgreSQL (Supabase Cloud)
- **버전**: PostgreSQL 13+
- **호스팅**: Supabase 클라우드
- **접근**: Supabase JS SDK (REST API)

### 주요 테이블 (8개)

| 테이블 | 용도 | 행 수 (예상) |
|--------|------|-----------|
| `auth.users` | Supabase Auth (자동 생성) | 사용자 수 |
| `profiles` | 사용자 기본 정보 (role) | 사용자 수 |
| `companies` | 기업 정보 | 기업 수 |
| `senior_profiles` | 시니어 전문가 정보 | 시니어 수 |
| `tf_requests` | TF 요청 | 요청 수 |
| `request_matches` | AI 매칭 결과 | 요청 × 매칭된 시니어 |
| `proposals` | 제안 | 제안 수 |
| `contracts` | 계약 | 계약 수 |
| `settlements` | 결제 정산 | 계약 수 |
| `contract_reviews` | 계약 완료 후 리뷰 | 리뷰 수 |

### 마이그레이션 전략

**Local Development** (로컬 Supabase):
```bash
# Supabase 로컬 서버 시작 (Docker 필수)
supabase start

# 마이그레이션 생성
supabase migration new [migration_name]

# 마이그레이션 실행 (로컬)
supabase migration up

# 데이터베이스 초기화 (모든 데이터 삭제)
npm run db:reset
```

**Production** (Supabase Cloud):
```bash
# Supabase CLI로 배포 (마이그레이션 자동 실행)
supabase db push
```

### 마이그레이션 파일 위치
```
supabase/migrations/
├── 20240101000000_initial_schema.sql      # 테이블 생성
├── 20240115000000_rls_policies.sql        # RLS 정책
└── 20240120000000_add_triggers.sql        # Auth 트리거
```

---

## 개발 환경 설정

### 요구사항
- Node.js 20 LTS 이상 (권장: 22 LTS)
- npm 10 이상 또는 yarn, pnpm
- Git 2.0 이상
- 텍스트 편집기 (VS Code 권장)

### 초기 설정 (처음 한 번)

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/seniorlink_web.git
cd seniorlink_web

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 편집기에서 .env.local 열기
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, 
# SUPABASE_SERVICE_ROLE_KEY 입력

# 4. Supabase 로컬 서버 시작 (선택)
supabase start
# 또는 Supabase Cloud 사용 (권장 for 초기 개발)

# 5. 개발 서버 시작
npm run dev

# http://localhost:3000 접속
```

### 빠른 테스트
```bash
# 개발 서버 실행 + 린팅 확인
npm run dev

# 다른 터미널: 타입 체킹 (watch 모드)
npx tsc --watch --noEmit

# 다른 터미널: E2E 테스트 (옵션)
npm run test:e2e
```

---

## E2E 테스트 (Playwright)

### 설정
- **설정 파일**: `playwright.config.ts`
- **테스트 포트**: 3005 (배정 — http://localhost:3005)
- **브라우저**: Chromium (기본), Firefox, WebKit 지원

### 테스트 파일 위치
```
e2e/
├── auth.spec.ts         # 로그인, 회원가입 테스트
├── request.spec.ts      # TF 요청 CRUD
├── proposal.spec.ts     # 제안 제출, 수락
└── ...
```

### 테스트 명령

```bash
# 모든 E2E 테스트 실행 (헤드리스 모드)
npm run test:e2e

# 특정 파일만 테스트
npx playwright test auth.spec.ts

# UI 모드 (브라우저에서 클릭, 디버깅)
npx playwright test --ui

# 디버그 모드 (단계별 실행)
npx playwright test --debug

# 테스트 결과 HTML 리포트 보기
npx playwright show-report
```

### 테스트 작성 예

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('회원가입 후 로그인', async ({ page }) => {
  // 1. 회원가입 페이지 접속
  await page.goto('http://localhost:3005/signup');
  
  // 2. 폼 입력
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 3. 대시보드 리다이렉트 확인
  await expect(page).toHaveURL(/\/dashboard/);
});
```

---

## 성능 최적화

### Next.js 빌드 최적화
```bash
# 빌드 분석 (번들 크기 확인)
ANALYZE=true npm run build
# 또는
npm run build -- --analyze (만약 next/bundle-analyzer 설치되면)
```

### 이미지 최적화
- `next/image` 컴포넌트 사용 (자동 최적화)
- WebP, AVIF 변환 자동
- Lazy loading 기본 활성화

### 데이터베이스 쿼리 최적화
- 필요한 컬럼만 선택 (SELECT *)
- 인덱스 활용 (자주 필터링되는 컬럼)
- 페이지네이션 (대량 데이터)

---

## CI/CD 파이프라인

### GitHub Actions (예정)
`.github/workflows/` 디렉토리에 다음 워크플로우 추가:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run ci          # 린트 + 빌드 + 보안 검사
      - run: npm run test:e2e    # E2E 테스트
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 배포 (Vercel 권장)

### Vercel 배포 단계

1. **Vercel 계정 생성** (vercel.com)
2. **GitHub 저장소 연결**
3. **환경 변수 설정** (Vercel Dashboard → Settings → Environment Variables)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **푸시 → 자동 배포** (GitHub main 푸시 시)

### 다른 호스팅 옵션
- 🔵 **Vercel** (Next.js 최적화, 권장)
- 🟢 **Railway** (PostgreSQL 통합)
- 🟠 **Render** (간단한 배포)
- 🟣 **AWS Amplify** (엔터프라이즈)

---

## 문제 해결

### 포트 충돌
```bash
# 포트 3000이 사용 중인 경우
npm run dev -- -p 3001
```

### 환경 변수 누락
```bash
# 환경 변수 확인
cat .env.local

# 누락된 경우 .env.example과 비교
diff .env.example .env.local
```

### Supabase 연결 오류
```bash
# Supabase URL 및 키 검증
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 로컬 Supabase 상태 확인
supabase status
```

### 빌드 실패
```bash
# 캐시 제거 후 재빌드
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## 버전 고정 및 업그레이드 정책

### 현재 버전 고정
```json
{
  "next": "15.1.0",
  "react": "19.0.0",
  "typescript": "5.7.0",
  "@supabase/supabase-js": "2.105.4",
  "@playwright/test": "1.60.0"
}
```

### 업그레이드 절차
1. **변경 사항 확인**: 해당 라이브러리 CHANGELOG 검토
2. **기능 테스트**: 변경 사항 영향도 평가
3. **종속성 업데이트**: `npm update package-name`
4. **E2E 테스트**: `npm run test:e2e` 실행
5. **PR 병합**: 테스트 통과 후 병합

---

## 참고 자료

### 공식 문서
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript 5.7](https://www.typescriptlang.org/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [Playwright Testing](https://playwright.dev)

### 보안 체크리스트
- [ ] Service Role Key가 `.env.example`에 없는가?
- [ ] 모든 민감한 환경 변수가 `.gitignore`에 있는가?
- [ ] 프로덕션 배포 전 `npm run ci` 실행했는가?
- [ ] Supabase RLS 정책을 `docs/db-rls.md`에서 확인했는가?

---

## 문서 참고

- **제품 문서**: `product.md` — 기능, MVP, 범위
- **구조 문서**: `structure.md` — 디렉토리, 라우트 그룹, 데이터 흐름
- **데이터베이스**: `docs/db-rls.md` — RLS 정책, 테이블 스키마, 마이그레이션
