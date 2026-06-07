# 의존성 지도

## 모듈 간 의존성 그래프

```
┌─────────────────────────────────────────────┐
│ 페이지 레이어 (Pages + Layout)              │
├─────────────────────────────────────────────┤
│ • (auth)/login/page.tsx                     │
│ • (auth)/signup/page.tsx                    │
│ • (dashboard)/requests/page.tsx             │
│ • (dashboard)/contracts/page.tsx            │
│ • (senior)/senior/proposals/page.tsx        │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌───────────────┐  ┌────────────────────┐
│ Actions 레이어 │  │ Components 레이어  │
├───────────────┤  ├────────────────────┤
│ • (auth)/     │  │ • Button.tsx       │
│   actions.ts  │  │ • Card.tsx         │
│ • (dashboard) │  │ • Input.tsx        │
│   /requests/  │  │ • NavBar.tsx       │
│   actions.ts  │  │ • StatusBadge.tsx  │
│ • (senior)    │  │ • ...              │
│   /proposals/ │  │                    │
│   actions.ts  │  │                    │
└───────────────┘  └──────┬─────────────┘
        │                 │
        └────────┬────────┘
                 ↓
    ┌─────────────────────────┐
    │ Domain Layer (lib/*)    │
    ├─────────────────────────┤
    │ • tf-request.ts         │
    │ • tf-request-server.ts  │
    │ • proposal.ts           │
    │ • contract.ts           │
    │ • contract-server.ts    │
    │ • dashboard-server.ts   │
    └──────────┬──────────────┘
               │
               ↓
    ┌─────────────────────────┐
    │ Supabase Layer          │
    ├─────────────────────────┤
    │ • supabase/server.ts    │
    │ • supabase/client.ts    │
    │ • supabase/middleware.ts│
    └──────────┬──────────────┘
               │
               ↓
    ┌─────────────────────────┐
    │ 데이터베이스 + 인증      │
    ├─────────────────────────┤
    │ • Supabase Auth         │
    │ • PostgreSQL Tables     │
    │ • RLS Policies          │
    └─────────────────────────┘
```

---

## 파일 수준 의존성

### (auth) 모듈

```
(auth)/login/page.tsx
├── (auth)/actions.ts ──── login()
│   ├── lib/supabase/server.ts ──── createClient()
│   └── lib/supabase/env.ts ──── getPublicSupabaseUrl()
├── components/ui/Card.tsx
├── components/ui/Input.tsx
└── components/ui/Button.tsx

(auth)/signup/page.tsx
├── (auth)/SignupForm.tsx
│   ├── (auth)/actions.ts ──── signup()
│   ├── components/ui/*.tsx
│   └── (로컬 상태: email, password, role)
└── ...

(auth)/actions.ts
├── lib/supabase/server.ts ──── createClient()
├── next/navigation ──── redirect()
└── 직접 의존성 없음 (RLS 정책으로 보호됨)
```

### (dashboard)/requests 모듈

```
(dashboard)/requests/page.tsx ◄── Server Component
├── lib/supabase/server.ts ──── createClient()
├── lib/tf-request-server.ts ──── fetchCompanyTfRequests()
│   └── lib/tf-request.ts ──── TfRequest 타입
├── components/requests/RequestStatusBadge.tsx
├── components/layout/RequestSubnav.tsx
└── <Link> to new/page.tsx

(dashboard)/requests/new/page.tsx
├── (dashboard)/requests/TfRequestForm.tsx ◄── Client Component
│   ├── (auth)/actions.ts ──── createTfRequest()
│   ├── 'use client'
│   ├── useActionState()
│   ├── components/ui/Input.tsx
│   ├── components/ui/Textarea.tsx
│   └── components/ui/Button.tsx
└── ...

(dashboard)/requests/[requestId]/page.tsx
├── lib/supabase/server.ts
├── lib/tf-request-server.ts ──── fetchTfRequest()
├── components/requests/*.tsx
└── <Link> to proposals/page.tsx

(dashboard)/requests/[requestId]/proposals/page.tsx
├── lib/supabase/server.ts
├── lib/proposal.ts ──── Proposal 타입
├── components/proposals/ProposalStatusBadge.tsx
└── <form action={acceptProposal}>  ◄── Server Action

(dashboard)/requests/actions.ts
├── lib/supabase/server.ts
├── next/cache ──── revalidatePath()
└── RLS 정책: companies, tf_requests 테이블
```

