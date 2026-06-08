# Seniorlink Web — 단계별 구현 계획 (트랙 B: Next.js + Supabase)

> **기본 스택**: Next.js(App Router) + **Supabase**(Auth · Postgres · RLS · 선택: Storage · Edge Functions).  
> **PRD 정합**: [prd.md](./prd.md) 절 1에서 모드 **B(중심)** 또는 **C(풀 교체)** 로 선언한 경우 본 문서를 그대로 따릅니다. 모드 **A(하이브리드)** 는 아래 각 Phase의 *Nest 옵션*만 추가하면 됩니다.  
> **상세 가이드**: [stack-next-supabase.md](./stack-next-supabase.md) · 라우트·역할: [ia.md](./ia.md) · MVP: [prd.md](./prd.md) · UC: [usecase.md](./usecase.md) · **단계별 테스트**: [test_usecase.md](./test_usecase.md)

---

## 원칙

- **역할**: `profiles.role`으로 **기업 라우트**와 **시니어 라우트**를 분리하고, 레이아웃·미들웨어에서 교차 진입을 막습니다([ia.md](./ia.md)).
- **데이터 접근**: 브라우저는 **anon 키 + RLS**만. `SUPABASE_SERVICE_ROLE_KEY`는 **서버(Route Handler·Server Action·Edge) 전용**, 클라이언트 번들에 넣지 않음.
- **완료 정의**: 각 Phase마다 해당 화면의 **Supabase 연동**(또는 합의된 목업) + a11y(레이블·포커스) + 빈/에러 상태 1종 이상.

---

## Phase 0 — Supabase 프로젝트·환경·스키마 초안

| # | 작업 |
|---|------|
| 0.1 | Supabase 프로젝트 생성 · CLI `supabase link` 또는 로컬 `supabase start` |
| 0.2 | `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` · 서버 전용 `SUPABASE_SERVICE_ROLE_KEY` (Git·클라이언트 비노출) |
| 0.3 | `pnpm add @supabase/supabase-js @supabase/ssr` (또는 npm) · `createServerClient` / `createBrowserClient` 유틸 분리 |
| 0.4 | **마이그레이션 초안**: `profiles`, `companies`, `tf_requests`, `proposals`, `contracts`, `settlements`, `reviews` 등(이름은 팀 합의 후 [prd.md](./prd.md) 8b·[ia.md](./ia.md) 7.2와 통일) |
| 0.5 | **RLS 정책 초안** — 테이블별 `company_id` / `auth.uid()` 규칙을 [stack-next-supabase.md](./stack-next-supabase.md) 3절에 맞게 정리. 권장 산출물: `docs/db-rls.md` |
| 0.6 | CI: `npm run lint` · `npm run build` |

**완료 기준**: 로컬 또는 스테이징 Supabase에 마이그레이션 적용 가능하고, Next 빌드가 녹색.

*Nest 하이브리드(A) 옵션*: `NEXT_PUBLIC_API_BASE_URL` 추가, 매칭·정산만 기존 REST를 부를 계획이면 Phase 0 README에 한 줄 명시.

---

## Phase 1 — 디자인 토큰·앱 셸

| # | 작업 |
|---|------|
| 1.1 | [design/DESIGN.md](./design/DESIGN.md) → CSS 변수 또는 Tailwind `theme.extend`([design.md](./design.md)) |
| 1.2 | `next/font`: Manrope·Work Sans, 루트 `layout.tsx` 타이포 위계 |
| 1.3 | `(dashboard)` 레이아웃 그룹: 좌측 사이드바 + 상단 앱 바 + 콘텐츠 `max-width` 1280px · 거터 24px |
| 1.4 | 공통 컴포넌트: `Button`(Primary 56px, CTA Gold+Navy 텍스트), `Card`, `Input`+Label, `Toast` |

**완료 기준**: 로그인 전에도 셸·타이포·색이 디자인 문서와 대체로 일치.

**승인 게이트**: 다음 Phase 착수 전 [phase-approval.md](./phase-approval.md)의 **Phase 2 시작 승인**을 받습니다.

---

## Phase 2 — 인증·미들웨어·역할 가드

| # | 작업 |
|---|------|
| 2.1 | 라우트 `/login`, `/signup` — [ia.md](./ia.md) 4.1 · 시니어는 `/signup?role=senior` |
| 2.2 | `auth.signUp` / `signInWithPassword` · 가입 시 `profiles`에 `role`(트리거: `company` → `companies`, `senior` → `senior_profiles.profile_id`) |
| 2.3 | 루트 `middleware.ts`에서 `createServerClient` + **`updateSession`** ([Supabase Next SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)) |
| 2.4 | 보호 레이아웃에서 세션 없으면 `/login` + `returnUrl` · **역할별** `(dashboard)` ↔ `(senior)` 리다이렉트 |
| 2.5 | (선택) OAuth·매직링크 → `/auth/callback` Route Handler에서 코드 교환 |

**완료 기준**: 기업 계정으로 가입·로그인·새로고침 후에도 보호 페이지 유지.

