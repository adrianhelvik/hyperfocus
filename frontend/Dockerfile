FROM node

WORKDIR /frontend

COPY ./frontend/scripts ./scripts
COPY ./frontend/config ./config
COPY ./frontend/public ./public

COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./

RUN yarn

COPY ./frontend/src src

CMD ["yarn", "start"]
