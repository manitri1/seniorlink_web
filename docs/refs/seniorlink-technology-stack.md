# SeniorTF 기술 스택 선정 가이드

## 1. 기술 스택 개요

### 1.1 선정 원칙

- **시니어 사용성**: 모바일 앱은 필수, 접근성 중심 UI
- **빠른 개발 속도**: MVP 6개월 내 완성 가능
- **확장성**: 사용자 증가에 대비한 스케일링
- **비용 효율**: 초기 자본금 2.5억 원대 범위 내
- **팀 역량**: 5인 코어팀이 운영 가능한 기술

### 1.2 전체 아키텍처

```
클라이언트 (모바일/웹)
    ↓
API Gateway / 로드 밸런서
    ↓
백엔드 API 서버 (Node.js + NestJS)
    ↓
데이터베이스 (PostgreSQL) / 캐시 (Redis)
    ↓
외부 연동 (결제, 문서 생성, AI)
```

---

## 2. 프론트엔드 스택

### 2.1 모바일 앱 (iOS/Android)

**기술**: React Native + Expo

**선택 이유**:

- iOS/Android 동시 개발 가능
- 코드 재사용성 높음 (개발 속도 단축)
- 자체 커뮤니티 및 라이브러리 풍부
- 시니어 사용자 대상 접근성 지원 용이

**핵심 라이브러리**:

- `react-native-navigation`: 화면 전환 관리
- `react-native-gesture-handler`: 터치 인터랙션
- `react-query`: 상태 관리 및 서버 동기화
- `zustand`: 가벼운 전역 상태 관리
- `react-native-accessibility`: 접근성 강화

**개발 환경**:

- Expo CLI (빠른 빌드, over-the-air 업데이트 가능)
- EAS Build (Apple/Google 배포 자동화)

### 2.2 웹 대시보드 (기업용)

**기술**: React 18 + TypeScript

**선택 이유**:

- 기업 사용자는 웹 기반 인터페이스 선호
- 관리자 기능 통합 용이
- 반응형 디자인 간편

**핵심 라이브러리**:

- `next.js`: 프레임워크 (SEO, SSR 지원)
- `tailwindcss`: 스타일링 (빠른 UI 구성)
- `react-hook-form`: 폼 관리
- `recharts`: 대시보드 차트
- `zustand`: 전역 상태 관리

**빌드 및 배포**:

- Vercel 또는 자체 서버 배포

### 2.3 디자인 시스템

**기술**: Storybook + Figma

**목적**:

- 시니어 접근성 중심 컴포넌트 라이브러리 구축
- 설계 문서: `design/DESIGN.md` 참고
- 큰 글씨(16px 이상), 높은 대비, 단순 레이아웃

---

## 3. 백엔드 스택

### 3.1 API 서버

**기술**: Node.js 20 LTS + NestJS + TypeScript

**선택 이유**:

- 빠른 개발 속도와 유연성
- TypeScript로 타입 안정성 확보
- 엔터프라이즈급 기능 (DI, 모듈화)
- 팀 개발 효율성

**핵심 라이브러리**:

- `@nestjs/common`: 프레임워크
- `@nestjs/typeorm`: ORM (PostgreSQL 연동)
- `passport + jwt`: 인증
- `@nestjs/config`: 환경 설정
- `class-validator`: 입력 검증
- `winston`: 로깅

### 3.2 데이터베이스

**기술**: PostgreSQL 15

**선택 이유**:

- RDBMS 특성에 맞는 데이터 구조
- ACID 트랜잭션 (계약, 정산 안정성)
- JSON 컬럼 지원 (유연한 데이터 저장)
- 무료이고 엔터프라이즈 수준

**핵심 기능**:

- 사용자, 프로필, 요청, 제안, 계약, 정산, 리뷰 테이블
- 외래키 관계 정의로 데이터 무결성 보장
- 인덱스 최적화 (매칭 검색 속도 개선)

**마이그레이션 도구**:

- TypeORM 또는 Prisma

### 3.3 캐시 레이어

**기술**: Redis

**목적**:

- 세션 관리 (JWT 토큰 블랙리스트)
- 매칭 결과 캐싱 (반복 검색 최적화)
- Rate limiting (API 남용 방지)

**도구**:

- `ioredis`: Node.js Redis 클라이언트
- AWS ElastiCache 또는 Redis Cloud

---

## 4. 인증 및 보안

