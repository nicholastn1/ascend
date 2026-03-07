# ---------- Dependencies Layer ----------
FROM node:24-slim AS dependencies

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN mkdir -p /tmp/dev /tmp/prod

COPY package.json pnpm-lock.yaml /tmp/dev/
COPY package.json pnpm-lock.yaml /tmp/prod/

RUN cd /tmp/dev && pnpm install --frozen-lockfile

RUN cd /tmp/prod && pnpm install --frozen-lockfile --prod

# ---------- Builder Layer ----------
FROM node:24-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=dependencies /tmp/dev/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ---------- Runtime Layer ----------
FROM node:24-slim AS runtime

LABEL maintainer="Nicholas Nogueira"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="Ascend"
LABEL org.opencontainers.image.description="A career management platform for creating, updating, and sharing resumes."
LABEL org.opencontainers.image.vendor="Nicholas Nogueira"

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=dependencies /tmp/prod/node_modules ./node_modules

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

ENTRYPOINT ["node", ".output/server/index.mjs"]
