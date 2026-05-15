# Seniorlink Web — 단계별 테스트 유스케이스

> **목적**: [task.md](./task.md)의 Phase 0~8과 [usecase.md](./usecase.md)의 `UC-WEB-C-xx`·베타 매핑(`BTS-xx`)을 **수동·스테이징 검증**할 때 따라갈 절차를 정리합니다.  
> **연계**: [ia.md](./ia.md)(URL) · [db-rls.md](./db-rls.md)(RLS) · [release-and-verification.md](./release-and-verification.md)(자동 스모크·배포)

**표기 규칙**

- **입력**: 화면 조작·폼 값·URL·(선택) Supabase 대시보드/SQL 예시.
- **출력**: 화면에 보이는 결과·리다이렉트·HTTP/토스트·DB에서 기대하는 상태(예시 값은 **샘플**이며 실제 UUID·이메일는 환경에 맞게 바꿉니다).
- **확인 사항**: 체크리스트(통과 기준).

**구현 참고**: UC 표의 `from('reviews')`는 저장소 구현에서 **`contract_reviews`** 테이블로 매핑됩니다.

---

## Phase 0 — Supabase·환경·스키마

| 항목 | 내용 |
|------|------|
| 대응 task | 0.1 ~ 0.6 |
| 관련 UC | (인프라 선행, UC 직접 매핑 없음) |

### TU-P0-01 마이그레이션·환경

| 구분 | 내용 |
|------|------|
| **전제** | Supabase 프로젝트 존재, 로컬에 Node 20+, 저장소 클론 |
| **입력 (파일)** | `.env.local` 예시: `NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co`, 그리고 **`NEXT_PUBLIC_SUPABASE_ANON_KEY`(JWT)** 또는 **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** 중 하나 |
| **입력 (CLI)** | [supabase-migrations.md](./supabase-migrations.md)에 따라 `npx supabase db push` 또는 SQL Editor에서 마이그레이션 순서 적용 |
| **출력 (빌드)** | `npm run build` 종료 코드 0, 콘솔에 치명 오류 없음 |
| **출력 (DB)** | `public.profiles`, `public.companies`, `public.tf_requests` 등 [db-rls.md](./db-rls.md)에 나열한 테이블 존재 |

**확인 사항**

- [ ] `.env.example`에 공개 URL·anon 자리, 서버 전용 키 주석이 문서와 일치한다.
- [ ] `supabase/migrations/` 체인이 원격에 적용되어 `migration list` 로컬·원격이 일치한다(또는 SQL로 동등 스키마).
- [ ] `npm run lint` 통과.

### TU-P0-02 적정 볼륨 DB 시드 (대시보드·목록 검증)

| 구분 | 내용 |
|------|------|
| **전제** | 마이그레이션 적용 완료, `public.companies` 최소 1행(기업 가입 1회 이상). |
| **입력 (파일)** | `supabase/seeds/loadtest/moderate.sql` — Supabase SQL Editor 또는 `psql "$DATABASE_URL" -f supabase/seeds/loadtest/moderate.sql` |
| **출력 (DB)** | [db-rls.md](./db-rls.md) 「적정 볼륨 부하 시드」표와 동일한 건수(시니어 +50, TF요청 40, 매칭·제안 각 40, 계약·정산 각 10, 후기 5). |
| **정리** | `supabase/seeds/loadtest/cleanup.sql` 또는 [db-rls.md](./db-rls.md)에 적힌 `DELETE` 두 줄. |

**확인 사항**

- [ ] `companies`가 비어 있으면 스크립트가 예외로 중단되는지(의도된 가드) 확인한다.
- [ ] 시드 행에 `[SEED-LOADTEST]`·`[SEED] QA시니어` 태그로 필터해 목록·집계 UI를 검증한다.
- [ ] 다중 기업·대량 Auth가 필요하면 Admin API 별도 트랙으로 분리한다(본 시드는 단일 기업 전제).

---

## Phase 1 — 디자인 토큰·앱 셸

| 항목 | 내용 |
|------|------|
| 대응 task | 1.1 ~ 1.4 |
| 관련 UC | (공통 UI 품질 — `usecase.md` 절 2) |

### TU-P1-01 루트 타이포·토큰

