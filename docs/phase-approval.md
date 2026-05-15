# 구현 Phase 승인 게이트

`docs/task.md`의 **트랙 B** 기준으로 단계별 구현 후, 다음 Phase로 넘어가기 전에 담당자 승인을 받습니다.

## Phase 1 — 디자인 토큰·앱 셸 (완료 시 체크)

- [ ] `globals.css`에 DESIGN 토큰(색·간격·그림자·반지름) 반영
- [ ] `next/font`: Manrope·Work Sans 적용
- [ ] `(dashboard)` 레이아웃: 사이드바·탑바·콘텐츠 `max-width` 1280px
- [ ] `Button` / `Card` / `Input` / `Toast` UI 스켈레톤
- [ ] `npm run build` 통과

### Phase 2 시작 승인

- **승인자**:
- **일자**:
- **비고** (변경 요청 등):

> 승인 후 Phase 2(인증·Supabase 미들웨어) 작업을 진행합니다.

---

## Phase 0 — Supabase·마이그레이션·RLS 초안 (구현 반영)

- [x] `.env.example` — 공개 URL·anon 키·서버 전용 키 자리
- [x] `supabase/migrations/20260521100000_drop_app_objects.sql` · `20260521110000_core_schema.sql` — `profiles`·`companies`·TF·매칭·계약·시니어 RLS·가입 트리거
- [x] `docs/db-rls.md` — 테이블·정책 요약

> 실제 프로젝트에 SQL 적용·`supabase link` 는 담당자가 수행합니다.

---

## Phase 2 — 인증·미들웨어·역할 가드 (구현 반영)

- [x] `src/lib/supabase/*` — 서버·브라우저·미들웨어 클라이언트
- [x] `src/middleware.ts` — `updateSession` + 보호 경로 + `returnUrl`
- [x] `/login` · `/signup` · Server Actions (`login` / `signup` / `logout`)
- [x] `/signup?role=senior` · `profiles` / `senior_profiles.profile_id` 트리거([db-rls.md](./db-rls.md))
- [x] `(senior)/layout` — 시니어 전용 사이드바·`/senior/*` · 기업 접근 시 `/dashboard`로 되돌림
- [x] `(dashboard)/layout` — 시니어가 기업 경로 진입 시 `/senior/dashboard`
- [x] `/senior-blocked` — 구 URL 호환 시 `/senior/dashboard`로 리다이렉트

### Phase 3 시작 승인 (기업 프로필 화면)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 3 — 기업 프로필 (구현 반영)

- [x] `/company/profile` — 조회·편집 폼
- [x] Server Action `saveCompanyProfile` — `companies` upsert (`onConflict: owner_id`), 검증·PostgREST 오류 메시지 매핑
- [x] `Textarea` UI — 회사 소개 필드
- [x] 사이드바 내비에 `기업 프로필` 링크

### Phase 4 시작 승인 (TF 요청)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 4 — TF 요청 (구현 반영)

- [x] `/requests` 목록·상태 필터·빈 상태 CTA
- [x] `/requests/new` 등록 폼 + `createTfRequest` (성공 시 상세로 redirect)
- [x] `/requests/[requestId]` 개요 + 접수중일 때만 수정 폼 + `updateTfRequest`
- [x] 서브내비: 개요 \| 매칭 결과 \| 제안
- [x] `supabase/migrations/20260521110000_core_schema.sql` (TF·RLS 포함)

### Phase 5 시작 승인 (매칭·제안)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 5 — 매칭·제안 (구현 반영)

- [x] `/requests/[requestId]/matches` — `ensureRequestMatches` + 후보 목록(행 간격·구분선)
- [x] `/requests/[requestId]/proposals` — `createProposal` / `withdrawProposal`, 목록·`ProposalComposer`·철회 폼
- [x] 중복 제안 방지(pending 부분 유니크 + 서버 검증), `revalidatePath`, 토스트 UI
- [x] `supabase/migrations/20260521110000_core_schema.sql` (매칭·제안·RLS 포함)

### Phase 6 시작 승인 (계약·정산)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 6 — 계약·정산·리뷰 (구현 반영)

- [x] `/contracts` · `/contracts/[contractId]` — 조회·상태 뱃지·진행률·PDF 자리(문구)
- [x] `/contracts/new` — 수락된 제안에서 계약 생성(`createContract`)·`activateContract` 시 정산 행 생성
- [x] `/contracts/[contractId]/settlement` — `SettlementStepper`, 정산 요청·완료 데모 액션
- [x] `contract_reviews` — 완료 계약에만 후기 폼(`submitContractReview`)
- [x] 제안 화면: `demoAcceptProposal`, 계약 링크·`/contracts/new?proposalId=`
- [x] `POST /api/webhooks/payment` — 토스 등 연동 전 스텁(501 + 안내 JSON)
- [x] `supabase/migrations/20260521110000_core_schema.sql` (계약·정산·후기 포함)

### Phase 7 시작 승인 (대시보드·랜딩·설정)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 7 — 대시보드·랜딩·설정 (구현 반영)

- [x] `/dashboard` — `tf_requests`·`proposals`·`contracts` head count 집계, 최근 요청 5건, 빈 상태 CTA
- [x] `/` — 비로그인 랜딩(가치 제안·카드·CTA); 로그인 세션 시 미들웨어에서 `/dashboard`로 리다이렉트
- [x] `/settings` — 이메일 표시·`logout` Server Action·바로가기 링크
- [x] `src/lib/dashboard-server.ts` — `getDashboardSnapshot` (`cache`)

### Phase 8 시작 승인 (검증·출시)

- **승인자**:
- **일자**:
- **비고**:

---

## Phase 8 — 검증·출시 (구현 반영)

- [x] Playwright 스모크: `/`, `/login`, `/signup`, `/signup?role=senior`, `/senior/dashboard`, `/dashboard` → `/login` ([e2e/smoke.spec.ts](../e2e/smoke.spec.ts))
- [x] `npm run ci` — lint + build + `npm audit --audit-level=high`
- [x] GitHub Actions — `.github/workflows/ci.yml`
- [x] [release-and-verification.md](./release-and-verification.md) — 베타 시나리오 매핑(BTS-WEB-01~05), Lighthouse·보안·Vercel+Supabase 배포 절차

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-14 | Phase 1 완료·승인 게이트 문서 추가 |
| 2026-05-14 | Phase 0·2 구현 반영(마이그레이션·RLS 문서·인증·역할 가드) |
| 2026-05-14 | Phase 3·4 구현 반영(기업 프로필, `tf_requests`·요청 UI) |
| 2026-05-14 | Phase 5 구현 반영(매칭·제안·`proposals` RLS) |
| 2026-05-14 | Phase 6 구현 반영(계약·정산·후기·웹훅 스텁) |
| 2026-05-14 | Phase 7 구현 반영(대시보드 집계·랜딩·설정·미들웨어 홈 리다이렉트) |
| 2026-05-14 | Phase 8·시니어 웹: Playwright·릴리즈 문서·역할 가드 갱신 |
