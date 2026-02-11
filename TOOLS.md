### Slack Channels
- #daily-report: C0AC70PML0M
- #claw-news: C0ACZPNUN73

### Browser
- 상태 확인: `openclaw browser status`
- 브라우저 시작: `openclaw browser --browser-profile openclaw start`
- 브라우저 사용 시: `openclaw browser --browser-profile openclaw`

### Kubernetes (kubectl)
**참고:** 상세 사용법은 `/home/jj/.openclaw/workspace/github/ai-lounge/README-DEV.md` 확인

**기본 설정:**
```bash
export KUBECONFIG=~/.kube/ai-lounge-kubeconfig
kubectl config current-context
kubectl cluster-info
```

**주요 명령어:**
```bash
# Pod 상태 확인
kubectl get pods -n ai-lounge

# Pod 상태 모니터링
kubectl get pods -n ai-lounge -w

# 로그 확인
kubectl logs -f deployment/<service-name> -n ai-lounge

# 서비스 확인
kubectl get svc -n ai-lounge

# 이벤트 확인
kubectl get events -n ai-lounge --sort-by=.metadata.creationTimestamp
```

**헬스 체크:**
```bash
ENDPOINT=$(kubectl get svc -n ai-lounge <service-name> -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl ${ENDPOINT}/health
```

### Docker Registry
- **레지스트리:** `registry.prup.xyz`
- **상태:** 복구 완료 (2026-02-10)
- **사용법:** 이미지 빌드 후 `docker push registry.prup.xyz/<image-name>:tag`

### Sub Agents

**사용 방법:** `sessions_send(sessionKey="[key]", message="[작업 내용]")`

#### pm 에이전트
- **sessionKey:** `agent:main:pm`
- **경로:** `/home/jj/.openclaw/agents/pm`
- **역할:** 기획자/QA
- **주요 책임:**
  - 요구사항 분석 및 기능 명세 작성
  - 프로젝트 개요 및 서비스 명세 업데이트 (README.md)
  - 테스트 기준 정의 및 QA 검증
  - 서비스 카탈로그 관리
  - 서비스 접속 테스트 및 사용자 관점 테스트
  - Slack 메시지 전송 (서브도메인 등록 요청)
- **참조 문서:** `/home/jj/.openclaw/workspace/github/ai-lounge/README.md`

#### developer 에이전트
- **sessionKey:** `agent:main:developer`
- **경로:** `/home/jj/.openclaw/agents/developer`
- **역할:** 개발자/운영자
- **주요 책임:**
  - 코드 작성 및 Dockerfile 작성
  - 이미지 빌드 및 레지스트리 푸시
  - Kustomization 설정 작성/수정
  - Git push 및 배포 상태 확인
  - Kubernetes 배포 및 인프라 관리
- **참조 문서:** `/home/jj/.openclaw/workspace/github/ai-lounge/README-DEV.md`
- **주요 도구:** Docker, kubectl, Git, SSH