| 구분 | 내용 |
|------|------|
| **전제** | `npm run dev` 후 브라우저로 접속 |
| **입력 (URL)** | `http://localhost:3000/` |
| **출력 (화면)** | 배경 off-white 계열, 헤드라인에 Manrope 계열 서체 적용(브라우저 개발자도구로 `--font-manrope` 확인 가능) |
| **입력 (URL)** | 로그인 후 `/dashboard` 등 대시보드 셸 |

**출력 (화면)**

- 좌측 네비(다크 Navy 톤), 본문 max-width·거터가 [design.md](./design.md)와 크게 어긋나지 않음.

**확인 사항**

- [ ] Primary 버튼 최소 높이·CTA(Warm Gold) 대비가 디자인 문서와 대체로 일치한다.
- [ ] 카드·입력에 포커스 시 2px Navy 아웃라인(또는 동등)이 보인다.

---

## Phase 2 — 인증·미들웨어·역할

| 항목 | 내용 |
|------|------|
| 대응 task | 2.1 ~ 2.5 |
| 관련 UC | UC-WEB-C-01, C-01b, C-02, C-03 |

### TU-P2-00 이메일 주소 (Supabase 제약)

**원인**: `company@example.com` 처럼 **`@example.com` / `@example.org` 등 RFC 예약·문서용 도메인**은 Supabase Auth에서 **허용되지 않으며**, `Email address "…" is invalid` 로 거절됩니다. Next 앱의 폼 검증 문제가 아닙니다.

**테스트에 쓸 수 있는 주소 예시** (본인이 수신·인증 가능한 도메인으로 바꿉니다).

| 형태 | 예시 | 비고 |
|------|------|------|
| Gmail + 태그 | `내계정+seniorlinkqa@gmail.com` | 같은 수신함으로 메일 수집, Supabase에서 통과하기 쉬움 |
| 실제 회사 메일 | `tester@우리회사실제도메인.co.kr` | MX가 있고 수신·인증 링크를 열 수 있어야 함 |
| 일회용이 아닌 실서비스형 | `seniorlink-tester@outlook.com` 등 | 프로젝트 정책에 맞는 공용 QA 메일 |

**피할 것**: `@example.com`, `@example.net`, `@test.com`, 지나치게 짧은 도메인 등(GoTrue 이메일 검증 정책).

### TU-P2-01 회원가입 (기업)

| 구분 | 내용 |
|------|------|
| **전제** | 위 **TU-P2-00**에 맞는 주소가 Supabase에 아직 없음 |
| **입력 (URL)** | `/signup` |
| **입력 (폼)** | 담당자 이름: `품질팀 김테스트`, 이메일: **`본인수신가능@gmail.com`의 플러스 주소 등**(예: `hongildong+slweb@gmail.com`), 비밀번호: `TestPassw0rd!` (8자 이상) |
| **출력 (화면)** | 이메일 확인 필요 시 안내 문구; 즉시 세션 있으면 `/dashboard`로 이동 |
| **출력 (DB)** | `auth.users`에 사용자 생성, `profiles`에 `id` = `auth.users.id`, `role` = `company` (트리거/앱 로직에 따름) |

**확인 사항**

- [ ] 중복 이메일 가입 시 사용자에게 읽을 수 있는 오류 메시지가 표시된다(UC 예외).
- [ ] UC-WEB-C-01: 가입 후 로그인 가능 상태가 된다.

### TU-P2-01b 회원가입 (시니어)

| 구분 | 내용 |
|------|------|
| **전제** | TU-P2-00에 맞는 **미사용** 이메일 |
| **입력 (URL)** | `/signup?role=senior` |
| **입력 (폼)** | 이름·이메일·비밀번호(8자 이상) |
| **출력 (URL)** | 즉시 세션 있으면 `/senior/dashboard` |
| **출력 (DB)** | `profiles.role` = `senior`, `senior_profiles.profile_id` = `auth.uid()` |

**확인 사항**

- [ ] UC-WEB-C-01b: 기업 가입과 구분되어 시니어 셸로만 진입한다.

