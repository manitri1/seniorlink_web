# 시니어링크 Phase 1 MVP 구현 계획서

> **이 문서의 목적**: `seniorlink-implementation-roadmap.md`의 Phase 1 (M3~M8) 섹션을 실제 개발에 바로 사용할 수 있는 수준으로 상세화한 기술 명세서입니다. 고수준 로드맵은 로드맵 문서를 참조하고, 이 문서는 구현 세부 사항의 단일 출처(Single Source of Truth)로 사용합니다.

---

## §1 개발 환경 & 프로젝트 구조

### 1.1 모노레포 디렉토리 구조

```
seniorlink/
├── apps/
│   ├── api/                          # NestJS 백엔드
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   └── decorators/
│   │   │   │       └── roles.decorator.ts
│   │   │   ├── seniors/
│   │   │   │   ├── seniors.module.ts
│   │   │   │   ├── seniors.controller.ts
│   │   │   │   ├── seniors.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── senior-profile.entity.ts
│   │   │   ├── companies/
│   │   │   │   ├── companies.module.ts
│   │   │   │   ├── companies.controller.ts
│   │   │   │   ├── companies.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── company-profile.entity.ts
│   │   │   ├── requests/
│   │   │   │   ├── requests.module.ts
│   │   │   │   ├── requests.controller.ts
│   │   │   │   ├── requests.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── tf-request.entity.ts
│   │   │   ├── matching/
│   │   │   │   ├── matching.module.ts
│   │   │   │   ├── matching.controller.ts
│   │   │   │   ├── matching.service.ts
│   │   │   │   └── matching.cache.ts
│   │   │   ├── proposals/
│   │   │   │   ├── proposals.module.ts
│   │   │   │   ├── proposals.controller.ts
│   │   │   │   ├── proposals.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── proposal.entity.ts
│   │   │   ├── contracts/
│   │   │   │   ├── contracts.module.ts
│   │   │   │   ├── contracts.controller.ts
│   │   │   │   ├── contracts.service.ts
│   │   │   │   ├── contract-pdf.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── contract.entity.ts
│   │   │   ├── settlements/
│   │   │   │   ├── settlements.module.ts
│   │   │   │   ├── settlements.controller.ts
│   │   │   │   ├── settlements.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── settlement.entity.ts
│   │   │   ├── reviews/
│   │   │   │   ├── reviews.module.ts
│   │   │   │   ├── reviews.controller.ts
│   │   │   │   ├── reviews.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── review.entity.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.module.ts
│   │   │   │   └── notifications.service.ts   # FCM 래퍼
│   │   │   ├── storage/
│   │   │   │   ├── storage.module.ts
│   │   │   │   └── storage.service.ts         # S3/MinIO 래퍼
│   │   │   ├── chat/
│   │   │   │   ├── chat.module.ts
│   │   │   │   ├── chat.gateway.ts            # Socket.IO
│   │   │   │   └── chat.service.ts
│   │   │   ├── common/
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   └── pipes/
│   │   │   │       └── validation.pipe.ts
│   │   │   ├── database/
│   │   │   │   ├── migrations/               # TypeORM 마이그레이션
│   │   │   │   └── seeds/                    # 더미 데이터 시드
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   ├── auth.e2e-spec.ts
│   │   │   └── matching.e2e-spec.ts
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── mobile/                       # React Native + Expo
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── auth/             # 로그인, 회원가입
│   │   │   │   ├── senior/           # 프로필, 제안함
│   │   │   │   ├── company/          # TF 요청, 매칭 결과
│   │   │   │   ├── contract/         # 계약서 확인
│   │   │   │   └── chat/             # 채팅
│   │   │   ├── components/           # 공통 UI 컴포넌트
│   │   │   ├── hooks/                # API 호출 훅
│   │   │   ├── store/                # Zustand 상태 관리
│   │   │   ├── api/                  # Axios 클라이언트
│   │   │   └── theme/                # 디자인 토큰
│   │   └── package.json
│   │
│   └── web/                          # Next.js 기업 대시보드
│       ├── src/
│       │   ├── app/                  # App Router
│       │   │   ├── dashboard/
│       │   │   ├── requests/
│       │   │   └── contracts/
│       │   ├── components/
│       │   ├── lib/
│       │   │   └── api.ts            # API 클라이언트
│       │   └── theme/
│       └── package.json
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json                      # 루트 워크스페이스
```

### 1.2 환경 변수 (`.env`)

```dotenv
# 애플리케이션
NODE_ENV=development
PORT=3000

# 데이터베이스
DATABASE_URL=postgresql://seniorlink:password@postgres:5432/seniorlink_db
DATABASE_SSL=false

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES=30d

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# 파일 스토리지 (개발: MinIO, 운영: S3)
STORAGE_TYPE=minio
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=seniorlink
S3_REGION=ap-northeast-2

# 토스 페이먼츠 (Sprint 6)
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
TOSS_ESCROW_CALLBACK_URL=https://api.seniorlink.co.kr/settlements/callback

# FCM (Sprint 4)
FCM_PROJECT_ID=seniorlink-firebase
FCM_SERVICE_ACCOUNT_KEY=./firebase-service-account.json

# 모니터링
SENTRY_DSN=
PROMETHEUS_PORT=9090
```

