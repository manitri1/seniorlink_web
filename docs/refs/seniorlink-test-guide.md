# 시니어링크 테스트 가이드

> 버전 1.0 · Phase 1 MVP · 최종 수정 2026-05-13  
> 대상: 백엔드 개발자 / QA 엔지니어

---

## 목차

1. [테스트 전략 개요](#1-테스트-전략-개요)
2. [환경 준비](#2-환경-준비)
3. [단위 테스트 (Unit Test)](#3-단위-테스트-unit-test)
4. [통합·E2E 테스트](#4-통합e2e-테스트)
5. [스프린트별 테스트 유즈케이스](#5-스프린트별-테스트-유즈케이스)
6. [커버리지 목표 & 리포트](#6-커버리지-목표--리포트)
7. [CI/CD 파이프라인 테스트](#7-cicd-파이프라인-테스트)
8. [공통 샘플 데이터](#8-공통-샘플-데이터)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1. 테스트 전략 개요

### 1.1 테스트 피라미드

```
         ┌─────────────┐
         │  E2E (37건) │  ← 전체 플로우 검증 (실제 DB/Redis 연동)
         └──────┬──────┘
         ┌──────┴──────────┐
         │  통합 테스트     │  ← 모듈 간 연동 (향후 추가)
         └──────┬──────────┘
  ┌─────────────┴─────────────────┐
  │  단위 테스트 (약 82건)         │  ← 서비스 로직, 스코어링 알고리즘
  └───────────────────────────────┘
```

### 1.2 테스트 파일 구성

| 파일 | 유형 | Sprint | 테스트 수 |
|---|---|---|---|
| `auth/auth.service.spec.ts` | 단위 | S1 | 5 |
| `seniors/seniors.service.spec.ts` | 단위 | S2 | 10 |
| `requests/requests.service.spec.ts` | 단위 | S2 | 8 |
| `matching/matching.scorer.spec.ts` | 단위 | S3 | 15 |
| `proposals/proposals.service.spec.ts` | 단위 | S4 | 14 |
| `contracts/contracts.service.spec.ts` | 단위 | S5 | 10 |
| `settlements/settlements.service.spec.ts` | 단위 | S6 | 10 |
| `reviews/reviews.service.spec.ts` | 단위 | S6 | 10 |
| `test/e2e/full-flow.e2e-spec.ts` | E2E | 전체 | 37 |
| **합계** | | | **119** |

### 1.3 커버리지 목표

| 모듈 | 목표 커버리지 | 우선순위 |
|---|---|---|
| 인증(auth) | 90%+ | 최우선 |
| 매칭(matching) | 80%+ | 최우선 |
| 제안(proposals) | 80%+ | 높음 |
| 정산(settlements) | 85%+ | 높음 |
| 리뷰(reviews) | 75%+ | 보통 |
| 나머지 모듈 | 70%+ | 보통 |

---

## 2. 환경 준비

### 2.1 필수 소프트웨어

| 소프트웨어 | 버전 | 용도 |
|---|---|---|
| Node.js | 20.x LTS | 런타임 |
| PostgreSQL | 15.x | E2E 테스트 DB |
| Redis | 7.x | 매칭 캐시 |
| Docker | 24.x+ | 테스트 인프라 (선택) |

### 2.2 단위 테스트 환경 설정

단위 테스트는 외부 의존성(DB·Redis) 없이 jest mock으로 실행됩니다.

#### macOS / Linux (bash)

```bash
cd seniorlink/apps/api
npm install
npm test
```

#### Windows (PowerShell)

```powershell
cd seniorlink\apps\api
npm install
npm test
```

### 2.3 E2E 테스트 환경 설정

#### 방법 A — Docker Compose 사용 (권장, Windows/macOS/Linux 공통)

```bash
# 프로젝트 루트에서 인프라 실행
cd seniorlink
docker compose up -d postgres redis

# 테스트 DB 생성 (최초 1회)
docker compose exec postgres psql -U seniorlink -d seniorlink_db -c "CREATE DATABASE seniorlink_test;"

# 마이그레이션 실행 (컨테이너 내부)
docker compose exec -e "DATABASE_URL=postgresql://seniorlink:password@postgres:5432/seniorlink_test" api npm run migration:run
```

> **Windows 주의**: Docker Desktop이 PATH에 없을 경우 PowerShell을 **관리자 권한**으로 열거나 아래 명령으로 PATH를 일시 추가합니다.
>
> ```powershell
> $env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"
> ```

#### 방법 B — 로컬 PostgreSQL 직접 사용

##### 로컬 — macOS / Linux (bash)

```bash
# PostgreSQL에 테스트 DB 생성
psql -U postgres -c "CREATE DATABASE seniorlink_test;"
psql -U postgres -c "CREATE USER seniorlink WITH PASSWORD 'password';"
psql -U postgres -c "GRANT ALL ON DATABASE seniorlink_test TO seniorlink;"

# 마이그레이션
DATABASE_URL=postgresql://seniorlink:password@localhost:5432/seniorlink_test \
npm run migration:run --workspace=apps/api
```

##### 로컬 — Windows (PowerShell)

```powershell
# PostgreSQL에 테스트 DB 생성 (psql이 PATH에 있어야 함)
psql -U postgres -c "CREATE DATABASE seniorlink_test;"
psql -U postgres -c "CREATE USER seniorlink WITH PASSWORD 'password';"
psql -U postgres -c "GRANT ALL ON DATABASE seniorlink_test TO seniorlink;"

# 마이그레이션 (PowerShell은 VAR=value 문법 미지원 → $env: 사용)
$env:DATABASE_URL = "postgresql://seniorlink:password@localhost:5432/seniorlink_test"
npm run migration:run --workspace=apps/api
```

### 2.4 `.env.test` 파일

`seniorlink/apps/api/.env.test` 파일을 생성합니다.

```dotenv
# 데이터베이스
DATABASE_URL=postgresql://seniorlink:password@localhost:5432/seniorlink_test
DATABASE_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=e2e-test-secret-key-for-testing-only
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=e2e-test-refresh-secret-for-testing-only
JWT_REFRESH_EXPIRES=30d

# S3/MinIO (E2E 미사용 — mock 처리)
S3_ENDPOINT=http://localhost:9000
S3_REGION=ap-northeast-2
S3_BUCKET=seniorlink-test
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin

# FCM (개발 환경 — mock 처리)
# FCM_PROJECT_ID=
# FCM_SERVICE_ACCOUNT_KEY=

# Toss Payments (개발 환경 — mock 처리)
# TOSS_SECRET_KEY=

# 앱 설정
NODE_ENV=test
PORT=3001
CORS_ORIGIN=http://localhost:3001
```

---

## 3. 단위 테스트 (Unit Test)

### 3.1 실행 방법

```bash
cd seniorlink/apps/api

# 전체 단위 테스트
npm test

# Watch 모드 (개발 중 실시간 재실행)
npm run test:watch

# 특정 파일만 실행
npm test -- auth.service.spec.ts
npm test -- matching.scorer.spec.ts

# 특정 describe/it 블록만 실행
npm test -- --testNamePattern="제안 발송"

# 커버리지 포함 실행
npm run test:cov
```

### 3.2 단위 테스트 패턴

모든 서비스 테스트는 다음 패턴을 따릅니다.

```typescript
// 1. TypeORM Repository mock 팩토리
const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

// 2. 의존 서비스 mock
const mockSeniorsService = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
};

// 3. TestingModule 생성
const module = await Test.createTestingModule({
  providers: [
    TargetService,
    { provide: getRepositoryToken(Entity), useValue: mockRepo },
    { provide: DependencyService, useValue: mockSeniorsService },
  ],
}).compile();

// 4. 각 테스트 전 mock 초기화
beforeEach(() => jest.clearAllMocks());
```

### 3.3 공통 픽스처 사용

`src/test/fixtures/sample-data.ts`에서 공유 샘플 데이터를 import해 사용합니다.

```typescript
import {
  mockSeniorProfile,
  mockCompanyProfile,
  mockTfRequest,
  mockProposal,
  mockContract,
  SENIOR_USER_ID,
  COMPANY_USER_ID,
} from '../test/fixtures/sample-data';
```

---

## 4. 통합·E2E 테스트

### 4.1 실행 방법

#### E2E 실행 — macOS / Linux (bash)

```bash
cd seniorlink/apps/api

# .env.test 파일 사용 (권장)
NODE_ENV=test npm run test:e2e

# 환경변수 직접 지정
DATABASE_URL=postgresql://seniorlink:password@localhost:5432/seniorlink_test \
REDIS_URL=redis://localhost:6379 \
JWT_SECRET=e2e-test-secret-key-for-testing-only \
npm run test:e2e

# 특정 describe 블록만 실행
npm run test:e2e -- --testNamePattern="Sprint 1"
npm run test:e2e -- --testNamePattern="정산"
```

#### E2E 실행 — Windows (PowerShell)

```powershell
cd seniorlink\apps\api

# .env.test 파일 사용 (권장)
$env:NODE_ENV = "test"; npm run test:e2e

# 환경변수 직접 지정
$env:DATABASE_URL = "postgresql://seniorlink:password@localhost:5432/seniorlink_test"
$env:REDIS_URL    = "redis://localhost:6379"
$env:JWT_SECRET   = "e2e-test-secret-key-for-testing-only"
npm run test:e2e

# 특정 describe 블록만 실행
npm run test:e2e -- --testNamePattern="Sprint 1"
npm run test:e2e -- --testNamePattern="정산"
```

> **참고**: PowerShell에서 `VAR=value command` 문법은 동작하지 않습니다. 반드시 `$env:VAR = "value"` 로 먼저 설정한 뒤 명령을 실행하세요.

### 4.2 E2E 테스트 아키텍처

```
full-flow.e2e-spec.ts
    │
    ├── beforeAll: TestingModule + NestApp 초기화
    │              실제 PostgreSQL + Redis 연결
    │
    ├── afterAll: 테스트 데이터 DB 삭제 + 앱 종료
    │
    ├── Sprint 1: 인증 (10개 케이스)
    ├── Sprint 2: 프로필 & TF 요청 (10개 케이스)
    ├── Sprint 3: AI 매칭 (4개 케이스)
    ├── Sprint 4: 제안 플로우 (7개 케이스)
    ├── Sprint 5: 계약 (6개 케이스)
    └── Sprint 6: 정산 + 리뷰 + 모니터링 (10개 케이스)
```

### 4.3 E2E 테스트 격리 전략

```typescript
afterAll(async () => {
  // 테스트 계정 삭제 (CASCADE로 연관 데이터 자동 삭제)
  await ds.query(
    `DELETE FROM users WHERE email IN ($1, $2)`,
    ['e2e-company@seniorlink.kr', 'e2e-senior@seniorlink.kr']
  );
  await app.close();
});
```

> **주의**: E2E 테스트는 실제 DB를 수정합니다. 반드시 프로덕션이 아닌 **테스트 전용 DB**를 사용하세요.

---

## 5. 스프린트별 테스트 유즈케이스

### Sprint 1 — 인증 (auth.service.spec.ts)

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-1-01 | 신규 사용자 회원가입 | 정상 | 201, passwordHash 미포함 |
| UC-1-02 | 중복 이메일 회원가입 | 오류 | ConflictException (409) |
| UC-1-03 | 유효한 자격증명으로 로그인 | 정상 | accessToken + refreshToken 반환 |
| UC-1-04 | 존재하지 않는 이메일 로그인 | 오류 | UnauthorizedException (401) |
| UC-1-05 | 비밀번호 불일치 로그인 | 오류 | UnauthorizedException (401) |

**샘플 데이터**

```typescript
// 정상 케이스
{
  email: 'kim@seniorlink.kr',
  password: 'SeniorLink1!',
  role: UserRole.SENIOR,
  name: '김철수',
}

// 오류 케이스 — 비밀번호 정책 미충족
{
  password: '1234'  // 8자 미만, 특수문자 없음 → 400
}
```

---

### Sprint 2 — 프로필 & TF 요청 (seniors.service.spec.ts, requests.service.spec.ts)

#### 시니어 프로필

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-S2-01 | 프로필 신규 생성 | 정상 | 201, profileId 반환 |
| UC-S2-02 | 중복 프로필 생성 | 오류 | ConflictException (409) |
| UC-S2-03 | ID로 프로필 조회 | 정상 | 200, 전체 필드 반환 |
| UC-S2-04 | 존재하지 않는 ID 조회 | 오류 | NotFoundException (404) |
| UC-S2-05 | 본인 프로필 수정 | 정상 | 200, 수정된 필드 반영 |
| UC-S2-06 | 타인 프로필 수정 시도 | 오류 | ForbiddenException (403) |
| UC-S2-07 | 상태를 INACTIVE로 변경 | 정상 | 200, status=inactive |
| UC-S2-08 | 아바타 이미지 업로드 | 정상 | 200, 신규 avatarUrl 반환 |
| UC-S2-09 | 아바타 업로드 시 기존 파일 삭제 | 정상 | S3 delete 호출 확인 |
| UC-S2-10 | avgRating 업데이트 | 정상 | 200, 신규 avgRating 반영 |

**샘플 데이터**

```typescript
// 시니어 프로필 생성 DTO
{
  fields: ['재무', '전략기획'],
  experienceYears: 25,
  keywords: ['CFO', 'M&A', '재무전략', '원가절감', 'IPO'],
  region: '서울',
  availableFrom: '2026-03-01',
  availableTo: '2026-12-31',
  hourlyRate: 200000,
  summary: '대기업 CFO 출신 25년 재무전략 전문가. M&A 자문 10건.',
}
```

#### TF 요청

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-R2-01 | TF 요청 생성 | 정상 | 201, requestId 반환 |
| UC-R2-02 | 기업 프로필 없이 생성 | 오류 | NotFoundException (404) |
| UC-R2-03 | ID로 요청 조회 | 정상 | 200, 요청 상세 반환 |
| UC-R2-04 | 존재하지 않는 요청 조회 | 오류 | NotFoundException (404) |
| UC-R2-05 | 소유 기업이 요청 수정 | 정상 | 200, 수정 반영 |
| UC-R2-06 | 비소유 기업의 수정 시도 | 오류 | ForbiddenException (403) |
| UC-R2-07 | OPEN → MATCHING 상태 전이 | 정상 | 200, status=matching |
| UC-R2-08 | MATCHING → IN_PROGRESS 상태 전이 | 정상 | 200, status=in_progress |

**샘플 데이터**

```typescript
// TF 요청 DTO
{
  title: 'AI SaaS 사업 재무전략 수립 TF',
  field: '재무',
  requiredFields: ['재무', '전략기획'],
  durationWeeks: 12,
  budgetMin: 5000000,
  budgetMax: 8000000,
  goals: 'Series B 투자 유치를 위한 재무 모델 수립 및 IR 자료 작성.',
  region: '서울',
}
```

---

### Sprint 3 — AI 매칭 (matching.scorer.spec.ts)

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-M3-01 | 전문 분야 완전 일치 → fieldScore=1.0 | 정상 | fieldScore === 1.0 |
| UC-M3-02 | 전문 분야 부분 일치(1/2) → fieldScore=0.5 | 정상 | fieldScore === 0.5 |
| UC-M3-03 | 전문 분야 불일치 → fieldScore=0 | 정상 | fieldScore === 0 |
| UC-M3-04 | 경력 30년 → careerScore ≈ 1.0 | 정상 | careerScore ≥ 0.9 |
| UC-M3-05 | 경력 0년 → careerScore=0 | 정상 | careerScore === 0 |
| UC-M3-06 | 리뷰 없는 신규 전문가 → reviewScore=0.5 | 정상 | reviewScore === 0.5 |
| UC-M3-07 | 평점 5.0 → reviewScore=1.0 | 정상 | reviewScore === 1.0 |
| UC-M3-08 | 지역 불일치 → availRegionScore 페널티 | 정상 | 지역 일치보다 낮음 |
| UC-M3-09 | 지역 "전국" → 어떤 지역도 availRegionScore=1.0 | 정상 | availRegionScore === 1.0 |
| UC-M3-10 | 총 fitScore가 0~1 범위 이내 | 정상 | 0 ≤ total ≤ 1 |
| UC-M3-11 | fitScore 내림차순 정렬 | 정상 | ranked[i] ≥ ranked[i+1] |
| UC-M3-12 | 최대 10명 반환 | 정상 | length ≤ 10 |
| UC-M3-13 | rank가 1부터 순서대로 부여 | 정상 | rank === index+1 |
| UC-M3-14 | matchReasons 배열 비어있지 않음 | 정상 | length > 0 |
| UC-M3-15 | 분야 완전 일치 → "필요 전문 분야 완전 일치" 이유 포함 | 정상 | reasons.includes(...) |

**스코어링 가중치**

```
fitScore = (fieldScore × 0.30) + (careerScore × 0.25)
         + (availRegionScore × 0.25) + (reviewScore × 0.20)
```

---

### Sprint 4 — 제안 플로우 (proposals.service.spec.ts)

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-P4-01 | 소유 기업이 시니어에게 제안 발송 | 정상 | status=pending, fitScore 반영 |
| UC-P4-02 | 매칭 캐시 없이도 제안 발송 가능 | 정상 | 오류 없이 저장 |
| UC-P4-03 | FCM 푸시 알림 비동기 발송 확인 | 정상 | sendProposalReceived 호출 |
| UC-P4-04 | 비소유 기업의 제안 발송 | 오류 | ForbiddenException (403) |
| UC-P4-05 | 동일 시니어 중복 제안 | 오류 | ConflictException (409) |
| UC-P4-06 | 시니어 수신함 1페이지 조회 | 정상 | data+meta 반환 |
| UC-P4-07 | 수신함 2페이지 → offset 20 적용 | 정상 | skip === 20 |
| UC-P4-08 | 제안 수락 → status=accepted | 정상 | proposal.status === accepted |
| UC-P4-09 | 제안 수락 → 계약(draft) 자동 생성 | 정상 | contract.status === draft |
| UC-P4-10 | 제안 수락 → 매칭 캐시 무효화 | 정상 | invalidateCache 호출 |
| UC-P4-11 | 보수 = budgetMax × durationWeeks | 정상 | compensation === 8M × 12 |
| UC-P4-12 | 수락된 제안 재수락 시도 | 오류 | BadRequestException (400) |
| UC-P4-13 | 다른 시니어의 수락 시도 | 오류 | ForbiddenException (403) |
| UC-P4-14 | 기업이 PENDING 제안 철회 | 정상 | status=withdrawn |
| UC-P4-15 | 수락된 제안 철회 시도 | 오류 | BadRequestException (400) |

---

### Sprint 5 — 계약 (contracts.service.spec.ts)

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-C5-01 | 기업이 계약 조회 | 정상 | 200, 전체 정보 반환 |
| UC-C5-02 | 시니어가 계약 조회 | 정상 | 200 |
| UC-C5-03 | 비당사자의 계약 조회 | 오류 | ForbiddenException (403) |
| UC-C5-04 | 존재하지 않는 계약 조회 | 오류 | NotFoundException (404) |
| UC-C5-05 | DRAFT → ACTIVE 활성화 | 정상 | status=active |
| UC-C5-06 | ACTIVE 계약 재활성화 | 오류 | BadRequestException (400) |
| UC-C5-07 | 진행률 50% 업데이트 | 정상 | progress=50 |
| UC-C5-08 | 진행률 100% 업데이트 | 정상 | progress=100 |
| UC-C5-09 | 진행률 101% | 오류 | BadRequestException (400) |
| UC-C5-10 | 진행률 -1% | 오류 | BadRequestException (400) |
| UC-C5-11 | DRAFT 계약의 진행률 업데이트 | 오류 | BadRequestException (400) |
| UC-C5-12 | PDF 생성 → S3 URL 저장 | 정상 | pdfUrl 반환 |

---

### Sprint 6 — 정산 & 리뷰 (settlements.service.spec.ts, reviews.service.spec.ts)

#### 정산

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-SE6-01 | ACTIVE 계약에 정산 요청 | 정상 | settlement 생성 |
| UC-SE6-02 | 금액 지정 정산 요청 (₩50M) | 정상 | amount=50_000_000 |
| UC-SE6-03 | 개발 환경 Toss mock → HELD 처리 | 정상 | status=held (비동기) |
| UC-SE6-04 | ACTIVE 아닌 계약의 정산 요청 | 오류 | BadRequestException (400) |
| UC-SE6-05 | 중복 정산 요청 | 오류 | ConflictException (409) |
| UC-SE6-06 | HELD 정산 릴리즈 → RELEASED + 계약 완료 | 정상 | status=released, contract=completed |
| UC-SE6-07 | PENDING 정산 릴리즈 시도 | 오류 | BadRequestException (400) |
| UC-SE6-08 | 존재하지 않는 정산 릴리즈 | 오류 | NotFoundException (404) |
| UC-SE6-09 | 계약 ID로 정산 현황 조회 | 정상 | settlement 반환 |
| UC-SE6-10 | 정산 없는 계약 조회 | 정상 | null 반환 |

#### 리뷰

| UC 번호 | 유즈케이스 | 유형 | 기대 결과 |
|---|---|---|---|
| UC-RV6-01 | 기업이 시니어에게 5점 리뷰 | 정상 | rating=5, revieweeId=seniorUserId |
| UC-RV6-02 | 기업 리뷰 → avgRating 자동 업데이트 | 정상 | updateRating 호출 |
| UC-RV6-03 | 시니어가 기업에게 4점 리뷰 | 정상 | rating=4, revieweeId=companyUserId |
| UC-RV6-04 | 시니어 리뷰 → avgRating 미업데이트 | 정상 | updateRating 미호출 |
| UC-RV6-05 | 미완료 계약에 리뷰 | 오류 | BadRequestException (400) |
| UC-RV6-06 | 비당사자의 리뷰 | 오류 | ForbiddenException (403) |
| UC-RV6-07 | 동일 계약 중복 리뷰 | 오류 | ConflictException (409) |
| UC-RV6-08 | 존재하지 않는 계약 리뷰 | 오류 | NotFoundException (404) |
| UC-RV6-09 | 최소값: 1점 + 10자 코멘트 | 정상 | rating=1 |
| UC-RV6-10 | 계약 리뷰 목록 조회 (양방향 2건) | 정상 | length=2 |

---

## 6. 커버리지 목표 & 리포트

### 6.1 커버리지 실행

```bash
# HTML 리포트 생성
npm run test:cov --workspace=apps/api

# 리포트 열기 (macOS)
open seniorlink/apps/api/coverage/lcov-report/index.html

# 리포트 열기 (Windows)
start seniorlink/apps/api/coverage/lcov-report/index.html
```

### 6.2 jest.config 설정 (package.json)

```json
"jest": {
  "collectCoverageFrom": [
    "**/*.(t|j)s",
    "!**/*.spec.ts",
    "!**/test/**",
    "!**/node_modules/**",
    "!**/migrations/**",
    "!**/seeds/**",
    "!**/main.ts",
    "!**/*.module.ts"
  ],
  "coverageThresholds": {
    "global": {
      "statements": 70,
      "branches": 65,
      "functions": 70,
      "lines": 70
    },
    "./src/matching/": {
      "statements": 80,
      "functions": 80
    },
    "./src/auth/": {
      "statements": 90,
      "functions": 90
    }
  }
}
```

### 6.3 커버리지 목표 요약

```
Overall ────────────────────── 70%+
  auth ──────────────────────  90%+  ★ 최우선
  matching ──────────────────  80%+  ★ 최우선
  proposals ─────────────────  80%+
  settlements ───────────────  85%+
  reviews ───────────────────  75%+
  seniors / companies / requests  70%+
  contracts ─────────────────  75%+
  chat / notifications ──────  60%+  (E2E 보완)
```

---

## 7. CI/CD 파이프라인 테스트

### 7.1 GitHub Actions 워크플로우

`.github/workflows/deploy.yml`에 포함된 테스트 단계:

```yaml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_DB: seniorlink_test
        POSTGRES_USER: seniorlink
        POSTGRES_PASSWORD: password
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
    redis:
      image: redis:7
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5

  steps:
    - name: 의존성 설치
      run: npm ci

    - name: 마이그레이션 실행
      run: npm run migration:run --workspace=apps/api
      env:
        DATABASE_URL: postgresql://seniorlink:password@localhost:5432/seniorlink_test

    - name: 단위 테스트 + 커버리지
      run: npm run test:cov --workspace=apps/api

    - name: E2E 테스트
      run: npm run test:e2e --workspace=apps/api
      env:
        DATABASE_URL: postgresql://seniorlink:password@localhost:5432/seniorlink_test
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: ci-test-secret
```

### 7.2 테스트 단계 실패 시 배포 차단

- 단위 테스트 실패 → `build` 및 `deploy` job 전부 차단
- E2E 테스트 실패 → `deploy` job 차단
- `develop` 브랜치에만 자동 배포 (main 제외)

---

## 8. 공통 샘플 데이터

모든 테스트에서 일관되게 사용하는 픽스처 파일: `src/test/fixtures/sample-data.ts`

### 8.1 사용자 계정

| 구분 | 이메일 | 역할 | 이름 |
|---|---|---|---|
| 기업 담당자 | `company@seniorlink.kr` | `company` | 이대표 |
| 시니어 전문가 | `senior@seniorlink.kr` | `senior` | 김철수 |

### 8.2 시니어 프로필 데이터

```typescript
{
  fields: ['재무', '전략기획'],
  experienceYears: 25,
  keywords: ['CFO', 'M&A', '재무전략', '원가절감', 'IPO'],
  region: '서울',
  availableFrom: new Date('2026-03-01'),
  availableTo: new Date('2026-12-31'),
  hourlyRate: 200000,       // 시간당 ₩200,000
  avgRating: 4.8,
  reviewCount: 12,
  summary: '대기업 CFO 출신 25년 재무전략 전문가. M&A 자문 10건 이상.',
}
```

### 8.3 기업 프로필 데이터

```typescript
{
  name: '(주)그로스파트너스',
  industry: 'IT서비스',
  size: '중소기업(50~100인)',
  description: 'AI 기반 B2B SaaS 기업. 시리즈A 투자 유치 완료.',
  website: 'https://growthpartners.kr',
}
```

### 8.4 TF 요청 데이터

```typescript
{
  title: 'AI SaaS 사업 재무전략 수립 TF',
  field: '재무',
  requiredFields: ['재무', '전략기획'],
  durationWeeks: 12,
  budgetMin: 5_000_000,   // ₩5,000,000 / 주
  budgetMax: 8_000_000,   // ₩8,000,000 / 주
  goals: 'Series B 투자 유치를 위한 재무 모델 수립, IR 자료 작성, 비용 구조 최적화.',
  region: '서울',
}
```

### 8.5 제안 데이터

```typescript
{
  fitScore: 0.87,
  matchReasons: [
    '필요 전문 분야 완전 일치',
    '25년 풍부한 경력',
    '평점 4.8 검증된 전문가',
  ],
  message: '안녕하세요 김철수 CFO님, 저희 그로스파트너스에서 Series B 재무전략 TF에 참여해 주실 것을 제안드립니다.',
}
```

### 8.6 계약 데이터

```typescript
{
  startDate: '2026-02-15',
  endDate: '2026-05-15',       // 12주 후
  compensation: 96_000_000,   // budgetMax(8M) × durationWeeks(12)
  status: ContractStatus.DRAFT,
  progress: 0,
}
```

### 8.7 정산 데이터

```typescript
{
  amount: 96_000_000,
  status: SettlementStatus.PENDING,
  tossOrderId: 'order-{contractId}-{timestamp}',
}
```

### 8.8 리뷰 데이터

```typescript
// 기업 → 시니어 (5점)
{
  rating: 5,
  comment: '김철수 CFO님 덕분에 Series B 투자 유치에 성공했습니다. 재무 모델 수립과 IR 자료 작성 모두 탁월하셨습니다. 강력히 추천합니다.',
}

// 시니어 → 기업 (4점)
{
  rating: 4,
  comment: '기업 측의 소통이 원활하고 계약 조건도 명확했습니다. 프로젝트 목표가 잘 정의되어 집중해서 작업할 수 있었습니다.',
}
```

---

## 9. 트러블슈팅

### 9.1 단위 테스트 오류

**`Cannot find module` 오류**
```bash
# TypeScript 경로 별칭 설정 확인
# tsconfig.json의 paths 설정과 jest moduleNameMapper 일치 여부 확인
npm test -- --verbose
```

**`jest.clearAllMocks()` 효과 없음**
```typescript
// afterEach 대신 beforeEach에 clearAllMocks 배치
beforeEach(() => {
  jest.clearAllMocks();  // ← 각 테스트 시작 전 초기화
});
```

**TypeORM 관련 `Cannot read property of undefined`**
```typescript
// findOne이 null 반환 시 처리
repo.findOne.mockResolvedValue(null);
// 서비스 내에서 null 체크 후 NotFoundException 발생 확인
```

---

### 9.2 E2E 테스트 오류

**`connect ECONNREFUSED 127.0.0.1:5432`**

```bash
# PostgreSQL 실행 확인
docker compose ps
```

**`Redis connection failed`**

```bash
# Redis 실행 확인
docker compose exec redis redis-cli ping  # → PONG
```

**`relation "users" does not exist`**

```bash
# 마이그레이션 누락 — Docker 컨테이너 내부에서 재실행
docker compose exec \
  -e "DATABASE_URL=postgresql://seniorlink:password@postgres:5432/seniorlink_test" \
  api npm run migration:run
```

Windows PowerShell:

```powershell
docker compose exec `
  -e "DATABASE_URL=postgresql://seniorlink:password@postgres:5432/seniorlink_test" `
  api npm run migration:run
```

**E2E 테스트 후 데이터 미정리 (다음 실행 시 409 충돌)**

```bash
# 수동 정리 (Docker 컨테이너 내부)
docker compose exec postgres psql -U seniorlink -d seniorlink_test \
  -c "DELETE FROM users WHERE email LIKE 'e2e-%';"
```

**테스트 타임아웃 (jest.setTimeout)**

```typescript
// full-flow.e2e-spec.ts 최상단
jest.setTimeout(90_000);  // 90초 (기본 5초에서 증가)
```

**Windows: `'NODE_ENV' is not recognized` 오류**

```powershell
# cross-env 없이 PowerShell에서 환경변수 설정
$env:NODE_ENV = "test"
npm run test:e2e
```

**Windows: Docker 명령을 찾을 수 없음** — Docker Desktop 설치 후 PATH 일시 추가:

```powershell
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"
docker compose ps
```

---

### 9.3 커버리지 임계값 실패

```
Jest: "global" coverage threshold for statements (70%) not met: 65%
```

→ 아직 테스트가 없는 서비스 확인 후 spec 파일 추가:
```bash
# 커버리지가 낮은 파일 확인
npm run test:cov --workspace=apps/api 2>&1 | grep "Uncovered"
```

---

*시니어링크 개발팀 · 내부 문서 · Phase 1 MVP*
