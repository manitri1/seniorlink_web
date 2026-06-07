# 아키텍처 문서: Seniorlink Web

## 디렉토리 구조 개요

```
seniorlink_web/
├── src/
│   ├── app/                          # Next.js App Router (메인 애플리케이션)
│   │   ├── (auth)/                   # 공개 경로 (인증 전)
│   │   │   ├── login/page.tsx        # 로그인 페이지
│   │   │   ├── signup/page.tsx       # 회원가입 페이지
│   │   │   ├── actions.ts            # 로그인/회원가입 Server Actions
│   │   │   └── layout.tsx            # 공개 페이지 레이아웃
│   │   │
│   │   ├── (dashboard)/              # 기업 전용 경로 (로그인 필수, role: company)
│   │   │   ├── dashboard/page.tsx    # 기업 대시보드 (진행 중 계약, 통계)
│   │   │   ├── requests/             # TF 요청 관리
│   │   │   │   ├── page.tsx          # 요청 목록
│   │   │   │   ├── [requestId]/
│   │   │   │   │   ├── page.tsx      # 요청 상세 + 제안 목록
│   │   │   │   │   └── proposal-actions.ts
│   │   │   │   └── actions.ts        # 요청 CRUD
│   │   │   ├── contracts/            # 계약 관리
│   │   │   │   ├── page.tsx          # 계약 목록
│   │   │   │   ├── [contractId]/page.tsx  # 계약 상세 + 결제
│   │   │   │   └── actions.ts
│   │   │   ├── company/              # 기업 프로필
│   │   │   │   ├── profile/page.tsx  # 프로필 수정 폼
│   │   │   │   └── actions.ts
│   │   │   ├── settings/page.tsx     # 설정 페이지
│   │   │   └── layout.tsx            # 기업 레이아웃 (네비게이션 포함)
│   │   │
│   │   ├── (senior)/                 # 시니어 전문가 전용 경로 (role: senior)
│   │   │   ├── senior/dashboard/page.tsx    # 시니어 대시보드
│   │   │   ├── senior/profile/
│   │   │   │   ├── page.tsx          # 프로필 조회
│   │   │   │   ├── edit/page.tsx     # 프로필 수정
│   │   │   │   └── actions.ts
│   │   │   ├── senior/proposals/     # 제안 관리
│   │   │   │   ├── page.tsx          # 제안 목록 (매칭된 요청)
│   │   │   │   ├── [proposalId]/page.tsx
│   │   │   │   └── proposal-actions.ts
│   │   │   ├── senior/contracts/page.tsx    # 계약 목록
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # Route Handlers (API 엔드포인트)
│   │   │   ├── auth/callback/route.ts       # OAuth 콜백 (Supabase)
│   │   │   └── webhooks/
│   │   │       └── payment/route.ts         # Toss Payments Webhook
│   │   │
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 홈 페이지 (모든 사용자)
│   │   └── loading.tsx, error.tsx, not-found.tsx
│   │
│   ├── components/                   # 재사용 가능한 React 컴포넌트
│   │   ├── ui/                       # UI 기본 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Form.tsx
│   │   │   └── index.ts              # 일괄 export
│   │   │
│   │   ├── DashboardNav.tsx          # 대시보드 네비게이션 바
│   │   ├── RequestCard.tsx           # TF 요청 카드
│   │   ├── ProposalCard.tsx          # 제안 카드
│   │   ├── ContractItem.tsx          # 계약 아이템
│   │   └── ...
│   │
│   └── lib/                          # 유틸리티, 헬퍼, 상수
│       ├── supabase/                 # Supabase 클라이언트 및 설정
│       │   ├── client.ts             # 브라우저 Client (Anon Key)
│       │   ├── server.ts             # Node.js Server (Service Role Key)
│       │   ├── middleware.ts         # 미들웨어 연결
│       │   └── env.ts                # 환경 변수 검증
│       │
│       ├── tf-request.ts             # TF 요청 헬퍼 (조회, 필터링)
│       ├── tf-request-server.ts      # TF 요청 Server Action 로직
│       ├── proposal.ts               # 제안 헬퍼
│       ├── contract.ts               # 계약 헬퍼
│       ├── contract-server.ts        # 계약 Server Action 로직
│       ├── request-matches.ts        # 매칭 헬퍼
│       ├── dashboard-server.ts       # 대시보드 쿼리
│       │
│       ├── types/                    # TypeScript 타입 정의
│       │   ├── database.ts           # DB 테이블 타입 (Supabase 생성)
│       │   └── ...
│       │
│       ├── constants.ts              # 상수 (상태, enum 등)
│       ├── utils.ts                  # 일반 유틸리티
│       └── ...
│
├── supabase/                         # Supabase 설정
│   ├── migrations/                   # SQL 마이그레이션 파일
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240115000000_rls_policies.sql
│   │   └── 20240120000000_add_triggers.sql
│   │
│   ├── seeds/                        # 시드 데이터
│   │   ├── qa/seed.sql               # QA 테스트용 더미 데이터
│   │   └── loadtest/seed.sql         # 부하 테스트용 데이터
│   │
│   └── config.toml                   # Supabase 로컬 설정
│
├── docs/                             # 프로젝트 문서
│   ├── prd.md                        # 제품 요구사항 문서
│   ├── ia.md                         # 정보 아키텍처
│   ├── task.md                       # 태스크 목록
│   ├── design.md                     # UI/UX 설계
│   └── db-rls.md                     # 데이터베이스 및 RLS 정책
│
├── e2e/                              # Playwright E2E 테스트
│   ├── auth.spec.ts                  # 인증 시나리오
│   ├── request.spec.ts               # TF 요청 시나리오
│   └── ...
│
├── .next/                            # Next.js 빌드 아웃풋 (git 무시)
├── node_modules/                     # npm 의존성 (git 무시)
├── public/                           # 정적 자산 (이미지, 폰트 등)
│
├── middleware.ts                     # Next.js 미들웨어 (요청 가로채기)
├── next.config.ts                    # Next.js 설정
├── tsconfig.json                     # TypeScript 설정
├── package.json                      # npm 메타데이터 및 스크립트
├── playwright.config.ts              # Playwright 설정
├── .env.example                      # 환경 변수 템플릿
├── CLAUDE.md                         # Claude Code 지침
└── README.md                         # 프로젝트 소개

```

