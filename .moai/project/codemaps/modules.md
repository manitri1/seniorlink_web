# 모듈 구조와 책임

## 모듈 계층도

```
┌─────────────────────────────────────────┐
│  프레젠테이션 계층 (Pages + Components)  │
├──────────────────┬──────────────────┬──┤
│  (auth)          │  (dashboard)     │ (senior) │
│  인증 페이지     │  기업 대시보드    │ 시니어 워크스페이스 │
└──────────────────┼──────────────────┼──┘
                   │                  │
                   ↓                  ↓
┌────────────────────────────────────────────┐
│  비즈니스 로직 계층 (Server Actions)       │
│  ├── (auth)/actions.ts                    │
│  ├── (dashboard)/requests/actions.ts      │
│  ├── (dashboard)/contracts/actions.ts     │
│  ├── (dashboard)/company/actions.ts       │
│  ├── (senior)/senior/proposal-actions.ts  │
│  └── (senior)/senior/profile/actions.ts   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌────────────────────────────────────────────┐
│  데이터 접근 계층 (lib)                    │
│  ├── lib/supabase/                        │
│  │   ├── server.ts (Server Component)     │
│  │   ├── client.ts (Client Component)     │
│  │   ├── middleware.ts (세션 갱신)        │
│  │   └── env.ts (환경변수)                │
│  └── lib/domain/ (타입 + 서버 헬퍼)      │
│      ├── tf-request.ts                    │
│      ├── tf-request-server.ts             │
│      ├── proposal.ts                      │
│      ├── contract.ts                      │
│      └── ...                              │
└──────────────┬──────────────────────────┘
               │
               ↓
┌────────────────────────────────────────────┐
│  Supabase (인증 + 데이터베이스)           │
│  ├── PostgreSQL 테이블                   │
│  ├── RLS 정책                             │
│  └── 트리거 (on_auth_user_created)       │
└────────────────────────────────────────────┘
```

---

## 모듈별 상세

### 1. (auth) 모듈 — 공개 인증

**위치**: `src/app/(auth)/`

**책임**
- 사용자 회원가입 (역할 선택)
- 사용자 로그인
- 로그아웃
- 역할 기반 프로필 초기화

**파일 구조**
```
(auth)/
├── layout.tsx              # 중앙 카드 레이아웃 (centered.css)
├── login/
│   └── page.tsx            # 로그인 폼 (useActionState)
├── signup/
│   ├── page.tsx            # 회원가입 폼 (역할 선택)
│   └── SignupForm.tsx      # Client Component (상태 관리)
└── actions.ts              # Server Actions
```

**공개 인터페이스** (`actions.ts`)

| 함수 | 입력 | 출력 | 부작용 |
|------|------|------|--------|
| `login(prevState, formData)` | email, password | `{ error?: string }` | auth.users 검증, 세션 쿠키 설정 |
| `signup(prevState, formData)` | email, password, role | `{ error?: string }` | auth.users 생성, profiles 행 생성 (트리거) |
| `logout()` | — | void | 세션 쿠키 제거, 로그아웃 |

**데이터 흐름**
```
signup (FormData: email, password, role)
  → Supabase Auth signUp()
  → auth.users 생성 (자동)
  → on_auth_user_created 트리거 발동
    → profiles (id, role, created_at) 행 생성
  → 성공하면 /login으로 리다이렉트
```

**RLS 정책** (직접 사용 없음 - 트리거만 사용)

**의존성**
- `lib/supabase/server.ts` — Supabase 클라이언트
- `lib/supabase/middleware.ts` — updateSession()

---

### 2. (dashboard) 모듈 — 기업 대시보드

**위치**: `src/app/(dashboard)/`

**책임**
- 기업 프로필 관리
- TF 요청 CRUD
- 제안 수신 및 검토
- 계약 관리
- 정산 관리

