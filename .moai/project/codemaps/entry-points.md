# 애플리케이션 진입점 (Entry Points)

## 요청 흐름

```
브라우저 요청
    ↓
src/middleware.ts ─────────────────────────┐
    │                                       │
    ├─ 세션 검증                           │
    ├─ 인증 경로 확인                      │
    └─ 보호 경로 리다이렉트                │
    │                                       │
    ↓ (인증됨 또는 공개 경로)             │
src/app/layout.tsx ◄─────────────────────┘
    │
    ├─ 루트 레이아웃
    ├─ 폰트 로딩
    ├─ CSS 초기화
    │
    ↓
src/app/page.tsx
또는
src/app/(auth)/layout.tsx
또는
src/app/(dashboard)/layout.tsx
또는
src/app/(senior)/layout.tsx
    │
    ├─ 라우트 그룹 레이아웃
    ├─ 인증/인가 검사
    ├─ 네비게이션 렌더링
    │
    ↓
페이지 컴포넌트 (page.tsx)
```

---

## 1. 미들웨어 진입점

### src/middleware.ts

**실행 시점**: 모든 요청의 최상단

**역할**
- 세션 갱신 (updateSession)
- 인증 확인
- 경로 기반 라우팅 결정

**코드 구조**

```typescript
export async function middleware(request: NextRequest) {
  // 단계 1: 세션 갱신
  const { response, user } = await updateSession(request);
  
  // 단계 2: 현재 경로 확인
  const { pathname } = request.nextUrl;
  
  // 단계 3: 인증 없이 보호 경로 접근
  if (!user && isProtectedPath(pathname)) {
    // /login으로 리다이렉트 (returnUrl 파라미터 포함)
    return NextResponse.redirect(loginUrl);
  }
  
  // 단계 4: 인증됨 + 인증 경로
  if (user && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    // /로 리다이렉트
    return NextResponse.redirect(homeUrl);
  }
  
  // 단계 5: 통과 (응답 반환)
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|...).*)" ],
};
```

**보호 경로 목록**
- `/dashboard/*`
- `/requests/*`
- `/contracts/*`
- `/settings/*`
- `/company/*`
- `/senior/*`

**공개 경로**
- `/`
- `/login`
- `/signup`
- `/auth/*`

**흐름도**

```
요청 들어옴
    ↓
updateSession(request)
    ├─ 쿠키에서 세션 읽기
    ├─ Supabase Auth 검증
    └─ auth.uid() 반환
    ↓
isProtectedPath(pathname) 확인
    ├─ YES: 미인증 → /login 리다이렉트
    └─ NO: 계속
    ↓
isPublicPath(pathname) 확인
    ├─ YES: 미인증 → 계속
    └─ NO: (보호 경로는 이미 처리됨)
    ↓
인증 + 인증 경로 (login/signup)
    ├─ YES → / 리다이렉트
    └─ NO: 계속
    ↓
원본 요청 처리
```

---

## 2. 루트 레이아웃 진입점

### src/app/layout.tsx

**실행 시점**: 모든 페이지 렌더링 전 (최상위)

**역할**
- HTML 루트 구조 제공
- 전역 폰트 로딩
- 메타데이터 설정
- 전역 스타일 로드

**코드 구조**

```typescript
import { Manrope, Work_Sans } from "next/font/google";
import "./globals.css";

// 폰트 선언
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",  // FCP 개선
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

// 메타데이터
export const metadata: Metadata = {
  title: "Seniorlink — 기업",
  description: "시니어 전문가와 단기 TF를 연결하는 기업용 웹",
};

// 렌더링
export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${manrope.variable} ${workSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**폰트 전략**
- `Manrope`: 본문 (sans-serif)
- `Work Sans`: 제목 (sans-serif)
- `display: swap`: 로딩 중 폴백 폰트 사용, 로드 후 교체

**CSS 계층**
```
globals.css
├── CSS 변수 (font-*)
├── 리셋 (html, body)
├── 유틸리티 클래스 (sl-shell, sl-sidebar, ...)
└── 컴포넌트 스타일
```

---

## 3. 공개 페이지 진입점

### src/app/page.tsx

**경로**: `/`

**역할**
- 미인증 사용자를 위한 랜딩 페이지
- 서비스 소개
- 로그인/회원가입 링크

**컴포넌트**
```typescript
import { HomeLanding } from "@/components/marketing/HomeLanding";

