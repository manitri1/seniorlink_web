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
| --- | --- |
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
| --- | --- |
| 대응 task | 1.1 ~ 1.4 |
| 관련 UC | (공통 UI 품질 — `usecase.md` 절 2) |

### TU-P1-01 루트 타이포·토큰

| 구분 | 내용 |
|------|------|
| **전제** | `npm run dev` 후 브라우저로 접속 |
| **입력 (URL)** | `http://localhost:3000/` |
| **출력 (화면)** | 배경 off-white 계열, 헤드라인에 Manrope 계열 서체 적용(브라우저 개발자도구로 `--font-manrope` 확인 가능) |
| **입력 (URL)** | 로그인 후 `/dashboard` 등 대시보드 셸 |

출력 (화면): 좌측 네비(다크 Navy 톤), 본문 max-width·거터가 [design.md](./design.md)와 크게 어긋나지 않음.

**확인 사항**

- [ ] Primary 버튼 최소 높이·CTA(Warm Gold) 대비가 디자인 문서와 대체로 일치한다.
- [ ] 카드·입력에 포커스 시 2px Navy 아웃라인(또는 동등)이 보인다.

---

## Phase 2 — 인증·미들웨어·역할 가드

| 항목 | 내용 |
|------|------|
| 대응 task | 2.1 ~ 2.5 |
| 관련 UC | UC-WEB-C-01, C-01b, C-02, C-03 |
| task 완료 기준 | 기업·시니어 계정 모두 가입·로그인 후 올바른 대시보드 진입 |

### TU-P2-00 E2E 로그인 테스트 계정 준비

Supabase Auth는 **실제 수신 가능한 도메인**만 허용합니다. `@example.com` 등은 거절됩니다.

| 구분 | 내용 |
|------|------|
| **방법** | Gmail `+` 별칭 사용 예: `본인계정+slweb@gmail.com` |
| **환경변수** | `E2E_COMPANY_EMAIL=본인계정+slweb@gmail.com` · `E2E_COMPANY_PASSWORD=TestPassw0rd!` |
| **실행** | `npm run test:e2e:doc-login` |

**확인 사항**

- [ ] Supabase 대시보드 → Authentication에서 해당 이메일이 `Confirmed` 상태인지 확인.
- [ ] `@example.com` 도메인으로 가입 시도 시 에러 메시지 표시.