---

## 라우트 그룹 아키텍처

### 왜 3가지 라우트 그룹으로 나눌까?

Next.js App Router의 **라우트 그룹** `(groupName)` 을 사용하여 다음을 달성합니다:

1. **URL 구조 분리 없이 레이아웃 분리**
   - `(auth)` 경로는 `/login`, `/signup` (URL에 `auth` 포함 안 함)
   - `(dashboard)` 경로는 `/dashboard`, `/requests` (기업 전용)
   - `(senior)` 경로는 `/senior/dashboard`, `/senior/proposals` (시니어 전용)

2. **역할 기반 보호**
   - 각 그룹은 독립적인 레이아웃과 미들웨어 인증 로직
   - 미들웨어가 역할 확인 → 권한 없는 사용자 리다이렉트

3. **독립적인 UI 구조**
   - `(auth)`: 공개 페이지, 헤더만 (네비게이션 X)
   - `(dashboard)`: 사이드바 네비게이션, 기업 관련 메뉴
   - `(senior)`: 사이드바 네비게이션, 시니어 관련 메뉴

### 라우트 그룹별 데이터 접근 범위

#### (auth) — 공개 그룹
- 🔓 **인증 상태**: 불필요
- 📋 **접근 가능한 데이터**: 없음 (공개 정보만, DB 쿼리 불가)
- **페이지**: 로그인, 회원가입, 랜딩 페이지
- **Server Actions**: `(auth)/actions.ts` — `createUser`, `signInUser` 등

#### (dashboard) — 기업 전용 그룹
- 🔐 **인증 상태**: 필수 + `role = 'company'` 확인
- 📋 **접근 가능한 데이터**:
  - 자신의 `companies` 레코드
  - 자신이 생성한 `tf_requests`
  - 자신의 요청에 대한 `proposals`
  - 자신의 `contracts` (company_id 기반)
  - `request_matches` (자신의 요청에 대한 것만)
- **RLS 정책**: `companies.owner_id = current_user_id`
- **Server Actions**: `company/actions.ts`, `requests/actions.ts`, `contracts/actions.ts`

#### (senior) — 시니어 전문가 전용 그룹
- 🔐 **인증 상태**: 필수 + `role = 'senior'` 확인
- 📋 **접근 가능한 데이터**:
  - 자신의 `senior_profiles` 레코드
  - 자신에게 매칭된 `request_matches` (시니어가 관련된 것)
  - 자신이 제출한 `proposals`
  - 자신의 `contracts` (senior_id 기반)
  - 자신이 받은 리뷰 (contract_reviews)
- **RLS 정책**: `proposals.senior_id = current_user_id` 등
- **Server Actions**: `senior/profile/actions.ts`, `senior/proposal-actions.ts`

---

## 데이터 흐름 패턴

### 패턴 1: 서버 컴포넌트 → 직접 쿼리 (읽기 전용)