export default function LandingPage() {
  return <HomeLanding />;
}
```

**렌더링**
- Server Component
- 미인증 사용자만 접근 가능 (middleware에서 인증됨 사용자는 / 리다이렉트)
- 정적 콘텐츠

---

## 4. 인증 영역 진입점

### src/app/(auth)/layout.tsx

**경로**: `/login`, `/signup`

**역할**
- 인증 UI 레이아웃 (centered card)
- 미인증 사용자만 접근

**코드 구조**

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="centered-card">
        {children}
      </div>
    </div>
  );
}
```

**스타일링**
- 수직 중앙 정렬 (flexbox)
- 카드 컨테이너
- 폼 너비 제한

#### src/app/(auth)/login/page.tsx

**경로**: `/login`

**흐름**
```
사용자 방문
    ↓
middleware 확인 → 미인증 ✓ 통과
    ↓
LoginPage 렌더링
    │
    ├─ Suspense (비동기 처리)
    └─ LoginForm (Client Component)
        │
        ├─ useActionState(login)
        ├─ returnUrl 파라미터 처리
        └─ 폼 제출 → login() Server Action
            │
            ├─ Email/Password 검증
            ├─ Supabase Auth signIn()
            ├─ 세션 쿠키 설정
            └─ returnUrl로 리다이렉트 (기본값: /dashboard)
```

**코드 스니펫**

```typescript
// (auth)/login/page.tsx
'use client';

function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/dashboard";
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="returnUrl" value={returnUrl} />
      <Input name="email" type="email" required />
      <Input name="password" type="password" required />
      <SubmitButton />
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Server Action (login)**

```typescript
// (auth)/actions.ts
'use server';

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const returnUrl = formData.get('returnUrl');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(returnUrl);
}
```

#### src/app/(auth)/signup/page.tsx

**경로**: `/signup`

**흐름**
```
사용자 방문
    ↓
middleware 확인 → 미인증 ✓ 통과
    ↓
SignupPage 렌더링
    │
    ├─ Suspense
    └─ SignupForm (Client Component)
        │
        ├─ 역할 선택 (company / senior)
        ├─ useActionState(signup)
        └─ 폼 제출 → signup() Server Action
            │
            ├─ Email/Password/Role 검증
            ├─ Supabase Auth signUp()
            │
            ├─ auth.users 행 생성
            │
            ├─ on_auth_user_created 트리거
            │   └─ profiles (id, role) 행 생성
            │
            └─ /login으로 리다이렉트
