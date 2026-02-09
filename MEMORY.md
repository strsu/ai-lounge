# AI Lounge 프로젝트 개발 작업

## 2026-02-07

### 개요
*   AI Lounge 프로젝트의 개발 작업을 진행.
*   사장님의 지시에 따라, 24시간 개발을 위한 초기 환경 설정 및 작업 파악.

### 작업 내용 요약
1.  **프로젝트 구조 파악**: README.md 및 README-DEV.md 파일 분석을 통해 프로젝트 구조 및 기술 스택 파악.
2.  **kubectl 관련 정보 획득**:  `kubectl`  명령어 사용에 어려움이 있어,  `/home/jj/.openclaw/workspace`  내에서  `grep`  명령어를 사용하여  `kubectl`  관련 정보를 검색. 배포 시뮬레이션 로그 및 README-DEV.md 파일에서 kubectl 명령어 활용 예시 확인.
3.  **배포 상태 확인**:  `deploy-simulation.log`  파일을 통해  `hello-ai`  서비스가 배포되었음을 확인.  `hello-ai.ai-lounge:8080`  엔드포인트로 접근 가능.

### 참고 자료
*   `kubectl`  관련 정보는  `/home/jj/.openclaw/workspace`  내 파일에서  `grep`  명령어를 사용하여 검색 가능.
*   kubectl get pods -n ai-lounge -w: Pod 상태 확인
*   kubectl logs -f deployment/my-service -n ai-lounge: 로그 확인
*   curl ${ENDPOINT}/health: 헬스 체크

### Git 관련 설정
*   git remote origin: git@github.com:strsu/ai-lounge.git
*   git 관련 설정 변경 사항은 없음.
*   기본 branch: main

### 다음 할 일
*   apps/hello-ai 서비스 코드 분석
*   Sub-agent 활용 계획 구체화
*   24시간 개발 프로세스 구축

---

## 2026-02-08

### 개요
*   네이버 맛집 포스팅 요약 플랫폼 기획 수행.

### 작업 내용 요약
1.  **요구사항 분석 및 기능 명세서 작성**:
    *   핵심 기능 정의 (데이터 수집, 정리 및 분석, 플랫폼 구축)
    *   공통 평가 vs 개인별 평가 항목 분류
    *   DO(공통점)와 DONT(차이점) 분석 방식 정의
2.  **기술 스택 선정**:
    *   프론트엔드: Next.js (App Router) + TypeScript + Tailwind CSS
    *   백엔드: Next.js API Routes + Prisma + PostgreSQL
    *   데이터 수집: Cheerio + Axios (네이버 블로그/지식인 스크래핑)
3.  **시스템 아키텍처 설계**:
    *   사용자 인터페이스 → Next.js API → 데이터베이스 → 스크래핑 서비스
    *   데이터베이스 스키마: Cafe, Post, Review, Summary 모델 정의
4.  **데이터 수집 전략**:
    *   네이버 블로그 (우선), 네이버 지식인 (보조), 인스타그램 (선택)
    *   중복 포스팅 필터링, 평점 추출, 데이터 검증
5.  **문서 작성**:
    *   README.md: 기획 및 QA 전용 문서 (기능 명세, 테스트 기준)
    *   README-DEV.md: 개발 및 운영 기술 지침서 (개발 가이드라인, 배포 절차)
    *   MEMORY.md: 프로젝트 기록 및 학습 사항

### 기획 내용 요약

**핵심 기능**:
1.  **데이터 수집**: 네이버 블로그/지식인에서 동일한 맛집의 여러 포스팅 수집, 공통 평가 vs 개인별 평가 분류
2.  **정리 및 분석**: 포스팅별 DO(공통점)와 DONT(차이점) 구체화, 사용자 친화적 요약 리포트 생성
3.  **플랫폼 구축**: 자체 웹사이트 운영 (API/SNS 게시 아님), 관리자용 웹 대시보드 및 게시물 관리

**주요 기술 결정**:
- 웹 스크래핑 기반 데이터 수집 (네이버 검색 API 대신 사용)
- PostgreSQL + Prisma ORM 데이터베이스
- Next.js App Router + Server Components 아키텍처
- ArgoCD + Kubernetes + Docker 배포
- 평점 시각화 (Chart.js)

### 참고 자료
- 기존 프로젝트 구조: `/home/jj/.openclaw/workspace/github/ai-lounge/`
- 기획 문서: `README.md` (기능 명세, 테스트 기준)
- 개발 문서: `README-DEV.md` (개발 가이드라인, 배포 절차)

### 다음 할 일
*   개발 시작 (developer 에이전트 위임)
*   스크래핑 로직 구현
*   프론트엔드 개발
*   배포 및 QA 검증

---

## 2026-02-09

### 개요
*   AI Lounge 프로젝트 개발 보고 및 상황 파악

### 작업 내용 요약

1. **배포 상태 확인:**
   - hello-ai 서비스: 정상 (v202602081653)
   - nabijiyo 서비스: 정상 (latest)
   - postgres 데이터베이스: 정상 (내부 접속)
   - cloudflare 터널: 정상

2. **최근 완료된 작업:**
   - hello-ai 서비스 개선 완료 (로깅 및 모니터링 강화)
   - nabijiyo 서비스 구현 완료 (검색, DO/DONT 분석)
   - chat-history-viewer 서비스 구현 완료
   - ai-image-generator 서비스 구현 후 제거 (불필요)
   - PostgreSQL 배포 및 ArgoCD 설정 완료

3. **인프라 상태:**
   - ArgoCD: App of Apps 패턴으로 설정 완료, 자동 배포 동작 중
   - Cloudflare Tunnel: Pod 배포 완료, 외부 접속 정상

### 프로젝트 상태

**배포된 서비스:**
1. hello-ai (https://hello-ai.mohae.uk) - 테스트용 웹 서비스
2. nabijiyo (https://nabijiyo.mohae.uk) - 맛집 포스팅 요약 플랫폼
3. postgres - 데이터베이스 (내부 접속만 가능)
4. cloudflare - Cloudflare Tunnel

**기술 스택:**
- 프론트엔드: Next.js 14.x, TypeScript, Tailwind CSS, Chart.js
- 백엔드: Next.js API Routes, Prisma ORM, PostgreSQL
- 데이터 수집: Cheerio, Axios
- 배포: Docker, Kubernetes, ArgoCD
- 인프라: Cloudflare Tunnel

### 다음 할 일
*   QA 검증 대기 (pm_qa 에이전트와 협업)
*   스크래핑 로직 강화 (네이버 차단 방지)
*   관리자 대시보드 추가
*   데이터 시각화 (Chart.js)
*   사용자 피드백 수집
