# Hello World 서비스용 Dockerfile
# 최소화된 Alpine 기반 이미지

FROM python:3.12-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 메인 스크립트 복사
COPY main.py .

# 포트 노출
EXPOSE 8080

# 비루트 유저로 실행 (보안)
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup appuser && \
    chown -R appuser:appgroup /app
USER appuser

# 서비스 실행
CMD ["python3", "-u", "main.py"]