**파일 구조**
```
(dashboard)/
├── layout.tsx                              # Shell 레이아웃 (auth gate)
├── dashboard/page.tsx                      # 홈 페이지
├── company/
│   ├── profile/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── actions.ts
├── requests/
│   ├── page.tsx                            # 요청 목록
│   ├── new/page.tsx                        # 새 요청 폼
│   ├── [requestId]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # 요청 상세
│   │   ├── matches/page.tsx                # 매칭 결과 (일반 조회)
│   │   ├── proposals/page.tsx              # 제안 목록
│   │   └── proposal-actions.ts             # 제안 처리 (수락/거절)
│   └── actions.ts
├── contracts/
│   ├── page.tsx                            # 계약 목록
│   ├── new/page.tsx                        # 새 계약 폼
│   ├── [contractId]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # 계약 상세 (상태 변경)
│   │   ├── settlement/page.tsx             # 정산 관리
│   │   └── (하위 컴포넌트)
│   └── actions.ts
├── settings/page.tsx                       # 대시보드 설정
└── ...
```

**공개 인터페이스**

#### requests/actions.ts

| 함수 | 입력 | 출력 | RLS 확인 |
|------|------|------|---------|
| `createTfRequest(formData)` | title, field, duration_weeks, ... | void | 자신의 company_id만 INSERT |
| `updateTfRequest(id, data)` | title, status, ... | void | 자신의 요청만 UPDATE |
| `deleteTfRequest(id)` | — | void | 자신의 요청만 DELETE |

#### contracts/actions.ts

| 함수 | 입력 | 출력 | RLS 확인 |
|------|------|------|---------|
| `createContract(proposalId)` | — | void | 자신의 제안에 대해서만 작동 |
| `activateContract(contractId)` | — | void | 자신의 계약만 활성화 |
| `requestSettlement(contractId)` | — | void | 정산 상태 변경 |

#### company/actions.ts

| 함수 | 입력 | 출력 | RLS 확인 |
|------|------|------|---------|
| `updateCompanyProfile(formData)` | name, industry, description, ... | void | 자신의 회사만 UPDATE |

**레이아웃 보호**
```typescript
// (dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login?returnUrl=/dashboard');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role === 'senior') {
    redirect('/senior/dashboard');  // 시니어는 진입 불가
  }
  
  return <Shell>{children}</Shell>;
}
```

**의존성**
- `lib/supabase/server.ts` — Server Component 클라이언트
- `lib/tf-request-server.ts` — TF 요청 서버 헬퍼
- `lib/contract-server.ts` — 계약 서버 헬퍼
- `lib/dashboard-server.ts` — 대시보드 집계 데이터
- `components/layout/DashboardNav.tsx` — 네비게이션
- `components/requests/RequestStatusBadge.tsx` — 상태 표시

---

### 3. (senior) 모듈 — 시니어 워크스페이스

**위치**: `src/app/(senior)/senior/`

**책임**
- 시니어 프로필 관리
- 제안 수신 및 검토
- 제안 수락/거절
- 진행 중인 계약 조회
- 정산 정보 확인

**파일 구조**
```
(senior)/
└── senior/
    ├── layout.tsx                          # Shell 레이아웃 (auth gate)
    ├── dashboard/page.tsx                  # 시니어 홈
    ├── profile/
    │   ├── page.tsx
    │   └── actions.ts
    ├── proposals/
    │   ├── page.tsx                        # 제안 목록
    │   ├── [proposalId]/page.tsx           # 제안 상세 (수락/거절)
    │   └── (하위 컴포넌트)
    ├── contracts/page.tsx                  # 계약 목록
    └── settings/page.tsx                   # 설정
```

**공개 인터페이스**

#### proposal-actions.ts

| 함수 | 입력 | 출력 | RLS 확인 |
|------|------|------|---------|
| `acceptProposal(proposalId)` | — | void | 자신의 제안만 수락 (status → accepted) |
| `rejectProposal(proposalId)` | — | void | 자신의 제안만 거절 (status → rejected) |
| `withdrawProposal(proposalId)` | — | void | 자신의 제안만 철회 (status → withdrawn) |

#### profile/actions.ts

| 함수 | 입력 | 출력 | RLS 확인 |
|------|------|------|---------|
| `updateSeniorProfile(formData)` | bio, skills, ... | void | 자신의 프로필만 UPDATE |

**레이아웃 보호**
```typescript
// (senior)/layout.tsx
export default async function SeniorLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login?returnUrl=/senior/dashboard');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  if (profile?.role !== 'senior') {
    redirect('/dashboard');  // 기업은 진입 불가
  }
  
  return <Shell>{children}</Shell>;
}
```

**의존성**
- `lib/supabase/server.ts`
- `lib/proposal.ts` — 제안 타입
- `lib/contract-server.ts` — 계약 정보
- `components/layout/SeniorNav.tsx` — 네비게이션