### 4.1 사용자 인증

**기술**: JWT (JSON Web Token) + Passport.js

**흐름**:

1. 사용자 회원가입 (이메일/전화)
2. 이메일 인증 또는 SMS 인증
3. 로그인 시 JWT 토큰 발급
4. API 요청 시 Authorization 헤더에 토큰 포함
5. 토큰 만료 후 Refresh Token으로 갱신

**보안 고려**:

- 비밀번호: bcrypt로 해싱
- JWT: HS256 또는 RS256 암호화
- HTTPS 필수
- CORS 설정으로 크로스 도메인 공격 방지

### 4.2 권한 관리 (RBAC)

**역할 정의**:

- `senior`: 시니어 전문가
- `company`: 기업 사용자
- `admin`: 관리자

**구현**:

- NestJS Guards로 라우트 보호
- 사용자 역할에 따른 접근 제어

---

## 5. 결제 및 정산

### 5.1 결제 서비스

**기술**: Toss Payments (또는 KakaoPay)

**선택 이유**:

- 한국 기업에 최적화
- 실시간 송금 지원
- 에스크로 기능 내장
- 개발자 친화적 API

**기능**:

- 신용카드/계좌이체 결제
- 에스크로 (자동 정산)
- 결제 이력 관리

### 5.2 에스크로 플로우

**시나리오**:

1. 기업이 프로젝트 진행료 선결제
2. 플랫폼에 에스크로 보관
3. 프로젝트 완료 후 시니어 정산 요청
4. 자동 또는 수동 승인 후 지급

**구현 도구**:

- Toss Payments API
- 정산 스케줄러 (Node-cron)

---

## 6. 파일 및 문서 관리

### 6.1 파일 저장소

**기술**: AWS S3 (또는 GCP Cloud Storage)

**용도**:

- 사용자 프로필 이미지
- 계약서 생성 및 저장
- 리뷰 첨부 파일

**라이브러리**:

- `aws-sdk/client-s3`
- Pre-signed URL로 보안 다운로드

### 6.2 계약서 자동 생성

**기술**: Puppeteer 또는 DocuSign API

**방식 1** (저비용):

- HTML 템플릿 + Puppeteer로 PDF 생성
- S3에 저장 후 링크 제공

**방식 2** (전문):

- DocuSign API로 전자서명 통합
- 더 높은 법적 신뢰성

---

## 7. AI 및 매칭 엔진

### 7.1 초기 매칭 로직 (Phase 1)

**기술**: 규칙 기반 매칭 (Rule Engine)

**구현 방식**:

```javascript
// 필터 단계
const candidates = seniors.filter(
  (s) =>
    isWithinBudget(s, request) &&
    isAvailable(s, request.period) &&
    isInRegion(s, request.region),
);

// 점수 단계
const scored = candidates.map((s) => ({
  senior: s,
  score: calculateScore(s, request),
}));

// 정렬
const sorted = scored.sort((a, b) => b.score - a.score);
```

**점수 요소**:

- 전문 분야 일치 (30%)
- 경력 적합도 (25%)
- 기간/지역 일치 (25%)
- 과거 성과 (20%)

### 7.2 고급 매칭 (Phase 2 이후)

**기술**: 머신러닝 (TensorFlow.js 또는 Python)

**개선 방향**:

- 과거 매칭 성공 데이터 학습
- 사용자 피드백 반영
- 다인 조합 추천 알고리즘

**서비스 옵션**:

- AWS SageMaker (관리형)
- Google Vertex AI
- 자체 Python 모델 서버 (비용 절감)

---

## 8. 클라우드 인프라

### 8.1 배포 환경

**기술**: AWS (또는 GCP)

**구성**:

- **컴퓨팅**: EC2 (또는 ECS + Fargate)
- **데이터베이스**: RDS PostgreSQL
- **캐시**: ElastiCache Redis
- **저장소**: S3
- **CDN**: CloudFront
- **로드 밸런싱**: Application Load Balancer

### 8.2 컨테이너화

**기술**: Docker + Docker Compose

**목적**:

- 개발/테스트/운영 환경 통일
- 쉬운 배포 및 롤백

**파일 구조**:

```
Dockerfile (Node.js 20)
docker-compose.yml (PostgreSQL, Redis 포함)
.dockerignore
```

### 8.3 CI/CD

**기술**: GitHub Actions

**파이프라인**:

