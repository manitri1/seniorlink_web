# SPEC-UI-001 (Compact)

## Requirements

- REQ-UI-001: `globals.css` CSS 변수 → primary #002444 (Navy), secondary/CTA #795900 (Gold), background #faf9f6.
- REQ-UI-002: `next/font`로 Manrope(display, 700) + Work Sans(body, 400) root `layout.tsx` 로드.
- REQ-UI-003: While (dashboard) 라우트 그룹, 좌측 DashboardNav + 상단 앱 바 + 콘텐츠 max-width 1280px, 24px gutter.
- REQ-UI-004: While 디자인 시스템 활성, when 공유 컴포넌트 사용, Button(Primary 56px, CTA Gold+Navy text)/Card/Input+Label/Textarea 렌더링.
- REQ-UI-005: When 알림 필요, Toast로 성공/실패 표시.
- REQ-UI-006: If 콘텐츠 1280px 초과, then gutter 유지하며 1280px로 제한.

## Acceptance Criteria

- Given CSS 변수 정의, When 페이지 렌더, Then Navy/Gold/배경 토큰 적용.
- Given (dashboard) 진입, When 페이지 렌더, Then 사이드바+앱바+1280px/24px gutter.
- Given 컴포넌트 로드, When CTA Button 렌더, Then Gold 배경+Navy 텍스트+56px.