---

### 4. lib/supabase 모듈 — 데이터 접근 기반

**위치**: `src/lib/supabase/`

**책임**
- Supabase 클라이언트 팩토리
- 세션 관리
- 환경변수 로딩

**파일 구조**
```
lib/supabase/
├── server.ts          # Server Component/Action용 클라이언트
├── client.ts          # Client Component용 클라이언트
├── middleware.ts      # 미들웨어 세션 갱신
└── env.ts             # 환경변수 게터
```

**공개 인터페이스**

#### server.ts

```typescript
export async function createClient() {
  // Next.js cookies() 사용
  // SupabaseClient<Database> 반환
  // 서버 측에서만 호출 가능
}
```

**사용 위치**
- Server Components (page.tsx)
- Server Actions (actions.ts)
- Route Handlers (api/route.ts)

**세션 관리**
```typescript
const { data: { user } } = await supabase.auth.getUser();
// → auth.users 테이블에서 현재 사용자 조회
// → 세션 쿠키에서 인증 정보 추출
```

#### client.ts

```typescript
export function createClient() {
  // 브라우저 API 사용
  // SupabaseClient<Database> 반환
  // 클라이언트 측에서만 호출 가능
}
```

**사용 위치**
- Client Components (`'use client'` 마크)
- 실시간 구독 (Realtime)

#### middleware.ts

```typescript
export async function updateSession(request: NextRequest) {
  // 세션 쿠키 갱신
  // { response, user } 반환
  // src/middleware.ts에서 호출
}
```

#### env.ts

| 함수 | 반환값 | 환경변수 |
|------|--------|---------|
| `getPublicSupabaseUrl()` | string | NEXT_PUBLIC_SUPABASE_URL |
| `getPublicSupabasePublishableKey()` | string | NEXT_PUBLIC_SUPABASE_ANON_KEY |

---

### 5. lib/domain 모듈 — 비즈니스 타입 및 헬퍼

**위치**: `src/lib/`

**책임**
- 비즈니스 도메인 타입 정의
- 서버 측 데이터 조회 헬퍼
- 비즈니스 로직 유틸

**파일 구조**
```
lib/
├── tf-request.ts                   # 타입: TfRequest
├── tf-request-server.ts            # 함수: fetchTfRequest(), fetchTfRequests()
├── proposal.ts                     # 타입: Proposal
├── contract.ts                     # 타입: Contract
├── contract-server.ts              # 함수: fetchContract()
├── dashboard-server.ts             # 집계: dashboardStats()
├── request-matches.ts              # 매칭 데이터
└── (기타)
```

**주요 타입**

#### TfRequest (tf-request.ts)

```typescript
interface TfRequest {
  id: string;
  company_id: string;
  title: string;
  field: string;
  duration_weeks: number;
  budget_min: number | null;
  budget_max: number | null;
  goals: string;
  region: string;
  status: 'open' | 'matching' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

#### Proposal (proposal.ts)

```typescript
interface Proposal {
  id: string;
  tf_request_id: string;
  senior_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  match_score: number | null;
  created_at: string;
}
```

#### Contract (contract.ts)

```typescript
interface Contract {
  id: string;
  proposal_id: string;
  company_id: string;
  senior_id: string;
  status: 'draft' | 'active' | 'settlement_requested' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}
```

**서버 헬퍼 함수**

#### tf-request-server.ts

```typescript
export async function fetchTfRequest(id: string) {
  // TfRequest by id
  // 호출자의 권한 확인 필요
}

export async function fetchCompanyTfRequests(companyId: string) {
  // company_id로 필터링된 TfRequest[]
  // RLS 적용됨
}
```

#### contract-server.ts

```typescript
export async function fetchContract(contractId: string) {
  // Contract by id with related data
  // Proposal, Company, Senior 정보 포함 가능
}
```

**의존성**
- `lib/supabase/server.ts` — 클라이언트
- Supabase 타입 정의 (Database)

---

### 6. components 모듈 — UI 컴포넌트 라이브러리

**위치**: `src/components/`

**책임**
- 재사용 가능한 UI 컴포넌트
- 상태 표시 배지
- 네비게이션
- 폼 컴포넌트

**파일 구조**
```
components/
├── ui/                              # 기본 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Toast.tsx
│   └── index.ts
├── layout/
│   ├── DashboardNav.tsx            # 기업 사이드바 네비
│   └── SeniorNav.tsx               # 시니어 사이드바 네비
├── requests/
│   ├── RequestStatusBadge.tsx       # 상태: open, matching, in_progress, ...
│   └── RequestSubnav.tsx            # 요청 상세 서브네비
├── proposals/
│   └── ProposalStatusBadge.tsx      # 상태: pending, accepted, rejected, withdrawn
├── contracts/
│   ├── ContractStatusBadge.tsx      # 상태: draft, active, settlement_requested, ...
│   └── SettlementStepper.tsx        # 정산 프로세스 스테퍼
└── marketing/
    └── HomeLanding.tsx             # 공개 홈페이지