1. **Lint & Test**: 코드 품질 검사
2. **Build**: Docker 이미지 빌드
3. **Push**: ECR/Docker Hub에 푸시
4. **Deploy**: AWS ECS에 배포

**브랜치 전략**:

- `main`: 프로덕션 (자동 배포)
- `develop`: 개발 (수동 배포)
- `feature/*`: 기능 개발

---

## 8-1. 자체 서버 기반 아키텍처 (초기 MVP/베타 테스트)

### 8-1.1 개요
AWS 클라우드 대신 **자체 서버 또는 저비용 VPS**를 활용하여 초기 MVP 개발과 베타 테스트를 진행하는 방안입니다. 비용을 **월 50만원대**로 절감하면서도 본격적인 검증이 가능합니다.

### 8-1.2 자체 서버 아키텍처

```
로컬 개발 (Docker Compose)
    ↓
VPS 배포 (Ubuntu 22.04 LTS)
    ↓
- Docker + Docker Compose 실행
- PostgreSQL (자체 설치)
- Redis (자체 설치)
- Nginx (리버스 프록시)
- 파일 스토리지 (로컬 디스크)
```

### 8-1.3 서버 구성

#### 하드웨어 요구사항
- **CPU**: 4 vCore 이상
- **메모리**: 8GB RAM 이상
- **스토리지**: 100GB SSD
- **네트워크**: 1Gbps, 고정 IP

#### VPS 제공업체 (월 비용 추정)
| 제공업체 | 사양 | 월비용 | 비고 |
|---------|------|--------|------|
| Linode | 4 vCore, 8GB RAM, 160GB | ₩25,000 | 한국 지원, 안정적 |
| DigitalOcean | 4 vCore, 8GB RAM, 160GB | ₩23,000 | 간편한 관리, 초보자 친화 |
| Vultr | 4 vCore, 8GB RAM, 80GB | ₩20,000 | 저가, 빠른 배포 |
| NCloud (네이버) | 2 vCore, 8GB RAM, 100GB | ₩30,000 | 국내 서비스, 지원 우수 |
| AWS Lightsail | 2 vCore, 4GB RAM, 80GB | ₩15,000 | AWS 생태계 활용 가능 |

### 8-1.4 초기 설정 (Ubuntu 22.04 LTS)

```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Nginx 설치 (리버스 프록시)
sudo apt install -y nginx

# 5. SSL 인증서 (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

### 8-1.5 Docker Compose 구성 (운영용)

```yaml
version: '3.9'

