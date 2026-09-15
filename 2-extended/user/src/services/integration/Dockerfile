FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY src/ ./src
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY tsconfig.build.json ./

RUN npm ci
RUN npm run integration:build
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
RUN touch .integration.env
RUN touch .env

USER node

CMD CMD npm run migrations:apply && npm run integration:run
