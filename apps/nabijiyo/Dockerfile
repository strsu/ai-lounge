# ========================================
# Stage 1: Builder (빌드 단계)
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --legacy-peer-deps

# Prisma 스키마 복사
COPY prisma ./prisma

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# ========================================
# Stage 2: Runtime (실행 단계)
# ========================================
FROM node:18-alpine AS runtime

WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production

# node_modules 복사
COPY --from=builder /app/node_modules ./node_modules

# .next 디렉토리 복사
COPY --from=builder /app/.next ./.next

# public 디렉토리 복사 (존재하는 경우에만)
RUN [ ! -d /app/public ] || mkdir -p ./public && [ ! -d /app/public ] || cp -r /app/public/* ./public/

# package.json 복사
COPY --from=builder /app/package.json ./package.json

# Prisma 복사
COPY --from=builder /app/prisma ./prisma

# 포트 노출
EXPOSE 3000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# 서비스 실행
CMD ["npm", "start"]