### TU-P2-02 로그인·세션

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/login?returnUrl=/requests` |
| **입력 (폼)** | 위에서 만든 이메일·비밀번호 |
| **출력 (URL)** | 로그인 성공 시 `returnUrl` 우선(역할과 `/senior` 접두 일치 검증). 없으면 기업은 `/dashboard`, 시니어는 `/senior/dashboard` |
| **출력 (동작)** | 새로고침 후에도 보호 라우트 접근 유지(쿠키 세션) |

**확인 사항**

- [ ] UC-WEB-C-02: 잘못된 비밀번호 시 `role="alert"` 영역에 오류 표시.
- [ ] UC-WEB-C-03: `middleware` 경유 요청에서 세션 갱신(로그 없어도 401 연쇄가 나지 않음).

### TU-P2 샘플 계정 실측 시 주의

| 현상 | 원인 예시 | 조치 |
|------|-----------|------|
| `Email address "…" is invalid` | `@example.com` 등 **예약/문서용 도메인** | TU-P2-00 참고 — Gmail+태그·실제 도메인 메일 사용 |
| `Invalid login credentials` | 미가입·비밀번호 불일치·**이메일 미인증** | Supabase Authentication에서 해당 이메일·`email_confirmed_at`·비밀번호 재설정 확인 |
| 가입 직후에도 로그인 불가 | Confirm email 활성 + 수신 불가 주소 | 로컬 개발: Auth에서 이메일 확인 비활성화, 또는 **수신 가능한** 메일 사용 |
| `email rate limit exceeded` | 짧은 시간에 가입 시도 반복 | 잠시 대기 후 재시도, Supabase 대시보드에서 한도·스팸 정책 확인 |

**자동 로그인 재현**: 로컬에서 `npm run dev` 실행 후, **수신 가능한 테스트 메일**을 환경 변수로 넘깁니다 (`@example.com` 불가).

```bash
set E2E_COMPANY_EMAIL=본인계정+slweb@gmail.com
set E2E_COMPANY_PASSWORD=TestPassw0rd!
set PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001
npm run test:e2e:doc-login
```

(`e2e/manual/login-doc-credentials.spec.ts` — CI 기본 `test:e2e`에는 포함되지 않음)

### TU-P2-03 역할별 가드·리다이렉트

| 구분 | 내용 |
|------|------|
| **입력 (비로그인)** | 시크릿 창에서 `/dashboard` 또는 `/senior/dashboard` 직접 입력 |
| **출력 (URL)** | `/login?returnUrl=…` |
| **입력 (시니어)** | `profiles.role = senior` 계정으로 로그인 후 `/dashboard` 또는 `/requests` 접근 시도 |
| **출력 (URL)** | `/senior/dashboard` 등 시니어 허용 경로로 리다이렉트(기업 전용 라우트 차단) |
| **입력 (기업)** | `profiles.role = company` 계정으로 `/senior/dashboard` 접근 시도 |
| **출력 (URL)** | `/dashboard` 등 기업 허용 경로로 리다이렉트 |

**확인 사항**

- [ ] 비로그인 시 anon으로 다른 기업 `tf_requests`가 노출되지 않는다(RLS + 미들웨어).
- [ ] 구형 `/senior-blocked` URL은 `/senior/dashboard` 또는 역할에 맞는 홈으로 이어진다.

---

## Phase 3 — 기업 프로필

| 항목 | 내용 |
|------|------|
| 대응 task | 3.1 ~ 3.4 |
| 관련 UC | UC-WEB-C-04 · BTS-01 |

### TU-P3-01 프로필 저장

| 구분 | 내용 |
|------|------|
| **전제** | 기업 계정 로그인 |
| **입력 (URL)** | `/company/profile` |
| **입력 (폼)** | 회사명: `(주)시니어링크 QA`, 소개: `MVP 베타 검증용 더미 소개입니다.`, (스키마에 있는 필드) 빈 값 없이 채움 |
| **출력 (화면)** | 저장 성공 메시지 또는 동일 화면에 반영된 값 |
| **출력 (DB)** | `companies`에서 `owner_id = auth.uid()` 행의 `name` 등이 업데이트됨 |

**확인 사항**

- [ ] UC-WEB-C-04: 페이지 새로고침 후에도 동일 값이 조회된다.
- [ ] RLS 위반 시 사용자 친화적 문구(맵핑된 PostgREST 오류)가 나온다.

---

## Phase 4 — TF 요청

| 항목 | 내용 |
|------|------|
| 대응 task | 4.1 ~ 4.4 |
| 관련 UC | UC-WEB-C-05, C-06 · BTS-01 |

### TU-P4-01 요청 생성

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/requests/new` |
| **입력 (폼)** | 제목: `2026 상반기 재무 TF`, 분야: `재무`, 기간(주): `8`, 목표: `분기 보고서 정비`, 지역: `서울`, 예산 최소/최대(있으면): `10000000`, `30000000` |
| **출력 (URL)** | `/requests/<uuid>` (생성된 요청 ID) |
| **출력 (DB)** | `tf_requests`에 `company_id` = 본인 기업, `status` = `open` 등 기본값 |