services:
  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:15-alpine
    container_name: seniorlink_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: seniorlink
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always
    networks:
      - seniorlink-network

  # Redis 캐시
  redis:
    image: redis:7-alpine
    container_name: seniorlink_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: always
    networks:
      - seniorlink-network
    command: redis-server --appendonly yes

  # Node.js API 서버
  api:
    build: .
    container_name: seniorlink_api
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      TOSS_API_KEY: ${TOSS_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - seniorlink-network
    volumes:
      - ./uploads:/app/uploads  # 파일 저장소

volumes:
  postgres_data:
  redis_data:

networks:
  seniorlink-network:
    driver: bridge
```

### 8-1.6 Nginx 설정 (리버스 프록시)

```nginx
server {
    listen 80;
    server_name api.seniorlink.com;

    # HTTP → HTTPS 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seniorlink.com;

    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/api.seniorlink.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seniorlink.com/privkey.pem;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # API 서버로 프록시
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 정적 파일 서빙
    location /uploads {
        alias /var/www/seniorlink/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8-1.7 배포 프로세스

```bash
# 1. 서버에 SSH 접속
ssh ubuntu@your-server-ip

# 2. 애플리케이션 코드 클론
git clone https://github.com/your-org/seniorlink.git
cd seniorlink

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (DB_PASSWORD, JWT_SECRET 등)

# 4. Docker 이미지 빌드 및 실행
docker-compose up -d

# 5. 데이터베이스 마이그레이션
docker-compose exec api npm run migrate

# 6. 로그 확인
docker-compose logs -f api

# 7. 상태 확인
docker-compose ps
```

### 8-1.8 파일 저장소 (S3 대신)

#### 옵션 1: 로컬 디스크 저장
```
/var/www/seniorlink/uploads/
  ├── profiles/
  ├── contracts/
  └── reviews/
```

#### 옵션 2: MinIO (S3 호환 오브젝트 스토리지)
```yaml
minio:
  image: minio/minio:latest
  container_name: seniorlink_minio
  environment:
    MINIO_ROOT_USER: ${MINIO_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
  volumes:
    - minio_data:/minio_data
  ports:
    - "9000:9000"
    - "9001:9001"
  command: minio server /minio_data --console-address ":9001"
  restart: always
  networks:
    - seniorlink-network
```

**사용법** (Node.js):
```javascript
const MinIO = require('minio');

const minioClient = new MinIO.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASSWORD,
});

// 파일 업로드
await minioClient.fPutObject('uploads', 'profile.jpg', './local_file.jpg');
```

### 8-1.9 백업 전략

```bash
# 일일 자동 백업 스크립트 (/etc/cron.daily/seniorlink-backup.sh)
#!/bin/bash

BACKUP_DIR="/backups/seniorlink"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL 백업
docker-compose -f /home/ubuntu/seniorlink/docker-compose.yml exec -T postgres pg_dump \
  -U postgres seniorlink > $BACKUP_DIR/db_$DATE.sql

# 파일 백업
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/seniorlink/uploads

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# 외부 저장소 동기 (선택사항)
# gsutil -m cp -r $BACKUP_DIR gs://backup-bucket/seniorlink/
```

### 8-1.10 모니터링 (오픈소스)

#### Prometheus + Grafana
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: seniorlink_prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  ports:
    - "9090:9090"
  restart: always
  networks:
    - seniorlink-network

grafana:
  image: grafana/grafana:latest
  container_name: seniorlink_grafana
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
  ports:
    - "3001:3000"
  volumes:
    - grafana_data:/var/lib/grafana
  restart: always
  networks:
    - seniorlink-network
```

### 8-1.11 성능 모니터링

```bash
# 1. API 응답 시간 (Winston 로그)
docker-compose logs api | grep "response_time"

# 2. 데이터베이스 연결
docker-compose exec postgres psql -U postgres -d seniorlink -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Redis 메모리 사용
docker-compose exec redis redis-cli INFO memory

# 4. 디스크 사용량
df -h /var/www/seniorlink/

# 5. CPU/메모리 사용량
docker stats
```

### 8-1.12 확장 계획 (프로덕션으로 전환)

| 단계 | 시점 | 작업 | 비용 증가 |
|------|------|------|----------|
| **Phase 1** | MVP 개발 | VPS 1대, Docker Compose | +0 |
| **Phase 2** | 베타 테스트 | VPS 1대 (사양 업그레이드 가능) | ~50만원 |
| **Phase 3** | 정식 출시 | AWS 마이그레이션 준비 (병렬 운영) | +100만원 |
| **Phase 4** | 본격 확장 | AWS로 완전 전환 (자동 스케일링) | +150만원 |

### 8-1.13 자체 서버 vs AWS 비용 비교

| 항목 | 자체 VPS | AWS (초기) | 절감액 |
|------|---------|-----------|-------|
| 컴퓨팅 | 25만원 | 50만원 | 25만원 |
| 데이터베이스 | 0원 (포함) | 50만원 | 50만원 |
| 캐시 | 0원 (포함) | 20만원 | 20만원 |
| 저장소 | 0원 (로컬/MinIO) | 10만원 | 10만원 |
| **월 총비용** | **25만원** | **130만원** | **105만원 절감** |

---

## 9. 모니터링 및 로깅

### 9.1 애플리케이션 모니터링

**기술**: CloudWatch + Winston

**추적 항목**:

- API 응답 시간
- 에러율
- 데이터베이스 쿼리 시간
- 사용자 활동

**대시보드**:

- Grafana (그래프 시각화)
- DataDog (지표 분석, 경고)

### 9.2 로그 관리

**기술**: ELK Stack (Elasticsearch + Logstash + Kibana) 또는 CloudWatch Logs

**수집 대상**:

- API 서버 로그
- 데이터베이스 쿼리 로그
- 에러 스택 트레이스

---

## 10. 개발 도구 및 환경

### 10.1 코드 품질

**기술**:

- ESLint: 코드 스타일 검사
- Prettier: 코드 포맷팅
- TypeScript: 타입 체크

**설정**:

```json
{
  "extends": ["eslint:recommended", "prettier"],
  "parser": "@typescript-eslint/parser"
}
```

### 10.2 테스트

**기술**:

- **유닛 테스트**: Jest
- **통합 테스트**: Supertest (HTTP 테스트)
- **E2E 테스트**: Cypress (UI 테스트)

**목표**:

- 코드 커버리지 70% 이상
- 핵심 기능 (매칭, 계약, 정산) 100% 테스트

### 10.3 개발 환경 설정

**필수 도구**:

- Node.js 20 LTS
- PostgreSQL 15
- Redis
- Docker Desktop
- VS Code

**개발 서버 실행**:

```bash
npm install
npm run dev
# http://localhost:3000
```

---

## 11. 성능 최적화

### 11.1 데이터베이스 최적화

- 인덱싱: 자주 검색하는 필드 (전문 분야, 지역, 가용 기간)
- 쿼리 최적화: EXPLAIN ANALYZE로 느린 쿼리 식별
- 연결 풀링: pg-pool (동시성 관리)

### 11.2 API 응답 시간

- 캐싱: 매칭 결과, 프로필 정보
- 페이지네이션: 대용량 리스트 처리
- 압축: gzip 활성화

### 11.3 모바일 앱 최적화

- 코드 분할: 필요한 번들만 로드
- 이미지 최적화: WebP 포맷, 반응형 이미지
- 네트워크 최적화: Offline-first 아키텍처 고려

---

## 12. 보안

### 12.1 데이터 보호

- 데이터 암호화: 전송(HTTPS), 저장(DB 암호화)
- 민감 정보: 카드 정보는 Toss에 위임
- 백업: 자동 일일 백업 (RDS 설정)

### 12.2 접근 제어

- VPC: 데이터베이스 격리
- 방화벽: 필요한 포트만 개방
- IAM: AWS 리소스 접근 권한 최소화

### 12.3 컴플라이언스

- 개인정보보호법: 사용자 동의 및 탈퇴 기능
- 플랫폼 노동 관련 법규: 계약 투명성

---

## 13. 기술 스택 요약 표

### 13.1 AWS 클라우드 기반 (중규모 확장)

| 계층                      | 기술                | 용도           | 비용                          |
| ------------------------- | ------------------- | -------------- | ----------------------------- |
| 모바일                    | React Native + Expo | iOS/Android 앱 | 무료                          |
| 웹                        | Next.js + React     | 기업 대시보드  | 무료/Vercel                   |
| 백엔드                    | NestJS + TypeScript | API 서버       | 무료                          |
| DB                        | PostgreSQL (RDS)    | 데이터 저장    | AWS RDS (월 50만원대)         |
| 캐시                      | Redis               | 세션/캐싱      | AWS ElastiCache (월 20만원대) |
| 저장소                    | AWS S3              | 파일 저장      | 용량 기반 (월 만원대)         |
| 결제                      | Toss Payments       | 결제/정산      | 거래액 기반                   |
| 배포                      | AWS ECS + ECR       | 컨테이너 배포  | 월 30~50만원                  |
| 모니터링                  | CloudWatch          | 로그/메트릭    | 포함 또는 DataDog             |
| **월 인프라 비용 (AWS)**  |                     |                | **약 100~150만원**            |

### 13.2 자체 VPS 기반 (비용 절감, 초기 MVP/베타)

| 계층                       | 기술                     | 용도           | 비용                    |
| -------------------------- | ------------------------ | -------------- | ----------------------- |
| 모바일                     | React Native + Expo      | iOS/Android 앱 | 무료                    |
| 웹                         | Next.js + React          | 기업 대시보드  | 무료/Vercel             |
| 백엔드                     | NestJS + TypeScript      | API 서버       | 무료                    |
| DB                         | PostgreSQL (자체 설치)   | 데이터 저장    | VPS 포함                |
| 캐시                       | Redis (자체 설치)        | 세션/캐싱      | VPS 포함                |
| 저장소                     | 로컬 디스크 / MinIO      | 파일 저장      | VPS 포함                |
| 결제                       | Toss Payments            | 결제/정산      | 거래액 기반             |
| 배포                       | Docker + Nginx (VPS)     | 컨테이너 배포  | VPS 월 25만원           |
| 모니터링                   | Prometheus + Grafana     | 로그/메트릭    | VPS 포함 (무료)         |
| **월 인프라 비용 (VPS)**   |                          |                | **약 25만원**           |
| **6개월 누적 비용**        |                          |                | AWS: 900만원 vs VPS: 150만원 |

---

## 14. 마이그레이션 경로

### 14.1 추천 경로: VPS → AWS 점진적 전환

#### Phase 1 (M1~M2, 시장 검증)
- **인프라**: 로컬 개발 (Docker Compose)
- **비용**: 0원
- **작업**: 사용자 인터뷰, 기술 검증

#### Phase 2 (M3~M8, MVP 개발)
- **인프라**: VPS 1대 (4 vCore, 8GB RAM)
- **배포**: Docker Compose + Nginx
- **비용**: 월 25만원 (6개월 150만원)
- **성과**: 시니어 프로필, TF 요청, 매칭, 계약 기능 완성

#### Phase 3 (M9~M11, 베타 테스트)
- **인프라**: VPS 1대 (사양 유지)
- **추가**: Prometheus + Grafana 모니터링
- **비용**: 월 25만원 (3개월 75만원)
- **성과**: 사용자 200명 + 기업 50개사 검증

#### Phase 4 (M12~M15, 정식 출시 & AWS 마이그레이션)
- **병렬 운영**:
  - VPS: 기존 베타 서비스 유지 (사용자 150~200명)
  - AWS: 새 프로덕션 환경 구축
- **마이그레이션 단계**:
  1. AWS에 동일 환경 구축 (RDS, ElastiCache, ECS)
  2. 트래픽 점진적 이관 (10% → 50% → 100%)
  3. VPS 서버 대기 모드 유지 (롤백용)
  4. 최종 VPS 종료
- **비용**: VPS 25만원 + AWS 130만원 = 월 155만원

### 14.2 VPS에서 AWS로 마이그레이션 체크리스트

```
[ ] 1. AWS 계정 생성 및 IAM 설정
[ ] 2. RDS PostgreSQL 인스턴스 생성
[ ] 3. ElastiCache Redis 클러스터 생성
[ ] 4. ECR 저장소 생성 및 Docker 이미지 푸시
[ ] 5. ECS 클러스터 및 태스크 정의
[ ] 6. RDS 자동 백업 설정
[ ] 7. CloudWatch 알림 설정
[ ] 8. Application Load Balancer 설정
[ ] 9. Route 53 DNS 설정 (트래픽 분산)
[ ] 10. 데이터 마이그레이션 (pg_dump → RDS)
[ ] 11. SSL/TLS 인증서 설정 (AWS Certificate Manager)
[ ] 12. 카나리 배포 (5% 트래픽으로 테스트)
[ ] 13. 모니터링 24시간 (응답 시간, 에러율)
[ ] 14. VPS 대기 상태 유지 (1주)
[ ] 15. VPS 서버 종료
```

### 14.3 추가 선택지: 하이브리드 구조 유지

초기에는 **VPS만으로 충분**하며, 추후 필요시 AWS로 확장할 수 있습니다:

| 사용자 규모 | 추천 인프라 | 월 비용 |
|----------|----------|-------|
| 0~1,000명 | VPS 1대 | 25만원 |
| 1,000~5,000명 | VPS 2대 + Load Balancer | 50만원 |
| 5,000~20,000명 | AWS ECS (자동 스케일) | 150만원 |
| 20,000명+ | AWS 멀티 리전 | 500만원+ |

---

## 15. 팀 역할별 기술 스택

### CTO / 백엔드 개발자

- Node.js, TypeScript, NestJS
- PostgreSQL, Redis
- Docker, AWS

### 모바일 개발자

- React Native, JavaScript/TypeScript
- Expo, EAS Build
- 성능 최적화, 접근성

### 웹 개발자 (기업용)

- React, Next.js, TypeScript
- Tailwind CSS
- Recharts (대시보드)

### DevOps / 운영

**초기 (VPS 운영)**:
- Linux (Ubuntu 22.04), Nginx
- Docker, Docker Compose
- PostgreSQL, Redis (자체 설치 및 유지보수)
- 백업 스크립트, 모니터링 (Prometheus + Grafana)
- GitHub Actions (CI/CD)

**확장 (AWS 마이그레이션)**:
- AWS (EC2, RDS, ElastiCache, S3, CloudFront)
- ECS, ECR, Fargate
- CloudWatch, DataDog
- 자동 스케일링, 로드 밸런싱

---

## 16. 학습 및 온보딩

### 팀 교육 계획

**VPS 운영 중심** (Phase 1~3):
1. **1주**: Node.js, TypeScript, Docker 기초
2. **2주**: NestJS 프레임워크 & PostgreSQL 설계 및 운영
3. **3주**: React Native 및 웹 개발
4. **4주**: Linux 관리, Nginx, 모니터링 (Prometheus)

**AWS 마이그레이션 준비** (Phase 3 말기):
- AWS 기초 (EC2, RDS, S3)
- ECS 및 컨테이너 오케스트레이션
- CloudWatch, 자동 스케일링

### 참고 자료

**VPS 운영**:
- DigitalOcean Tutorials (리눅스, 도커)
- Nginx 공식 문서
- PostgreSQL 관리 가이드
- Prometheus + Grafana 구축 가이드

**개발**:
- NestJS 공식 문서
- React Native 공식 문서
- Docker Best Practices

**AWS 마이그레이션**:
- AWS Well-Architected Framework
- AWS 트레이닝 자료
- EC2 → ECS 마이그레이션 가이드

---

**기술 스택 최종 선정 일시**: 2026년 5월 13일  
**검토 주기**: 매 Phase마다 기술 스택 재평가

---

## 17. REST API 명세

### 17.1 인증

| 메서드 | 엔드포인트 | 설명 |
| ------ | ---------- | ---- |
| POST | `/auth/signup` | 사용자 가입 |
| POST | `/auth/login` | 로그인 (JWT 발급) |

### 17.2 시니어 프로필

| 메서드 | 엔드포인트 | 설명 |
| ------ | ---------- | ---- |
| POST | `/seniors/profile` | 프로필 생성 |
| GET | `/seniors/profile/:id` | 프로필 조회 |
| PUT | `/seniors/profile/:id` | 프로필 수정 |

### 17.3 기업 TF 요청

| 메서드 | 엔드포인트 | 설명 |
| ------ | ---------- | ---- |
| POST | `/requests` | TF 요청 생성 |
| GET | `/requests/:id` | 요청 조회 |
| GET | `/requests` | 요청 목록 |

### 17.4 매칭 및 제안

| 메서드 | 엔드포인트 | 설명 |
| ------ | ---------- | ---- |
| GET | `/requests/:id/matches` | 추천 전문가 조회 |
| POST | `/requests/:id/proposals` | 제안 발송 |
| GET | `/proposals/:id` | 제안 조회 |
| POST | `/proposals/:id/accept` | 제안 수락 |

### 17.5 계약 및 정산

| 메서드 | 엔드포인트 | 설명 |
| ------ | ---------- | ---- |
| POST | `/contracts` | 계약 생성 |
| POST | `/contracts/:id/settlement` | 정산 요청 |
| GET | `/contracts/:id/status` | 진행 상태 조회 |
| POST | `/contracts/:id/review` | 리뷰 작성 |

### 17.6 MVP 개발 완료 검증 기준

개발 완료 후 아래 5개 항목이 모두 작동해야 MVP로 인정합니다.

- [ ] 시니어와 기업이 각각 프로필/요청을 작성할 수 있는가?
- [ ] 추천 결과가 한 번이라도 도출되는가?
- [ ] 제안 발송 후 시니어가 수락을 처리할 수 있는가?
- [ ] 수락 시 계약 생성 흐름이 연결되는가?
- [ ] 진행 상태와 정산 요청 흐름이 기본적으로 동작하는가?

## 부록: 자체 VPS vs AWS 빠른 비교

### 초기 MVP/베타 단계 추천
**자체 VPS 기반**:
- ✅ 6개월 150만원 (AWS는 900만원)
- ✅ 간단한 구조, 운영이 직관적
- ✅ 작은 팀 (1명의 DevOps)으로 충분
- ✅ 언제든 AWS로 마이그레이션 가능
- ⚠️ 자동 스케일링 미지원 (수동 확장 필요)
- ⚠️ 고가용성 (HA) 구축 복잡

### 정식 출시 이후 추천
**AWS 마이그레이션**:
- ✅ 자동 스케일링 (사용자 급증 시 자동 대응)
- ✅ 고가용성, 재해 복구 (멀티 AZ)
- ✅ 관리형 서비스 (RDS, ElastiCache)
- ✅ 글로벌 확장 용이
- ⚠️ 월 100~150만원 (VPS의 5배)
- ⚠️ 복잡도 증가 (DevOps 2~3명 필요)