### (dashboard)/contracts 모듈

```
(dashboard)/contracts/page.tsx ◄── Server Component
├── lib/supabase/server.ts
├── lib/contract-server.ts ──── fetchContracts()
│   └── lib/contract.ts ──── Contract 타입
├── components/contracts/ContractStatusBadge.tsx
└── ...

(dashboard)/contracts/[contractId]/page.tsx
├── lib/contract-server.ts
├── components/contracts/ContractActivateForm.tsx ◄── Client Component
│   ├── (dashboard)/contracts/actions.ts ──── activateContract()
│   └── useActionState()
├── components/contracts/ContractProgressForm.tsx
├── components/contracts/ContractReviewSection.tsx
└── ...

(dashboard)/contracts/[contractId]/settlement/page.tsx
├── lib/contract-server.ts
├── components/contracts/CompleteSettlementForm.tsx ◄── Client Component
│   ├── (dashboard)/contracts/actions.ts ──── requestSettlement()
│   └── useActionState()
├── components/contracts/SettlementStepper.tsx
└── ...

(dashboard)/contracts/actions.ts
├── lib/supabase/server.ts
├── lib/contract-server.ts
├── next/cache
└── RLS 정책: contracts, proposals, settlements 테이블
```

### (senior) 모듈

```
(senior)/senior/proposals/page.tsx ◄── Server Component
├── lib/supabase/server.ts
├── lib/proposal.ts ──── Proposal 타입
├── components/proposals/ProposalStatusBadge.tsx
└── <Link> to [proposalId]/page.tsx

(senior)/senior/proposals/[proposalId]/page.tsx
├── lib/supabase/server.ts
├── components/proposals/SeniorAcceptProposalForm.tsx ◄── Client Component
│   ├── (senior)/senior/proposal-actions.ts ──── acceptProposal()
│   └── useActionState()
├── components/proposals/SeniorRejectProposalForm.tsx
└── ...

(senior)/senior/proposal-actions.ts
├── lib/supabase/server.ts
├── next/cache
└── RLS 정책: proposals, contracts 테이블

(senior)/senior/contracts/page.tsx
├── lib/contract-server.ts
└── ...

(senior)/senior/profile/page.tsx
├── components/ui/*.tsx
├── (senior)/senior/profile/SeniorProfileForm.tsx ◄── Client Component
│   └── (senior)/senior/profile/actions.ts ──── updateSeniorProfile()
└── ...
```

### 데이터 접근 계층

```
lib/supabase/server.ts
├── next/headers ──── cookies()
├── @supabase/ssr ──── createServerClient()
└── lib/supabase/env.ts ──── getPublicSupabaseUrl()

lib/supabase/client.ts
├── @supabase/ssr ──── createBrowserClient()
└── lib/supabase/env.ts

lib/supabase/middleware.ts
├── next/headers
├── @supabase/ssr ──── createServerClient()
└── 세션 갱신 (src/middleware.ts에서 호출)

lib/supabase/env.ts
└── 환경변수 읽기 (process.env.NEXT_PUBLIC_SUPABASE_URL)

lib/tf-request-server.ts
├── lib/supabase/server.ts
├── lib/tf-request.ts ──── 타입
└── RLS 자동 필터링

lib/contract-server.ts
├── lib/supabase/server.ts
├── lib/contract.ts ──── 타입
└── RLS 자동 필터링

lib/dashboard-server.ts
├── lib/supabase/server.ts
└── 집계 쿼리
```

### 미들웨어 및 전역

```
src/middleware.ts
├── next/server ──── NextRequest, NextResponse
├── lib/supabase/middleware.ts ──── updateSession()
└── 모든 경로에 적용 (matcher 설정)

src/app/layout.tsx ◄── Root Layout
├── next/font/google ──── Manrope, Work_Sans
├── globals.css
└── metadata

src/app/page.tsx ◄── Landing Page
└── components/marketing/HomeLanding.tsx

src/app/api/auth/callback/route.ts
├── next/server
├── lib/supabase/server.ts
└── OAuth 콜백 처리

src/app/api/webhooks/payment/route.ts
├── next/server
├── lib/supabase/server.ts
└── 결제 웹훅 처리
```