**확인 사항**

- [ ] UC-WEB-C-05: 필수 필드 누락 시 제출 전 검증 또는 서버 오류 메시지.
- [ ] BTS-01: 기업 관점에서 TF 요청이 목록에 보인다.

### TU-P4-02 목록·필터·상세·수정

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/requests?status=open` |
| **출력 (화면)** | 방금 생성한 요청이 필터에 맞게 표시 |
| **입력** | 상세 `/requests/<uuid>` → 서브내비에서 개요·매칭·제안 링크 존재 확인 |
| **입력** | (정책상 수정 가능한 상태일 때) 제목 일부 변경 후 저장 |
| **출력 (DB)** | `updated_at` 갱신, 제목 반영 |

**확인 사항**

- [ ] UC-WEB-C-06: 본인 소유 아닌 `uuid`로 접근 시 404 또는 접근 불가.
- [ ] 빈 목록일 때 CTA(새 요청)가 있다.

---

## Phase 5 — 매칭·제안

| 항목 | 내용 |
|------|------|
| 대응 task | 5.1 ~ 5.5 |
| 관련 UC | UC-WEB-C-07, C-08, C-09 · **UC-WEB-S-02, S-03** · BTS-02 |
| task 완료 기준 | UC-WEB-C-07~C-09 및 시니어 제안 조회·응답 수동 통과 |

### TU-P5-01 매칭 목록

| 구분 | 내용 |
|------|------|
| **전제** | `request_matches`가 비어 있으면 앱에서 `ensureRequestMatches` 등으로 채우는 흐름이 있다면 먼저 실행 |
| **입력 (URL)** | `/requests/<requestId>/matches` |
| **출력 (화면)** | 시니어 표시명, 적합도, 행 간 여백·구분선 |

**확인 사항**

- [ ] UC-WEB-C-07: 후보 0명일 때 빈 상태 안내.
- [ ] BTS-02: 추천 리스트가 정책대로만 조회된다(다른 기업 요청 ID로는 접근 불가).

### TU-P5-02 제안 발송

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/requests/<requestId>/proposals` |
| **입력 (폼)** | 후보 1명 선택, 메시지: `안녕하세요. 8주 재무 TF 제안드립니다.` |
| **출력 (화면)** | 성공 토스트 또는 메시지, 목록에 `pending` 제안 행 추가 |
| **출력 (DB)** | `proposals`에 `(request_id, senior_id, status=pending)` 유니크 정책 위반 시 명확한 실패 |

**확인 사항**

- [ ] UC-WEB-C-08: 동일 시니어에게 `pending` 중복 발송 불가.
- [ ] UI: CTA가 Gold/Navy 규칙에 맞는지( `usecase.md` 절 2).

### TU-P5-03 제안 철회

| 구분 | 내용 |
|------|------|
| **입력** | `pending` 제안 행에서 철회 실행 |
| **출력 (DB)** | `status` = `withdrawn` (또는 구현상 동등 상태) |
| **출력 (화면)** | 목록에 반영, 재발송 가능 여부가 정책과 일치 |

**확인 사항**

- [ ] UC-WEB-C-09: 이미 `accepted` 등 종료 상태에서는 철회 불가.

### TU-P5-04 시니어 — 받은 제안·응답

| 구분 | 내용 |
|------|------|
| **전제** | 시니어 계정으로 로그인 · 해당 시니어에게 `pending` 제안이 DB에 존재(기업 계정으로 사전 발송) |
| **입력 (URL)** | `/senior/proposals` → 제안 상세 |
| **출력 (화면)** | 요청 제목·기업명·메시지, 수락/거절 CTA |
| **출력 (DB)** | 수락 시 `accepted`, 거절 시 `rejected` |

