FROM oven/bun:1.1.20 AS install

WORKDIR /backend

COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./
COPY ./backend/migrations ./
COPY ./backend/knexfile.js ./
COPY ./backend/src ./

RUN bun install --production

CMD ["--watch", "src/index.ts"]

FROM oven/bun:1.1.20-distroless

WORKDIR /backend

COPY --from=install /backend/node_modules /backend/node_modules

COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./
COPY ./backend/migrations ./
COPY ./backend/knexfile.js ./
COPY ./backend/src ./

CMD ["src/index.ts"]
