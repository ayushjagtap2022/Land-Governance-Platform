# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo package manifests
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ ./packages/

RUN npm install

# Copy frontend source
COPY apps/frontend/ ./apps/frontend/
COPY attached_assets/ ./attached_assets/

# Build frontend production bundle
RUN npm --workspace=@land-governance/frontend run build

# Production Nginx stage
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