### 1.3 `docker-compose.yml` (개발 환경)

```yaml
version: '3.9'

services:
  api:
    build:
      context: ./apps/api
      target: development
    ports:
      - '3000:3000'
      - '9229:9229'   # Node.js 디버거
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    env_file: ./apps/api/.env
    depends_on:
      - postgres
      - redis
      - minio
    command: npm run start:dev

  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: seniorlink
      POSTGRES_PASSWORD: password
      POSTGRES_DB: seniorlink_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'   # MinIO 콘솔
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ':9001'

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## §2 데이터베이스 스키마 (DDL)

### 2.1 열거형 (ENUM) 정의

```sql
CREATE TYPE user_role AS ENUM ('senior', 'company', 'admin');
CREATE TYPE senior_status AS ENUM ('active', 'inactive', 'on_project');
CREATE TYPE request_status AS ENUM ('open', 'matching', 'in_progress', 'completed', 'cancelled');
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE contract_status AS ENUM ('draft', 'active', 'settlement_requested', 'completed', 'cancelled');
CREATE TYPE settlement_status AS ENUM ('pending', 'held', 'released', 'failed');
```

### 2.2 8개 핵심 테이블

```sql
-- 1. users (공통 인증 정보)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. senior_profiles
CREATE TABLE senior_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  fields           TEXT[] NOT NULL DEFAULT '{}',   -- 예: ['재무', '전략기획']
  experience_years INTEGER NOT NULL DEFAULT 0,
  keywords         TEXT[] NOT NULL DEFAULT '{}',   -- 기술/역량 키워드
  region           VARCHAR(50) NOT NULL,            -- 예: '서울', '전국'
  available_from   DATE,
  available_to     DATE,
  hourly_rate      INTEGER,                         -- 원/시간
  status           senior_status NOT NULL DEFAULT 'active',
  avatar_url       TEXT,
  summary          TEXT,                            -- 자기소개 (500자 이내)
  avg_rating       NUMERIC(3,2) DEFAULT 0.00,       -- 리뷰 평균 (역정규화)
  review_count     INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. company_profiles
CREATE TABLE company_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  industry    VARCHAR(100),
  size        VARCHAR(50),                -- 예: '50-200인'
  description TEXT,
  website     TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. tf_requests (TF 요청)
CREATE TABLE tf_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  field           VARCHAR(100) NOT NULL,   -- 주요 전문 분야 1개
  required_fields TEXT[] NOT NULL DEFAULT '{}',
  duration_weeks  INTEGER NOT NULL,
  budget_min      INTEGER,                 -- 원/주
  budget_max      INTEGER,
  goals           TEXT NOT NULL,
  region          VARCHAR(50) NOT NULL,
  status          request_status NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. proposals (매칭 제안)
CREATE TABLE proposals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID NOT NULL REFERENCES tf_requests(id) ON DELETE CASCADE,
  senior_id      UUID NOT NULL REFERENCES senior_profiles(id),
  fit_score      NUMERIC(5,4),             -- 0.0000 ~ 1.0000
  match_reasons  TEXT[] NOT NULL DEFAULT '{}',
  message        TEXT,                     -- 기업이 작성하는 제안 메시지 (1000자 이내)
  status         proposal_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, senior_id)            -- 동일 요청에 중복 제안 방지
);

-- 6. contracts (계약)
CREATE TABLE contracts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id    UUID NOT NULL UNIQUE REFERENCES proposals(id),
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  role_scope     TEXT NOT NULL,            -- 역할 및 업무 범위
  compensation   INTEGER NOT NULL,         -- 총 보수 (원)
  status         contract_status NOT NULL DEFAULT 'draft',
  pdf_url        TEXT,                     -- S3/MinIO 계약서 PDF 경로
  progress       INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. settlements (정산)
CREATE TABLE settlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id       UUID NOT NULL UNIQUE REFERENCES contracts(id),
  amount            INTEGER NOT NULL,
  status            settlement_status NOT NULL DEFAULT 'pending',
  toss_payment_key  VARCHAR(200),
  toss_order_id     VARCHAR(200),
  requested_at      TIMESTAMPTZ,
  held_at           TIMESTAMPTZ,
  released_at       TIMESTAMPTZ,
  failed_reason     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. reviews (리뷰 — 양방향: 기업→시니어, 시니어→기업)
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id  UUID NOT NULL REFERENCES contracts(id),
  reviewer_id  UUID NOT NULL REFERENCES users(id),
  reviewee_id  UUID NOT NULL REFERENCES users(id),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT CHECK (char_length(comment) BETWEEN 10 AND 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contract_id, reviewer_id)          -- 계약당 리뷰 1회
);
```

### 2.3 인덱스

```sql
-- 매칭 쿼리 최적화
CREATE INDEX idx_senior_profiles_status ON senior_profiles(status);
CREATE INDEX idx_senior_profiles_fields ON senior_profiles USING GIN(fields);
CREATE INDEX idx_senior_profiles_region ON senior_profiles(region);
CREATE INDEX idx_senior_profiles_available ON senior_profiles(available_from, available_to);

