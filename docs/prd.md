# Seniorlink Web — 제품 요구사항(PRD)

> **버전**: 0.5 · **범위**: Next.js **기업·시니어 공용** 웹 앱(`seniorlink_web`)만 기술합니다.  
> **상세 사업·전체 로드맵**: [refs/seniorlink-project-planning-document.md](./refs/seniorlink-project-planning-document.md)  
> **경험·시각 SSOT**: [design/DESIGN.md](./design/DESIGN.md) · 웹 요약 [design.md](./design.md)  
> **스택 가이드**: [stack-next-supabase.md](./stack-next-supabase.md)

---

## 1. 구현 스택 선언 (필수)

문서·코드 리뷰 시 혼선을 막기 위해 **아래 중 하나**를 저장소 README 또는 본 PRD에 명시합니다([stack-next-supabase.md](./stack-next-supabase.md) 1절).

| 모드 | 설명 | SST(데이터·API) |
|------|------|------------------|
| **Nest 기본** | Next 웹이 Phase 1 **REST + JWT**만 호출 | [refs/seniorlink-phase1-implementation-plan.md](./refs/seniorlink-phase1-implementation-plan.md) |
| **A. 하이브리드** | Supabase = 인증·프로필·일부 CRUD; 매칭·계약·정산·토스 등은 **Nest** | Nest 명세 + Supabase Auth·해당 테이블 마이그레이션 |
| **B. Supabase 중심** | Postgres·RLS·RPC·Edge 중심; Nest는 축소 또는 제거 | 마이그레이션·RLS 문서(권장 신규 `docs/db-rls.md`) + `refs/`는 레거런스 참고 |
| **C. 풀 교체** | Nest 제거; 결제·PDF 등 Edge/외부 서비스 | 새 OpenAPI/스키마 SST |

**본 PRD 기본 서술**: **Nest 기본** 트랙. **A/B/C** 채택 시 절 3·6·7b·8을 우선 적용합니다.

---

## 2. 문서 목적

본 PRD는 양면 플랫폼(시니어·기업) 전체가 아니라 **웹 클라이언트**의 범위, MVP 기능, 비기능 요구, 백엔드 의존성을 한 곳에서 추적하기 위한 실행용 문서입니다. 마스터 기획서와 중복되는 시장·재무 서술은 링크로 대체합니다.

---

## 3. 제품 한 줄

**퇴직 시니어 전문가와 단기 TF가 필요한 기업을 연결하는 플랫폼**에서, **기업** 담당자는 TF 요청·매칭·제안·계약·정산을, **시니어** 전문가는 제안 수신·응답·계약 진행을 **동일 웹 클라이언트**에서 처리합니다. 모바일 앱은 별도 저장소로 두고, 본 PRD 범위는 **데스크톱·모바일 브라우저 웹**에 한정합니다. 사용자 인지 부하를 줄이기 위해 **Corporate Modernism** 기반의 절제된 UI([design/DESIGN.md](./design/DESIGN.md))를 따릅니다.

---

## 4. 사용자·페르소나

| 구분 | MVP 웹 |
|------|--------|
| **1차 (포함)** | **기업** 담당자 — TF 요청 작성·매칭 검토·제안 발송·계약/진행·정산 승인 등 |
| **1차 (포함)** | **시니어** 전문가 — 프로필 유지·받은 제안 조회·수락/거절·계약(및 정산) **조회** 등 웹 플로우 ([ia.md](./ia.md) §4.2) |
| **공통** | 회원가입·로그인·세션 갱신이 필요하며, **`profiles.role`**(`company` \| `senior`)과 **RLS**로 기업·시니어 데이터를 분리합니다([stack-next-supabase.md](./stack-next-supabase.md)). |

---

## 5. 문제·가치 (웹 관점 요약)

기업은 단기 TF 수요를 정리하고 여러 후보를 비교·제안·계약까지 **한 화면 흐름**으로 처리해야 합니다. 시니어는 **동일 브랜드·동일 토큰**의 웹에서 제안을 검토하고 응답합니다. 웹은 표·다단계 폼·PDF/계약 확인에 유리하므로, [refs/seniorlink-project-planning-document.md](./refs/seniorlink-project-planning-document.md)의 “절차 간소화·진행 모니터링” 가치를 **업무 효율·가독성** 측면에서 제공하는 것이 목표입니다.

