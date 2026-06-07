# Seniorlink Web 아키텍처 개요

## 시스템 소개

**Seniorlink Web**은 기업과 시니어(경력) 전문가를 연결하는 쌍방향 마켓플레이스입니다.

### 핵심 가치 제안

| 역할 | 주요 기능 |
|-----|---------|
| **기업** | TF(Task Force) 요청 등록 → 시니어 제안 수신 → 계약 체결 → 협업 관리 |
| **시니어** | TF 제안 검토 → 계약 수락 → 프로젝트 실행 → 정산 청구 |

### 아키텍처 계층

```
┌─────────────────────────────────────────────────────────┐
│  사용자 인터페이스 (Next.js 15 App Router)              │
├──────────────────┬──────────────────┬──────────────────┤
│  (auth) - 인증   │  (dashboard)     │  (senior)        │
│  로그인/회원가입 │  기업 대시보드    │  시니어 워크스페이스│
├──────────────────┴──────────────────┴──────────────────┤
│  비즈니스 로직 레이어 (Server Actions, Route Handlers) │
├──────────────────────────────────────────────────────────┤
│  데이터 접근 레이어 (lib/supabase + domain helpers)     │
├──────────────────────────────────────────────────────────┤
│  데이터베이스 (Supabase PostgreSQL + RLS)               │
├──────────────────────────────────────────────────────────┤
│  외부 시스템 (OAuth, Toss Payment)                      │
└──────────────────────────────────────────────────────────┘
```

---

## 3개 라우트 그룹

### 1. (auth) — 공개 인증 영역

```
(auth)/
├── layout.tsx          # 중앙 카드 레이아웃
├── login/page.tsx      # 로그인 폼
├── signup/page.tsx     # 회원가입 폼 (역할 선택)
└── actions.ts          # login(), signup(), logout() Server Actions
```

**역할**
- 로그인/회원가입 UI 제공
- 인증 처리 (Supabase Auth)
- 역할 기반 프로필 생성 (profiles 테이블)

**보안**
- 미들웨어가 이미 로그인한 사용자를 리다이렉트 (중복 로그인 방지)
- Server Actions로 민감한 인증 처리

### 2. (dashboard) — 기업 전용 보호 영역

```
(dashboard)/
├── layout.tsx                         # Shell: 사이드바 + 톱바
├── dashboard/page.tsx                 # 대시보드 홈
├── company/profile/                   # 기업 프로필 관리
│   ├── page.tsx
│   └── actions.ts
├── requests/                          # TF 요청 CRUD
│   ├── page.tsx
│   ├── new/page.tsx
│   ├── [requestId]/
│   │   ├── page.tsx
│   │   ├── matches/page.tsx
│   │   ├── proposals/page.tsx
│   │   └── proposal-actions.ts
│   └── actions.ts
├── contracts/                         # 계약 관리
│   ├── page.tsx
│   ├── [contractId]/page.tsx
│   ├── [contractId]/settlement/page.tsx
│   └── actions.ts
└── settings/page.tsx                  # 대시보드 설정
```

**접근 제어**
- middleware.ts에서 `/dashboard` 경로 보호
- (dashboard)/layout.tsx에서 `role === "company"` 검증
- `role !== "company"`면 `/senior/dashboard`로 리다이렉트

**주요 흐름**
1. TF 요청 생성 (new/page.tsx → actions.ts)
2. 제안 수신 (proposals/page.tsx 조회)
3. 계약 체결 (contracts/new)
4. 정산 관리 (contracts/[contractId]/settlement)

### 3. (senior) — 시니어 전용 보호 영역

```
(senior)/
└── senior/
    ├── layout.tsx                     # Shell (공유)
    ├── dashboard/page.tsx             # 시니어 대시보드
    ├── profile/                       # 시니어 프로필
    │   ├── page.tsx
    │   └── actions.ts
    ├── proposals/                     # 받은 제안 목록
    │   ├── page.tsx
    │   ├── [proposalId]/page.tsx
    │   └── proposal-actions.ts
    └── contracts/page.tsx             # 진행 중인 계약
```

