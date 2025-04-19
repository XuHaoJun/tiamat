FROM node:22.14.0-alpine3.21 AS base-stage
WORKDIR /app

#
## Dependencies Stage
FROM base-stage AS dependencies-stage
# for node-gyp build 
RUN apk add --no-cache build-base python3
COPY package.json yarn.lock ./
# 只安裝 production 相關模組，並複製出來，準備給 Release Stage 使用
RUN yarn install --frozen-lockfile --production
RUN cp -R node_modules /production_node_modules
# prod & dev 模組全部安裝
RUN yarn install --frozen-lockfile

# 
## Build Stage
FROM dependencies-stage AS build-stage
ENV NODE_ENV=production

COPY assets assets
COPY Intl Intl
COPY config config
COPY server server
COPY client client
COPY package.json yarn.lock .babelrc .eslintignore .eslintrc .tern-project index.js mern.json webpack.config.babel.js webpack.config.prod.js webpack.config.server.js  ./

RUN npm run build:all


#
## Release Stage 
FROM base-stage AS release-stage
ENV NODE_ENV=production

COPY --from=build-stage /app/assets assets
COPY --from=build-stage /app/package.json package.json
COPY --from=dependencies-stage /production_node_modules node_modules
COPY --from=build-stage /app/index.js index.js
COPY --from=build-stage /app/dist dist
COPY --from=build-stage /app/build build

EXPOSE 8000

CMD []
ENTRYPOINT ["npm", "run", "start:prod"]
