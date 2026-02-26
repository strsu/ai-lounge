# LESSONS.md - 교훈·해결 기록

## kubectl 인증 만료
- **문제:** `You must be logged in to the server (the server has asked for the client to provide credentials)`
- **원인:** kubeconfig의 service account token 만료
- **해결:** K3S 서버(192.168.1.120)에서 새로운 token 생성 필요
- **명령어:** `kubectl -n ai-lounge create token ai-lounge-user --duration=8760h > /tmp/new-token`
- **파일:** `/home/jj/.kube/ai-lounge-kubeconfig`의 `token` 필드 업데이트

## 502 / Probe 실패
- **문제:** Pod 502, liveness/readinessProbe 실패
- **원인:** deployment의 probe가 `/api/health` 등을 쓰면 앱에 해당 엔드포인트 구현 누락
- **해결:** route.ts에 `/api/health` endpoint 추가로 해결 (nabijiyo)

## hello-ai 제거
- **내용:** 기술적 리팩토링(구조적 중복 제거)
- **참고:** 기획 단계 결정 아님. README 서비스 카탈로그 업데이트 필요

## kubectl 사용 전
- **필수:** `export KUBECONFIG=~/.kube/ai-lounge-kubeconfig` (미설정 시 실패)

## 팀장 보고 채널
- **채널:** #daily-report (C0AC70PML0M)
- **Cron:** "개발 보고" 시 plain text 반환하면 자동 전달

## 보고서 신뢰성
- **문제:** sub 에이전트 보고서와 실제 불일치
- **원인:** 실제 테스트 없이 보고서만 작성
- **해결:** 직접 테스트 검증 필수. 자동화된 보고서에만 의존하지 않기
