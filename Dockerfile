# Stage 1: Build (Vite)
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install dependencies
# Lockfile が別プラットフォームで生成されていると Rollup の native optional を解決できず失敗するため、
# ここでは lockfile を持ち込まずに Linux 用に再解決させる
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
# Build for production (Vite). Ensure .env.production is prepared if needed
RUN npm run build

# Stage 2: Static serve with Nginx
FROM nginx:1.27-alpine

# Use custom nginx config (Cloud Run listens on 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
