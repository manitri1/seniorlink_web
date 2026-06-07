# 제품 문서: Seniorlink Web

## 개요

**프로젝트명**: Seniorlink Web

**한 줄 설명**: 기업과 시니어 전문가를 연결하는 이중 역할 B2B 마켓플레이스 — 기업이 TF(태스크 포스) 요청을 게시하고, 시니어 전문가들이 제안으로 응답합니다.

**기술 스택**: Next.js 15 (App Router) + React 19 + Supabase + TypeScript 5.7

---

## 타겟 사용자

### 기업 (Requesters)
- TF 프로젝트에 시니어 전문가를 필요로 하는 중·대형 기업
- 특정 기술 분야의 단기 지원이 필요한 스타트업
- 컨설팅 및 멘토링을 원하는 조직
- **주요 역할**: TF 요청 작성, 시니어 선택, 계약 체결, 결제

### 시니어 전문가 (Senior Experts)
- 은퇴한 기술 전문가 또는 산업 경험이 풍부한 멘토
- 프리랜서로 일하는 경력 있는 개발자, 아키텍트, 컨설턴트
- 특정 분야에서 10년 이상의 경험을 보유한 전문가
- **주요 역할**: 프로필 작성, 매칭 제안 검토, 계약 수락, 업무 수행

---

## 핵심 가치 제안

### 기업 측
1. **빠른 인재 충원**: 시간 낭비 없이 즉시 경험 많은 전문가 접근
2. **비용 효율**: 풀타임 채용 없이 필요한 기간만 지원 받기
3. **품질 보증**: 검증된 시니어 전문가만 매칭
4. **명확한 프로세스**: 제안-계약-결제의 투명한 워크플로우

### 시니어 전문가 측
1. **유연한 업무**: 원하는 프로젝트만 선택하여 참여
2. **합리적 보상**: 공정한 가격으로 전문성 인정받기
3. **지속적 경력 개발**: 최신 기술 트렌드와 만나기
4. **커뮤니티**: 동료 전문가들과의 네트워킹 기회

---

## MVP 기능 (8가지)

### 1. 사용자 인증 및 프로필 관리
- 이메일 기반 가입/로그인 (Supabase Auth)
- 역할 기반 프로필 (기업/시니어)
- 프로필 정보 CRUD (Company, Senior Profiles)
- **완료 단계**: Phase 2, 3

### 2. TF 요청 작성 및 관리
- 기업이 TF 요청 게시 (제목, 분야, 예산, 기간 등)
- 상태 관리 (작성 중 → 공개 → 마감)
- 요청 수정 및 삭제
- **완료 단계**: Phase 4

### 3. AI 기반 매칭
- 요청과 시니어 전문가 간 자동 매칭 알고리즘
- 적합도 점수 계산 및 표시
- 매칭 제안 목록 (request_matches 테이블)
- **완료 단계**: Phase 5 (부분 - UI 완료, 알고리즘 미구현)

### 4. 제안 시스템
- 시니어가 TF 요청에 제안 제출
- 제안 상태 관리 (검토 중 → 수락 → 거절)
- 제안 철회 기능
- **완료 단계**: Phase 5 (부분 - UI 완료, 철회 RPC 미구현)

### 5. 계약 관리
- 수락된 제안 → 계약 생성 (draft → active → settlement_requested → completed)
- 계약 세부사항 및 조건 저장
- 계약 문서 PDF 생성 (toss-pdf 연동)
- **완료 단계**: Phase 6 (부분 - UI 완료, PDF 생성 미구현)

### 6. 결제 및 정산
- Toss Payments 연동
- 결제 상태 추적 (pending → held → released)
- 정산 완료 및 정산 보류 처리
- Webhook 기반 결제 확인
- **완료 단계**: Phase 6 (부분 - Webhook 검증 미구현)

### 7. 대시보드
- 기업 대시보드: 요청 관리, 진행 중인 계약 현황
- 시니어 대시보드: 제안 현황, 진행 중인 계약 목록
- 통계 및 활동 요약
- **완료 단계**: Phase 7

### 8. 착용 후기 (Contract Reviews)
- 기업이 시니어에게 업무 완료 후 리뷰 작성
- 평점 및 의견 기록
- 평점 기반 전문가 신뢰도 관리
- **완료 단계**: Phase 7 (부분)

---

## 범위 밖 기능 (Non-Goals)

다음 기능들은 현재 구현 대상이 **아닙니다**:

### 플랫폼
- ❌ 모바일 앱 (iOS, Android) — Next.js 웹 기반만 지원
- ❌ 데스크톱 애플리케이션 (Electron 등)

### 인증 및 계정
- ❌ 소셜 로그인 (Google, GitHub 등) 전체 구현 — 이메일 기반만 MVP
- ❌ 두 가지 인증 (2FA, SMS OTP)
- ❌ 싱글 사인온 (SSO) 엔터프라이즈 기능