---

## 6. MVP 기능 목록 (웹)

[refs/seniorlink-user-guide.md](./refs/seniorlink-user-guide.md) 4장(기업 담당자) 및 Phase 1 웹 구조와 정렬합니다. **백엔드 구현 주체**(Nest API vs Supabase 쿼리·RPC·Edge)는 절 1의 모드에 따르며, 화면 단 기능 범위는 동일합니다.

1. **인증**: 회원가입(역할: 기업 또는 시니어), 로그인, 세션 만료 시 갱신 UX  
2. **기업 프로필**: 등록·조회·수정  
3. **시니어 프로필**: 등록·조회·수정(로그인 시니어와 `senior_profiles` 연결, [db-rls.md](./db-rls.md))  
4. **TF 요청**: 생성·목록·상세·수정(필요 시), 상태 표시  
5. **AI 매칭 결과**: 요청별 추천 목록·적합도 등 메타 표시  
6. **제안**: 후보별 제안 발송(기업), **받은 제안·수락/거절(시니어)**, 요청별 제안 목록, 제안 철회(기업·가능한 경우)  
7. **계약**: 수락 후 계약 조회, PDF 생성 요청(연동 방식에 따름), 진행률·상태(기업·시니어 각각 RLS 범위)  
8. **정산**: 정산 정보 조회, 에스크로/승인 플로우에 맞는 요청·승인 UI  
9. **리뷰**: 계약 완료 후 리뷰 작성(기업 웹에서 노출할 경우)  
10. **대시보드 요약**: 역할별 진행 중 요청·제안·계약 건수 등 요약 위젯(선택, MVP 후반)  

---

## 7. 비기능 요구

| 영역 | Nest 기본 / 하이브리드(A) | Supabase 중심(B)·풀 교체(C) 추가 |
|------|---------------------------|-----------------------------------|
| **인증** | JWT 액세스·리프레시; [refs/seniorlink-user-guide.md](./refs/seniorlink-user-guide.md) 및 Phase 1 | **Supabase Auth** 세션, `@supabase/ssr`, `middleware.ts`에서 `updateSession` ([stack-next-supabase.md](./stack-next-supabase.md) 2절 prd) |
| **보안** | HTTPS, 토큰 저장·XSS·CSRF | **RLS**로 행 단위 권한; `SUPABASE_SERVICE_ROLE_KEY`는 **서버·Edge만** ([stack-next-supabase.md](./stack-next-supabase.md) 3절) |
| **반응형** | 데스크톱 우선; 12컬럼 그리드·24px 거터([design/DESIGN.md](./design/DESIGN.md)) · 시니어·기업 **동일 토큰**으로 모바일 브라우저에서도 주요 플로우 가능 |
| **경험·UI** | Distinguished Experience([design/DESIGN.md](./design/DESIGN.md), [design.md](./design.md)) | 동일 |
| **접근성** | WCAG 목표·본문 16px+·키보드 동선 | 동일 |
| **성능** | 목록 체감 2초 이내([refs/seniorlink-beta-test-scenarios.md](./refs/seniorlink-beta-test-scenarios.md)) | PostgREST·인덱스·RLS 비용 점검 |
| **국제화** | MVP 한국어 단일 | 동일 |

---

## 8. 데이터·API 의존성

### 8a. Nest REST (`/v1`) — Nest 기본·하이브리드(A)의 Nest 구간

상세 스키마·상태 전이는 Phase 1 SST를 따릅니다.

| 도메인 | 메서드·경로 (예) |
|--------|------------------|
| 인증 | `POST /v1/auth/signup`, `POST /v1/auth/login`, `POST /v1/auth/refresh` |
| 기업 프로필 | `POST /v1/companies/profile` (+ Phase 1 companies) |
| TF 요청 | `POST /v1/requests`, 요청별 조회·수정 |
| 매칭 | `GET /v1/requests/{requestId}/matches` |
| 제안 | `POST /v1/requests/{requestId}/proposals`, `GET .../proposals`, `POST /v1/proposals/{id}/withdraw` |
| 계약 | `GET /v1/contracts/{id}`, `POST .../pdf` 등 |
| 정산 | `POST .../settlement`, `GET .../settlement`, `POST /v1/settlements/{id}/release` |
| 리뷰 | `POST /v1/contracts/{id}/review` |
| 헬스 | `GET /v1/health` |