```
┌─────────────────────┐
│ Server Component    │
│ (page.tsx)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ lib/supabase/       │
│ server.ts           │ (Service Role Key 사용)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Supabase RLS        │
│ 행 수준 보안        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 데이터 반환         │
│ (권한 확인됨)       │
└─────────────────────┘
```

**사용 장소**:
- 페이지 초기 데이터 로드
- 대시보드 통계 조회
- 요청/계약 목록 조회

**구현 예**:
```typescript
// src/app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const contracts = await getActiveContracts();
  return <div>{contracts.map(...)}</div>;
}

// src/lib/dashboard-server.ts
export async function getActiveContracts() {
  const supabase = await createServerClient();
  return supabase
    .from('contracts')
    .select('*')
    .eq('status', 'active');
}
```

### 패턴 2: 클라이언트 폼 → Server Action (쓰기)

```
┌──────────────────┐
│ Client Component │
│ <form>           │
└────────┬─────────┘
         │ formData
         ▼
┌──────────────────┐
│ Server Action    │
│ 'use server'     │ (인증, 입력 검증)
└────────┬─────────┘
         │ (Anon or Service Role Key)
         ▼
┌──────────────────┐
│ Supabase RLS     │
│ INSERT/UPDATE    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 결과 반환        │
│ (에러 또는 성공) │
└──────────────────┘
```

**사용 장소**:
- 폼 제출 (회원가입, 요청 생성, 계약 업데이트)
- 액션 트리거 (제안 수락, 계약 서명)

**구현 예**:
```typescript
// src/app/(dashboard)/requests/actions.ts
'use server';

export async function createTFRequest(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('tf_requests')
    .insert({
      title: formData.get('title'),
      field: formData.get('field'),
      company_id: user.id, // RLS가 자동 확인
    });
  
  if (error) throw error;
  revalidatePath('/requests');
  return data;
}
```

### 패턴 3: Webhook (외부 → 서버)

```
┌──────────────────┐
│ Toss Payments    │ (외부 서비스)
└────────┬─────────┘
         │ POST /api/webhooks/payment
         ▼
┌──────────────────┐
│ Route Handler    │
│ (route.ts)       │
└────────┬─────────┘
         │ (Supabase Service Role)
         ▼
┌──────────────────┐
│ settlements      │
│ UPDATE 상태      │
└──────────────────┘
```

---

## 핵심 파일 위치 및 목적

### 미들웨어 및 인증
- **`src/middleware.ts`**
  - 모든 요청 가로채기
  - `updateSession()` 호출 → Supabase 세션 갱신
  - 역할 확인 → 권한 없는 경로 리다이렉트
  - 예: `/senior/*` 접근 시 role 확인, company 아니면 로그인 페이지로

- **`src/lib/supabase/middleware.ts`**
  - 미들웨어용 Supabase 클라이언트 생성
  - Request/Response 쿠키 관리

### Supabase 클라이언트
- **`src/lib/supabase/client.ts`**
  - 브라우저 클라이언트 (Anon Key)
  - 클라이언트 컴포넌트에서만 사용
  - RLS 정책에 의존하여 행 필터링

- **`src/lib/supabase/server.ts`**
  - Node.js 서버 클라이언트 (Service Role Key)
  - Server Actions, Route Handlers, Server Components에서만 사용
  - ⚠️ **절대 클라이언트에 노출하면 안 됨**

- **`src/lib/supabase/env.ts`**
  - 환경 변수 로드 및 검증
  - `NEXT_PUBLIC_*` vs `SUPABASE_SERVICE_ROLE_KEY` 분리

### 도메인 로직 (Server)
- **`src/lib/tf-request-server.ts`**
  - TF 요청 조회, 생성, 업데이트 로직
  - Service Role Key 사용

- **`src/lib/contract-server.ts`**
  - 계약 조회, 상태 업데이트
  - 결제 상태 동기화

- **`src/lib/dashboard-server.ts`**
  - 대시보드용 집계 쿼리
  - 통계, 진행 중인 계약, 요청 요약

### Server Actions (라우트 그룹별)
- **`src/app/(auth)/actions.ts`**
  - `createUser()` — 회원가입
  - `signInUser()` — 로그인
  - `signOutUser()` — 로그아웃

- **`src/app/(dashboard)/requests/actions.ts`**
  - `createTFRequest()` — 요청 생성
  - `updateTFRequest()` — 요청 수정
  - `closeTFRequest()` — 요청 마감

- **`src/app/(dashboard)/requests/[requestId]/proposal-actions.ts`**
  - `acceptProposal()` — 제안 수락 → 계약 생성
  - `rejectProposal()` — 제안 거절

