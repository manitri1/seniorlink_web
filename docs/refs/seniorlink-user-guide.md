# 시니어링크 사용자 가이드

> 버전 1.0 · Phase 1 MVP · 최종 수정 2026-05-13

---

## 목차

1. [서비스 소개](#1-서비스-소개)
2. [회원가입 & 로그인](#2-회원가입--로그인)
3. [시니어 전문가 가이드](#3-시니어-전문가-가이드)
   - 3.1 프로필 등록
   - 3.2 제안 수신함
   - 3.3 제안 수락 & 거절
   - 3.4 계약 진행 & 채팅
   - 3.5 리뷰 작성
4. [기업 담당자 가이드](#4-기업-담당자-가이드)
   - 4.1 기업 프로필 등록
   - 4.2 TF 요청 작성
   - 4.3 AI 매칭 결과 확인
   - 4.4 제안 발송 & 관리
   - 4.5 계약 활성화 & 진행 관리
   - 4.6 정산 처리
   - 4.7 리뷰 작성
5. [공통 기능](#5-공통-기능)
6. [자주 묻는 질문(FAQ)](#6-자주-묻는-질문faq)
7. [개발 환경 실행 방법](#7-개발-환경-실행-방법)
   - 7.1 사전 준비
   - 7.2 백엔드 API (NestJS)
   - 7.3 웹 앱 (Next.js)
   - 7.4 모바일 앱 (React Native / Expo)
   - 7.5 전체 스택 Docker 실행

---

## 1. 서비스 소개

**시니어링크**는 퇴직 시니어 전문가와 단기 TF(Task Force)가 필요한 기업을 AI로 정밀 매칭하는 플랫폼입니다.

| 역할 | 설명 |
|---|---|
| **시니어 전문가** | 재무·전략·HR·마케팅·IT 등 분야의 전직 임원·팀장 |
| **기업 담당자** | 단기 외부 전문가가 필요한 기업의 담당 임직원 |

### 핵심 플로우

```
기업                              시니어
  │                                 │
  ├── TF 요청 작성                   │
  │                                 │
  ├── AI 매칭 결과 확인              │
  │      └─ 적합도 점수 기반 추천    │
  │                                 │
  ├── 제안 발송 ─────────────────▶ 제안 수신
  │                                 │
  │                        수락 또는 거절
  │                                 │
  ◀──────────── 계약 자동 생성 ──────┤
  │                                 │
  ├── 계약 활성화 & 진행 관리         │
  │                       채팅 소통  │
  │                                 │
  ├── 정산 요청 (에스크로) ──────▶ 보수 수령
  │                                 │
  └── 리뷰 작성 ◀──────────────── 리뷰 작성
```

---

## 2. 회원가입 & 로그인

### 2.1 회원가입

**모바일 앱 기준**

1. 앱 실행 후 **\[시작하기\]** 탭
2. 역할 선택: **시니어 전문가** 또는 **기업 담당자**
3. 이름, 이메일, 비밀번호 입력

   > **비밀번호 규칙**: 8자 이상, 영문 대소문자 + 숫자 + 특수문자 포함  
   > 예: `SeniorLink1!`

4. **\[회원가입\]** 버튼 탭

**API (개발자용)**

```http
POST /v1/auth/signup
Content-Type: application/json

{
  "email": "kim@example.com",
  "password": "SeniorLink1!",
  "role": "senior",          // "senior" 또는 "company"
  "name": "김철수"
}
```

응답 예시:
```json
{
  "id": "a1b2c3d4-...",
  "email": "kim@example.com",
  "role": "senior",
  "name": "김철수",
  "createdAt": "2026-02-01T09:00:00Z"
}
```

---

### 2.2 로그인

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "kim@example.com",
  "password": "SeniorLink1!"
}
```

응답:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "...", "role": "senior", "name": "김철수" }
}
```

- `accessToken`: 15분 유효 · 모든 API 요청 헤더에 포함
- `refreshToken`: 30일 유효 · 토큰 갱신 시 사용

---

### 2.3 토큰 갱신

`accessToken` 만료(401 응답) 시 자동으로 갱신됩니다. 앱이 자동 처리하므로 별도 조작이 불필요합니다.

수동 갱신이 필요한 경우:
```http
POST /v1/auth/refresh

{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

---

## 3. 시니어 전문가 가이드

### 3.1 프로필 등록

프로필이 완성도 높을수록 기업으로부터 더 많은 제안을 받을 수 있습니다.

#### 3.1.1 프로필 작성 화면 (모바일 4단계 스텝)

**Step 1 — 전문 분야 선택**

최대 5개까지 선택 가능합니다. 실제 경험이 있는 분야를 선택하세요.

| 분야 | 예시 직무 |
|---|---|
| 재무 | CFO, 재무팀장, 경리부장 |
| 전략기획 | 전략기획실장, 경영기획 |
| HR/인사 | CHO, 인사팀장, HRD |
| 마케팅 | CMO, 브랜드 매니저 |
| IT/기술 | CTO, 개발팀장, IT 기획 |
| 영업/BD | 영업본부장, 사업개발 |
| 법무/컴플라이언스 | 법무팀장, 준법감시인 |
| 생산/SCM | 공장장, 물류팀장 |

**Step 2 — 경력 & 키워드**

- **경력 연수**: 실제 업무 경험 연수 (예: `25`)
- **키워드**: 구체적 전문 역량 최대 20개 (예: `M&A`, `재무전략`, `원가절감`, `IPO`)
  - 키워드가 구체적일수록 AI 매칭 정확도가 높아집니다

**Step 3 — 지역**

| 선택 | 설명 |
|---|---|
| 서울 / 경기 / 부산 등 | 해당 지역 TF만 매칭 |
| **전국** | 지역 제한 없이 전국 TF 매칭 (온라인 작업 가능 시 권장) |

**Step 4 — 가용 기간 & 희망 단가**

- **가용 시작일**: 프로젝트 시작 가능한 날짜 (예: `2026-03-01`)
- **가용 종료일**: 가용 가능한 마지막 날짜 (예: `2026-12-31`)
- **희망 단가**: 시간당 희망 보수 (원 단위, 예: `200000`)
- **소개글**: 500자 이내 자기소개 (선택)

#### 3.1.2 API 예시

```http
POST /v1/seniors/profile
Authorization: Bearer {accessToken}

{
  "fields": ["재무", "전략기획"],
  "experienceYears": 25,
  "keywords": ["CFO", "M&A", "재무전략", "원가절감", "IPO"],
  "region": "서울",
  "availableFrom": "2026-03-01",
  "availableTo": "2026-12-31",
  "hourlyRate": 200000,
  "summary": "대기업 CFO 출신 25년 재무전략 전문가. M&A 자문 10건, Series B 이상 투자 유치 3건."
}
```

#### 3.1.3 프로필 수정

등록 후 언제든 수정 가능합니다. 활동 중인 프로젝트가 있더라도 수정할 수 있습니다.

```http
PUT /v1/seniors/profile/{profileId}
Authorization: Bearer {accessToken}

{
  "hourlyRate": 250000,
  "region": "전국",
  "status": "inactive"    // "active" | "inactive" | "on_project"
}
```

**상태(status) 안내**

| 상태 | 의미 |
|---|---|
| `active` | 제안 수신 가능 (기본값) |
| `inactive` | 잠시 활동 중단 (제안 매칭에서 제외) |
| `on_project` | 현재 프로젝트 진행 중 |

#### 3.1.4 아바타 사진 업로드

- 지원 형식: JPG, PNG, WEBP
- 최대 크기: 5MB
- 권장: 정면 얼굴 사진, 전문적인 이미지

```http
PATCH /v1/seniors/profile/{profileId}/avatar
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

avatar: (파일)
```

---

### 3.2 제안 수신함

기업이 제안을 발송하면 앱 푸시 알림과 수신함에서 확인할 수 있습니다.

**수신함 목록 조회**

```http
GET /v1/proposals/inbox?page=1&limit=20
Authorization: Bearer {accessToken}
```

응답 예시:
```json
{
  "data": [
    {
      "id": "e1b2...",
      "status": "pending",
      "fitScore": 0.87,
      "message": "안녕하세요 김철수 CFO님...",
      "createdAt": "2026-02-10T10:00:00Z",
      "request": {
        "title": "AI SaaS 사업 재무전략 수립 TF",
        "field": "재무",
        "durationWeeks": 12,
        "region": "서울",
        "company": { "name": "(주)그로스파트너스" }
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

**제안 카드에서 확인할 정보**

| 항목 | 설명 |
|---|---|
| 기업명 | 제안한 기업 |
| TF 프로젝트명 | 참여할 TF 내용 |
| 분야 / 기간 / 지역 | 분야·기간(주)·활동 지역 |
| 매칭 적합도 | AI가 계산한 적합도 점수 (예: 87%) |
| 제안 메시지 | 기업 담당자의 개별 메시지 |
| 상태 배지 | 검토 중 / 수락됨 / 거절됨 / 철회됨 |

---

### 3.3 제안 수락 & 거절

#### 수락

```http
POST /v1/proposals/{proposalId}/accept
Authorization: Bearer {accessToken}
```

> **수락 시 자동으로 진행되는 일**
> 1. 제안 상태 → `accepted`
> 2. 계약서(초안, `draft` 상태) 자동 생성
> 3. 기업 담당자에게 알림 발송

응답 예시:
```json
{
  "proposal": { "id": "e1b2...", "status": "accepted" },
  "contract": {
    "id": "f1b2...",
    "startDate": "2026-02-15",
    "endDate": "2026-05-15",
    "compensation": 96000000,
    "status": "draft"
  }
}
```

#### 거절

거절 시 선택적으로 이유를 남길 수 있습니다(로깅용).

```http
POST /v1/proposals/{proposalId}/reject
Authorization: Bearer {accessToken}

{ "reason": "해당 기간에 다른 프로젝트가 예정되어 있습니다." }
```

> **주의**: 수락 또는 거절한 제안은 되돌릴 수 없습니다.

---

### 3.4 계약 진행 & 채팅

#### 계약 내용 확인

```http
GET /v1/contracts/{contractId}
Authorization: Bearer {accessToken}
```

계약서에 포함된 내용:

| 항목 | 예시 |
|---|---|
| 시작일 / 종료일 | 2026-02-15 ~ 2026-05-15 |
| 역할 및 범위 | TF 요청의 목표(goals)가 그대로 기재 |
| 총 보수 | ₩96,000,000 (예산 상한 × 기간(주)) |
| 진행률 | 0~100% |
| 계약서 PDF | 생성 후 URL 제공 |

#### 실시간 채팅

계약이 `active` 상태가 되면 기업 담당자와 채팅이 가능합니다.

- 채팅은 WebSocket(Socket.IO) 기반 실시간 통신
- 채팅 이력은 영구 저장되어 재접속 시 이전 메시지 확인 가능
- 500자 이내로 메시지 전송

---

### 3.5 리뷰 작성

계약이 완료된 후 기업에 대한 리뷰를 남길 수 있습니다.

```http
POST /v1/contracts/{contractId}/review
Authorization: Bearer {accessToken}

{
  "rating": 4,
  "comment": "기업 측의 소통이 원활하고 계약 조건도 명확했습니다. 다음에도 함께하고 싶습니다."
}
```

| 항목 | 규칙 |
|---|---|
| 평점 | 1~5점 (정수) |
| 코멘트 | 10~500자 (선택) |
| 작성 가능 시점 | 계약 상태가 `completed`인 경우만 |
| 중복 작성 | 계약 1건당 1회만 가능 |

---

## 4. 기업 담당자 가이드

### 4.1 기업 프로필 등록

TF 요청을 작성하기 전에 기업 프로필이 필요합니다.

```http
POST /v1/companies/profile
Authorization: Bearer {accessToken}

{
  "name": "(주)그로스파트너스",
  "industry": "IT서비스",
  "size": "중소기업(50~100인)",
  "description": "AI 기반 B2B SaaS 기업. 시리즈A 투자 유치 완료.",
  "website": "https://growthpartners.kr"
}
```

---

### 4.2 TF 요청 작성

효과적인 TF 요청은 AI 매칭 정확도와 시니어 전문가의 관심도를 높입니다.

```http
POST /v1/requests
Authorization: Bearer {accessToken}

{
  "title": "AI SaaS 사업 재무전략 수립 TF",
  "field": "재무",
  "requiredFields": ["재무", "전략기획"],
  "durationWeeks": 12,
  "budgetMin": 5000000,
  "budgetMax": 8000000,
  "goals": "AI 기반 SaaS 서비스의 Series B 투자 유치를 위한 재무 모델 수립, 투자자 IR 자료 작성, 비용 구조 최적화 방안 도출.",
  "region": "서울"
}
```

#### TF 요청 작성 팁

**title (제목)**
- 목적이 명확하게 드러나도록 작성
- 좋은 예: `AI SaaS 사업 재무전략 수립 TF`
- 나쁜 예: `재무 TF 구함`

**requiredFields (필요 분야)**
- 실제로 필요한 분야만 선택 (최대 5개)
- 분야가 많을수록 매칭 후보군이 넓어지지만 정밀도 감소
- 핵심 분야 1~2개 + 보조 분야 조합 권장

**goals (목표)**
- 10자 이상, 2,000자 이내
- 구체적인 기대 결과물, 마일스톤, 필요 역량 기술
- AI 스코어링의 목표 유사도 계산에 사용됨

**budgetMin / budgetMax (예산)**
- 주(週) 단위 보수로 입력
- 실제 계약 보수 = `budgetMax × durationWeeks`
- 예산 범위를 현실적으로 설정할수록 지원율 향상

---

### 4.3 AI 매칭 결과 확인

TF 요청 작성 후 AI 매칭 결과를 확인할 수 있습니다.

```http
GET /v1/requests/{requestId}/matches
Authorization: Bearer {accessToken}
```

응답 예시:
```json
{
  "requestId": "d1b2...",
  "seniors": [
    {
      "rank": 1,
      "fitScore": 0.87,
      "matchReasons": [
        "필요 전문 분야 완전 일치",
        "25년 풍부한 경력",
        "평점 4.8 검증된 전문가"
      ],
      "scoreBreakdown": {
        "fieldScore": 1.0,
        "careerScore": 0.95,
        "availRegionScore": 0.90,
        "reviewScore": 0.96
      },
      "profile": {
        "id": "b1b2...",
        "fields": ["재무", "전략기획"],
        "experienceYears": 25,
        "region": "서울",
        "avgRating": 4.8,
        "reviewCount": 12
      }
    }
  ]
}
```

#### 적합도 점수(fitScore) 해석

| 점수 범위 | 등급 | 의미 |
|---|---|---|
| **85% 이상** | ★ 최적 | 모든 조건에서 탁월하게 부합 |
| 70~84% | 적합 | 주요 조건 부합, 일부 차이 있음 |
| 55~69% | 보통 | 참고 후 판단 권장 |
| 55% 미만 | 낮음 | 조건 불일치 다수 |

#### 점수 구성 요소

| 항목 | 비중 | 설명 |
|---|---|---|
| 전문 분야 일치 | 30% | 필요 분야와 시니어 분야의 겹침 비율 |
| 경력 적합도 | 25% | 경력 연수 vs. 프로젝트 기간·복잡도 |
| 가용성 & 지역 | 25% | 기간·지역 매칭 여부 |
| 리뷰 평점 | 20% | 과거 프로젝트 평균 평점 (신규는 0.5 기본) |

> 매칭 결과는 Redis 캐시로 10분간 저장됩니다. 시니어 프로필 변경 또는 제안 수락 시 자동으로 초기화됩니다.

---

### 4.4 제안 발송 & 관리

#### 제안 발송

매칭 결과에서 원하는 시니어 전문가를 선택해 제안을 발송합니다.

```http
POST /v1/requests/{requestId}/proposals
Authorization: Bearer {accessToken}

{
  "seniorId": "b1b2...",
  "message": "안녕하세요 김철수 CFO님, 저희 그로스파트너스에서 Series B 재무전략 TF에 참여해 주실 것을 제안드립니다. 귀하의 M&A 자문 경험이 꼭 필요합니다."
}
```

- 동일한 시니어에게 중복 제안 발송 불가
- 메시지는 최대 1,000자

#### 발송 제안 목록 조회

```http
GET /v1/requests/{requestId}/proposals
Authorization: Bearer {accessToken}
```

#### 제안 철회

시니어가 수락·거절하기 전(`pending` 상태)에만 철회 가능합니다.

```http
POST /v1/proposals/{proposalId}/withdraw
Authorization: Bearer {accessToken}
```

---

### 4.5 계약 활성화 & 진행 관리

시니어가 제안을 수락하면 계약서가 자동 생성됩니다.

#### 계약 활성화 (`draft` → `active`)

계약 내용을 확인 후 활성화합니다.

```http
PUT /v1/contracts/{contractId}/activate
Authorization: Bearer {accessToken}
```

#### 진행률 업데이트

프로젝트 진행 상황을 0~100% 사이로 업데이트합니다.

```http
PUT /v1/contracts/{contractId}/progress
Authorization: Bearer {accessToken}

{ "progress": 50 }
```

#### 계약서 PDF 생성

계약서를 PDF로 자동 생성하고 안전하게 보관합니다.

```http
POST /v1/contracts/{contractId}/pdf
Authorization: Bearer {accessToken}
```

PDF에 포함되는 내용:
- 계약 당사자 (기업명, 시니어 전문가명)
- TF 프로젝트명
- 계약 기간 (시작일 ~ 종료일)
- 총 보수
- 역할 및 범위 (goals 내용)

---

### 4.6 정산 처리

프로젝트 완료 후 시니어 전문가에게 보수를 지급합니다. 에스크로(escrow) 방식으로 안전하게 처리됩니다.

#### 정산 흐름

```
기업 → 정산 요청 → [에스크로 보류(held)] → 기업 확인 → [지급 승인(released)] → 시니어 수령
```

#### Step 1: 정산 요청

```http
POST /v1/contracts/{contractId}/settlement
Authorization: Bearer {accessToken}

{
  "amount": 96000000
}
```

> `amount` 미입력 시 계약 보수(`compensation`)로 자동 설정됩니다.

- 요청 즉시 Toss Payments 에스크로에 보류됩니다
- 계약 상태가 `settlement_requested`로 변경됩니다

#### Step 2: 정산 현황 확인

```http
GET /v1/contracts/{contractId}/settlement
Authorization: Bearer {accessToken}
```

| 정산 상태 | 설명 |
|---|---|
| `pending` | 정산 요청 처리 중 |
| `held` | 에스크로 보류 완료 |
| `released` | 시니어에게 지급 완료 |
| `failed` | 처리 실패 (고객센터 문의) |

#### Step 3: 지급 승인

시니어의 역할을 최종 확인한 후 지급을 승인합니다.

```http
POST /v1/settlements/{settlementId}/release
Authorization: Bearer {accessToken}
```

> 지급 승인 후 계약 상태가 `completed`로 자동 변경됩니다.

---

### 4.7 리뷰 작성

계약 완료 후 시니어 전문가에 대한 리뷰를 남겨주세요. 리뷰는 다른 기업이 전문가를 선택하는 데 중요한 정보가 됩니다.

```http
POST /v1/contracts/{contractId}/review
Authorization: Bearer {accessToken}

{
  "rating": 5,
  "comment": "김철수 CFO님 덕분에 Series B 투자 유치에 성공했습니다. 재무 모델 수립과 IR 자료 작성 모두 탁월하셨습니다."
}
```

작성된 리뷰는 시니어 프로필의 **평균 평점(avgRating)** 에 자동으로 반영됩니다.

---

## 5. 공통 기능

### 5.1 API 인증 방법

모든 보호된 API는 Authorization 헤더에 `accessToken`을 포함해야 합니다.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

토큰이 없거나 만료된 경우 `401 Unauthorized` 응답이 반환됩니다.

---

### 5.2 공통 에러 응답 형식

```json
{
  "statusCode": 400,
  "message": "유효하지 않은 요청입니다.",
  "error": "Bad Request"
}
```

| 상태코드 | 의미 | 대응 방법 |
|---|---|---|
| `400` | 잘못된 요청 (입력값 오류) | 요청 데이터 확인 |
| `401` | 인증 필요 (토큰 없음·만료) | 토큰 갱신 또는 재로그인 |
| `403` | 권한 없음 (역할 불일치) | 계정 역할 확인 |
| `404` | 리소스 없음 | ID 확인 |
| `409` | 중복 (이미 존재하는 데이터) | 기존 데이터 확인 |
| `429` | 요청 횟수 초과 | 1분 후 재시도 |
| `500` | 서버 오류 | 고객센터 문의 |

---

### 5.3 페이지네이션

목록 조회 API는 페이지네이션을 지원합니다.

**요청**
```
GET /v1/proposals/inbox?page=2&limit=10
```

**응답**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 35,
    "totalPages": 4
  }
}
```

---

### 5.4 헬스 체크

서비스 상태 확인:

```http
GET /v1/health
```

응답:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T09:00:00Z",
  "uptime": 3600,
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

---

## 6. 자주 묻는 질문(FAQ)

**Q. 프로필을 등록했는데 제안이 오지 않아요.**

→ 프로필 상태(`status`)가 `active`인지 확인하세요. `inactive`나 `on_project` 상태에서는 매칭에서 제외됩니다. 또한 가용 기간(`availableFrom`, `availableTo`)이 현재 날짜를 포함하는지 확인하세요.

---

**Q. 제안을 수락했는데 계약서가 안 보여요.**

→ 수락 즉시 `draft` 상태의 계약서가 생성됩니다. `GET /v1/contracts/{contractId}`로 확인하거나 앱의 계약 탭에서 조회하세요.

---

**Q. 매칭 결과에서 내 프로필이 낮은 순위에 있어요.**

→ 다음 사항을 개선하면 매칭 점수가 높아집니다:
- 전문 분야를 정확하게 선택했는지 확인
- 키워드를 구체적으로 입력 (예: `M&A`, `재무전략` → `크로스보더 M&A`, `Series B 재무모델`)
- 가용 기간을 현재 날짜 이후로 설정
- 지역을 `전국`으로 설정하면 더 많은 TF에 매칭

---

**Q. 계약 완료 전에 정산을 요청할 수 없나요?**

→ 계약이 `active` 상태일 때 정산을 요청할 수 있습니다. `draft` 상태에서는 먼저 계약을 활성화해야 합니다.

---

**Q. 리뷰를 수정하거나 삭제할 수 있나요?**

→ Phase 1에서는 리뷰 수정·삭제 기능을 제공하지 않습니다. 신중하게 작성해 주세요.

---

**Q. 동시에 여러 TF에 참여할 수 있나요?**

→ 플랫폼 상에서는 제한이 없습니다. 단, 프로필 상태를 `on_project`로 설정해 현재 상황을 기업에 알리는 것을 권장합니다.

---

*시니어링크 운영팀 · [support@seniorlink.kr](mailto:support@seniorlink.kr)*

---

## 7. 개발 환경 실행 방법

로컬에서 시니어링크 각 앱을 개발 모드로 실행하는 방법입니다.

### 7.1 사전 준비

| 항목 | 버전 | 용도 |
|---|---|---|
| Node.js | 20 LTS | API · 웹 · 모바일 공통 |
| Docker Desktop | 최신 | 전체 스택 실행 |
| Expo Go 앱 | 최신 | 실물 기기 모바일 테스트 |
| Android Studio | 최신 | Android 에뮬레이터 |
| Xcode | 최신 (macOS) | iOS 시뮬레이터 |

저장소 루트에서 의존성을 설치합니다 (최초 1회):

```bash
# 프로젝트 루트 (seniorlink/)
npm install
```

모바일은 별도 설치가 필요합니다:

```bash
cd apps/mobile
npm install
```

---

### 7.2 백엔드 API (NestJS)

**전제 조건**: PostgreSQL과 Redis가 실행 중이어야 합니다. Docker를 사용하는 경우 §7.5를 먼저 실행하세요.

```bash
# 방법 1 — 루트 워크스페이스 스크립트
npm run api:dev

# 방법 2 — 앱 디렉토리에서 직접 실행
cd apps/api
npm run start:dev
```

- **포트**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api-docs`
- **헬스 체크**: `http://localhost:3000/v1/health`

환경 변수 파일 위치: `apps/api/.env`

**Windows (PowerShell)**에서 환경 변수를 수동으로 지정해야 하는 경우:

```powershell
$env:NODE_ENV = "development"
npm run start:dev
```

---

### 7.3 웹 앱 (Next.js)

```bash
# 방법 1 — 루트 워크스페이스 스크립트
npm run web:dev

# 방법 2 — 앱 디렉토리에서 직접 실행
cd apps/web
npm run dev
```

- **포트**: `http://localhost:3001`
- 개발 서버는 파일 변경 시 자동으로 Hot Reload됩니다.

> API 서버(`http://localhost:3000`)가 먼저 실행되어 있어야 정상 동작합니다.

---

### 7.4 모바일 앱 (React Native / Expo)

**사전 준비**: [Expo CLI](https://docs.expo.dev/get-started/installation/) 또는 `npx expo` 사용

```bash
cd apps/mobile

# Expo 개발 서버 시작 (QR 코드 출력)
npx expo start

# Android 에뮬레이터로 바로 실행
npx expo start --android

# iOS 시뮬레이터로 바로 실행 (macOS 전용)
npx expo start --ios
```

#### 실물 기기 테스트 (Expo Go)

1. iOS / Android에서 **Expo Go** 앱 설치
2. `npx expo start` 실행 후 터미널에 출력된 QR 코드 스캔
3. 개발 PC와 기기가 동일한 Wi-Fi에 연결되어 있어야 합니다

#### API 엔드포인트 설정

모바일 앱이 로컬 API 서버에 연결되도록 `apps/mobile` 내 API URL을 개발 PC의 실제 IP 주소로 지정합니다:

```dotenv
# 예: 개발 PC IP가 192.168.1.100인 경우
API_URL=http://192.168.1.100:3000
```

> `localhost`는 에뮬레이터/실기기에서 개발 PC를 가리키지 않습니다. `adb reverse`(Android) 또는 실제 IP를 사용하세요.

---

### 7.5 전체 스택 Docker 실행

API, 웹, PostgreSQL, Redis, MinIO, Nginx를 한 번에 실행합니다.

```bash
# 프로젝트 루트 (seniorlink/)
docker compose up -d
```

| 서비스 | URL |
| --- | --- |
| 웹 + API (Nginx) | `http://localhost:8080` |
| API 직접 | `http://localhost:3000` |
| MinIO 콘솔 | `http://localhost:9001` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

**DB 마이그레이션** (컨테이너 최초 실행 후):

```bash
cd apps/api
npm run migration:run
```

**Windows (PowerShell) 참고**: Docker 명령이 인식되지 않는 경우 PATH에 추가합니다:

```powershell
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"
docker compose up -d
```
