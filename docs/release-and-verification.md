# Phase 8 — 검증·출시 가이드

`docs/task.md` Phase 8(검증·출시)에 대응합니다. 스테이징 URL에서 **기업·시니어** 플로우 데모가 가능한지가 완료 기준입니다.

---

## 8.1 스모크·베타 시나리오

### 자동화 (Playwright)

공개·인증 경계만 검증합니다(실제 Supabase 로그인은 스테이징 계정으로 수동).

```bash
npm run test:e2e
```

- 기본 포트는 **`3005`**(로컬 `npm run dev`의 3000과 충돌 방지). 바꾸려면 `PLAYWRIGHT_PORT` 또는 `PLAYWRIGHT_BASE_URL`을 설정합니다.
- 첫 실행 전: `npx playwright install chromium`

### 수동 체크리스트 (베타 문서 매핑)

원본: [refs/seniorlink-beta-test-scenarios.md](./refs/seniorlink-beta-test-scenarios.md)

| 웹 스모크 ID | 베타 시나리오 | 기업 웹에서 확인할 것 |
|--------------|---------------|------------------------|
| BTS-WEB-01 | 시나리오 1 (프로필·요청) | `/company/profile` 저장 후 재방문 반영 · `/requests/new` 생성 · 목록·상세 |
| BTS-WEB-02 | 시나리오 2 (매칭·제안) | `/requests/[id]/matches` 후보 표시 · `/requests/[id]/proposals` 발송·철회 |
| BTS-WEB-03 | 시나리오 3 (계약) | 제안 수락(데모 또는 시니어 웹)·`/contracts/new`·계약 활성화·진행률 |
| BTS-WEB-04 | 시나리오 4 (정산) | `/contracts/[id]/settlement` 스텝·데모 정산 액션 |
| BTS-WEB-05 | (선택) 시나리오 1 변형 | 시니어 `/signup?role=senior` → `/senior/dashboard` → `/senior/profile` 저장 |

시나리오 5(설문·NPS)는 웹 범위 밖이면 별도 설문 도구로 추적합니다.

## 8.2 Lighthouse (접근성·성능)

[prd.md](./prd.md) 비기능: 접근성(WCAG 지향), 목록 체감 2초 이내(베타 문서와 연계).

Chrome에서 스테이징 또는 로컬 프로덕션 빌드(`npm run build && npm run start`)를 연 뒤:

1. 개발자 도구 → **Lighthouse** 패널  
2. 모드: **내비게이트** · 범주: **Performance**, **Accessibility**  
3. `/`, `/login`, `/dashboard` 또는 `/senior/dashboard`(각 역할 로그인 후) 각각 1회 이상 실행

**권장 목표(가이드라인, CI 강제 아님)**

| 항목 | 메모 |
|------|------|
| Accessibility | 심각·중대 이슈 0건, 폼 레이블·대비·포커스 링 유지([design.md](./design.md)) |
| Performance | LCP·TBT는 네트워크에 따라 변동; 동일 환경에서 스프린트마다 비교 |

CLI 사용 시: [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)로 HTML 리포트를 아티팩트로 보관할 수 있습니다.

---

## 8.3 보안

| 점검 | 방법 |
|------|------|
| 의존성 | `npm audit --audit-level=high` (CI에 포함). 상위 이슈는 Next·PostCSS 등 이행 시 재평가 |
| Service role | `SUPABASE_SERVICE_ROLE_KEY`는 **서버·CI 시크릿만**. `NEXT_PUBLIC_*`에 넣지 않음. `src/`에 키 문자열 하드코딩 금지 |
| RLS | [db-rls.md](./db-rls.md)와 마이그레이션 변경 시, 기업·시니어·타 계정 데이터 분리 수동 확인 |
| 웹훅 | `POST /api/webhooks/payment` 연동 시 서명·멱등·재시도 설계 |

---

## 8.4 배포 (Vercel + Supabase)

1. **Supabase**: 프로젝트에 [supabase-migrations.md](./supabase-migrations.md) 순서로 마이그레이션 적용  
2. **Vercel**(또는 동등 호스팅): Git 연결, Node 20, 빌드 `npm run build`, 출력 `.next`  
3. **환경 변수** (Vercel 프로젝트 설정):

   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (또는 프로젝트에 맞는 publishable 키 명칭)  
   - `NEXT_PUBLIC_SITE_URL` — 프로덕션 도메인(이메일 리다이렉트·OAuth에 사용)  
   - `SUPABASE_SERVICE_ROLE_KEY` — **웹훅·관리 스크립트만** 필요 시; 일반 페이지 번들에는 포함되지 않도록 Route Handler/서버 전용에서만 참조  

4. Docker/Nginx 자체 호스팅은 [refs/seniorlink-build-deploy-guide.md](./refs/seniorlink-build-deploy-guide.md)를 필요할 때만 참고합니다.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-14 | Phase 8 문서 최초 작성(Playwright·Lighthouse·보안·배포) |
| 2026-05-14 | 시니어 웹: BTS-WEB-05·Lighthouse 역할 경로·RLS 점검 문구 보강 |

---
