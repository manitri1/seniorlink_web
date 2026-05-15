# 시니어링크 빌드 & 배포 가이드

> 버전 1.0 · Phase 1 MVP · 최종 수정 2026-05-13  
> 대상: DevOps 엔지니어 / 백엔드 개발자

---

## 목차

1. [전체 아키텍처](#1-전체-아키텍처)
2. [로컬 개발 환경 구성](#2-로컬-개발-환경-구성)
3. [환경 변수 레퍼런스](#3-환경-변수-레퍼런스)
4. [빌드](#4-빌드)
5. [데이터베이스 마이그레이션](#5-데이터베이스-마이그레이션)
6. [VPS 초기 서버 설정](#6-vps-초기-서버-설정)
7. [프로덕션 배포](#7-프로덕션-배포)
8. [GitHub Actions CI/CD](#8-github-actions-cicd)
9. [SSL 인증서 (Let's Encrypt)](#9-ssl-인증서-lets-encrypt)
10. [모니터링 & 로그](#10-모니터링--로그)
11. [롤백 절차](#11-롤백-절차)
12. [트러블슈팅](#12-트러블슈팅)

---

## 1. 전체 아키텍처

```
인터넷
  │
  ▼
[Nginx :443]  ─── SSL 종단, 리버스 프록시
  ├── api.seniorlink.kr  →  [NestJS API :3000]
  │                              │
  │                         ┌───┼───────────────┐
  │                         ▼   ▼               ▼
  │                    [PostgreSQL] [Redis]  [MinIO/S3]
  │
  └── seniorlink.kr  →  [Next.js Web :3001]

모바일 (React Native)  →  api.seniorlink.kr/v1
```

### 인프라 스택

| 컴포넌트 | 기술 | 역할 |
|---|---|---|
| API 서버 | NestJS 10 (Node.js 22) | REST API, Socket.IO |
| 웹 대시보드 | Next.js 15 (App Router) | 기업 관리 대시보드 |
| 데이터베이스 | PostgreSQL 15 | 영구 데이터 저장 |
| 캐시 | Redis 7 | 매칭 결과 캐시 (TTL 10분) |
| 오브젝트 스토리지 | MinIO (개발) / AWS S3 (운영) | 아바타·계약서 PDF |
| 리버스 프록시 | Nginx Alpine | SSL 종단, 라우팅 |
| 컨테이너 | Docker 24+ | 런타임 격리 |
| 레지스트리 | GitHub Container Registry (GHCR) | Docker 이미지 저장 |
| CI/CD | GitHub Actions | 자동 빌드·배포 |

---

## 2. 로컬 개발 환경 구성

### 2.1 전제 조건

| 소프트웨어 | 버전 | 설치 확인 |
|---|---|---|
| Node.js | 22 LTS | `node -v` |
| npm | 10+ | `npm -v` |
| Docker Desktop | 24+ | `docker -v` |
| Git | 2.40+ | `git -v` |

### 2.2 저장소 클론 & 의존성 설치

```bash
git clone https://github.com/your-org/seniorlink.git
cd seniorlink

# 루트에서 모든 workspace 의존성 한 번에 설치
npm install
```

### 2.3 환경 변수 파일 생성

```bash
# API 환경 변수
cp apps/api/.env.example apps/api/.env
# .env 파일 편집 (아래 §3 참조)
```

### 2.4 Docker Compose로 전체 실행

```bash
# 모든 서비스 실행 (백그라운드)
docker compose up -d


# 로그 실시간 확인
docker compose logs -f api

# 특정 서비스만 재시작
docker compose restart api
```

실행 후 접속 주소:

| 서비스 | URL |
|---|---|
| API | http://localhost:3000/v1 |
| Swagger 문서 | http://localhost:3000/docs |
| 웹 대시보드 | http://localhost:3001 |
| Nginx 게이트웨이 | http://localhost:80 |
| MinIO 콘솔 | http://localhost:9001 (minioadmin / minioadmin) |
| PostgreSQL | localhost:5432 (seniorlink / password) |
| Redis | localhost:6379 |

### 2.5 초기 데이터 시드

```bash
# 마이그레이션 실행 (최초 1회)
docker compose exec api npm run migration:run

# 시드 데이터 삽입 (시니어 20명, 기업 5개, TF요청 10건)
docker compose exec api npm run seed
```

### 2.6 개발 서버 단독 실행 (Docker 없이)

```bash
# PostgreSQL, Redis만 Docker로 실행
docker compose up -d postgres redis minio

# API 개발 서버 (Hot Reload)
cd apps/api
npm run start:dev

# 웹 개발 서버 (별도 터미널)
cd apps/web
npm run dev
```

---

## 3. 환경 변수 레퍼런스

### 3.1 `apps/api/.env` (API 서버)

```dotenv
# ── 데이터베이스 ──────────────────────────────────
DATABASE_URL=postgresql://seniorlink:password@postgres:5432/seniorlink_db
DATABASE_SSL=false        # 프로덕션: true

# ── Redis ─────────────────────────────────────────
REDIS_URL=redis://redis:6379
# 프로덕션: redis://:${REDIS_PASSWORD}@redis:6379

# ── JWT ───────────────────────────────────────────
JWT_SECRET=최소32자이상의-랜덤-비밀키-여기에입력
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=갱신토큰용-별도-랜덤-비밀키-입력
JWT_REFRESH_EXPIRES_IN=30d

# ── S3 / MinIO ────────────────────────────────────
S3_ENDPOINT=http://minio:9000        # 프로덕션: 삭제 (AWS S3 사용)
S3_REGION=ap-northeast-2
S3_BUCKET=seniorlink
AWS_ACCESS_KEY_ID=minioadmin         # 프로덕션: IAM 키
AWS_SECRET_ACCESS_KEY=minioadmin     # 프로덕션: IAM 시크릿

# ── Firebase FCM ──────────────────────────────────
FCM_PROJECT_ID=your-firebase-project-id
FCM_SERVICE_ACCOUNT_KEY=/secrets/firebase-key.json

# ── Toss Payments ─────────────────────────────────
TOSS_SECRET_KEY=test_sk_...          # 프로덕션: live_sk_...

# ── 앱 설정 ───────────────────────────────────────
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:80
```

### 3.2 `apps/web/.env.local` (Next.js 웹)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/v1   # 프로덕션: https://api.seniorlink.kr/v1
```

### 3.3 프로덕션 `.env.prod` (VPS `/srv/seniorlink/`)

```dotenv
# 데이터베이스
DATABASE_URL=postgresql://seniorlink:${POSTGRES_PASSWORD}@postgres:5432/seniorlink_db
DATABASE_SSL=false
POSTGRES_USER=seniorlink
POSTGRES_PASSWORD=강력한-랜덤-비밀번호-32자이상
POSTGRES_DB=seniorlink_db

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=강력한-레디스-비밀번호

# JWT (openssl rand -base64 48 로 생성)
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# S3 (AWS)
S3_REGION=ap-northeast-2
S3_BUCKET=seniorlink-prod
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# FCM
FCM_PROJECT_ID=...
FCM_SERVICE_ACCOUNT_KEY=/secrets/firebase-key.json

# Toss
TOSS_SECRET_KEY=live_sk_...

# 앱
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seniorlink.kr,https://www.seniorlink.kr

# MinIO (내부 스토리지용 — S3 전환 전까지)
MINIO_ROOT_USER=...
MINIO_ROOT_PASSWORD=...
```

> **보안 주의**: `.env.prod`는 절대 Git에 커밋하지 마세요.  
> GitHub Secrets에 개별 값으로 관리합니다.

---

## 4. 빌드

### 4.1 API 빌드

```bash
cd apps/api

# TypeScript 컴파일 → dist/
npm run build

# 빌드 결과 확인
ls dist/main.js
```

### 4.2 프로덕션 Docker 이미지 빌드

```bash
# API 이미지 (멀티스테이지 빌드)
docker build -t seniorlink-api:latest apps/api

# 이미지 크기 확인 (목표: 400MB 이하)
docker image ls seniorlink-api

# GHCR에 푸시
docker tag seniorlink-api:latest ghcr.io/your-org/seniorlink-api:latest
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin
docker push ghcr.io/your-org/seniorlink-api:latest
```

### 4.3 웹 빌드

```bash
cd apps/web

# Next.js 프로덕션 빌드
NEXT_PUBLIC_API_URL=https://api.seniorlink.kr/v1 npm run build

# Standalone 출력 확인 (next.config.js에 output:'standalone' 설정 필요)
ls .next/standalone/
```

### 4.4 `next.config.js` Standalone 설정

`apps/web/next.config.js`에 아래 설정이 필요합니다:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

### 4.5 빌드 체크리스트

```bash
# TypeScript 타입 오류 확인
cd apps/api && npx tsc --noEmit

# ESLint 검사
npm run lint

# 단위 테스트
npm test

# 이상 없으면 빌드
npm run build
```

---

## 5. 데이터베이스 마이그레이션

### 5.1 마이그레이션 파일 구조

```
apps/api/src/database/migrations/
  1700000000000-InitialSchema.ts    ← 8개 테이블 + 6개 ENUM + 11개 인덱스
  1700000000001-ChatMessages.ts     ← chat_messages 테이블
```

### 5.2 마이그레이션 명령어

```bash
# 실행 (신규 마이그레이션 적용)
DATABASE_URL=postgresql://... npm run migration:run --workspace=apps/api

# 롤백 (마지막 마이그레이션 1개 되돌리기)
DATABASE_URL=postgresql://... npm run migration:revert --workspace=apps/api

# 신규 마이그레이션 파일 생성
DATABASE_URL=postgresql://... npm run migration:generate -- src/database/migrations/NewFeature --workspace=apps/api

# 적용된 마이그레이션 목록 확인
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY timestamp;"
```

### 5.3 마이그레이션 실행 순서 (최초 배포)

```bash
# 1. 데이터베이스 접속 확인
psql $DATABASE_URL -c "SELECT version();"

# 2. 마이그레이션 실행
npm run migration:run --workspace=apps/api

# 3. 시드 데이터 (선택 — 개발/스테이징만)
npm run seed --workspace=apps/api

# 4. 테이블 확인
psql $DATABASE_URL -c "\dt"
```

### 5.4 마이그레이션 주의사항

| 상황 | 권장 방법 |
|---|---|
| 컬럼 추가 | 새 마이그레이션 파일 생성 |
| 컬럼 삭제 | 새 마이그레이션 + `NOT NULL` 제약 먼저 해제 |
| 대용량 테이블 변경 | 무중단 배포 전략 사용 (CONCURRENTLY 인덱스) |
| 롤백 필요 시 | `migration:revert` 후 코드 롤백 |

> **절대 금지**: `synchronize: true` 프로덕션 사용 — 데이터 소실 위험

---

## 6. VPS 초기 서버 설정

### 6.1 권장 서버 스펙

| 구분 | 최소 | 권장 (Phase 1) |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| 디스크 | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| 네트워크 | 100 Mbps | 1 Gbps |

### 6.2 서버 초기화 스크립트

```bash
# Ubuntu 22.04 기준

# 1. 시스템 업데이트
apt update && apt upgrade -y

# 2. Docker 설치
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# 3. Docker Compose V2 확인
docker compose version

# 4. 배포 디렉토리 생성
mkdir -p /srv/seniorlink/nginx
mkdir -p /srv/seniorlink/secrets

# 5. 방화벽 설정
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw enable

# 6. GHCR 로그인 (GitHub Personal Access Token 필요)
echo $GHCR_TOKEN | docker login ghcr.io -u your-github-username --password-stdin
```

### 6.3 환경 변수 파일 배포

```bash
# 로컬에서 VPS로 .env.prod 복사 (scp 또는 수동 편집)
scp .env.prod ubuntu@your-vps-ip:/srv/seniorlink/.env.prod

# Firebase 서비스 계정 키 복사
scp firebase-key.json ubuntu@your-vps-ip:/srv/seniorlink/secrets/firebase-key.json

# 파일 권한 설정
ssh ubuntu@your-vps-ip "chmod 600 /srv/seniorlink/.env.prod /srv/seniorlink/secrets/firebase-key.json"
```

### 6.4 Nginx 설정 파일 배포

```bash
scp nginx/prod.conf ubuntu@your-vps-ip:/srv/seniorlink/nginx/prod.conf
```

---

## 7. 프로덕션 배포

### 7.1 최초 배포 절차

```bash
# VPS SSH 접속
ssh ubuntu@your-vps-ip

# 작업 디렉토리로 이동
cd /srv/seniorlink

# docker-compose.prod.yml 생성 (로컬에서 복사 또는 직접 작성)
# 이미지 Pull
docker compose -f docker-compose.prod.yml pull

# 서비스 실행 (DB, Redis, MinIO, Nginx 먼저)
docker compose -f docker-compose.prod.yml up -d postgres redis minio

# 10초 대기 (PostgreSQL 초기화)
sleep 10

# 마이그레이션 실행
docker compose -f docker-compose.prod.yml run --rm api npm run migration:run

# 전체 서비스 실행
docker compose -f docker-compose.prod.yml up -d

# 상태 확인
docker compose -f docker-compose.prod.yml ps
```

### 7.2 일반 배포 절차 (업데이트)

```bash
# 신규 이미지 Pull
docker compose -f docker-compose.prod.yml pull api web

# 무중단 재시작 (Nginx가 연결 유지)
docker compose -f docker-compose.prod.yml up -d --no-deps api web

# 마이그레이션 (신규 마이그레이션이 있는 경우)
docker compose -f docker-compose.prod.yml exec api npm run migration:run

# 헬스체크
curl -s https://api.seniorlink.kr/v1/health | jq .
```

### 7.3 배포 후 검증 체크리스트

```bash
# 1. 헬스체크 API
curl https://api.seniorlink.kr/v1/health
# → { "status": "ok", "services": { "database": "ok", "redis": "ok" } }

# 2. 메트릭 확인
curl https://api.seniorlink.kr/v1/metrics | head -20

# 3. Swagger 문서 접근
curl -I https://api.seniorlink.kr/docs
# → HTTP/2 200

# 4. WebSocket 연결 확인
# 브라우저 콘솔: new WebSocket('wss://api.seniorlink.kr/socket.io/?EIO=4&transport=websocket')

# 5. 컨테이너 상태
docker compose -f docker-compose.prod.yml ps
# → 모든 서비스 Up

# 6. 최근 로그 (오류 없는지 확인)
docker compose -f docker-compose.prod.yml logs api --tail=50
```

---

## 8. GitHub Actions CI/CD

### 8.1 워크플로우 흐름

```
develop 브랜치 push
    │
    ▼
test job ──────────────────────────────────
  1. Node.js 22 설치
  2. npm ci
  3. 마이그레이션 실행 (테스트 DB)
  4. npm run test:cov  ← 실패 시 중단
    │
    ▼ (test 성공 시에만)
deploy job ────────────────────────────────
  1. Docker 이미지 빌드
  2. GHCR 푸시
  3. VPS SSH 접속
  4. docker compose pull api
  5. docker compose up -d api
  6. migration:run
```

### 8.2 GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서 설정:

| Secret 이름 | 값 | 설명 |
|---|---|---|
| `VPS_HOST` | `123.45.67.89` | VPS IP 주소 |
| `VPS_USER` | `ubuntu` | VPS SSH 사용자 |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | SSH 개인키 전체 |
| `GHCR_TOKEN` | `ghp_...` | GitHub Personal Access Token (packages:write) |

### 8.3 SSH 키 생성 및 등록

```bash
# 로컬에서 배포 전용 SSH 키 생성
ssh-keygen -t ed25519 -C "seniorlink-deploy" -f ~/.ssh/seniorlink_deploy

# 공개키를 VPS에 등록
ssh-copy-id -i ~/.ssh/seniorlink_deploy.pub ubuntu@your-vps-ip

# 개인키를 GitHub Secrets에 등록
cat ~/.ssh/seniorlink_deploy
# 전체 내용을 VPS_SSH_KEY secret에 붙여넣기
```

### 8.4 배포 워크플로우 전체 (`.github/workflows/deploy.yml`)

```yaml
name: CI/CD — develop → VPS

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    name: 테스트 & 린트
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: seniorlink
          POSTGRES_PASSWORD: password
          POSTGRES_DB: seniorlink_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4

      - name: Node.js 설치
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: apps/api/package-lock.json

      - name: 의존성 설치
        working-directory: apps/api
        run: npm ci

      - name: 마이그레이션 (테스트 DB)
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://seniorlink:password@localhost:5432/seniorlink_test
        run: npm run migration:run

      - name: 단위 테스트 + 커버리지
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://seniorlink:password@localhost:5432/seniorlink_test
          JWT_SECRET: test-jwt-secret-32-chars-minimum-ok
          JWT_REFRESH_SECRET: test-refresh-secret-32-chars-min-ok
          REDIS_URL: redis://localhost:6379
        run: npm run test:cov

  deploy:
    name: VPS 배포
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: GHCR 로그인
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | \
          docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: API Docker 이미지 빌드 & 푸시
        run: |
          docker build \
            -t ghcr.io/${{ github.repository_owner }}/seniorlink-api:latest \
            -t ghcr.io/${{ github.repository_owner }}/seniorlink-api:${{ github.sha }} \
            apps/api
          docker push ghcr.io/${{ github.repository_owner }}/seniorlink-api:latest
          docker push ghcr.io/${{ github.repository_owner }}/seniorlink-api:${{ github.sha }}

      - name: VPS SSH 배포
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            cd /srv/seniorlink

            echo "📦 신규 이미지 Pull..."
            docker compose -f docker-compose.prod.yml pull api

            echo "🔄 API 서비스 재시작..."
            docker compose -f docker-compose.prod.yml up -d --no-deps api

            echo "🗄️ 마이그레이션 실행..."
            docker compose -f docker-compose.prod.yml exec -T api npm run migration:run

            echo "🏥 헬스체크..."
            sleep 5
            curl -sf http://localhost:3000/v1/health || exit 1

            echo "✅ 배포 완료: $(date)"
```

### 8.5 PR 배포 차단 정책

| 브랜치 | 트리거 | 동작 |
|---|---|---|
| `main` 또는 `develop`으로 PR | `pull_request` | 테스트만 실행 (배포 없음) |
| `develop` 브랜치 push | `push` | 테스트 → 배포 |
| 테스트 실패 | — | 배포 job 차단 |

---

## 9. SSL 인증서 (Let's Encrypt)

### 9.1 Certbot 설치 및 최초 발급

```bash
# VPS에서 실행
apt install -y certbot

# Nginx 중지 후 인증서 발급 (standalone 모드)
docker compose -f docker-compose.prod.yml stop nginx

certbot certonly --standalone \
  -d seniorlink.kr \
  -d www.seniorlink.kr \
  -d api.seniorlink.kr \
  --email admin@seniorlink.kr \
  --agree-tos \
  --non-interactive

# Nginx 재시작
docker compose -f docker-compose.prod.yml start nginx
```

### 9.2 자동 갱신 설정 (Cron)

```bash
# crontab 편집
crontab -e

# 매월 1일 02:30 자동 갱신 + Nginx 리로드
30 2 1 * * certbot renew --quiet && \
  docker exec seniorlink-nginx nginx -s reload
```

### 9.3 인증서 갱신 확인

```bash
certbot renew --dry-run
# → Congratulations, all simulated renewals succeeded
```

---

## 10. 모니터링 & 로그

### 10.1 헬스체크 엔드포인트

```bash
# 상태 확인
curl https://api.seniorlink.kr/v1/health | jq .
```

```json
{
  "status": "ok",
  "timestamp": "2026-05-13T09:00:00Z",
  "uptime": 86400,
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

### 10.2 Prometheus 메트릭

```bash
# 메트릭 수집
curl https://api.seniorlink.kr/v1/metrics
```

```
# HELP http_requests_total Total number of HTTP requests by route
http_requests_total{route="POST /v1/auth/login"} 1243
http_requests_total{route="GET /v1/requests/:id/matches"} 892

# HELP http_request_duration_ms_avg Average HTTP request duration
http_request_duration_ms_avg 45.23

# HELP process_uptime_seconds Process uptime
process_uptime_seconds 86400
```

### 10.3 컨테이너 로그 확인

```bash
# API 로그 (실시간)
docker compose -f docker-compose.prod.yml logs -f api

# 최근 100줄
docker compose -f docker-compose.prod.yml logs api --tail=100

# 에러만 필터
docker compose -f docker-compose.prod.yml logs api | grep -i error

# 특정 시간 이후 로그
docker compose -f docker-compose.prod.yml logs api --since="2026-05-13T09:00:00"
```

### 10.4 리소스 사용량 확인

```bash
# 컨테이너별 CPU/메모리
docker stats

# 디스크 사용량
df -h
docker system df

# PostgreSQL 연결 수
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U seniorlink -c "SELECT count(*) FROM pg_stat_activity;"

# Redis 메모리 사용량
docker compose -f docker-compose.prod.yml exec redis redis-cli info memory | grep used_memory_human
```

### 10.5 업타임 모니터링 (UptimeRobot 권장)

| 모니터 이름 | URL | 타입 | 주기 |
|---|---|---|---|
| API Health | `https://api.seniorlink.kr/v1/health` | HTTP | 5분 |
| Web Dashboard | `https://seniorlink.kr` | HTTP | 5분 |

경고 조건: 응답 없음 3회 연속 → 이메일/슬랙 알림

---

## 11. 롤백 절차

### 11.1 빠른 롤백 (이전 이미지)

```bash
# VPS에서 실행
cd /srv/seniorlink

# 이전 커밋 SHA 확인
docker images ghcr.io/your-org/seniorlink-api | head -5

# 특정 버전으로 롤백
docker compose -f docker-compose.prod.yml stop api
docker tag ghcr.io/your-org/seniorlink-api:{이전_SHA} \
           ghcr.io/your-org/seniorlink-api:latest
docker compose -f docker-compose.prod.yml up -d api

# 헬스체크
sleep 5 && curl -sf http://localhost:3000/v1/health
```

### 11.2 마이그레이션 롤백

```bash
# 마이그레이션 1단계 되돌리기
docker compose -f docker-compose.prod.yml exec api npm run migration:revert

# 이전 코드 이미지로 롤백
docker compose -f docker-compose.prod.yml up -d --no-deps api
```

### 11.3 데이터베이스 백업 & 복구

```bash
# 수동 백업
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U seniorlink seniorlink_db > backup-$(date +%Y%m%d-%H%M%S).sql

# 복구 (긴급 시)
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U seniorlink seniorlink_db < backup-20260513-090000.sql
```

### 11.4 자동 백업 Cron

```bash
# /srv/seniorlink/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/srv/seniorlink/backups

mkdir -p $BACKUP_DIR
docker compose -f /srv/seniorlink/docker-compose.prod.yml exec -T postgres \
  pg_dump -U seniorlink seniorlink_db > $BACKUP_DIR/db-$DATE.sql

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# crontab에 등록
chmod +x /srv/seniorlink/backup.sh
crontab -e
# 매일 새벽 3시 백업
0 3 * * * /srv/seniorlink/backup.sh >> /var/log/seniorlink-backup.log 2>&1
```

---

## 12. 트러블슈팅

### 12.1 컨테이너가 시작되지 않음

```bash
# 상태 확인
docker compose -f docker-compose.prod.yml ps

# 종료된 컨테이너 로그
docker compose -f docker-compose.prod.yml logs api --tail=50

# 환경 변수 확인
docker compose -f docker-compose.prod.yml config
```

**`Error: connect ECONNREFUSED`**
```bash
# PostgreSQL 헬스체크 확인
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# 의존성 순서 재확인
docker compose -f docker-compose.prod.yml up -d postgres redis
sleep 10
docker compose -f docker-compose.prod.yml up -d api
```

---

### 12.2 마이그레이션 실패

```bash
# 오류 메시지 확인
docker compose -f docker-compose.prod.yml exec api npm run migration:run 2>&1

# 현재 마이그레이션 상태
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 5;"

# 수동으로 특정 마이그레이션 실행
psql $DATABASE_URL -f apps/api/src/database/migrations/1700000000001-ChatMessages.ts
```

---

### 12.3 Nginx 502 Bad Gateway

```bash
# API 컨테이너 상태 확인
docker compose -f docker-compose.prod.yml ps api

# API 포트 응답 확인 (Nginx 없이 직접)
curl http://localhost:3000/v1/health

# Nginx 설정 검증
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Nginx 리로드
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

### 12.4 SSL 인증서 오류

```bash
# 인증서 만료일 확인
certbot certificates

# 수동 갱신
certbot renew --force-renewal
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

### 12.5 디스크 공간 부족

```bash
# 미사용 Docker 리소스 정리
docker system prune -af

# 오래된 이미지 삭제 (최근 3개만 유지)
docker images ghcr.io/your-org/seniorlink-api | \
  tail -n +4 | awk '{print $3}' | xargs docker rmi

# 로그 파일 정리
find /var/lib/docker/containers -name "*.log" -exec truncate -s 0 {} \;
```

---

### 12.6 Redis 연결 오류

```bash
# Redis 상태 확인
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
# → PONG

# 비밀번호 인증 확인
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli -a $REDIS_PASSWORD ping

# 메모리 부족 시 캐시 전체 초기화 (주의: 매칭 캐시 소실)
docker compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL
```

---

### 12.7 Puppeteer PDF 생성 실패

```bash
# Chromium 실행 확인
docker compose -f docker-compose.prod.yml exec api \
  /usr/bin/chromium-browser --version

# sandbox 오류 시 환경변수 확인
docker compose -f docker-compose.prod.yml exec api \
  env | grep PUPPETEER
# → PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# → PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

---

*시니어링크 개발팀 · 내부 문서 · Phase 1 MVP*