### 8b. Supabase — 모드 A(일부)·B·C

테이블·RPC 이름은 예시입니다. 확정 시 [ia.md](./ia.md) 7.2절·(권장) `docs/db-rls.md`와 동기화합니다.

| 도메인 | 예시 데이터 소스 |
|--------|------------------|
| 인증 | `auth.signUp` / `signInWithPassword` · 세션 쿠키 |
| 기업 프로필 | `from('companies').upsert/select` + RLS |
| TF 요청 | `from('tf_requests')` CRUD + RLS |
| 매칭 | `rpc('get_matches')` 또는 동기화 테이블; 알고리즘은 Edge/Nest 단일 소스 권장([stack-next-supabase.md](./stack-next-supabase.md) 3절) |
| 제안·계약·정산 | 해당 테이블 + 필요 시 Edge; 토스 웹훅은 Route Handler / Edge에서 검증 후 DB 업데이트 |

---

## 9. 범위 밖 (웹 PRD)

- **별도 모바일 앱 프로젝트**(React Native) 전용 화면·네이티브 네비게이션 — 본 저장소 웹과 API·Auth는 공유할 수 있으나 UI 구현은 범위 밖으로 둡니다.  
- FCM 푸시 UI(알림 센터는 웹에서 선택)  
- 앱스토어 배포·인앱 결제 UI  
- 법률 검토용 최종 계약 문안 확정(템플릿은 백엔드/운영 정책)  

**Supabase 채택 시 범위 조정**: **Realtime**(제안·채팅 알림), **Storage**(계약 PDF·첨부)를 MVP에 넣을 경우 본 절에서 제거하고 절 6 기능 항목에 반영합니다([stack-next-supabase.md](./stack-next-supabase.md) 2절 prd 8절).

---

## 10. 성공 지표 (웹 측정 가능 항목)

[refs/seniorlink-beta-test-scenarios.md](./refs/seniorlink-beta-test-scenarios.md)와 연계:

- TF 요청 작성 **완료율**·폼 이탈률  
- 매칭 결과 화면에서 **제안 발송까지 소요 시간**·발송율  
- 시니어 **제안 응답 시간**·수락/거절 비율  
- 계약·정산 화면에서 **작업 완료율**·오류율  

---

## 11. 관련 문서

| 문서 | 용도 |
|------|------|
| [README.md](../README.md) | 로컬 개발·빌드 명령 |
| [design/DESIGN.md](./design/DESIGN.md) | 브랜드·토큰·컴포넌트 정본 |
| [design.md](./design.md) | 웹 구현용 토큰 매핑·체크리스트 |
| [ia.md](./ia.md) | 정보 구조·URL·내비게이션 |
| [usecase.md](./usecase.md) | 유스케이스·베타 시나리오 참조 |
| [task.md](./task.md) | 단계별 구현 계획(**트랙 B: Supabase** 기본, Nest는 부록) |
| [stack-next-supabase.md](./stack-next-supabase.md) | Supabase 모드·환경 변수·RLS·보안 체크리스트 |
| [refs/seniorlink-phase1-implementation-plan.md](./refs/seniorlink-phase1-implementation-plan.md) | Phase 1 Nest 명세(레거런스 SST) |
| [refs/seniorlink-technology-stack.md](./refs/seniorlink-technology-stack.md) | 스택·인프라 |

---

## 12. 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-14 | 0.1 | 최초 작성(웹 전용 PRD 분리) |
| 2026-05-14 | 0.2 | `design/DESIGN.md`·경험/접근성 비기능 보강, refs 링크로 정리 |
| 2026-05-14 | 0.3 | Supabase 스택 변형 절·`stack-next-supabase.md` 링크 추가 |
| 2026-05-14 | 0.4 | `stack-next-supabase.md` 반영: 스택 선언(1절), 이중 비기능·8a/8b API, 범위 조정 |
| 2026-05-14 | 0.5 | 시니어 웹 1차 포함: 페르소나·IA §4.2·MVP 기능·범위 밖(네이티브 앱)·성공 지표 |
