FROM node:20.18.1-slim
WORKDIR /usr/src/app/pgt
COPY package*.json ./
RUN yarn config set registry https://registry.npmmirror.com/
RUN yarn install
COPY . .
EXPOSE 5965
CMD ["yarn", "start"]
ENV NODE_ENV=production
ENV TZ=Asia/Shanghai