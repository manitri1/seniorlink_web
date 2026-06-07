---
id: SPEC-UI-001
version: "1.0.0"
status: completed
created: "2026-06-07"
updated: "2026-06-07"
author: "manitri"
priority: high
issue_number: 0
---

# SPEC-UI-001: 디자인 토큰·앱 셸

## HISTORY

- 2026-06-07 (v1.0.0): 최초 작성. Phase 1 as-built 문서화. 디자인 토큰(CSS 변수), 폰트, (dashboard) 라우트 그룹 셸, 공유 컴포넌트를 EARS 형식으로 정리.

## Overview

Seniorlink Web의 시각 기반(visual foundation)을 정의한다. `design/DESIGN.md` 가이드를 CSS 변수로 구현해 Navy(#002444, primary), Gold(#795900, secondary/CTA), 배경(#faf9f6) 색상 토큰을 전역에 노출한다. `next/font`로 Manrope(display, 700)와 Work Sans(body, 400)를 로드하고, (dashboard) 라우트 그룹에 좌측 사이드바(DashboardNav)와 상단 앱 바, 최대 폭 1280px·24px gutter의 콘텐츠 영역을 갖춘 앱 셸을 구성한다. Button, Card, Input+Label, Textarea, Toast 등 공유 컴포넌트를 제공해 이후 모든 화면이 일관된 디자인 시스템 위에서 구축되도록 한다.

## EARS Requirements

### Ubiquitous (시스템 상시 요구사항)

- REQ-UI-001: The system **shall** `design/DESIGN.md` 기반 CSS 변수를 `globals.css`에 정의하여 primary #002444 (Navy), secondary/CTA #795900 (Gold), background #faf9f6 색상 토큰을 전역에 제공한다.
- REQ-UI-002: The system **shall** `next/font`로 Manrope(display, weight 700)와 Work Sans(body, weight 400)를 root `layout.tsx`에서 로드하여 일관된 타이포그래피를 제공한다.

### State-Driven (상태 기반 요구사항)

- REQ-UI-003: **While** 사용자가 (dashboard) 라우트 그룹 내 페이지를 보는 상태이면, the system **shall** 좌측 사이드바(DashboardNav)와 상단 앱 바, 최대 폭 1280px·24px gutter의 콘텐츠 영역으로 구성된 앱 셸을 렌더링한다.

### Event-Driven (이벤트 기반 요구사항)

- REQ-UI-005: **When** 사용자 액션 결과로 알림이 필요하면, the system **shall** Toast 컴포넌트로 성공/실패 메시지를 표시한다.

### Unwanted Behavior (비정상 동작 방지 요구사항)

- REQ-UI-006: **If** 콘텐츠가 최대 폭 1280px를 초과하면, **then** the system **shall** gutter를 유지한 채 콘텐츠를 1280px 폭 내로 제한한다.

### Complex (복합 요구사항)

- REQ-UI-004: **While** 디자인 시스템이 활성화된 상태에서, **when** 화면이 공유 컴포넌트를 사용하면, the system **shall** Button(Primary 56px, CTA는 Gold 배경 + Navy 텍스트), Card, Input+Label, Textarea를 일관된 스타일로 렌더링한다.

## What NOT to Build (Exclusions)

- Tailwind CSS는 도입하지 않는다. CSS 변수와 일반 CSS로 디자인 토큰을 관리한다.
- 외부 디자인 툴(design tool) 연동은 포함하지 않는다.
- 다크 모드(dark mode)는 본 SPEC 범위에서 제외한다.
- 모바일 전용 브레이크포인트(mobile-specific breakpoints) 세분화는 다루지 않는다.

## Affected Files

- `src/app/globals.css` (CSS 변수 / 디자인 토큰)
- `src/app/layout.tsx` (폰트 로드)
- `src/app/(dashboard)/layout.tsx` (앱 셸)
- `src/components/Button.tsx`
- `src/components/Card.tsx`
- `src/components/Input.tsx`
- `src/components/Textarea.tsx`
