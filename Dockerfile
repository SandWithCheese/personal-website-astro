FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM base AS build-deps
RUN pnpm install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN pnpm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN addgroup --system astro && adduser --system astro --ingroup astro

COPY --from=prod-deps --chown=astro:astro /app/node_modules ./node_modules
COPY --from=build --chown=astro:astro /app/dist ./dist
COPY --chown=astro:astro package.json ./package.json

USER astro

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]