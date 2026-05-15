# Next.js + Supabase 웹으로 새 구현할 때의 수정 가이드

> **대상**: 현재 문서가 가정하는 **Nest REST + JWT**([refs/seniorlink-phase1-implementation-plan.md](./refs/seniorlink-phase1-implementation-plan.md)) 대신, **Next.js(App Router) + Supabase(Auth·DB·선택: Storage·Edge Functions)** 로 기업 웹을 다시 짓는 경우.

---

## 1. 아키텍처 선택 (문서·코드에 먼저 박을 결정)

| 모드 | 설명 | Phase 1 REST 문서와의 관계 |
|------|------|------------------------------|
| **A. 하이브리드** | Supabase = 인증·프로필·일부 CRUD만. 매칭·계약·정산·토스 등은 **기존 Nest API** 유지. | [prd.md](./prd.md) API 표는 “Nest 호출”로 두고, 인증만 Supabase 세션으로 대체. |
| **B. Supabase 중심** | Postgres·RLS·RPC로 도메인 대부분 이전. 무거운 로직은 **Supabase Edge Functions** 또는 별도 워커. | REST 표는 **테이블·RPC·Edge HTTP**로 재작성. `refs/`는 “레거런스 참고”로 격하. |
| **C. 풀 교체** | Nest 제거 가정. 결제·PDF 등도 Edge/외부 서비스로 재설계. | 새 **OpenAPI/스키마 문서**가 SST가 됨. |

문서 전체를 바꿀 때는 **A/B/C 중 하나를 prd 상단에 명시**하는 것이 좋습니다.

---

## 2. 문서별 수정 요약

### [prd.md](./prd.md)

| 절 | 수정 내용 |
|----|-----------|
| **메타·범위** | SST를 `refs/phase1` 단독이 아니라 **Supabase 마이그레이션·RLS 정책 문서**(신규)와 병기하거나 교체. [prd.md](./prd.md) 절 1·8b 참고. |
| **5. MVP 기능** | 기능 목록은 유지. “백엔드 구현 주체”만 Nest → Supabase/Edge로 바꿔 서술. |
| **6. 비기능·인증** | JWT 수동 갱신 → **Supabase Auth 세션**(쿠키: `@supabase/ssr`, `middleware.ts`에서 `updateSession`). 토큰 저장 전략 문단은 **Supabase 권장 패턴**으로 교체. ([prd.md](./prd.md) 7절) |
| **7. API 의존성** | `POST /v1/auth/...` 표를 **제거 또는 부록**으로 내리고, 대신 **테이블·액션(RLS)·RPC·Edge 엔드포인트** 매핑 표로 교체. ([prd.md](./prd.md) 8b) |
| **8. 범위 밖** | Supabase **Realtime**·**Storage**(이력서 파일) 사용 시 범위 안으로 이동. ([prd.md](./prd.md) 9절) |

### [ia.md](./ia.md)

| 절 | 수정 내용 |
|----|-----------|
| **4. URL** | 라우트는 동일하게 둘 수 있음. **인증 경로**만 `/login`을 Supabase Hosted UI를 쓸지, 이메일 매직링크 전용 페이지로 할지 결정 후 IA에 명시. |
| **6. 역할** | `company` / `senior` 모두 **웹**에서 주 플로우 완료. `profiles.role` + RLS + 레이아웃 가드([ia.md](./ia.md) §6). |
| **7. 화면–API** | “REST” 열 → “데이터 소스” 열로 바꾸고 `supabase.from('tf_requests').select(...)` / `rpc('match_candidates')` 등으로 기술. |

### [task.md](./task.md)

| Phase | 수정 내용 |
|-------|-----------|
| **0~8** | 본 저장소 기본은 **Next.js + Supabase** 단일 Phase 0~8([task.md](./task.md)). Nest는 부록·하이브리드 옵션. |
| **0** | `.env.example`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, (서버 전용) `SUPABASE_SERVICE_ROLE_KEY`는 **절대 클라이언트 번들 금지**. 하이브리드 시에만 `NEXT_PUBLIC_API_BASE_URL` 유지. |
| **1** | 디자인 토큰·앱 셸(스택 공통). |
| **2** | `signInWithPassword` / OAuth / Magic link. **Middleware**에서 세션 리프레시([Supabase SSR 가이드](https://supabase.com/docs/guides/auth/server-side/nextjs)). |
| **3~6** | **서버 컴포넌트·Server Actions·Route Handler**에서 Supabase 클라이언트 호출. 민감 연산은 **service role은 서버만**, 클라이언트는 **RLS 통과 쿼리**만. |
| **8** | E2E에 Supabase 로컬(`supabase start`) 또는 스테이징 프로젝트 연동. |

### [usecase.md](./usecase.md)

| 절 | 수정 내용 |
|----|-----------|
| **표 “API” 열** | `POST /v1/...` → `auth.signUp` / `from('companies').upsert` / `rpc('create_proposal')` 등 실제 호출 단위로 변경. |
| **시퀀스** | `NestAPI` → `Supabase` 또는 `NextServerAction` 노드로 변경. |

### [design.md](./design.md)

- **변경 최소**. 브랜드 토큰은 그대로.
- (선택) Supabase Dashboard 기본 테마와 무관하므로 **앱 UI는 여전히 DESIGN.md**만 따른다는 한 줄 추가 가능.

---

## 3. 데이터·보안 (반드시 문서화할 항목)

1. **RLS**: `tf_requests`, `proposals`, `contracts` 등 테이블별 `company_id = auth.uid()` 조건·정책을 표로 정리(prd 또는 신규 `docs/db-rls.md`).
2. **서비스 롤**: 정산·에스크로 콜백처럼 “시스템이 대리 수행”하는 작업만 Edge Function + service role.
3. **매칭 엔진**: 알고리즘이 Postgres만으로 어렵면 **A안 하이브리드**로 Nest/Edge 한 곳에만 두고, 결과만 `matches` 테이블에 쓰기.
4. **결제(토스)**: 웹훅은 **Route Handler** 또는 Edge Function에서 서명 검증 후 Supabase에 상태 업데이트.

---

## 4. 환경 변수 예시 (문서·`.env.example`에 반영)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# 서버 전용 (Git·클라이언트 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 하이브리드 시에만
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/v1
```

---

## 5. 패키지·Next 구조 (구현 시)

- `@supabase/supabase-js`, `@supabase/ssr`
- `middleware.ts`: 세션 쿠키 갱신
- 서버: `createServerClient`, 클라이언트: `createBrowserClient` 패턴 유지

---

## 6. `refs/` 레거런스 문서

- **그대로 두고** “Nest/JWT 기준 초기 설계”로 라벨링하거나,
- 팀 정책에 따라 **Supabase 스키마가 안정화되면** `docs/refs/`는 아카이브하고 새 SST만 유지.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-14 | 최초 작성 |
| 2026-05-14 | 시니어 웹: [ia.md](./ia.md) §6 역할·양면 RLS 요약 |