**접근 제어**
- middleware.ts에서 `/senior` 경로 보호
- (senior)/layout.tsx에서 `role === "senior"` 검증
- `role !== "senior"`면 `/dashboard`로 리다이렉트

**주요 흐름**
1. 제안 검토 (proposals/page.tsx)
2. 제안 수락/거절 ([proposalId]/page.tsx → proposal-actions.ts)
3. 계약 진행 (contracts/page.tsx)

---

## 보안 모델

### 인증 (Authentication)

```
로그인 요청
    ↓
Supabase Auth
    ↓
auth.users 테이블 (자동)
    ↓
on_auth_user_created 트리거
    ↓
profiles 테이블 행 생성 (role 포함)
    ↓
세션 쿠키 (secure, httpOnly)
    ↓
이후 요청마다 검증
```

**구현**
- `lib/supabase/server.ts` — Server Components용 클라이언트 (anon key)
- `lib/supabase/client.ts` — Client Components용 클라이언트 (anon key)
- `lib/supabase/middleware.ts` — updateSession() 미들웨어 함수

### 인가 (Authorization)

**레벨 1: 미들웨어**
```typescript
// src/middleware.ts
// 보호 경로 확인 → 미인증 사용자 /login으로 리다이렉트
```

**레벨 2: 레이아웃**
```typescript
// (dashboard)/layout.tsx
// 프로필 조회 → role 검증 → 다른 역할이면 리다이렉트
```

**레벨 3: RLS (Row-Level Security)**
```sql
-- tf_requests 테이블
-- "tf_requests_select_own": 자신의 company_id 요청만 조회
-- "tf_requests_select_senior_invited": 초대받은 시니어만 조회
```

### API 키 전략

| 컨텍스트 | 사용 키 | 용도 |
|---------|--------|------|
| Browser (Client Component) | anon key | 공개 데이터 + RLS로 보호 |
| Server Component | anon key | 서버 측 데이터 읽기 (쿠키 기반 세션) |
| Server Action | anon key | 서버 측 데이터 쓰기 (세션 + RLS) |
| Route Handler | service role key | 외부 웹훅 처리 (미들웨어 검증 필요) |
| 미들웨어 | — | 키 없음 (세션만 갱신) |

**주의**: Service role key는 절대 클라이언트로 전송하지 않음

---

## 디자인 패턴

### 1. Server Components (기본값)

모든 페이지(`page.tsx`)는 Server Component입니다.

**장점**
- 데이터 조회가 페이지 렌더링 시점에 실행
- 민감한 로직을 서버에서만 실행
- 클라이언트 번들 크기 감소

**예시**
```typescript
// (dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from('tf_requests')
    .select('*');
  // RLS가 자동으로 필터링 (company 소유 요청만)
  return <div>{/* 렌더링 */}</div>;
}
```

### 2. Server Actions (모든 쓰기)

상태 변경(CREATE, UPDATE, DELETE)은 Server Actions를 사용합니다.

**구조**
```typescript
// (dashboard)/requests/actions.ts
'use server';

export async function createTfRequest(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tf_requests')
    .insert({ /* 데이터 */ });
  if (error) throw error;
  revalidatePath('/dashboard/requests');
}
```

**사용처**
- 폼 제출 (useActionState)
- 버튼 클릭
- 데이터 변경

### 3. Middleware-First 인증

모든 보호 경로는 middleware.ts에서 먼저 확인합니다.

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await updateSession(request);
  
  if (!user && isProtectedPath(pathname)) {
    // /login으로 리다이렉트
  }
}
```

**단계**
1. 모든 요청이 middleware를 거침
2. 세션 검증 (Supabase Auth)
3. 인증 없으면 보호 경로 차단

### 4. RLS (Row-Level Security)

데이터베이스 레벨에서 행 단위 접근 제어를 강제합니다.

**예시: tf_requests**
```sql
create policy "tf_requests_select_own" on public.tf_requests
for select using (
  company_id in (
    select c.id from public.companies c 
    where c.owner_id = auth.uid()
  )
);
```

**보장**
- 기업은 자신의 요청만 조회 가능
- DB에서 필터링되므로 클라이언트 검증 우회 불가능
- Supabase가 자동으로 `auth.uid()` 주입

---

## 외부 시스템 경계

### OAuth (Supabase Auth)

- **용도**: 사용자 인증
- **흐름**: 구글 로그인 → Supabase Auth → /api/auth/callback → 세션 생성

### AI 매칭 엔진

- **용도**: TF 요청과 시니어 프로필 매칭
- **범위**: Seniorlink Web 외부 (별도 마이크로서비스)
- **인터페이스**: request_matches 테이블에 결과 저장

### Toss Payment

- **용도**: 정산 처리
- **흐름**: 정산 청구 → Toss API 호출 → /api/webhooks/payment 콜백 수신

---

## 데이터 흐름

### 기업의 TF 요청 → 시니어 제안 흐름

```
1. 기업이 TF 요청 생성
   (dashboard)/requests/new/page.tsx → createTfRequest()
   ↓