### 커뮤니케이션
- ❌ 실시간 채팅 (WebSocket 기반)
- ❌ 비디오 컨퍼런싱 통합
- ❌ 이메일 자동 발송 시스템 (Sendgrid 등)

### 분석 및 리포팅
- ❌ 고급 분석 대시보드 (차트, 트렌드 분석)
- ❌ 비즈니스 인텔리전스 (BI) 통합
- ❌ 데이터 내보내기 (CSV, Excel)

### 통합 및 확장
- ❌ REST API 공개 (개발자용)
- ❌ Webhook 커스텀 엔드포인트
- ❌ 제3자 통합 (Zapier, IFTTT 등)

### 백엔드 기술
- ❌ Nest.js, Express 등 별도 백엔드 — Supabase RLS + Next.js Server Actions 만 사용
- ❌ GraphQL (REST API만 사용)
- ❌ Microservices 아키텍처

---

## 구현 상태 개요

| Phase | 기능 | 상태 | 설명 |
|-------|------|------|------|
| **0** | Supabase 스키마 및 RLS | ✅ 완료 | 모든 테이블, 마이그레이션, Row Level Security 정책 완료 |
| **1** | 디자인 및 UI 쉘 | ✅ 완료 | 디자인 토큰, 레이아웃, 공유 컴포넌트 (Button, Card, Input 등) |
| **2** | 인증 및 미들웨어 | ✅ 완료 | 로그인, 회원가입, updateSession(), 역할 기반 리다이렉트 |
| **3** | 기업 프로필 관리 | ✅ 완료 | 프로필 폼, 저장, 조회, 기업 정보 수정 |
| **4** | TF 요청 CRUD | ✅ 완료 | 요청 생성, 조회, 수정, 삭제, 상태 관리 |
| **5** | 매칭 및 제안 | ⚠️ 부분 | **UI 완료**: 제안 목록, 상태 화면<br/>**미구현**: AI 매칭 알고리즘, 제안 철회 RPC |
| **6** | 계약 및 결제 | ⚠️ 부분 | **UI 완료**: 계약 상세, 결제 화면<br/>**미구현**: PDF 생성 (toss-pdf), Webhook 검증 |
| **7** | 대시보드 및 랜딩 | ✅ 완료 | 기업/시니어 대시보드, 랜딩 페이지, 대시보드 탐색 |
| **8** | 테스트 및 배포 | ❌ 최소 | Playwright 설정만 완료, GitHub Actions 워크플로우 없음 |

### 범례
- ✅ **완료** (Ready for Production)
- ⚠️ **부분** (In Progress / Partially Complete)
- ❌ **최소** (Minimal / Not Started)

---

## 기술적 특징

### 보안 강화
- **RLS (Row Level Security)**: Supabase 정책으로 행 단위 접근 제어
- **Service Role Key**: 서버 전용 (Route Handlers, Server Actions 에서만 사용) — 클라이언트 번들에 절대 포함 금지
- **Auth Trigger**: 회원가입 시 자동 프로필 생성 — 역할 권한 탈취 방지

### 데이터 흐름 (Server-First)
1. 클라이언트 → Server Component / Server Action (Anon Key)
2. Server Action → Supabase RLS 쿼리 (Service Role Key)
3. RLS 정책이 최종 행 접근 제어

### 모듈 분리
- **Route Groups**: `(auth)` 공개, `(dashboard)` 기업전용, `(senior)` 시니어전용
- **Server Actions**: 각 route group별 `actions.ts` 파일
- **Lib**: `lib/supabase/`, `lib/tf-request.ts`, `lib/contract.ts` 등 도메인별 헬퍼

---

## 다음 단계

### 우선순위 높음 (High Priority)
1. **Phase 5 완성**: AI 매칭 알고리즘 구현 + 제안 철회 RPC
2. **Phase 6 완성**: PDF 생성 + Toss Webhook 검증
3. **Phase 8**: Playwright E2E 테스트 커버리지

### 우선순위 중간 (Medium Priority)
1. 리뷰 시스템 (contract_reviews 테이블)
2. 고급 검색 및 필터링
3. 모바일 반응형 디자인 최적화

### 우선순위 낮음 (Low Priority)
1. 소셜 로그인 (Phase 2 이후)
2. 실시간 알림 (WebSocket)
3. 분석 대시보드

---

## 문서 참고

- **구조 문서**: `structure.md` — 디렉토리 구조, 라우트 그룹, 모듈 경계
- **기술 문서**: `tech.md` — 의존성, 환경 변수, 빌드 및 배포
- **데이터베이스**: `docs/db-rls.md` — RLS 정책, 테이블 스키마
- **설계**: `docs/design.md` — UI 컴포넌트, 디자인 시스템