-- TF 요청 목록 조회 최적화
CREATE INDEX idx_tf_requests_company_id ON tf_requests(company_id);
CREATE INDEX idx_tf_requests_status ON tf_requests(status);
CREATE INDEX idx_tf_requests_field ON tf_requests(field);

-- 제안 & 계약 조회 최적화
CREATE INDEX idx_proposals_request_id ON proposals(request_id);
CREATE INDEX idx_proposals_senior_id ON proposals(senior_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- 리뷰 평균 집계 최적화
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
```

### 2.4 마이그레이션 전략

```bash
# TypeORM 마이그레이션 명령
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
npm run migration:revert  # 롤백
```

`package.json` 스크립트:

```json
{
  "scripts": {
    "migration:generate": "typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm migration:revert -d src/database/data-source.ts",
    "seed": "ts-node src/database/seeds/index.ts"
  }
}
```

---

## §3 API 요청/응답 스키마

### 3.1 공통 규칙

**기본 URL**: `https://api.seniorlink.co.kr/v1`

**인증**: `Authorization: Bearer {accessToken}` 헤더

**공통 에러 응답 형식**:

```json
{
  "statusCode": 401,
  "message": "인증이 필요합니다.",
  "error": "Unauthorized"
}
```

**HTTP 상태코드 매핑**:

| 코드 | 의미 | 사용 예시 |
| --- | --- | --- |
| 200 | 성공 | 조회, 수정 |
| 201 | 생성 성공 | 리소스 생성 |
| 400 | 잘못된 요청 | 유효성 검사 실패 |
| 401 | 인증 필요 | 토큰 없음/만료 |
| 403 | 권한 없음 | 역할 불일치 |
| 404 | 리소스 없음 | ID 조회 실패 |
| 409 | 중복 | 이메일 중복 가입 |
| 500 | 서버 오류 | 내부 에러 |

**페이지네이션 쿼리 파라미터**: `?page=1&limit=20`

**페이지네이션 응답 형식**:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 3.2 인증 API

#### `POST /auth/signup` — 회원가입

**요청**:

```json
{
  "email": "kim@example.com",
  "password": "SecurePass123!",
  "role": "senior",
  "name": "김영수"
}
```

**응답 201**:

```json
{
  "id": "uuid",
  "email": "kim@example.com",
  "role": "senior",
  "name": "김영수",
  "createdAt": "2026-03-01T09:00:00Z"
}
```

유효성 규칙: 이메일 형식 필수, 비밀번호 8자 이상 + 영문 + 숫자 + 특수문자, role은 `senior` 또는 `company`만 허용

---

#### `POST /auth/login` — 로그인

**요청**:

```json
{
  "email": "kim@example.com",
  "password": "SecurePass123!"
}
```

**응답 200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "kim@example.com",
    "role": "senior",
    "name": "김영수"
  }
}
```

---

#### `POST /auth/refresh` — 토큰 갱신

**요청**:

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiJ9..." }
```

**응답 200**: `{ "accessToken": "...", "refreshToken": "..." }`

Refresh Token Rotation 적용: 갱신 시 기존 Refresh Token 무효화, 신규 발급

---

### 3.3 시니어 프로필 API

#### `POST /seniors/profile` — 프로필 생성

**권한**: `senior` 역할만 가능

**요청**:

```json
{
  "fields": ["재무", "전략기획"],
  "experienceYears": 25,
  "keywords": ["M&A", "사업재편", "재무분석", "투자유치"],
  "region": "서울",
  "availableFrom": "2026-04-01",
  "availableTo": "2026-09-30",
  "hourlyRate": 80000,
  "summary": "대기업 CFO 출신으로 재무전략 및 투자유치 25년 경력..."
}
```

