# SPEC-UI-001 인수 기준 (Acceptance Criteria)

## Scenario 1: 디자인 토큰 적용

- **Given** `globals.css`에 색상 CSS 변수가 정의된 상태에서
- **When** 임의의 페이지가 렌더링되면
- **Then** primary는 #002444 (Navy), CTA는 #795900 (Gold), 배경은 #faf9f6으로 표시된다.

## Scenario 2: 앱 셸 레이아웃

- **Given** 인증된 company 사용자가 (dashboard) 라우트 그룹에 진입한 상태에서
- **When** 대시보드 페이지가 렌더링되면
- **Then** 좌측에 DashboardNav 사이드바, 상단에 앱 바, 콘텐츠 영역은 최대 폭 1280px·24px gutter로 표시된다.

## Scenario 3: 공유 컴포넌트 스타일

- **Given** 디자인 시스템 컴포넌트가 로드된 상태에서
- **When** Button을 CTA 변형으로 렌더링하면
- **Then** Gold 배경 + Navy 텍스트, 높이 56px로 표시된다.

## Edge Cases

- 콘텐츠가 1280px를 초과하는 대형 화면에서도 콘텐츠는 1280px로 제한되고 gutter가 유지된다.
- 폰트 로드 실패 시 시스템 폰트로 graceful fallback된다.
- Input에 오류가 있을 때 Label과 함께 연결된 메시지가 표시된다.

## Performance Criteria

- 폰트는 self-host되어 외부 네트워크 요청 없이 로드된다.
- 디자인 토큰 변경이 단일 CSS 변수 수정으로 전역 반영된다.
- 레이아웃 이동(CLS)이 최소화된다.
