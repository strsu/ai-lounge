# ========================================
# Stage 1: Builder (빌드 단계)
# ========================================
FROM node:18-alpine AS builder

# OpenSSL 설치
RUN apk add --no-cache openssl

WORKDIR /app

# 의존성 파일 복사 (레이어 캐싱 최적화)
COPY package*.json ./

# 의존성 설치 (캐싱 제거하지 않음)
RUN npm ci --legacy-peer-deps

# Prisma 스키마 복사
COPY prisma ./prisma

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# Next.js 빌드 (캐시 제거 포함)
RUN npm run build

# 불필요한 파일 삭제
# RUN rm -rf /app/node_modules/.prisma

# public 디렉토리가 존재하지 않으면 생성
RUN mkdir -p public || true

# ========================================
# Stage 2: Runtime (실행 단계)
# ========================================
FROM node:18-alpine AS runtime

# OpenSSL 설치 (Prisma CLI 필요)
RUN apk add --no-cache openssl

WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# .next/standalone 디렉토리 전체 복사
COPY --from=builder /app/.next/standalone ./

# Prisma 스키마 및 Client 복사
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Prisma CLI 전역 설치
RUN npm install -g prisma@5.22.0

# 포트 노출
EXPOSE 3000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# 서비스 실행 (standalone server.js 사용)
CMD ["node", "server.js"]