**응답 201**:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "fields": ["재무", "전략기획"],
  "experienceYears": 25,
  "keywords": ["M&A", "사업재편", "재무분석", "투자유치"],
  "region": "서울",
  "availableFrom": "2026-04-01",
  "availableTo": "2026-09-30",
  "hourlyRate": 80000,
  "status": "active",
  "avgRating": 0,
  "reviewCount": 0,
  "createdAt": "2026-03-01T09:00:00Z"
}
```

---

#### `GET /seniors/profile/:id` — 프로필 조회

**응답 200**:

```json
{
  "id": "uuid",
  "user": { "name": "김영수" },
  "fields": ["재무", "전략기획"],
  "experienceYears": 25,
  "keywords": ["M&A", "사업재편"],
  "region": "서울",
  "status": "active",
  "avgRating": 4.7,
  "reviewCount": 12,
  "recentReviews": [
    { "rating": 5, "comment": "전문성이 탁월하셨습니다.", "createdAt": "..." }
  ]
}
```

---

#### `PUT /seniors/profile/:id` — 프로필 수정

요청 본문: 생성 요청과 동일한 필드 (부분 수정 가능, PATCH 시맨틱으로 동작)

**응답 200**: 수정된 프로필 전체 반환

---

#### `PATCH /seniors/profile/:id/avatar` — 프로필 이미지 업로드

**요청**: `multipart/form-data`, 필드명 `file`

허용 형식: JPEG, PNG, WebP / 최대 5MB

**응답 200**: `{ "avatarUrl": "https://storage.seniorlink.co.kr/..." }`

---

### 3.4 TF 요청 API

#### `POST /requests` — TF 요청 생성

**권한**: `company` 역할만 가능

**요청**:

```json
{
  "title": "신사업 진출을 위한 시장 조사 TF",
  "field": "전략기획",
  "requiredFields": ["전략기획", "마케팅"],
  "durationWeeks": 8,
  "budgetMin": 500000,
  "budgetMax": 800000,
  "goals": "동남아시아 시장 진출 타당성 분석 및 진입 전략 수립",
  "region": "서울"
}
```

**응답 201**: 생성된 TF 요청 전체 + `status: "open"`

---

#### `GET /requests` — TF 요청 목록

**쿼리 파라미터**: `?page=1&limit=20&status=open&field=전략기획`

**응답 200**: 페이지네이션 형식, 본인 회사의 요청만 반환

---

#### `GET /requests/:id` — TF 요청 상세

**응답 200**: TF 요청 상세 + company 기본 정보

---

### 3.5 매칭 API

#### `GET /requests/:id/matches` — 매칭 결과 조회

**권한**: `company` 역할, 해당 요청의 소유사만 조회 가능

**응답 200**:

```json
{
  "requestId": "uuid",
  "seniors": [
    {
      "rank": 1,
      "fitScore": 0.8750,
      "matchReasons": [
        "전략기획 분야 완전 일치",
        "25년 경력으로 기준치 초과",
        "서울 지역 가용"
      ],
      "profile": {
        "id": "uuid",
        "name": "김영수",
        "fields": ["재무", "전략기획"],
        "experienceYears": 25,
        "keywords": ["M&A", "전략"],
        "avgRating": 4.7,
        "reviewCount": 12,
        "region": "서울",
        "hourlyRate": 80000
      }
    }
  ],
  "totalCandidates": 5,
  "cachedAt": "2026-03-01T09:00:00Z"
}
```

---

### 3.6 제안 API

#### `POST /requests/:id/proposals` — 제안 발송

**권한**: `company` 역할

**요청**:

```json
{
  "seniorId": "uuid",
  "message": "안녕하세요, 저희 회사의 전략기획 TF에 참여해 주실 수 있을지 제안드립니다..."
}
```

**응답 201**:

```json
{
  "id": "uuid",
  "requestId": "uuid",
  "seniorId": "uuid",
  "fitScore": 0.8750,
  "message": "...",
  "status": "pending",
  "createdAt": "..."
}
```

---

#### `GET /proposals/inbox` — 제안 수신함 (시니어용)

**권한**: `senior` 역할

**응답 200**: 페이지네이션 형식, 본인에게 온 제안 목록

---

#### `POST /proposals/:id/accept` — 제안 수락

**권한**: `senior` 역할 (해당 제안의 수신자만)

**응답 200**:

```json
{
  "proposal": { "id": "uuid", "status": "accepted" },
  "contract": {
    "id": "uuid",
    "status": "draft",
    "message": "계약서가 생성되었습니다. 내용을 확인하고 서명해주세요."
  }
}
```

계약 자동 생성 트리거: 수락 즉시 `contracts` 레코드 생성, 계약서 PDF Puppeteer 생성 (비동기)

---

#### `POST /proposals/:id/reject` — 제안 거절

**요청**: `{ "reason": "해당 기간에 다른 프로젝트가 있습니다." }` (선택)

**응답 200**: `{ "id": "uuid", "status": "rejected" }`

---

### 3.7 계약 API

#### `GET /contracts/:id` — 계약 상세

**응답 200**:

```json
{
  "id": "uuid",
  "proposalId": "uuid",
  "senior": { "name": "김영수", "id": "uuid" },
  "company": { "name": "ABC Corp", "id": "uuid" },
  "startDate": "2026-04-01",
  "endDate": "2026-05-31",
  "roleScope": "동남아 시장 조사 및 진출 전략 수립",
  "compensation": 6400000,
  "status": "active",
  "progress": 35,
  "pdfUrl": "https://storage.seniorlink.co.kr/contracts/uuid.pdf",
  "createdAt": "..."
}
```

---

#### `PUT /contracts/:id/progress` — 진행률 업데이트

**권한**: `senior` 역할 (해당 계약 참여자)

**요청**: `{ "progress": 65 }`

**응답 200**: 업데이트된 계약 정보

---

#### `POST /contracts/:id/settlement` — 정산 요청

**권한**: `senior` 역할

**요청**: `{ "accountNumber": "110-123-456789", "bankCode": "004" }` (선택, 최초 1회)

**응답 201**:

```json
{
  "settlementId": "uuid",
  "contractId": "uuid",
  "amount": 6400000,
  "status": "pending",
  "message": "정산 요청이 접수되었습니다. 기업 확인 후 처리됩니다."
}
```

---

#### `GET /contracts/:id/status` — 계약 상태 조회

**응답 200**: `{ "contractStatus": "active", "progress": 65, "settlementStatus": null }`

---

### 3.8 리뷰 API

#### `POST /contracts/:id/review` — 리뷰 작성

**권한**: `senior` 또는 `company` (계약 완료 상태에서만 가능)

**요청**:

```json
{
  "rating": 5,
  "comment": "전문성과 소통 능력이 탁월하셨습니다. 덕분에 프로젝트가 성공적으로 마무리되었습니다."
}
```

**응답 201**: `{ "id": "uuid", "rating": 5, "comment": "...", "createdAt": "..." }`

유효성 규칙: rating 1~5 정수, comment 10자 이상 500자 이하, 계약 완료 상태에서만 작성 가능

---

## §4 매칭 알고리즘 상세

### 4.1 전체 흐름

```
GET /requests/:id/matches 호출
  ↓
