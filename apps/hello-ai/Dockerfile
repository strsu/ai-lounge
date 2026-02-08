# Hello World 서비스용 Dockerfile
# 최적화된 빌드

# ========================================
# Stage 1: Builder (빌드 단계)
# ========================================
FROM python:3.12-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /build

# 의존성 파일 복사
COPY requirements.txt .

# requirements.txt가 비어있으므로 별도 설치 없이 종료
# 필요한 경우 여기에 패키지 설치

# ========================================
# Stage 2: Runtime (실행 단계)
# ========================================
FROM python:3.12-alpine AS runtime

# 작업 디렉토리 설정
WORKDIR /app

# 메인 스크립트 복사
COPY main.py .

# 비루트 유저 생성 (보안 강화)
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -s /sbin/nologin -D appuser && \
    chown -R appuser:appgroup /app

# 포트 노출
EXPOSE 8080

# 비루트 유저로 전환
USER appuser

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health', timeout=5)" || exit 1

# 서비스 실행
CMD ["python3", "-u", "main.py"]
