# AI 이미지 생성 서비스용 Dockerfile
# Node.js 기반 서비스

# ========================================
# Stage 1: Builder (빌드 단계)
# ========================================
FROM node:18-alpine AS builder

WORKDIR /build

# package.json 복사
COPY package.json ./

# 의존성 설치
RUN npm install --production --no-optional --no-audit --no-fund

# ========================================
# Stage 2: Runtime (실행 단계)
# ========================================
FROM node:18-alpine AS runtime

# 시스템 패키지 설치 (Sharp 이미지 라이브러리용)
RUN apk add --no-cache \
    vips-dev \
    fficonfig \
    pkgconfig \
    gcc \
    g++ \
    make

# 작업 디렉토리 설정
WORKDIR /app

# 빌더 단계에서 설치한 node_modules 복사
COPY --from=builder /build/node_modules ./node_modules

# 애플리케이션 파일 복사
COPY package.json ./
COPY server.js ./

# 이미지 저장 디렉토리 생성
RUN mkdir -p images uploads && \
    chmod 755 images uploads

# 비루트 유저 생성
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -s /sbin/nologin -D appuser && \
    chown -R appuser:appgroup /app

# 포트 노출
EXPOSE 3000

# 비루트 유저로 전환
USER appuser

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# 서비스 실행
CMD ["node", "server.js"]