2. requests 테이블에 INSERT (RLS: 자신의 company_id만)
   ↓
3. AI 매칭 엔진이 비동기로 실행 (외부 시스템)
   ↓
4. 일치하는 시니어 프로필에 대해 request_matches 행 생성
   ↓
5. 시니어 대시보드에서 일치 항목 확인 (proposals/page.tsx)
   ↓
6. 시니어가 제안 수락/거절 ([proposalId]/page.tsx)
   ↓
7. proposals 테이블 상태 변경 (proposal_status)
   ↓
8. 수락 시 contracts 테이블에 draft 계약 생성
   ↓
9. 기업이 계약 활성화 (contracts/[contractId]/page.tsx)
   ↓
10. 프로젝트 진행 중...
    ↓
11. 정산 청구 (contracts/[contractId]/settlement/page.tsx)
    ↓
12. Toss Payment 처리
    ↓
13. settlements 테이블 상태 변경 (completed)
```

### 권한 격리

**기업 A는 볼 수 없음**
- 다른 기업의 TF 요청
- 다른 기업의 제안
- 다른 기업의 계약

**시니어 B는 볼 수 없음**
- 자신에게 초대되지 않은 TF 요청
- 자신의 제안이 아닌 다른 제안
- 자신의 계약이 아닌 다른 계약

**모두 RLS 정책으로 강제됨**

---

## 주요 기술 스택

| 계층 | 기술 | 버전 |
|-----|------|------|
| **프론트엔드** | Next.js | 15.1.0 |
| | React | 19.0.0 |
| | TypeScript | 5.7.0 |
| **백엔드** | Next.js Server Actions | 15.1.0 |
| | Next.js API Routes | 15.1.0 |
| **데이터베이스** | Supabase | 최신 |
| | PostgreSQL | 15+ |
| **인증** | Supabase Auth | 내장 |
| | OAuth 2.0 | - |
| **클라이언트 라이브러리** | @supabase/ssr | 0.10.3 |
| | @supabase/supabase-js | 2.105.4 |
| **UI** | 커스텀 컴포넌트 | - |
| | CSS (globals.css) | - |

---

## 배포 단위

| 단위 | 기술 | 배포 대상 |
|------|------|---------|
| 웹앱 | Next.js 15 | Vercel / Node.js 호스팅 |
| 데이터베이스 | PostgreSQL | Supabase Cloud |
| 인증 | Supabase Auth | Supabase Cloud |
| 스토리지 | 미정 | - |

---

## 코드 응집도

**핵심 비즈니스 로직**
- Server Actions (`(dashboard)/requests/actions.ts`)
- Domain helpers (`lib/tf-request-server.ts`, `lib/contract-server.ts`)
- RLS 정책 (supabase/migrations)

**프레젠테이션**
- Page components (`(dashboard)/requests/page.tsx`)
- UI components (`components/ui/*.tsx`)
- Layout shells (`(dashboard)/layout.tsx`)

**데이터 접근**
- Supabase client factories (`lib/supabase/*.ts`)
- Type helpers (`lib/tf-request.ts`)

---

## 다음 단계

이 개요를 바탕으로:
1. **modules.md** — 각 모듈의 책임과 인터페이스
2. **dependencies.md** — 모듈 간 의존성 맵
3. **entry-points.md** — 애플리케이션 시작점
4. **data-flow.md** — 비즈니스 흐름과 데이터 변환