---

## 외부 패키지 의존성

### 프로덕션 의존성

| 패키지 | 버전 | 용도 | 사용 위치 |
|--------|------|------|---------|
| `next` | 15.1.0 | 웹 프레임워크 | 모든 페이지, 라우트, 미들웨어 |
| `react` | 19.0.0 | UI 라이브러리 | 모든 컴포넌트 |
| `react-dom` | 19.0.0 | DOM 렌더링 | Client Components, 폼 |
| `@supabase/ssr` | 0.10.3 | SSR Supabase 클라이언트 | lib/supabase/* |
| `@supabase/supabase-js` | 2.105.4 | Supabase 클라이언트 | (선택적) 실시간 구독 |

### 개발 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `typescript` | 5.7.0 | 타입 검사 |
| `@types/react` | 19.0.0 | React 타입 |
| `@types/react-dom` | 19.0.0 | React-DOM 타입 |
| `@types/node` | 20.17.0 | Node.js 타입 |
| `eslint` | 9.15.0 | 린팅 |
| `eslint-config-next` | 15.1.0 | Next.js ESLint 설정 |
| `@playwright/test` | 1.60.0 | E2E 테스트 |

---

## 데이터베이스 테이블 접근 맵

### auth.users (Supabase Auth)

| 접근 대상 | 읽음 | 쓰임 | 위치 |
|---------|------|------|------|
| 로그인 | ✓ | — | (auth)/actions.ts |
| 회원가입 | — | ✓ | (auth)/actions.ts |
| 사용자 ID 조회 | ✓ | — | 모든 Server Component/Action |

### profiles

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 역할 조회 | ✓ | — | ✓ (자신만) | (dashboard)/layout.tsx, (senior)/layout.tsx |
| 프로필 생성 | — | ✓ | — | on_auth_user_created 트리거 |

### companies

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 회사 정보 | ✓ | — | ✓ (소유자만) | (dashboard)/company/profile/page.tsx |
| 회사 업데이트 | — | ✓ | ✓ (소유자만) | (dashboard)/company/actions.ts |

### tf_requests

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 요청 목록 (기업) | ✓ | — | ✓ (소유 회사) | (dashboard)/requests/page.tsx |
| 요청 상세 (기업) | ✓ | — | ✓ (소유 회사) | (dashboard)/requests/[requestId]/page.tsx |
| 요청 생성 | — | ✓ | ✓ (소유 회사) | (dashboard)/requests/actions.ts |
| 요청 업데이트 | — | ✓ | ✓ (소유 회사) | (dashboard)/requests/actions.ts |
| 요청 조회 (시니어) | ✓ | — | ✓ (초대됨) | (senior)/senior/proposals/page.tsx |

### proposals

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 제안 목록 (기업) | ✓ | — | ✓ (자신 요청) | (dashboard)/requests/[requestId]/proposals/page.tsx |
| 제안 목록 (시니어) | ✓ | — | ✓ (자신 제안) | (senior)/senior/proposals/page.tsx |
| 제안 수락/거절 | — | ✓ | ✓ (자신 제안) | (senior)/senior/proposal-actions.ts |

### contracts

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 계약 목록 (기업) | ✓ | — | ✓ (소유 회사) | (dashboard)/contracts/page.tsx |
| 계약 상세 (기업) | ✓ | — | ✓ (소유 회사) | (dashboard)/contracts/[contractId]/page.tsx |
| 계약 생성 | — | ✓ | ✓ (권한 확인) | (dashboard)/contracts/actions.ts |
| 계약 활성화 | — | ✓ | ✓ (소유 회사) | (dashboard)/contracts/actions.ts |
| 계약 목록 (시니어) | ✓ | — | ✓ (당사자) | (senior)/senior/contracts/page.tsx |

### settlements

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 정산 정보 | ✓ | — | ✓ (당사자) | (dashboard)/contracts/[contractId]/settlement/page.tsx |
| 정산 요청 | — | ✓ | ✓ (권한 확인) | (dashboard)/contracts/actions.ts |
| 정산 상태 업데이트 | — | ✓ | ✓ (권한 확인) | (api)/webhooks/payment/route.ts |

### request_matches

| 접근 대상 | 읽음 | 쓰임 | RLS | 위치 |
|---------|------|------|-----|------|
| 매칭 결과 | ✓ | — | ✓ (자신 요청) | (dashboard)/requests/[requestId]/matches/page.tsx |
| 매칭 생성 | — | ✓ | — | 외부 AI 매칭 서비스 |

---

## 외부 시스템 연동

### Supabase OAuth

```
사용자 ──────────────┐
                     │
                     ↓
          Google OAuth Provider
                     │
                     ↓
          Supabase Auth Endpoint
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ↓                                 ↓
/api/auth/callback ────────────► auth.users
    │                                 │
    ↓                                 ↓
세션 쿠키 설정              on_auth_user_created 트리거
    │                                 │
    ↓                                 ↓
/dashboard 리다이렉트          profiles 행 생성
```

**코드 경로**
- Request: `(auth)/login/page.tsx`
- Callback: `api/auth/callback/route.ts`
- 세션 초기화: `lib/supabase/middleware.ts`

### AI 매칭 엔진 (외부)

```
(dashboard)/requests/actions.ts ──── createTfRequest()
                                           │
                                           ↓
                                    tf_requests INSERT
                                           │
                                           ↓
                          (외부 비동기 서비스 트리거)
                                           │
                                           ↓
                          AI 매칭 로직 실행
                                           │
                                           ↓
                          request_matches INSERT
                                           │
                                           ↓
(senior)/senior/proposals/page.tsx ◄── 매칭 결과 조회
```

### Toss Payment (결제)

```
(dashboard)/contracts/[contractId]/settlement/page.tsx
    │
    ├── 정산 청구 폼
    │
    ↓
(dashboard)/contracts/actions.ts ──── requestSettlement()
    │
    ↓
settlements INSERT (pending)
    │
    ↓
Toss Payment API 호출
    │
    ↓
결제 처리
    │
    ↓
/api/webhooks/payment ◄── 콜백 수신
    │
    ↓
settlements UPDATE (released/failed)
```

**보안**
- Service role key로 웹훅 처리
- HMAC 서명 검증
- 거래 금액 재확인

---

## 순환 의존성 (Circular Dependencies)

**검사 결과**: 순환 의존성 없음 ✓

**검증 방법**
```bash
# 프로젝트에서 다음 명령 실행:
npm run lint  # ESLint + Next.js 규칙
```

---

## 의존성 버전 호환성

| 패키지 | 최소 버전 | 권장 버전 | 호환성 |
|--------|---------|---------|-------|
| Node.js | 18.17+ | 20 LTS | ✓ |
| npm | 9+ | 10+ | ✓ |
| Next.js | 15.0+ | 15.1.0 | ✓ |
| React | 19.0+ | 19.0.0 | ✓ |
| Supabase | 0.10+ | 0.10.3 | ✓ |
| TypeScript | 5.0+ | 5.7.0 | ✓ |

---

## 성능 최적화

### 번들 크기 최적화

1. **Server Components 기본값**
   - 클라이언트 번들에서 데이터 로직 제외
   - 민감한 로직을 서버에서만 실행

2. **동적 임포트**
   ```typescript
   // 필요시 사용
   const HeavyComponent = dynamic(() => 
     import('../components/HeavyComponent')
   );
   ```

3. **Font 최적화**
   - `next/font/google`으로 웹폰트 최적화
   - `display: swap` 설정

### 캐싱 전략

| 항목 | 캐싱 방식 | 재검증 |
|------|---------|-------|
| 페이지 | ISR (on-demand) | revalidatePath() |
| API | 캐시 없음 | 실시간 |
| 정적 자산 | 장기 캐싱 | 버전 관리 |

---

## 다음 문서

- **overview.md** — 아키텍처 전체 개요
- **modules.md** — 모듈 상세 책임
- **entry-points.md** — 애플리케이션 진입점
- **data-flow.md** — 비즈니스 흐름