---

## Phase 3 — 기업 프로필

| # | 작업 |
|---|------|
| 3.1 | `/company/profile` |
| 3.2 | Server Component / Server Action + `createServerClient` → `from('companies').select` / `upsert` (RLS) |
| 3.3 | 폼 검증·`aria-describedby` · RLS/PostgREST 오류 메시지 매핑 |
| 3.4 | (선택) 프로필 미완료 시 TF 작성 화면 진입 시 안내 모달 |

**완료 기준**: 저장 후 재방문 시 데이터 반영.

---

## Phase 4 — TF 요청

| # | 작업 |
|---|------|
| 4.1 | [ia.md](./ia.md) 라우트: `/requests`, `/requests/new`, `/requests/[requestId]` |
| 4.2 | 목록: `tf_requests` `select` + 정렬·필터·빈 상태 CTA · (선택) `limit`·cursor 페이지네이션 |
| 4.3 | 생성·수정: Server Action `insert` / `update` · 상태 뱃지(색+텍스트) |
| 4.4 | 요청 상세 **서브내비**: 개요 \| 매칭 결과 \| 제안 |

**완료 기준**: 생성·목록·상세 필수; 수정은 스키마·RLS 범위 내.

*Nest 옵션*: 매칭 전용 필드만 Nest에 동기화하는 Webhook/cron은 이 Phase 이후로 미루거나 최소 스텁만.

---

## Phase 5 — 매칭·제안

| # | 작업 |
|---|------|
| 5.1 | `/requests/[requestId]/matches` — 후보 `select`(전용 테이블 또는 `rpc('get_matches', { ... })`) |
| 5.2 | 목록 UI: 행 간격 24px·구분선([ia.md](./ia.md) §2) |
| 5.3 | `/requests/[requestId]/proposals` — `proposals` `insert`/`select` · 철회는 `update`(상태) 또는 `rpc` |
| 5.4 | 제안 발송 CTA·중복 제출 방지 · 성공/실패 토스트 · `revalidatePath` 등 |
| 5.5 | **시니어 웹**: `/senior/proposals` 목록·상세, 수락/거절 Server Action, RLS 검증([db-rls.md](./db-rls.md)) |

**완료 기준**: [usecase.md](./usecase.md) UC-WEB-C-07~C-09 수동 통과.

*Nest 옵션*: 알고리즘이 Nest에만 있으면, Nest 결과를 주기적으로 `request_matches` 테이블에 넣고 **5.1은 해당 테이블만 읽기**.

---

## Phase 6 — 계약·정산·리뷰

| # | 작업 | 상태 |
|---|------|------|
| 6.1 | `/contracts`, `/contracts/[contractId]` — `contracts` 조회·상태·진행률 | ✅ |
| 6.2 | PDF: **Storage** 업로드/서명 URL 또는 Edge에서 생성 후 저장(정책에 따라) | ✅ |
| 6.3 | `/contracts/[contractId]/settlement` — `settlements` CRUD(RLS) | ✅ |
| 6.4 | **토스 등 웹훅**: Route Handler 또는 Edge에서 서명 검증 후 **service role**로 DB만 갱신([stack-next-supabase.md](./stack-next-supabase.md) 3절) | ✅ |
| 6.5 | 정산 단계 UI: Stepper 또는 단계 라벨([design.md](./design.md)) | ✅ |
| 6.6 | 리뷰: `contract_reviews` `insert` — 완료 조건에서만 노출 | ✅ |

**완료 기준**: UC-WEB-C-10~C-12 스테이징 데이터로 검증.

*Nest 옵션*: PDF 생성만 기존 `POST /v1/.../pdf` 호출 후 Storage에 올리는 브리지.

---

## Phase 7 — 대시보드·랜딩·설정

| # | 작업 |
|---|------|
| 7.1 | `/dashboard` — 집계 쿼리 또는 뷰·RPC로 진행 중 요청·제안·계약 카드 |
| 7.2 | `/` — 비로그인 랜딩(가치 제안 + 로그인/가입) |
| 7.3 | `/settings` — 로그아웃(`auth.signOut`)·이메일 표시 등 MVP 최소 |

**완료 기준**: 로그인 후 첫 화면이 대시보드, 주요 기능 2클릭 이내.

---

## Phase 8 — 검증·출시

| # | 작업 |
|---|------|
| 8.1 | [refs/seniorlink-beta-test-scenarios.md](./refs/seniorlink-beta-test-scenarios.md) BTS-01~04 스모크 체크리스트 또는 Playwright 최소 시나리오 |
| 8.2 | Lighthouse 접근성·성능( [prd.md](./prd.md) §7 목표 ) |
| 8.3 | 보안: 의존성 감사 · RLS 회귀 테스트 · **service role** 유출 점검 |
| 8.4 | 배포: Vercel(웹) + Supabase(호스팅) 등 실제 타깃에 맞게 파이프라인 구성 — [refs/seniorlink-build-deploy-guide.md](./refs/seniorlink-build-deploy-guide.md)에서 Docker/Nginx 절은 필요 시만 이식 |

