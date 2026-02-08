# 맛집 포스팅 요약 플랫폼 - 개발 및 운영 기술 지침서

이 문서는 개발자/운영자가 맛집 포스팅 요약 플랫폼을 개발하고 배포하는 방법을 안내합니다.

## 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)
3. [기술 스택 상세](#기술-스택-상세)
4. [개발 가이드라인](#개발-가이드라인)
5. [데이터베이스 설치 및 설정](#데이터베이스-설치-및-설정)
6. [배포 절차](#배포-절차)
7. [테스트 가이드](#테스트-가이드)
8. [문제 해결 가이드](#문제-해결-가이드)

---

## 개발 환경 설정

### 1. 필수 소프트웨어

```bash
# Node.js (v18 이상)
node --version

# pnpm (또는 yarn/npm)
pnpm --version
```

### 2. 프로젝트 클론

```bash
cd /home/jj/.openclaw/workspace/github/ai-lounge
git clone <repo-url> .
```

### 3. 의존성 설치

```bash
# 프로젝트 루트에서 실행
pnpm install
```

### 4. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

**.env 파일 내용:**
```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/nabijiyo"

# 애플리케이션
NEXT_PUBLIC_APP_URL="https://nabijiyo.com"
NEXT_PUBLIC_API_URL="https://api.nabijiyo.com"

# 로깅
LOG_LEVEL="info"

# 스크래핑
SCRAPING_DELAY_MS="2000"
SCRAPING_MAX_RETRIES="3"
```

### 5. 데이터베이스 마이그레이션 실행

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init
```

### 6. 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev
```

서버가 http://localhost:3000 에서 시작됩니다.

---

## 프로젝트 구조

```
ai-lounge/
├── app/                      # Next.js App Router
│   ├── (main)/              # 메인 페이지 그룹
│   │   ├── page.tsx         # 검색 페이지
│   │   └── layout.tsx       # 레이아웃
│   ├── (admin)/             # 관리자 페이지 그룹
│   │   ├── dashboard/       # 대시보드
│   │   ├── cafes/           # 맛집 관리
│   │   └── posts/           # 포스팅 관리
│   ├── api/                 # API Routes
│   │   ├── search/          # 검색 API
│   │   ├── detail/          # 상세 API
│   │   ├── scrape/          # 스크래핑 API
│   │   └── admin/           # 관리자 API
│   ├── lib/                 # 유틸리티
│   │   ├── db.ts            # Prisma client
│   │   ├── scrape.ts        # 스크래핑 로직
│   │   └── analysis.ts      # 분석 로직
│   └── components/          # React 컴포넌트
│       ├── CafeCard.tsx
│       ├── ReviewChart.tsx
│       └── ...
├── prisma/                  # Prisma 설정
│   ├── schema.prisma
│   └── migrations/
├── public/                  # 정적 자산
├── Dockerfile               # Docker 이미지 빌드
├── k8s/                     # Kubernetes 매니페스트
│   ├── base/
│   └── overlays/
├── .env                     # 환경 변수
├── .env.example             # 환경 변수 예시
├── package.json
└── tsconfig.json
```

---

## 기술 스택 상세

### 프론트엔드

#### Next.js (App Router)
- **버전:** 14.x
- **특징:**
  - App Router 사용
  - Server Components 활용
  - ISR (Incremental Static Regeneration) 지원

#### TypeScript
- **버전:** 5.x
- **타입 정의:**
  - 타입 안전한 API 호출
  - Prisma 타입 활용

#### Tailwind CSS
- **설정:**
  - 유틸리티 클래스 사용
  - 커스텀 컴포넌트 스타일링

#### Chart.js
- **사용 목적:**
  - 평점 그래프 시각화
  - 다차원 평가 표시

### 백엔드

#### Prisma ORM
- **버전:** 5.x
- **설정:**
  - PostgreSQL 사용
  - 마이그레이션 관리
  - 타입 세이프 쿼리

### 데이터 수집

#### Cheerio
- **사용 목적:**
  - HTML 파싱
  - 네이버 포스팅 데이터 추출

#### Axios
- **사용 목적:**
  - HTTP 요청
  - CORS 처리

---

## 개발 가이드라인

### 1. 커밋 컨벤션

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일링
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드/작업 도구 수정
```

### 2. 코딩 스타일

- **TypeScript:** 엄격한 타입 체크 사용
- **함수:** 가능한 순수 함수 작성
- **에러 처리:** 적절한 에러 처리
- **가독성:** 명확한 변수명 및 주석

### 3. 파일명 규칙

- 컴포넌트: PascalCase (예: `CafeCard.tsx`)
- 유틸리티: camelCase (예: `scrape.ts`)
- 페이지: kebab-case (예: `cafe-detail.tsx`)

---

## 데이터베이스 설치 및 설정

### 1. PostgreSQL 설치

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux
```bash
sudo apt-get install postgresql
sudo service postgresql start
```

#### Docker
```bash
docker run --name nabijiyo-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nabijiyo \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Prisma 설치

```bash
npx prisma init
```

### 3. 스키마 정의

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cafe {
  id          String     @id @default(uuid())
  name        String
  address     String
  phone       String?
  description String?
  hours       String?
  menu        Json
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  posts       Post[]
  reviews     Review[]
  summary     Summary?
}

model Post {
  id         String     @id @default(uuid())
  cafeId     String
  cafe       Cafe       @relation(fields: [cafeId], references: [id])
  source     String     // naver_blog, naver_knowledge, instagram
  url        String
  title      String
  content    String
  thumbnail  String?
  metadata   Json?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  reviews    Review[]
}

model Review {
  id         String   @id @default(uuid())
  cafeId     String
  cafe       Cafe     @relation(fields: [cafeId], references: [id])
  postId     String
  post       Post     @relation(fields: [postId], references: [id])
  category   String   // taste, service, value, cleanliness
  score      Int      // 1-5
  description String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Summary {
  id           String   @id @default(uuid())
  cafeId       String   @unique
  cafe         Cafe     @relation(fields: [cafeId], references: [id])
  doPoints     Json     // 공통점
  dontPoints   Json     // 차이점
  warnings     Json     // 주의사항
  overallScore Float?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 4. 마이그레이션 실행

```bash
# 초기 마이그레이션
npx prisma migrate dev --name init

# 수정 후
npx prisma migrate dev

# 배포용 마이그레이션
npx prisma migrate deploy

# 스키마 확인
npx prisma studio
```

---

## 배포 절차

### 1. 이미지 빌드

```bash
# 프로젝트 루트에서 실행
docker build -t nabijiyo:latest .
```

### 2. 레지스트리 푸시 (선택)

```bash
# Docker Hub
docker push username/nabijiyo:latest

# 또는 AWS ECR/GCR 등
```

### 3. Kustomization 업데이트

```bash
# app-of-apps/overlays/{service}/kustomization.yaml 수정
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
images:
  - name: nabijiyo
    newTag: latest
```

### 4. Git Push

```bash
git add .
git commit -m "feat: 배포를 위한 이미지 태그 업데이트"
git push
```

### 5. ArgoCD 배포 확인

```bash
# ArgoCD 로그 확인
kubectl argocd app get -n argocd nabijiyo

# 로그 확인
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server
```

### 6. 배포 확인

```bash
# 서비스 확인
kubectl get pods -n {namespace}

# 서비스 엔드포인트 확인
kubectl get svc -n {namespace}

# 로그 확인
kubectl logs -f <pod-name> -n {namespace}
```

### 7. 서비스 접속 테스트

```bash
curl ${ENDPOINT}/health
# 예상 응답: {"status": "ok"}
```

---

## 테스트 가이드

### 1. 개발 서버 테스트

```bash
# 검색 페이지
http://localhost:3000/search?q=맛집

# 상세 페이지
http://localhost:3000/cafe/{cafe-id}

# 관리자 대시보드
http://localhost:3000/admin/dashboard
```

### 2. API 테스트

```bash
# 맛집 검색
curl http://localhost:3000/api/search?q=맛집

# 맛집 상세
curl http://localhost:3000/api/detail/{cafe-id}

# 스크래핑
curl http://localhost:3000/api/scrape?url={url}

# 관리자 API
curl http://localhost:3000/api/admin/cafes
```

### 3. 스크래핑 테스트

```bash
# 네이버 블로그 스크래핑
node lib/scrape.ts --source naver_blog --url "https://blog.naver.com/..."

# 네이버 지식인 스크래핑
node lib/scrape.ts --source naver_knowledge --url "https://kin.naver.com/..."
```

### 4. 분석 테스트

```bash
# 맛집 요약 분석
node lib/analysis.ts --cafe-id {cafe-id}
```

---

## 문제 해결 가이드

### 1. 데이터베이스 연결 문제

**문제:** `PrismaClientInitializationError: Can't reach database server at localhost:5432`

**해결:**
```bash
# PostgreSQL 서비스 확인
sudo service postgresql status

# PostgreSQL 시작
sudo service postgresql start

# 데이터베이스 생성
sudo -u postgres createdb nabijiyo

# 사용자 생성
sudo -u postgres psql
CREATE USER user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE nabijiyo TO user;
```

### 2. 스크래핑 차단 문제

**문제:** 네이버에서 스크래핑이 차단됨

**해결:**
- User-Agent 헤더 설정
- 요청 간격 조절 (2초 이상)
- 로봇 대체 수집 방안 검토

### 3. 포트 충돌 문제

**문제:** 3000번 포트가 이미 사용 중

**해결:**
```bash
# 포트 확인
lsof -i :3000

# 포트 사용 중인 프로세스 종료
kill -9 <pid>
```

### 4. 타입 에러

**문제:** TypeScript 에러

**해결:**
```bash
# 타입 재생성
npx prisma generate

# 타입 확인
npx tsc --noEmit
```

### 5. Docker 빌드 실패

**문제:** Docker 빌드가 실패

**해결:**
```bash
# Docker 캐시 제거
docker builder prune

# 이미지 재빌드
docker build --no-cache -t nabijiyo:latest .

# 로그 확인
docker logs <container-id>
```

---

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Docker 문서](https://docs.docker.com/)
- [Kubernetes 문서](https://kubernetes.io/docs/)
- [ArgoCD 문서](https://argoproj.github.io/argo-cd/)
- [Cheerio 문서](https://cheerio.js.org/)
- [Axios 문서](https://axios-http.com/)

---

## 협업 가이드

### 개발 흐름

1. **기획 확인:** README.md에서 기능 명세 확인
2. **기술 검토:** README-DEV.md에서 기술 스택 확인
3. **개발:** 해당 섹션의 가이드라인 따르기
4. **테스트:** 테스트 가이드에 따라 테스트 수행
5. **배포:** 배포 절차에 따라 배포
6. **QA:** QA 체크리스트 확인

### 문서 업데이트

- 코드 변경 시 README.md 업데이트
- 기술 변경 시 README-DEV.md 업데이트
- 배포 후 결과 기록

---

**마지막 업데이트:** 2026-02-08