**확인 사항**

- [ ] UC-WEB-S-02, S-03: RLS로 다른 시니어 제안은 보이지 않음.

---

## Phase 6 — 계약·정산·리뷰

| 항목 | 내용 |
|------|------|
| 대응 task | 6.1 ~ 6.6 |
| 관련 UC | UC-WEB-C-09, C-10, C-11, C-12 · **UC-WEB-S-03, S-04** · BTS-03, BTS-04 |
| task 완료 기준 | UC-WEB-C-10~C-12 스테이징 검증 |

### TU-P6-01 제안 수락(데모)·계약 생성

| 구분 | 내용 |
|------|------|
| **전제** | `accepted` 제안이 필요 — 기업 화면 **데모 수락** 또는 **시니어**가 `/senior/proposals/[id]`에서 수락 |
| **입력** | 제안 화면에서 데모 수락 → 상태 `accepted` |
| **입력 (URL)** | `/contracts/new?proposalId=<proposal_uuid>` |
| **입력 (폼)** | 시작일 `2026-06-01`, 종료일 `2026-07-31`, 역할 범위: `재무 검토 및 보고서`, 보수(원): `25000000` |
| **출력 (URL)** | `/contracts/<contract_uuid>` |
| **출력 (DB)** | `contracts.status` = `draft`, `proposal_id` 유니크 |

**확인 사항**

- [ ] UC-WEB-C-10: 무효 `proposalId`는 404 또는 오류.
- [ ] BTS-03: 기업 화면에서 계약 생성까지 도달 가능.

### TU-P6-02 계약 활성·진행률

| 구분 | 내용 |
|------|------|
| **입력** | 계약 상세에서 **계약 시작**(또는 `activateContract`) 실행 |
| **출력 (DB)** | `contracts.status` = `active`, `settlements` 1행 생성(구현 기준) |
| **입력** | 진행률 `40` 제출 |
| **출력 (화면)** | 진행률 바 또는 숫자 40% 표시 |

**확인 사항**

- [ ] PDF 자리(문구/URL 필드)가 요구사항대로 노출되는지(Storage 미연동 시 placeholder 허용).

### TU-P6-03 정산 플로우(데모)

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/contracts/<contractId>/settlement` |
| **입력** | 정산 요청(데모) → 완료(데모) 순으로 액션 |
| **출력 (DB)** | `contracts.status`가 `settlement_requested` → 이후 `completed` 등 구현 상태와 일치 |
| **출력 (화면)** | Stepper 단계 라벨 갱신 |

**확인 사항**

- [ ] UC-WEB-C-11: 실결제 없이도 스테이징에서 시연이 가능하다.
- [ ] BTS-04: 정산 UI까지 도달.

### TU-P6-04 리뷰

| 구분 | 내용 |
|------|------|
| **전제** | 계약 `completed` |
| **입력** | 후기 폼: 별점 `5`, 코멘트: `일정과 커뮤니케이션이 훌륭했습니다.` |
| **출력 (DB)** | `contract_reviews`에 `reviewer_id` = 기업 사용자, `contract_id` 유니크 |

**확인 사항**

- [ ] UC-WEB-C-12: 완료 전에는 폼 미노출 또는 제출 불가.
- [ ] 중복 제출 시 DB 유니크 또는 서버 검증.

### TU-P6-05 웹훅 스텁

| 구분 | 내용 |
|------|------|
| **입력 (HTTP)** | `curl -X POST https://<staging>/api/webhooks/payment -H "Content-Type: application/json" -d "{}"` |
| **출력 (HTTP)** | 상태 코드 `501`, 본문 JSON에 미구성 안내 메시지 |

**확인 사항**

- [ ] 응답에 서비스 롤 키·내부 스택이 노출되지 않는다.

---

## Phase 7 — 대시보드·랜딩·설정

| 항목 | 내용 |
|------|------|
| 대응 task | 7.1 ~ 7.3 |
| 관련 UC | 대시보드 요약은 PRD MVP 항목과 연계; 랜딩은 공개 영역 |

### TU-P7-01 대시보드 집계