Redis 캐시 확인 (key: matches:request:{id}, TTL: 10분)
  ├─ 캐시 HIT → 캐시 반환
  └─ 캐시 MISS
       ↓
       1. Filter Stage: active 시니어 후보군 필터링 (SQL)
       ↓
       2. Scoring Stage: 각 후보에 fit_score 계산 (TypeScript)
       ↓
       3. Ranking Stage: fit_score 내림차순 정렬, 상위 10명
       ↓
       4. Redis 캐시 저장 (TTL: 600초)
       ↓
       응답 반환
```

### 4.2 Filter Stage (SQL WHERE 조건)

```sql
SELECT sp.*
FROM senior_profiles sp
WHERE
  sp.status = 'active'
  AND sp.available_from <= :requestStartEstimate
  AND (sp.available_to IS NULL OR sp.available_to >= :requestEndEstimate)
  AND (sp.region = :region OR sp.region = '전국')
  AND sp.fields && :requiredFields::text[]       -- 배열 교집합 연산
  AND (:budgetMin IS NULL OR sp.hourly_rate <= :budgetMax / :durationWeeks / 40)
```

`&&` PostgreSQL 배열 교집합 연산자: 하나라도 겹치면 통과

### 4.3 Scoring Stage (TypeScript)

```typescript
interface ScoringInput {
  senior: SeniorProfile;
  request: TfRequest;
}

function calculateFitScore(input: ScoringInput): number {
  const { senior, request } = input;

  // 1. 전문 분야 일치도 (30%)
  const fieldOverlap = senior.fields.filter(f => request.requiredFields.includes(f)).length;
  const fieldScore = Math.min(fieldOverlap / request.requiredFields.length, 1.0);

  // 2. 경력 적합도 (25%) — 요청 기간(주) * 0.5년을 최소 경력으로 가정
  const minExpected = request.durationWeeks * 0.5;
  const careerScore = Math.min(senior.experienceYears / (minExpected + 10), 1.0);

  // 3. 가용 기간 & 지역 일치 (25%)
  const regionScore = senior.region === request.region || senior.region === '전국' ? 1.0 : 0.3;
  const availScore = isFullyAvailable(senior, request) ? 1.0 : 0.5;
  const availRegionScore = (regionScore + availScore) / 2;

  // 4. 과거 프로젝트 성과 (20%) — 리뷰 평균 5점 만점 → 1.0 정규화
  const reviewScore = senior.reviewCount > 0 ? senior.avgRating / 5.0 : 0.5; // 첫 프로젝트는 0.5 기본값

  const fitScore =
    fieldScore * 0.30 +
    careerScore * 0.25 +
    availRegionScore * 0.25 +
    reviewScore * 0.20;

  return Math.round(fitScore * 10000) / 10000; // 소수점 4자리
}

function buildMatchReasons(senior: SeniorProfile, request: TfRequest, fitScore: number): string[] {
  const reasons: string[] = [];
  const overlap = senior.fields.filter(f => request.requiredFields.includes(f));
  if (overlap.length === request.requiredFields.length) reasons.push('전문 분야 완전 일치');
  else if (overlap.length > 0) reasons.push(`${overlap.join(', ')} 분야 부분 일치`);
  if (senior.experienceYears >= 20) reasons.push(`${senior.experienceYears}년 경력 보유`);
  if (senior.region === request.region) reasons.push(`${request.region} 지역 근무 가능`);
  if (senior.avgRating >= 4.5) reasons.push(`평점 ${senior.avgRating}/5.0 우수`);
  return reasons;
}
```

### 4.4 Redis 캐싱 전략

| 항목 | 값 |
| --- | --- |
| Key 형식 | `matches:request:{requestId}` |
| TTL | 600초 (10분) |
| 무효화 조건 | 해당 request 수정, 시니어 프로필 상태 변경 |
| 저장 데이터 | 상위 10명 매칭 결과 전체 (JSON 직렬화) |
| 캐시 히트 표시 | 응답에 `cachedAt` 타임스탬프 포함 |

무효화 시점 (`cache.del('matches:request:{id}')`):
- `PUT /requests/:id` 호출 시
- `PATCH /seniors/profile/:id/status` 호출 시 (시니어 상태 변경)

---

## §5 상태 머신

### 5.1 Proposal 상태 전이

```
                      [기업: 제안 발송]
                            │
                            ▼
                         pending
                        ╱       ╲
     [시니어: 수락]   ╱           ╲  [시니어: 거절]
                    ╱               ╲
                accepted           rejected
                    │
         (자동: 계약 생성 트리거)

        * pending 상태에서 [기업: 철회] → withdrawn
