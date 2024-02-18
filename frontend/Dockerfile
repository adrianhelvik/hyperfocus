FROM node

WORKDIR /frontend

COPY ./frontend/vite.config.ts ./
COPY ./frontend/tsconfig.json ./
COPY ./frontend/index.html ./index.html
COPY ./frontend/scripts ./scripts
COPY ./frontend/config ./config

COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./

RUN yarn

COPY ./frontend/src src

CMD ["yarn", "start"]
