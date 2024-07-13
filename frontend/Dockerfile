FROM node:21-alpine AS build

WORKDIR /frontend

COPY ./frontend/vite.config.ts ./
COPY ./frontend/tsconfig.json ./
COPY ./frontend/index.html ./index.html
COPY ./frontend/public ./public/

COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./

RUN yarn

COPY ./frontend/src src

CMD ["yarn", "start"]
