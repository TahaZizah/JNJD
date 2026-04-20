# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (layer-cached unless lockfile changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Runtime stage (Nginx) ──────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
