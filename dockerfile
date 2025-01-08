# 使用多阶段构建
FROM node:23-slim AS builder

# 设置工作目录
WORKDIR /usr/src/app/pgt

# 安装 git
RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 yarn.lock
COPY package*.json ./
COPY yarn.lock ./

# 设置 yarn 配置并安装依赖
RUN yarn config set registry https://registry.npmmirror.com/ \
    && yarn install --production \
    && yarn cache clean

# 复制其余文件
COPY . .

# 第二阶段：最终镜像
FROM node:23-slim

# 设置时区和环境变量
ENV NODE_ENV=production \
    TZ=Asia/Shanghai

# 创建非 root 用户和必要的目录
RUN groupadd -r appgroup && \
    useradd -r -g appgroup appuser && \
    mkdir -p /usr/src/app/pgt

# 设置工作目录
WORKDIR /usr/src/app/pgt

# 从构建阶段复制文件
COPY --from=builder --chown=appuser:appgroup /usr/src/app/pgt ./

# 创建必要的目录并设置权限
RUN mkdir -p public/uploads/compressed views templates \
    && chown -R appuser:appgroup . \
    && chmod -R 755 .

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 5965

# 启动应用
CMD ["yarn", "start"]