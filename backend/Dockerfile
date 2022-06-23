FROM node

WORKDIR /backend

COPY ./backend/package.json ./
COPY ./backend/yarn.lock ./

RUN yarn

COPY ./backend/migrations ./migrations
COPY ./backend/knexfile.js ./
COPY ./backend/src src

CMD ["yarn", "start"]
