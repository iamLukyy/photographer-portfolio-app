# Multi-stage build pro Next.js s PNPM
FROM node:20-alpine AS base

# Install pnpm
RUN apk add --no-cache libc6-compat && npm install -g pnpm

# Stage 1: Závislosti
FROM base AS deps
WORKDIR /app

# Kopírování package.json a lockfile
COPY package.json pnpm-lock.yaml* ./

# Instalace závislostí
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Build arguments pro environment variables
ARG RESEND_API_KEY
ARG CONTACT_EMAIL
ARG ADMIN_COOKIE_SECURE

# Kopírování závislostí z předchozího stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
# Set build-time env vars
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV CONTACT_EMAIL=${CONTACT_EMAIL}
ENV ADMIN_COOKIE_SECURE=${ADMIN_COOKIE_SECURE}

# Build Next.js aplikace
RUN pnpm run build

# Stage 3: Runner (produkční image)
FROM base AS runner
ARG ADMIN_COOKIE_SECURE
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV ADMIN_COOKIE_SECURE=${ADMIN_COOKIE_SECURE}

# Vytvoření nextjs uživatele
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopírování potřebných souborů z builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Kopírování built aplikace
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kopírování lib folder s photos.json
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public /app/lib

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