```

| 상태 | 허용 전이 | 트리거 | 권한 |
| --- | --- | --- | --- |
| `pending` | → `accepted` | `POST /proposals/:id/accept` | senior |
| `pending` | → `rejected` | `POST /proposals/:id/reject` | senior |
| `pending` | → `withdrawn` | `POST /proposals/:id/withdraw` | company |
| `accepted` | (종료 상태) | — | — |
| `rejected` | (종료 상태) | — | — |

---

### 5.2 Contract 상태 전이

```
         [제안 수락 시 자동 생성]
                    │
                    ▼
                  draft
                    │ [양측 확인]
                    ▼
                 active  ──────────────────────┐
                    │ [시니어: 정산 요청]       │ [기업: 계약 취소]
                    ▼                          ▼
         settlement_requested             cancelled
                    │ [기업: 승인]
                    ▼
                completed
```

| 전이 | 트리거 | 권한 |
| --- | --- | --- |
| `draft` → `active` | `POST /contracts/:id/confirm` | 양측 모두 |
| `active` → `settlement_requested` | `POST /contracts/:id/settlement` | senior |
| `settlement_requested` → `completed` | Toss 에스크로 지급 완료 콜백 | system |
| `active` → `cancelled` | `POST /contracts/:id/cancel` | company or admin |

---

### 5.3 Settlement 상태 전이

```
    [정산 요청 생성 시]
           │
           ▼
         pending
           │ [Toss 에스크로 선불 입금 확인]
           ▼
          held  ──────────┐
           │ [프로젝트 완료 + 기업 승인]  │ [결제 오류]
           ▼              ▼
        released        failed
```

| 전이 | 트리거 | 설명 |
| --- | --- | --- |
| `pending` → `held` | Toss 웹훅 `payment.done` | 기업 에스크로 입금 확인 |
| `held` → `released` | 기업 승인 → Toss 정산 API 호출 | 시니어 계좌 입금 |
| `held` → `failed` | Toss 웹훅 `payment.fail` | 결제 오류 처리 |

---

## §6 스프린트별 구현 체크리스트 (상세)

### Sprint 1 (M3): 기반 & 인증

**백엔드 구현 순서**

1. `nest new api --strict` → 모듈 스캐폴딩
2. TypeORM + pg 드라이버 설치, `data-source.ts` 설정
3. `§2.1` ENUM DDL 실행, `§2.2` 테이블 DDL 실행
4. `users` 엔티티 + 마이그레이션 파일 생성
5. `AuthModule`: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`
   - `passport-jwt` 전략 2개 (access / refresh)
   - `JwtAuthGuard`, `RolesGuard`, `@Roles()` 데코레이터
   - bcrypt 해싱 (`saltRounds: 12`)
6. 글로벌 `ValidationPipe`, `HttpExceptionFilter`, `TransformInterceptor` 등록

**프론트엔드 구현 순서**

7. `npx create-expo-app mobile --template blank-typescript`
8. `npx create-next-app web --typescript --app`
9. 디자인 토큰 `theme/colors.ts`, `theme/typography.ts` 파일 생성 (DESIGN.md 기준)
10. 로그인 화면, 회원가입 화면 (역할 선택 → 정보 입력)
11. JWT 저장: React Native는 `expo-secure-store`, Next.js는 HttpOnly 쿠키

**인프라 구현 순서**

12. VPS: Docker 설치, `docker-compose.yml` 실행
13. Let's Encrypt SSL (`certbot --nginx`)
14. GitHub Actions `deploy.yml`: `develop` 브랜치 push → SSH → `docker compose up -d`

**Sprint 1 완료 기준**

- [ ] `POST /auth/signup` 호출 시 DB `users` 테이블에 레코드 생성 확인
- [ ] `POST /auth/login` 호출 시 accessToken/refreshToken 반환 확인
- [ ] `Authorization: Bearer {token}` 없이 보호 라우트 접근 시 401 반환
- [ ] 모바일 앱 로그인 화면에서 실제 API 연동 후 토큰 저장 성공
- [ ] VPS에서 `curl https://api.seniorlink.co.kr/auth/login` 응답 확인

---

### Sprint 2 (M4): 프로필 & TF 요청

**백엔드**

1. `SeniorProfilesModule`: `§3.3` 전체 API 구현 + 파일 업로드 미들웨어
2. `CompanyProfilesModule`: 기업 프로필 CRUD
3. `RequestsModule`: `§3.4` 전체 API 구현
4. `StorageModule`: MinIO SDK 연동, `upload(file)` → URL 반환 메서드

**프론트엔드**

5. 시니어 프로필 등록 화면 (4단계 스텝: 분야 → 경력 → 기술 태그 → 가용 기간)
6. 기업 TF 요청 생성 화면
7. `Chip` 컴포넌트 (DESIGN.md 칩 스펙 적용: 알약형, Navy 틴트)

**Sprint 2 완료 기준**

- [ ] 시니어 프로필 생성/조회/수정 API 정상 동작
- [ ] 프로필 이미지 업로드 → MinIO 저장 → URL 반환 확인
- [ ] 기업 TF 요청 생성/조회 API 정상 동작
- [ ] 접근성: 모든 입력 필드 레이블 항상 표시, 버튼 높이 ≥ 56px

---

### Sprint 3 (M5): 매칭 엔진 v1

**백엔드**

