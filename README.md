# Seniorlink Web

Next.js 기반 **기업용 웹** 클라이언트 저장소입니다. 마스터 기획·API 명세·가이드는 [docs/refs/](docs/refs/)의 `seniorlink-*.md`를 참고하고, 웹 실행 범위는 아래 4개 문서를 우선합니다.

## 문서 (웹 전용)

| 파일 | 설명 |
|------|------|
| [docs/prd.md](docs/prd.md) | 제품 요구사항(MVP·비기능·API 요약) |
| [docs/ia.md](docs/ia.md) | 정보 구조·URL·내비게이션 |
| [docs/design.md](docs/design.md) | 웹 토큰 매핑·컴포넌트·접근성 요약 |
| [docs/design/DESIGN.md](docs/design/DESIGN.md) | 브랜드·YAML 토큰·컴포넌트 정본 |
| [docs/usecase.md](docs/usecase.md) | 유스케이스·베타 시나리오 매핑 |
| [docs/task.md](docs/task.md) | 단계별 구현 계획(트랙 B: Next.js + Supabase, Phase 0~8) |
| [docs/db-rls.md](docs/db-rls.md) | Postgres 테이블·RLS 요약 |
| [docs/supabase-migrations.md](docs/supabase-migrations.md) | Supabase 마이그레이션 적용·작성 가이드 |
| [docs/phase-approval.md](docs/phase-approval.md) | Phase 간 넘김 승인(체크리스트) |
| [docs/release-and-verification.md](docs/release-and-verification.md) | Phase 8: 스모크·Lighthouse·보안·배포(Vercel+Supabase) |
| [docs/test_usecase.md](docs/test_usecase.md) | Phase별 수동 테스트 절차·입출력 예시·확인 사항 |

## 레거런스 레퍼런스

[docs/refs/](docs/refs/) 내 `seniorlink-project-planning-document.md`, `seniorlink-phase1-implementation-plan.md`, `seniorlink-user-guide.md` 등.

## 개발

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

루트에 `.env.local`을 두고 [`.env.example`](.env.example)의 `NEXT_PUBLIC_SUPABASE_*` 값을 채웁니다. CI나 일회성 빌드에서는 동일 이름의 환경 변수를 주입하면 됩니다(값이 없으면 서버 컴포넌트에서 `createClient()`가 실패할 수 있음).

## 빌드·검증

```bash
npm run build
npm start
```

```bash
npm run ci          # lint + build + npm audit (high 이상)
npm run test:e2e    # Playwright 스모크 (기본 포트 3005, 첫 실행 전 npx playwright install chromium)
```

GitHub에 푸시 시 `.github/workflows/ci.yml`에서 **lint·감사** 후 **Playwright**(내부에서 `build`·`start`)를 실행합니다. 로컬에서 전체를 한 번에 보려면 `npm run ci` 뒤에 `npm run test:e2e`를 실행하면 됩니다.
