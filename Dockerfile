FROM node:20.10.0

WORKDIR /app

COPY package.json /app

RUN yarn

COPY . /app

RUN yarn prisma generate

RUN yarn build

EXPOSE 80


CMD ["yarn", "start"]