1. `MatchingModule`: `MatchingService` 구현
   - `filter(requestId): Promise<SeniorProfile[]>` — `§4.2` SQL 쿼리
   - `score(seniors, request): ScoredSenior[]` — `§4.3` 계산 함수
   - `getMatches(requestId)` — 캐시 확인 → filter → score → rank → 캐시 저장
2. Redis `ioredis` 클라이언트 설정, `MatchingCacheService` 래퍼
3. `GET /requests/:id/matches` 엔드포인트

**단위 테스트 작성** (Jest)

```typescript
describe('MatchingService', () => {
  it('전문 분야 완전 일치 시 fieldScore가 1.0이어야 한다');
  it('리뷰 없는 첫 시니어의 reviewScore는 0.5여야 한다');
  it('지역 불일치 시 regionScore는 0.3이어야 한다');
  it('fit_score가 내림차순 정렬되어야 한다');
  it('Redis 캐시 히트 시 DB 쿼리가 실행되지 않아야 한다');
});
```

**Sprint 3 완료 기준**

- [ ] 시니어 20명 더미 데이터 seed 후 매칭 결과 반환 확인
- [ ] 매칭 알고리즘 단위 테스트 커버리지 80% 이상
- [ ] Redis 캐시 TTL 후 재조회 시 DB 쿼리 발생 확인
- [ ] `GET /requests/:id/matches` 응답 시간 500ms 이하

---

### Sprint 4 (M6): 제안 플로우

**백엔드**

1. `ProposalsModule`: `§3.6` 전체 API 구현
2. `POST /proposals/:id/accept` 시 `ContractsModule.createFromProposal()` 호출
3. `NotificationsModule`: Firebase Admin SDK 연동
   - 제안 수신 시 시니어에게 FCM 푸시

**FCM 메시지 페이로드**:

```json
{
  "notification": {
    "title": "새로운 TF 참여 제안이 도착했습니다",
    "body": "ABC Corp에서 '신사업 전략기획 TF'에 참여를 제안했습니다."
  },
  "data": {
    "type": "proposal",
    "proposalId": "uuid",
    "screen": "ProposalDetail"
  }
}
```

**프론트엔드**

4. 기업: 추천 전문가 카드 → 제안 메시지 작성 → 발송 화면
5. 시니어: 제안 수신함 (프로젝트 내용 + 수락/거절 버튼)
6. 제안 상태 뱃지 컴포넌트 (`pending` / `accepted` / `rejected` 색상 구분)

**Sprint 4 완료 기준**

- [ ] 제안 발송 후 시니어 앱 FCM 푸시 수신 확인
- [ ] 수락 클릭 → 제안 `accepted` → 계약 레코드 자동 생성 확인
- [ ] 거절 시 제안 `rejected` 상태 변경 + UI 반영 확인

---

### Sprint 5 (M7): 계약 & 채팅

**백엔드**

1. `ContractsModule`: 계약 생성, 조회, 진행률 업데이트 API
2. `ContractPdfService`: Puppeteer 기반 PDF 생성
   - HTML 템플릿: 계약 당사자, 기간, 역할, 보수, 정산 조건 포함
   - 생성된 PDF → MinIO 저장 → `contracts.pdf_url` 업데이트
3. `ChatModule` (Socket.IO):
   - `@SubscribeMessage('join')`: `contract:{id}` 룸 입장
   - `@SubscribeMessage('message')`: 메시지 Redis Pub/Sub 브로드캐스트
   - 메시지 PostgreSQL `chat_messages` 테이블 영속화 (Sprint 5에서 추가)

**`chat_messages` 테이블** (Sprint 5 추가):

```sql
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  sender_id   UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL CHECK (char_length(content) <= 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_contract ON chat_messages(contract_id, created_at DESC);
```

**Sprint 5 완료 기준**

- [ ] 제안 수락 후 계약서 PDF MinIO에 저장 + URL 반환 확인
- [ ] 채팅: 브라우저 2개 탭에서 실시간 메시지 주고받기 확인
- [ ] PDF 생성 ~ MinIO 저장 소요 시간 5초 이하

---

### Sprint 6 (M8): 정산 & QA

**백엔드**

1. `SettlementsModule`: `§3.7` 정산 API 구현
2. Toss Payments 에스크로 연동:
   - 선불 결제: 기업 → Toss `POST /v1/payments/confirm`
   - 웹훅 수신: `POST /settlements/webhook` → 상태 업데이트
   - 정산 승인: `POST /v1/settlements/confirm`
3. `ReviewsModule`: `§3.8` 리뷰 API 구현
   - 리뷰 작성 후 `senior_profiles.avg_rating`, `review_count` 업데이트
4. `PUT /contracts/:id/progress` API

**통합 테스트 시나리오** (Supertest):

```typescript
it('전체 플로우: signup → profile → request → match → proposal → contract → settlement → review', async () => {
  const { seniorToken } = await signupSenior();
  const { companyToken } = await signupCompany();
  await createSeniorProfile(seniorToken);
  const { requestId } = await createTfRequest(companyToken);
  const { seniors } = await getMatches(companyToken, requestId);
  const { proposalId } = await sendProposal(companyToken, requestId, seniors[0].id);
  const { contractId } = await acceptProposal(seniorToken, proposalId);
  await updateProgress(seniorToken, contractId, 100);
  await requestSettlement(seniorToken, contractId);
  await writeReview(companyToken, contractId, 5, '탁월한 전문성이었습니다.');
  // 계약 completed, 리뷰 2건 (양방향), 시니어 avg_rating 업데이트 검증
});
```

