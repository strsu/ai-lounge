# AI Lounge 프로젝트 개발 상황 보고 - 2026-02-08 16:40 UTC

## 📊 개요
사장님이 요청한 AI Lounge 프로젝트 개발 상황 체크 결과입니다.

## ✅ 완료된 작업

### 1. 프로젝트 구조 파악
- **프로젝트 명칭**: 맛집 포스팅 요약 플랫폼 (AI Lounge)
- **기술 스택**: Next.js, TypeScript, Prisma, PostgreSQL, Kubernetes, ArgoCD
- **도메인**: *.mohae.uk (Cloudflare Tunnel 통해서만 외부 노출)

### 2. 배포 상태
- **hello-ai 서비스**: 배포 완료 (시뮬레이션)
  - 용도: Hello World 출력 (테스트용)
  - 이미지: registry.prup.xyz/ai-lounge/hello-ai:v202602081621
  - 내부 포트: 8080
  - Subdomain: hello-ai.mohae.uk (등록 필요)

- **nabijiyo 서비스**: 배포 설정 완료
  - 용도: 메인 웹 애플리케이션 (프론트엔드)
  - 이미지: registry.prup.xyz/ai-lounge/nabijiyo:latest
  - 내부 포트: 3000
  - Subdomain: nabijiyo.mohae.uk (등록 필요)

- **postgres 서비스**: 배포 설정 완료
  - 용도: 데이터베이스
  - 내부 포트: 5432
  - 외부 노출: 없음 (클러스터 내부에서만 접속)

### 3. Git 상태
- 마지막 커밋: `docs: 도메인을 nabijiyo.com에서 .mohae.uk로 변경`
- 현재 브랜치: main
- 작업 디렉토리: clean (변경 사항 없음)

## ⚠️ 현재 이슈

### 1. ArgoCD Secret 충돌 문제 (해결 필요)
```
Error: accumulating resources from 'overlays/nabijiyo': may not add resource with an already registered id: Secret.v1.[noGrp]/regcred.ai-lounge
```

**원인**:
- `app-of-apps/common/registry-secret.yaml`에 `Secret regcred`가 존재
- `app-of-apps/overlays/hello-ai/registry-secret.yaml`에 동일한 `Secret regcred`가 존재
- `app-of-apps/overlays/nabijiyo/registry-secret.yaml`에 동일한 `Secret regcred`가 존재
- Kustomization에서 이들을 합칠 때 ID 충돌 발생

**해결 방안**:
1. common/registry-secret.yaml만 유지
2. overlays/*/registry-secret.yaml 파일 삭제
3. 모든 서비스가 동일한 regcred Secret 사용

### 2. Subagent 응답 없음
- @developer, @pm 에이전트가 타임아웃으로 응답하지 않음
- 직접 프로젝트 상황 파악 완료

### 3. kubectl 설치 필요
- 현재 로컬 머신(126)에 kubectl이 설치되어 있지 않음

## 🔄 개발 진행 상황

### hello-ai 서비스
- ✅ main.py 작성 완료
- ✅ Dockerfile 작성 완료
- ✅ Kustomization 설정 완료
- ✅ 이미지 빌드 완료 (v202602081621)
- ⏳ 실제 배포 및 테스트 필요

### nabijiyo 서비스
- ✅ Next.js 프로젝트 초기화
- ✅ Prisma 스키마 구현
- ✅ Dockerfile 작성 완료
- ✅ Kustomization 설정 완료
- ✅ API Routes 구현
- ✅ 스크래핑 로직 구현
- ⏳ 이미지 빌드 필요
- ⏳ 실제 배포 필요

### postgres 서비스
- ✅ Kustomization 설정 완료
- ✅ Secret 설정 완료
- ⏳ 실제 배포 필요

## 📋 다음 작업 계획

### 1. 우선순위: ArgoCD Secret 충돌 해결
- overlays/*/registry-secret.yaml 파일 삭제
- common/registry-secret.yaml만 사용하도록 수정
- git commit 및 push
- ArgoCD 자동 배포 확인

### 2. postgres 서비스 배포
- Kustomization 설정 확인
- git commit 및 push
- ArgoCD 배포 확인
- Pod 상태 확인

### 3. nabijiyo 서비스 배포
- 이미지 빌드 (로컬 머신 126에서 실행)
  ```bash
  cd /home/jj/.openclaw/workspace/github/ai-lounge/apps/nabijiyo
  docker build -t registry.prup.xyz/ai-lounge/nabijiyo:latest .
  docker push registry.prup.xyz/ai-lounge/nabijiyo:latest
  ```
- git commit 및 push
- ArgoCD 배포 확인
- Pod 상태 및 로그 확인

### 4. hello-ai 서비스 실제 배포 확인
- Pod 상태 확인
- 로그 확인
- 헬스 체크 테스트

### 5. Subdomain 등록 요청
- Slack 채널 #claw-news (C0ACCABRQQ3)에 메시지 전송
- hello-ai, hello-ai.ai-lounge:8080
- nabijiyo, nabijiyo.ai-lounge:3000

## 💾 환경 설정 정보

### .env 파일 위치
- 경로: `/home/jj/.openclaw/workspace/github/ai-lounge/.env`

### 레지스트리 정보
- URL: registry.prup.xyz
- User: admin
- Password: admin66^^

## 🚨 필요한 지원 사항

### 1. kubectl 설치 지원
- 로컬 머신(126)에 kubectl 설치 필요
- 또는 SSH 접속 후 주인장 서버(51)에서 kubectl 사용

### 2. 빌드 환경 명확화
- 빌드는 로컬 머신(126)에서 수행
- 주인장 서버(51)는 kubectl 명령어만 사용

### 3. Subagent 활성화
- @developer, @pm 에이전트 응답 없음
- 에이전트 상태 확인 필요

## 📝 참고 문서
- README.md: 프로젝트 개요 및 서비스 명세
- README-DEV.md: 개발 및 운영 기술 지침서
- deploy-simulation.log: 배포 시뮬레이션 로그

---

**보고 시간**: 2026-02-08 16:40 UTC
**팀장**: Main Agent