**완료 기준**: 스테이징 URL에서 기업 플로우 데모 가능.

**산출물**: [release-and-verification.md](./release-and-verification.md) · `e2e/smoke.spec.ts` · `.github/workflows/ci.yml`

---

## 의존성·리스크

| 항목 | 대응 |
|------|------|
| 스키마·RLS 미확정 | Phase 0에서 `docs/db-rls.md` 동결 후에만 Phase 4+ 본격 개발 |
| 매칭 로직 복잡도 | Postgres만으로 어렵면 **RPC + Edge** 또는 *Nest 옵션*으로 단일 소스 유지 |
| 토스·에스크로 | Phase 1 문서 Sprint 6 범위 + Phase **6.4** 웹훅 |
| Realtime·Storage | MVP에 포함 시 [prd.md](./prd.md) §9 범위 조정 후 Phase 5~6에 반영 |
| 시니어 웹·RLS | `20260521110000_core_schema.sql` 적용 후 [db-rls.md](./db-rls.md) 기준으로 시니어·기업 교차 조회 회귀 점검 |

---

## 부록 — Nest REST 트랙 (대안)

기업 웹이 **Phase 1 Nest API + JWT**만 사용하는 경우에는, Phase **0~8**을 다음으로 치환하면 됩니다(상세는 [refs/seniorlink-phase1-implementation-plan.md](./refs/seniorlink-phase1-implementation-plan.md) · [refs/seniorlink-user-guide.md](./refs/seniorlink-user-guide.md)).

| Phase | 요지 |
|-------|------|
| 0 | `NEXT_PUBLIC_API_BASE_URL`, `fetch`+`Authorization`, 401 refresh, CI |
| 1 | 본문 Phase 1과 **동일**(디자인 셸) |
| 2 | `/login`·`/signup` → `POST /v1/auth/*` |
| 3~6 | 화면은 동일, 데이터는 **`/v1` REST** 호출 |
| 7~8 | 본문 Phase 7~8과 동일 |

**하이브리드(A)**: 본문 **Phase 0~4**는 Supabase 유지, **Phase 5~6**의 일부만 위 표의 REST 호출로 대체하는 식으로 합성합니다.

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-14 | 0.1 | 최초 작성 |
| 2026-05-14 | 0.2 | `stack-next-supabase.md` 링크 |
| 2026-05-14 | 0.3 | 트랙 A/B 분리(A0~A8 / B0~B8) |
| 2026-05-14 | 0.4 | **트랙 B 단일 본문**(Phase 0~8), Nest는 부록·하이브리드 옵션으로 축소 |
| 2026-05-14 | 0.5 | Phase 1 코드 반영 · Phase 간 [phase-approval.md](./phase-approval.md) 승인 게이트 |
| 2026-05-14 | 0.6 | Phase 0·2 코드: Supabase 클라이언트·미들웨어·`/login`·`/signup`·`/auth/callback`·`profiles`/`companies` 마이그레이션 초안·[db-rls.md](./db-rls.md) |
| 2026-05-14 | 0.7 | Phase 3: `/company/profile`, `saveCompanyProfile`, `companies` 확장 마이그레이션, `Textarea`, 내비 링크 |
| 2026-05-14 | 0.8 | Phase 4: `tf_requests` 마이그레이션·RLS, `/requests`·`/requests/new`·`/requests/[id]`(+매칭/제안 플레이스홀더), `TfRequestForm`·상태 뱃지·필터 |
| 2026-05-14 | 0.9 | Phase 5: `senior_profiles` 시드·`request_matches`·`proposals`, 매칭 목록·제안 발송·철회, 부분 유니크(pending) |
| 2026-05-14 | 1.0 | Phase 6: `contracts`·`settlements`·`contract_reviews`, 계약·정산·후기 UI, 제안 데모 수락, `/api/webhooks/payment` 스텁 |
| 2026-05-14 | 1.1 | Phase 7: 대시보드 집계(`getDashboardSnapshot`), 랜딩 보강, `/settings` 계정·로그아웃, 로그인 시 `/`→`/dashboard` |
| 2026-05-14 | 1.2 | Phase 8: Playwright 스모크(`e2e/`), `npm run ci`, GitHub Actions, `docs/release-and-verification.md` |
| 2026-05-14 | 1.3 | `docs/test_usecase.md` — Phase·UC 기준 단계별 테스트 절차·입출력 예시 |
| 2026-05-14 | 1.4 | 시니어 웹: `profile_id`·RLS 마이그레이션, `/senior/*` 셸·제안·프로필, 가입/로그인 역할 분기 |
| 2026-06-07 | 1.5 | Phase 6 계약·PDF·정산·웹훅 구현 반영. 시니어 대시보드 라우팅 버그 수정(profiles null 폴백). 신규 마이그레이션 3건(RPC·Storage·RLS). CI 파이프라인 업데이트. |