**프론트엔드**

5. 진행 관리 화면 (진행률 바 + 정산 요청 버튼)
6. 완료 후 리뷰 화면 (별점 + 코멘트)
7. 기업 대시보드 (진행 중 프로젝트 카드, 정산 내역)

**접근성 감사**

- 모든 화면 폰트 최소 16px 확인
- 터치 영역 44×44px 이상 확인
- WCAG AA 색 대비율 확인 (Navy `#002444` on white: 14.7:1 통과)

**Sprint 6 완료 기준**

- [ ] 통합 테스트 전체 플로우 PASS
- [ ] Toss 에스크로 테스트 결제 정상 처리 (테스트 키 사용)
- [ ] VPS 프로덕션 서버 핵심 기능 전체 동작
- [ ] MVP 완료 체크리스트 (5개 항목) 모두 통과

---

## §7 테스트 전략

### 7.1 단위 테스트 (Jest)

| 대상 | 핵심 테스트 케이스 | 목표 커버리지 |
| --- | --- | --- |
| `MatchingService` | 스코어링 계산, 필터 로직, 캐시 히트/미스 | 80%+ |
| `AuthService` | JWT 발급, bcrypt 검증, Refresh 로테이션 | 90%+ |
| `ContractsService` | 상태 전이 유효성, PDF 생성 트리거 | 75%+ |
| `SettlementsService` | 에스크로 상태 머신, 웹훅 처리 | 75%+ |

### 7.2 통합 테스트 (Supertest + 실제 DB)

테스트 DB: `seniorlink_test` (CI에서 별도 컨테이너)

각 테스트 전 `beforeEach: truncate tables` + `afterAll: drop schema`

핵심 시나리오: Sprint 6 완료 기준의 전체 플로우 (§6 Sprint 6 참고)

### 7.3 더미 데이터 Seed Script

`src/database/seeds/index.ts` 실행 내용:
- 시니어 20명 (다양한 분야: 재무 5, 전략 5, HR 5, IT 5)
- 기업 5개 (다양한 규모)
- TF 요청 10건 (status: open 7개, matching 3개)
- 이미 완료된 계약 3건 + 리뷰 6건 (양방향)

---

## §8 인프라 설정

### 8.1 프로덕션 `docker-compose.prod.yml`

```yaml
version: '3.9'

services:
  api:
    image: ghcr.io/seniorlink/api:latest
    restart: unless-stopped
    env_file: /etc/seniorlink/.env
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    env_file: /etc/seniorlink/postgres.env
    volumes:
      - /data/postgres:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - /data/redis:/data
    command: redis-server --save 60 1 --loglevel warning

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /etc/nginx/conf.d:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt
```

### 8.2 Nginx 설정 (`/etc/nginx/conf.d/seniorlink.conf`)

```nginx
server {
    listen 443 ssl;
    server_name api.seniorlink.co.kr;

    ssl_certificate     /etc/letsencrypt/live/api.seniorlink.co.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seniorlink.co.kr/privkey.pem;

    # API 요청
    location / {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 30s;
    }

    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://api:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}

server {
    listen 80;
    server_name api.seniorlink.co.kr;
    return 301 https://$host$request_uri;
}
```

### 8.3 GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to VPS

on:
  push:
    branches: [develop]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run Tests
        run: |
          cd apps/api
          npm ci
          npm run test:cov

      - name: Build Docker Image
        run: |
          docker build -t ghcr.io/seniorlink/api:${{ github.sha }} apps/api
          docker tag ghcr.io/seniorlink/api:${{ github.sha }} ghcr.io/seniorlink/api:latest

      - name: Push to GHCR
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/seniorlink/api:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            docker compose -f /srv/seniorlink/docker-compose.prod.yml pull api
            docker compose -f /srv/seniorlink/docker-compose.prod.yml up -d api
            docker compose -f /srv/seniorlink/docker-compose.prod.yml exec api npm run migration:run
```

### 8.4 Prometheus 모니터링 지표

`@willsoto/nestjs-prometheus` 패키지 사용

| 지표 이름 | 타입 | 설명 |
| --- | --- | --- |
| `http_requests_total` | Counter | HTTP 요청 수 (method, route, status_code 레이블) |
| `http_request_duration_seconds` | Histogram | API 응답 시간 (P50, P95, P99) |
| `matching_score_duration_ms` | Histogram | 매칭 알고리즘 수행 시간 |
| `redis_cache_hits_total` | Counter | Redis 캐시 히트 수 |
| `redis_cache_misses_total` | Counter | Redis 캐시 미스 수 |
| `active_contracts_total` | Gauge | 현재 진행 중인 계약 수 |
| `db_connections_active` | Gauge | PostgreSQL 활성 연결 수 |

Grafana 알림 설정: P95 응답 시간 > 1000ms, 에러율 > 1% 시 Slack 알림

---

> **다음 단계**: Phase 1 MVP 완료 후 `seniorlink-beta-test-scenarios.md`의 5개 시나리오를 기반으로 Phase 2 클로즈드 베타를 진행합니다.
