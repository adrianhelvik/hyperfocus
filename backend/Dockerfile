FROM node:21-alpine

WORKDIR /backend

COPY ./backend/scripts ./scripts
COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./

RUN yarn

COPY ./backend/migrations ./migrations
COPY ./backend/knexfile.js ./
COPY ./backend/src src

CMD ["yarn", "start"]