- **`src/app/(senior)/senior/proposal-actions.ts`**
  - `submitProposal()` — 제안 제출
  - `withdrawProposal()` — 제안 철회

### API 라우트
- **`src/app/api/auth/callback/route.ts`**
  - OAuth 콜백 처리
  - Supabase 세션 설정

- **`src/app/api/webhooks/payment/route.ts`**
  - Toss Payments 결제 완료 Webhook
  - `settlements` 테이블 업데이트

---

## 모듈 경계 (Module Boundaries)

### (dashboard) 기업 컴포넌트
- ✅ 접근 가능: 자신의 요청, 자신의 계약, 받은 제안
- ❌ 접근 불가: 다른 기업의 데이터, 모든 시니어 프로필

**RLS 정책**:
```sql
-- tf_requests 테이블
CREATE POLICY "Companies see own requests"
  ON tf_requests
  FOR SELECT
  USING (company_id = auth.uid());
```

### (senior) 시니어 컴포넌트
- ✅ 접근 가능: 자신의 프로필, 자신의 제안, 자신의 계약
- ❌ 접근 불가: 다른 시니어의 프로필, 다른 시니어의 제안

**RLS 정책**:
```sql
-- proposals 테이블
CREATE POLICY "Seniors see their own proposals"
  ON proposals
  FOR SELECT
  USING (senior_id = auth.uid());
```

### 교차 접근 (Cross Access)
- 기업은 자신의 요청에 대한 제안만 볼 수 있음
- 시니어는 자신이 제출한 제안만 볼 수 있음
- 양쪽 모두 자신과 관련된 계약만 조회

---

## 보안 경계 (Security Boundary)

### Service Role Key — 서버 전용 (HARD Rule)

**보호된 위치** (OK):
- ✅ `src/lib/supabase/server.ts`
- ✅ `src/app/api/*/route.ts` (Route Handlers)
- ✅ `'use server'` Server Actions 내부
- ✅ `supabase/migrations/*.sql` 초기 설정

**금지된 위치** (NEVER):
- ❌ `src/lib/supabase/client.ts`
- ❌ `'use client'` 컴포넌트
- ❌ `src/components/*` 폴더
- ❌ 클라이언트 측 `.env.local` 파일
- ❌ 브라우저 DevTools에서 조회 불가능

### 환경 변수 규칙

| 변수 | 용도 | 공개 | 서버 |
|------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 연결 | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 쿼리 | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 Admin 쿼리 | ❌ | ✅ |

---

## 데이터 접근 흐름 다이어그램

```
사용자 요청
   │
   ▼
middleware.ts (인증 확인)
   │
   ├─ 로그인 안 함 → (auth) 로 리다이렉트
   ├─ role = company → (dashboard) 접근 가능
   └─ role = senior → (senior) 접근 가능
   │
   ▼
Route Group Layout (권한 체크)
   │
   ▼
Server Component 또는 Client Component
   │
   ├─ 읽기 (조회)
   │  └─ lib/supabase/server.ts (Service Role)
   │     또는 RLS 쿼리 (Anon Key)
   │
   └─ 쓰기 (생성, 수정)
      └─ Server Action
         └─ Supabase RLS 정책이 행 필터링
```

---

## 개발 팁

### 새로운 기능 추가 시
1. **라우트 그룹 결정**: `(auth)`, `(dashboard)`, `(senior)` 중 선택
2. **권한 확인**: 해당 그룹의 사용자만 접근 가능한지 확인
3. **RLS 정책 확인**: `db-rls.md` 에서 정책 확인
4. **Server Action 작성**: `actions.ts` 에 로직 추가
5. **테스트**: E2E 테스트로 권한 경계 확인

### 데이터 쿼리 시
- **읽기 전용**: `lib/supabase/server.ts` 에서 `createServerClient()` 사용
- **쓰기 작업**: `'use server'` Server Action 내에서 처리
- **클라이언트 쿼리**: RLS 정책만으로 충분한 경우만 (간단한 필터링)

### 보안 확인 체크리스트
- [ ] Service Role Key가 클라이언트 번들에 없는가?
- [ ] 모든 Server Action이 `'use server'` 로 표시되었는가?
- [ ] 크로스-테넌트 데이터 누수가 없는가? (RLS 정책 확인)
- [ ] 미들웨어가 역할 기반 리다이렉트를 수행하는가?

---

## 문서 참고

- **제품 문서**: `product.md` — 기능, MVP, 범위
- **기술 문서**: `tech.md` — 의존성, 환경 변수, 빌드
- **데이터베이스**: `docs/db-rls.md` — RLS 정책, 테이블 스키마