### TU-P2-01 기업 계정 가입·로그인

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/signup` (기업, 기본 role) |
| **입력 (폼)** | 이름: `테스트기업`, 이메일: `corp+test@gmail.com`, 비밀번호: `TestPassw0rd!` |
| **출력 (URL)** | 이메일 확인 비활성화 시 `/dashboard`; 활성화 시 확인 안내 메시지 |
| **출력 (DB)** | `profiles(role='company')`, `companies` 행 생성 |

**확인 사항**

- [ ] UC-WEB-C-01: 중복 이메일로 가입 시 에러 토스트.
- [ ] 로그인 후 `/dashboard` 진입, 기업 사이드바 표시.
- [ ] `/senior/*` 접근 시 `/dashboard`로 리디렉션.

### TU-P2-02 시니어 계정 가입·로그인

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/signup?role=senior` |
| **입력 (폼)** | 이름: `테스트시니어`, 이메일: `senior+test@gmail.com`, 비밀번호: `TestPassw0rd!` |
| **출력 (URL)** | `/senior/dashboard` |
| **출력 (DB)** | `profiles(role='senior')`, `senior_profiles(profile_id=<uid>)` 행 생성 |

**확인 사항**

- [ ] UC-WEB-C-01b: 시니어로 가입 후 **기업 대시보드가 아닌** `/senior/dashboard` 진입.
- [ ] DB `profiles.role = 'senior'` 확인(Supabase 대시보드 → Table Editor).
- [ ] 마이그레이션 미적용 환경: signup action의 방어적 upsert 동작 확인(`profiles_insert_own` 정책 적용 필요).
- [ ] `/dashboard`(기업) 직접 접근 시 `/senior/dashboard`로 리디렉션.

### TU-P2-03 세션 갱신·역할 가드

| 구분 | 내용 |
|------|------|
| **전제** | 기업 계정 로그인 상태 |
| **입력** | 페이지 새로고침 또는 보호 경로(`/requests`) 재접근 |
| **출력 (화면)** | 세션 유지, 보호 페이지 정상 표시 |
| **입력 (미인증)** | 쿠키 삭제 후 `/dashboard` 접근 |
| **출력 (URL)** | `/login?returnUrl=/dashboard` |

**확인 사항**

- [ ] UC-WEB-C-03: `middleware.ts`의 `updateSession`으로 토큰 자동 갱신.
- [ ] 로그인 후 `/login` 재접근 시 `/`로 리디렉션.
- [ ] 인증 없이 `/senior/dashboard` 접근 시 `/login?returnUrl=/senior/dashboard`.

---

## Phase 3 — 기업 프로필

| 항목 | 내용 |
|------|------|
| 대응 task | 3.1 ~ 3.4 |
| 관련 UC | UC-WEB-C-04 |
| task 완료 기준 | 저장 후 재방문 시 데이터 반영 |

### TU-P3-01 기업 프로필 등록·수정

| 구분 | 내용 |
|------|------|
| **전제** | 기업 계정 로그인 |
| **입력 (URL)** | `/company/profile` |
| **입력 (폼)** | 회사명: `(주)테스트기업`, 업종: `IT/소프트웨어`, 소개: `AI 기반 HR 솔루션`, 웹사이트: `https://example.com` |
| **출력 (DB)** | `companies(name, industry, description, website_url)` 업서트 |
| **출력 (화면)** | 성공 토스트, 재방문 시 동일 값 표시 |

**확인 사항**

- [ ] UC-WEB-C-04: RLS — 다른 기업 계정으로 접근 시 본인 데이터만 조회.
- [ ] 필수 필드(회사명) 비워 두면 저장 불가.
- [ ] 저장 후 `companies` 테이블에 `owner_id = auth.uid()` 행 존재.

---

## Phase 4 — TF 요청

| 항목 | 내용 |
|------|------|
| 대응 task | 4.1 ~ 4.4 |
| 관련 UC | UC-WEB-C-05, C-06 · BTS-01 |
| task 완료 기준 | 생성·목록·상세 필수, 수정은 스키마·RLS 범위 내 |

### TU-P4-01 TF 요청 생성

| 구분 | 내용 |
|------|------|
| **전제** | 기업 프로필(`companies` 행) 존재 |
| **입력 (URL)** | `/requests/new` |
| **입력 (폼)** | 제목: `재무 전략 TF 8주`, 분야: `재무·회계`, 지역: `서울`, 기간: `8주`, 예산: `2000~3000만원`, 목표: `분기 손익 분석 보고서` |
| **출력 (URL)** | `/requests/<new_id>` |
| **출력 (DB)** | `tf_requests(status='open', company_id=<company_id>)` |

**확인 사항**

- [ ] UC-WEB-C-05: 필수 필드(제목·분야·목표) 누락 시 저장 불가.
- [ ] RLS — 생성된 요청은 소유 기업 계정에만 조회.
- [ ] BTS-01: 생성 후 `/requests` 목록에 새 항목 표시.

### TU-P4-02 TF 요청 목록·상세·수정

| 구분 | 내용 |
|------|------|
| **입력 (URL)** | `/requests` |
| **출력 (화면)** | 기업 소유 요청 목록, 상태 뱃지(색+텍스트), 행 간격·구분선 |
| **입력 (URL)** | `/requests/<requestId>` |
| **출력 (화면)** | 요청 상세, 서브내비(개요 \| 매칭 결과 \| 제안) |
| **입력** | 수정 폼: 제목 변경 후 저장 |
| **출력 (DB)** | `tf_requests` 갱신 |

**확인 사항**

- [ ] UC-WEB-C-06: 다른 기업 요청 ID로 접근 시 빈 결과 또는 404.
- [ ] 상태 `cancelled` 요청은 수정 불가(또는 경고 표시).
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

### TU-P6-01 계약 활성화 및 진행률 업데이트

| 구분 | 내용 |
|------|------|
| **전제** | 수락된 제안 존재, 계약이 `draft` 상태 |
| **입력 (URL)** | `/contracts` → 계약 선택 또는 `/contracts/<contractId>` 직접 접근 |
| **입력 (동작)** | "계약 시작" 또는 활성화 버튼 클릭 |
| **출력 (DB)** | `contracts.status` = `active` |
| **입력** | 진행률 슬라이더 또는 입력: `40` |
| **출력 (화면)** | 진행률 바 40% 표시 |
| **출력 (DB)** | `contracts.progress_pct` = 40 |

**확인 사항**

- [ ] UC-WEB-C-10: 계약 상세 페이지에 상태 배지(draft → active) 표시.
- [ ] 미활성 계약은 진행률 수정 불가.

### TU-P6-02 PDF 생성 및 다운로드

| 구분 | 내용 |
|------|------|
| **전제** | 활성 계약 존재, Supabase Storage `contracts` 버킷 생성됨(`20260607000002` 마이그레이션 적용) |
| **입력 (URL)** | `/contracts/<contractId>` |
| **입력 (동작)** | "계약서 PDF 생성" 또는 유사 버튼 클릭 |
| **출력 (HTTP)** | `generateContractPdf` Server Action 호출, service role로 Storage에 파일 업로드 |
| **출력 (DB)** | `contracts.pdf_url` 값 생성(예: `https://<supabase-url>/storage/v1/object/public/contracts/<contract_id>/contract.pdf`) |
| **출력 (화면)** | PDF 다운로드 링크 표시 또는 새 탭에서 열기 |

**확인 사항**

- [ ] Service role 없이 authenticated 역할로 Storage upload 시도 시 403.
- [ ] `pdf_url`이 저장되고 재접근 시 동일 값 유지.
- [ ] 파일 크기 10 MB 초과 시 Storage 정책(제한) 확인.

### TU-P6-03 정산 요청 및 데모 완료

| 구분 | 내용 |
|------|------|
| **전제** | 활성 계약 존재 |
| **입력 (URL)** | `/contracts/<contractId>/settlement` |
| **입력 (동작)** | "정산 요청" 버튼 클릭 |
| **출력 (DB)** | `contracts.status` = `settlement_requested` (또는 구현상 동등), `settlements.status` = `pending` |
| **입력 (동작)** | "데모 완료" 또는 정산 완료 버튼 클릭 |
| **출력 (DB)** | `settlements.status` = `released` → `completed` 흐름(구현 기준), `contracts.status` = `completed` |
| **출력 (화면)** | Stepper 단계 라벨 변경(예: "정산 요청" → "완료") |

**확인 사항**

- [ ] UC-WEB-C-11: 실제 결제 없이 데모 모드로 진행 가능.
- [ ] BTS-04: 정산 UI까지 도달.
- [ ] 정산 상태 변화가 DB에서 확인됨.

### TU-P6-04 결제 웹훅 수신 (수동)

| 구분 | 내용 |
|------|------|
| **전제** | `SUPABASE_SERVICE_ROLE_KEY` 서버 환경변수 설정됨, `/api/webhooks/payment` Route Handler 구현됨 |
| **입력 (curl)** | `POST /api/webhooks/payment` + Basic Auth header + Toss 웹훅 payload (결제 확인 상태) |
| **예시** | `curl -X POST http://localhost:3000/api/webhooks/payment -H "Authorization: Basic <base64>" -H "Content-Type: application/json" -d '{"status": "SUCCESS", ...}'` |
| **출력 (HTTP)** | 성공 시 200, 실패/서명 오류 시 401/400 |
| **출력 (DB)** | service role로 `settlements.status` 업데이트(예: `pending` → `released` → `completed`) |

**확인 사항**

- [ ] Basic Auth 헤더 누락 시 401.
- [ ] 웹훅 서명 검증 실패 시 401 반환.
- [ ] 응답에 service role 키·내부 스택이 노출되지 않음.
- [ ] 실제 Toss 웹훅은 staging/production 배포 후 통합 테스트 시 수행.

### TU-P6-05 리뷰 작성

| 구분 | 내용 |
|------|------|
| **전제** | 계약 `completed` |
| **입력 (URL)** | `/contracts/<contractId>` |
| **입력 (폼)** | 별점: 5, 코멘트: `일정과 커뮤니케이션이 훌륭했습니다.` |
| **출력 (DB)** | `contract_reviews`에 `reviewer_id` = 기업 사용자, `contract_id` 유니크 제약 확인 |

**확인 사항**

- [ ] UC-WEB-C-12: 완료 전에는 리뷰 폼 미노출.
- [ ] 중복 제출 시 DB 유니크 제약 또는 서버 검증으로 방지.

### TU-P6-06 제안 수락(데모)·계약 생성

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
| --- | --- | --- |
| 2026-05-14 | 0.1 | 최초 작성(Phase 0~8 골격) |
| 2026-05-14 | 0.2 | TU-P2-00 추가(Supabase `@example.com` 거절, 수동 E2E는 `E2E_COMPANY_EMAIL` 환경변수 사용) |
| 2026-05-14 | 0.3 | Phase 3 TU-P3-01 기업 프로필 등록·수정 절차 보강 |
| 2026-05-14 | 0.4 | Phase 4 TU-P4-01/02 TF 요청 생성·목록·수정 절차 |
| 2026-05-14 | 0.5 | Phase 5 TU-P5-01~04 매칭·제안·시니어 응답 |
| 2026-05-14 | 0.6 | Phase 6 TU-P6-01~04 계약·정산·웹훅·리뷰 초안 |
| 2026-05-14 | 0.7 | Phase 6 TU-P6-05/06 리뷰·계약생성 추가, 시니어 제안 수락 분리 |
| 2026-06-07 | 0.8 | Phase 6 재구성: TU-P6-01~06 Storage 버킷·웹훅 curl 예시 보강. 시니어 가입 버그 수정 반영(TU-P2-02). 파일 복구(Phase 0~4 소실 복원). |