```

---

## 5. 기업 대시보드 진입점

### src/app/(dashboard)/layout.tsx

**경로**: `/dashboard/*`

**실행 순서**

```
middleware.ts ──────────────┐
                            │
(dashboard)/layout.tsx ◄────┘
    │
    ├─ 인증 확인
    │   └─ await supabase.auth.getUser()
    │
    ├─ 프로필 조회
    │   └─ await supabase.from('profiles').select('role').eq('id', user.id)
    │
    ├─ 역할 검증
    │   ├─ role === 'company' → 계속
    │   └─ role === 'senior' → /senior/dashboard 리다이렉트
    │
    └─ Shell 렌더링
        │
        ├─ 사이드바 (DashboardNav)
        ├─ 톱바
        └─ 콘텐츠 영역 (children)
```

**코드**

```typescript
// (dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  
  // 1. 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?returnUrl=/dashboard');
  
  // 2. 프로필 조회 (RLS: 자신만)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  
  // 3. 역할 검증
  if (profile?.role === 'senior') {
    redirect('/senior/dashboard');
  }
  
  // 4. 렌더링
  return (
    <div className="sl-shell">
      <aside className="sl-sidebar">
        <DashboardNav />
      </aside>
      <main className="sl-main-wrap">{children}</main>
    </div>
  );
}
```

**보호 메커니즘** (3단계)
1. middleware: 미인증 → /login 리다이렉트
2. layout: 인증 확인 + 역할 검증
3. RLS: 데이터베이스에서 자동 필터링

#### src/app/(dashboard)/dashboard/page.tsx

**경로**: `/dashboard`

**역할**
- 기업 대시보드 홈
- 주요 지표 표시
- 최근 활동

**데이터**
```typescript
// Server Component
const { data: requests } = await supabase
  .from('tf_requests')
  .select('*')
  .eq('company_id', companyId);
  // RLS 적용: 자신의 company_id만 조회 가능
```

#### src/app/(dashboard)/requests/page.tsx

**경로**: `/dashboard/requests`

**역할**
- TF 요청 목록

**데이터 흐름**
```
page.tsx (Server Component)
    ↓
fetchCompanyTfRequests(userId)
    ↓
select * from tf_requests
where company_id in (
  select id from companies where owner_id = auth.uid()
)
(RLS 자동 필터링)
    ↓
RequestList 컴포넌트 렌더링
    ├─ 요청 표 / 카드
    ├─ 상태 배지
    └─ [+새 요청] 버튼 → /new
```

#### src/app/(dashboard)/requests/new/page.tsx

**경로**: `/dashboard/requests/new`

**역할**
- 새 TF 요청 생성 폼

**데이터 흐름**
```
TfRequestForm (Client Component)
    │
    ├─ useActionState(createTfRequest)
    │
    └─ formAction으로 제출
        │
        ↓ (Server Action)
        createTfRequest(prevState, formData)
        │
        ├─ 폼 데이터 파싱
        ├─ 검증
        ├─ supabase.from('tf_requests').insert()
        │   (RLS: 자신의 company_id만)
        ├─ revalidatePath('/dashboard/requests')
        └─ redirect('/dashboard/requests/[newId]')
            │
            ↓ (외부 시스템)
            AI 매칭 엔진 비동기 실행
            └─ request_matches 테이블에 결과 저장
```

#### src/app/(dashboard)/contracts/page.tsx

**경로**: `/dashboard/contracts`

**역할**
- 진행 중인 계약 목록

**데이터**
```typescript
const { data: contracts } = await supabase
  .from('contracts')
  .select(`
    *,
    proposals (
      status,
      senior_id,
      senior_profiles (full_name)
    )
  `)
  // RLS: 자신의 company_id 계약만
```

---

## 6. 시니어 워크스페이스 진입점

### src/app/(senior)/layout.tsx

**경로**: `/senior/*`

**보호 메커니즘**

```
middleware → (senior)/layout.tsx
                │
                ├─ 인증 확인
                │
                ├─ 프로필 조회
                │
                ├─ role === 'senior' 검증
                │   └─ 아니면 → /dashboard 리다이렉트
                │
                └─ Shell 렌더링
                    ├─ 사이드바 (SeniorNav)
                    └─ 콘텐츠
```

#### src/app/(senior)/senior/proposals/page.tsx

**경로**: `/senior/proposals`

**역할**
- 시니어가 받은 제안 목록

**데이터 흐름**
```
page.tsx (Server Component)
    ↓
select * from proposals
where senior_id = auth.uid()
(RLS 자동 필터링)
    ↓
제안 목록 렌더링
├─ TF 요청 제목
├─ 예상 기간 / 예산
├─ 매칭 점수
└─ [상세 보기] 링크 → /[proposalId]
```

#### src/app/(senior)/senior/proposals/[proposalId]/page.tsx

**경로**: `/senior/proposals/[proposalId]`

**역할**
- 제안 상세 + 수락/거절 폼

**데이터 흐름**
```
page.tsx (Server Component)
    │
    ├─ 제안 데이터 조회 (RLS 확인)
    │
    └─ SeniorAcceptProposalForm / SeniorRejectProposalForm
        │
        ├─ useActionState(acceptProposal)
        │
        └─ 폼 제출
            │
            ↓ (Server Action)
            acceptProposal(proposalId)
            │
            ├─ RLS 확인 (자신의 제안?)
            ├─ proposals 상태 → 'accepted'
            ├─ contracts INSERT (draft)
            ├─ revalidatePath()
            └─ redirect('/senior/contracts')
                │
                ↓ (기업 측)
                기업이 계약 활성화 대기
```

---

## 7. API 라우트 진입점

### src/app/api/auth/callback/route.ts

**경로**: `/api/auth/callback`

**호출 시점**
1. 사용자가 로그인 페이지에서 "Google로 로그인" 클릭
2. Google OAuth 창 열림
3. 사용자 동의
4. Google → Supabase → 이 라우트로 리다이렉트 (code 파라미터)

**흐름**

```
GET /api/auth/callback?code=...&state=...
    │
    ├─ Supabase Auth 코드로 세션 설정
    │
    └─ /dashboard 리다이렉트
        │
        ↓ (미들웨어)
        updateSession() 실행
        │
        ├─ 세션 쿠키 갱신
        └─ 대시보드 렌더링
```

**코드**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // 세션 쿠키 자동 설정
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

### src/app/api/webhooks/payment/route.ts

**경로**: `/api/webhooks/payment`

**호출 시점**
1. 정산 청구 폼 제출 (RequestSettlement)
2. 기업이 Toss Payment API에 결제 요청
3. 결제 완료 또는 실패
4. Toss → 이 라우트로 콜백

**보안**
- 서명 검증 (HMAC)
- Service role key 사용 (기업/시니어 인증 없이)

**흐름**

```
POST /api/webhooks/payment
{
  "transactionId": "...",
  "status": "completed|failed",
  "amount": 1000000,
  "signature": "..."
}
    │
    ├─ 서명 검증
    │   └─ 위조된 요청 거부
    │
    ├─ settlements 테이블 조회
    │   └─ transactionId로 찾기
    │
    ├─ 상태 업데이트
    │   ├─ completed → 'released'
    │   └─ failed → 'failed'
    │
    └─ 200 OK 응답
```

**코드**

```typescript
export async function POST(request: NextRequest) {
  const payload = await request.json();
  
  // 1. 서명 검증
  const signature = payload.signature;
  const isValid = verifySignature(payload, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 2. settlements 업데이트 (service role)
  const supabase = createServerClient(url, serviceRoleKey);
  const { error } = await supabase
    .from('settlements')
    .update({ status: payload.status === 'completed' ? 'released' : 'failed' })
    .eq('transaction_id', payload.transactionId);
  
  return NextResponse.json({ success: true });
}
```

---

## 8. Server Actions 진입점

### src/app/(auth)/actions.ts

| Action | 입력 | 호출 위치 | 데이터 변경 |
|--------|------|---------|----------|
| `login(prevState, formData)` | email, password, returnUrl | (auth)/login/page.tsx | auth.users (signIn) |
| `signup(prevState, formData)` | email, password, role | (auth)/signup/page.tsx | auth.users + profiles (트리거) |
| `logout()` | — | (dashboard)/layout.tsx | auth.users (signOut) |

### src/app/(dashboard)/requests/actions.ts

| Action | 입력 | 호출 위치 | 데이터 변경 |
|--------|------|---------|----------|
| `createTfRequest(formData)` | title, field, ... | /requests/new | tf_requests INSERT |
| `updateTfRequest(id, data)` | status, ... | /requests/[id] | tf_requests UPDATE |
| `deleteTfRequest(id)` | — | /requests/[id] | tf_requests DELETE |

### src/app/(dashboard)/contracts/actions.ts

| Action | 입력 | 호출 위치 | 데이터 변경 |
|--------|------|---------|----------|
| `createContract(proposalId)` | — | /requests/[id]/proposals | contracts INSERT |
| `activateContract(contractId)` | — | /contracts/[id] | contracts UPDATE (active) |
| `requestSettlement(contractId)` | — | /contracts/[id]/settlement | settlements INSERT |

### src/app/(senior)/senior/proposal-actions.ts

| Action | 입력 | 호출 위치 | 데이터 변경 |
|--------|------|---------|----------|
| `acceptProposal(proposalId)` | — | /proposals/[id] | proposals UPDATE + contracts INSERT |
| `rejectProposal(proposalId)` | — | /proposals/[id] | proposals UPDATE |
| `withdrawProposal(proposalId)` | — | /proposals/[id] | proposals UPDATE |

---

## 진입점 정리표

| 진입점 | 파일 | 타입 | 인증 | 설명 |
|--------|------|------|------|------|
| **모든 요청** | src/middleware.ts | Middleware | — | 세션 갱신 + 경로 보호 |
| **HTML 루트** | src/app/layout.tsx | Layout | — | 폰트, 메타데이터, globals.css |
| **공개 홈** | src/app/page.tsx | Page | 미인증 | 랜딩 페이지 |
| **로그인** | src/app/(auth)/login/page.tsx | Page | 미인증 | 로그인 폼 |
| **회원가입** | src/app/(auth)/signup/page.tsx | Page | 미인증 | 회원가입 폼 (역할 선택) |
| **기업 대시보드** | src/app/(dashboard)/layout.tsx | Layout | company | 기업 Shell |
| **기업 홈** | src/app/(dashboard)/dashboard/page.tsx | Page | company | 대시보드 홈 |
| **시니어 워크스페이스** | src/app/(senior)/layout.tsx | Layout | senior | 시니어 Shell |
| **시니어 홈** | src/app/(senior)/senior/dashboard/page.tsx | Page | senior | 시니어 대시보드 홈 |
| **OAuth 콜백** | src/app/api/auth/callback/route.ts | Route | — | Google 로그인 콜백 |
| **결제 웹훅** | src/app/api/webhooks/payment/route.ts | Route | — | Toss Payment 콜백 |

---

## 데이터 흐름 요약

### 신규 사용자 가입 흐름

```
1. /signup 방문
2. SignupForm: email, password, role 입력
3. signup() Server Action 호출
   ├─ Supabase Auth signUp()
   ├─ auth.users 행 생성
   ├─ on_auth_user_created 트리거
   └─ profiles (id, role) 행 생성
4. /login 리다이렉트
```

### 기업의 TF 요청 생성 흐름

```
1. /dashboard/requests/new 방문
2. TfRequestForm: title, field, duration_weeks, ... 입력
3. createTfRequest() Server Action 호출
   ├─ tf_requests INSERT (RLS: 자신의 company_id)
   ├─ revalidatePath('/dashboard/requests')
   └─ /dashboard/requests/[newId] 리다이렉트
4. 외부: AI 매칭 엔진이 비동기로 request_matches 생성
```

### 시니어의 제안 수락 흐름

```
1. /senior/proposals/[id] 방문
2. SeniorAcceptProposalForm 표시
3. acceptProposal() Server Action 호출
   ├─ proposals UPDATE (status → accepted)
   ├─ contracts INSERT (draft)
   ├─ revalidatePath()
   └─ /senior/contracts 리다이렉트
4. 기업이 계약 활성화 대기
```

### 정산 청구 흐름

```
1. /dashboard/contracts/[id]/settlement 방문
2. RequestSettlementForm 표시
3. requestSettlement() Server Action 호출
   ├─ settlements INSERT (pending)
   ├─ Toss Payment API 호출
   └─ 결제 대기
4. 결제 완료 시:
   ├─ /api/webhooks/payment 콜백 수신
   ├─ settlements UPDATE (released/failed)
   └─ 정산 완료
```

---

## 다음 문서

- **overview.md** — 전체 아키텍처
- **modules.md** — 모듈별 책임
- **data-flow.md** — 비즈니스 흐름