| 구분 | 내용 |
|------|------|
| **전제** | Phase 4~6 데이터 일부 존재 |
| **입력 (URL)** | `/dashboard` |
| **출력 (화면)** | 진행 중 TF 수, 대기 제안 수, 진행 중 계약 수가 head count와 일치, 최근 요청 5건 링크 |

**확인 사항**

- [ ] 집계 오류 시 `role="alert"`로 메시지 표시.
- [ ] 전부 0일 때 빈 상태 CTA(`/requests/new`) 표시.

### TU-P7-02 랜딩·홈 리다이렉트

| 구분 | 내용 |
|------|------|
| **입력** | 비로그인 `/` — 로그인·가입 버튼 클릭 가능 |
| **입력** | 로그인 상태에서 `/` |
| **출력 (URL)** | `/dashboard`로 리다이렉트 |

**확인 사항**

- [ ] 메타 타이틀·랜딩 헤드라인이 PRD/IA와 충돌 없음.

### TU-P7-03 설정·로그아웃

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/settings` |
| **출력 (화면)** | 로그인 이메일 표시 |
| **입력** | 로그아웃 제출 |
| **출력 (URL)** | `/` 또는 정책상 랜딩, 이후 `/dashboard`는 로그인 요구 |

**확인 사항**

- [ ] 로그아웃 후 뒤로 가기로 보호 페이지가 열리지 않거나 재인증 요구.

---

## Phase 8 — 검증·출시

| 항목 | 내용 |
|------|------|
| 대응 task | 8.1 ~ 8.4 |
| 관련 UC | 전 구간 회귀 + 비기능 |

### TU-P8-01 자동 스모크

| 구분 | 내용 |
|------|------|
| **입력 (CLI)** | `npm run test:e2e` (필요 시 `PLAYWRIGHT_PORT=3005`, 첫 실행 `npx playwright install chromium`) |
| **출력 (CLI)** | `4 passed` 등 Playwright 요약 성공 |

**확인 사항**

- [ ] [release-and-verification.md](./release-and-verification.md)의 BTS-WEB-01~04 수동 표와 병행한다.

### TU-P8-02 Lighthouse

| 구분 | 내용 |
|------|------|
| **입력** | Chrome Lighthouse — Performance + Accessibility, URL `/`, `/login`, 로그인 후 `/dashboard` |
| **출력 (예시)** | Accessibility: Critical 0 (환경마다 수치 상이) |

**확인 사항**

- [ ] [prd.md](./prd.md) 비기능(접근성·목록 체감 등) 목표를 리포트에 메모로 남긴다.

### TU-P8-03 보안·감사

| 구분 | 내용 |
|------|------|
| **입력 (CLI)** | `npm audit --audit-level=high` |
| **출력** | exit 0 또는 팀 정책에 따른 이슈 티켓 |

**확인 사항**

- [ ] `NEXT_PUBLIC_*`에 service role 키가 없다.
- [ ] `src/`에 `SUPABASE_SERVICE_ROLE_KEY` 하드코딩 없음.

### TU-P8-04 스테이징 데모

| 구분 | 내용 |
|------|------|
| **입력** | Vercel(또는 타 호스트) URL + Supabase 프로덕션/스테이징 프로젝트 |
| **출력** | 외부 시연자가 TU-P2 → P6까지 **한 흐름**으로 데모 가능 |

**확인 사항**

- [ ] `NEXT_PUBLIC_SITE_URL` 등 리다이렉트 URL이 스테이징 도메인과 일치한다.

---

## 부록 A — UC ↔ Phase 빠른 색인

| UC ID | 주요 검증 Phase |
|--------|-----------------|
| UC-WEB-C-01 | Phase 2 |
| UC-WEB-C-02, C-03 | Phase 2 |
| UC-WEB-C-04 | Phase 3 |
| UC-WEB-C-05, C-06 | Phase 4 |
| UC-WEB-C-07, C-08, C-09 | Phase 5 |
| UC-WEB-C-09, C-10, C-11, C-12 | Phase 6 |
| (대시보드·랜딩·설정) | Phase 7 |
| 회귀·비기능 | Phase 8 |

---

## 부록 B — 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-14 | 0.2 | TU-P2-00 추가(Supabase `@example.com` 거절), 수동 E2E는 `E2E_COMPANY_EMAIL` 사용 |