```

**주요 컴포넌트**

#### Button.tsx

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

**사용처**: 모든 폼, 네비게이션, 작업 버튼

#### Card.tsx

```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
}
```

**사용처**: 인증 레이아웃, 데이터 표시

#### Input.tsx, Textarea.tsx

**사용처**: 폼 필드 (로그인, 회원가입, 프로필, TF 요청)

#### DashboardNav.tsx

```typescript
// <nav>
//   <Link href="/dashboard">대시보드</Link>
//   <Link href="/dashboard/requests">TF 요청</Link>
//   <Link href="/dashboard/contracts">계약</Link>
//   <Link href="/dashboard/settings">설정</Link>
// </nav>
```

**의존성**
- React
- Next.js Link

---

### 7. api 모듈 — 외부 웹훅 및 콜백

**위치**: `src/app/api/`

**책임**
- OAuth 콜백
- 결제 웹훅

**파일 구조**
```
api/
├── auth/callback/route.ts          # OAuth 콜백 (Google, etc.)
└── webhooks/payment/route.ts       # Toss Payment 웹훅
```

**공개 인터페이스**

#### auth/callback/route.ts

```typescript
export async function GET(request: NextRequest) {
  // code 파라미터로 세션 설정
  // Supabase OAuth flow 완료
  // /dashboard 리다이렉트
}
```

**흐름**
```
사용자가 Google 로그인 클릭
  ↓ (Supabase Auth 리다이렉트)
Google 동의 화면
  ↓ (code 반환)
/api/auth/callback?code=...
  ↓ (Supabase 토큰 교환)
세션 쿠키 설정
  ↓
/dashboard 리다이렉트
```

#### webhooks/payment/route.ts

```typescript
export async function POST(request: NextRequest) {
  // Toss Payment 서명 검증
  // settlements 테이블 업데이트
  // 200 OK 응답
}
```

**보안**
- 서명 검증 (HMAC)
- Service role key 사용 가능

**의존성**
- `lib/supabase/server.ts`
- Toss Payment SDK

---

## 모듈 간 의존성 정리

```
(auth) ──────────────────────┐
                             │
(dashboard) ──── lib/domain ──┤
                 ↓           │
              lib/supabase ───┤
                             │
(senior) ─────────────────────┘
                             │
           components/layout─┤
           components/ui ────┤
           components/* ──────┘

           api/ ───── lib/supabase
               └────── middleware
```

---

## 데이터 접근 패턴

### 패턴 1: Server Component에서 읽기

```typescript
// (dashboard)/requests/page.tsx
const supabase = await createClient();
const { data: requests } = await supabase
  .from('tf_requests')
  .select('*')
  // RLS 자동 적용: company_id IN (자신의 회사들)

return <RequestList requests={requests} />;
```

### 패턴 2: Server Action에서 쓰기

```typescript
// (dashboard)/requests/actions.ts
'use server';

export async function createTfRequest(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tf_requests')
    .insert({
      company_id,
      title: formData.get('title'),
      // ...
    });
  revalidatePath('/dashboard/requests');
}
```

### 패턴 3: Client Component에서 읽기 (필요시)

```typescript
'use client';

const supabase = createClient();
const { data: contracts } = await supabase
  .from('contracts')
  .select('*')
  // RLS 자동 적용
```

**주의**: 민감한 쓰기는 Server Action 필수

---

## 다음 참고 문서

- **dependencies.md** — 패키지 의존성 및 외부 시스템
- **entry-points.md** — 애플리케이션 시작점
- **data-flow.md** — 비즈니스 데이터 흐름
