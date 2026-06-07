# SPEC-UI-001 구현 계획

## Implementation Approach

토큰 우선(token-first) 접근으로 색상·타이포그래피를 `globals.css`의 CSS 변수와 root `layout.tsx`의 `next/font`에 먼저 정의한 뒤, 이를 소비하는 공유 컴포넌트와 (dashboard) 앱 셸을 구축한다. Tailwind 없이 순수 CSS 변수 기반으로 디자인 시스템을 운영해 의존성을 최소화한다. 앱 셸은 (dashboard) 라우트 그룹 layout에 배치해 대시보드 계열 페이지가 공통 레이아웃을 자동 상속하도록 한다.

본 SPEC은 구현 완료(as-built) 상태이며 실제 구현은 아래 파일에 반영되어 있다.

- `src/app/globals.css` (CSS 변수)
- `src/app/layout.tsx` (폰트)
- `src/app/(dashboard)/layout.tsx` (셸)
- `src/components/Button.tsx`, `Card.tsx`, `Input.tsx`, `Textarea.tsx`

## Technical Constraints

- 디자인 토큰은 `design/DESIGN.md`를 단일 기준으로 삼는다 (색상 하드코딩 금지, CSS 변수 참조).
- 폰트는 `next/font`로 self-host하여 FOUT/CLS를 최소화한다.
- 콘텐츠 영역은 최대 폭 1280px, 좌우 gutter 24px를 유지한다.
- Button Primary 높이는 56px, CTA는 Gold 배경 + Navy 텍스트 규칙을 준수한다.

## Task Decomposition

1. `globals.css`에 색상 CSS 변수 정의 (REQ-UI-001) — 완료
2. root `layout.tsx`에 Manrope + Work Sans 로드 (REQ-UI-002) — 완료
3. (dashboard) layout 앱 셸 구성 (REQ-UI-003, REQ-UI-006) — 완료
4. 공유 컴포넌트 작성: Button, Card, Input, Textarea (REQ-UI-004) — 완료
5. Toast 알림 컴포넌트 (REQ-UI-005) — 완료

## Risk Analysis

- **토큰 불일치 위험 (Medium)**: 컴포넌트가 CSS 변수 대신 하드코딩 색상을 사용하면 디자인 일관성이 깨진다. → 변수 참조 강제.
- **폰트 로딩 CLS 위험 (Low)**: 폰트 로드 지연으로 레이아웃 이동 발생. → `next/font` self-host로 완화.
- **반응형 누락 위험 (Low)**: 모바일 브레이크포인트 제외 결정으로 소형 화면 경험 저하 가능. → 의도된 범위 제외.
