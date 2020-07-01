FROM node:latest
WORKDIR '/app'
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY ./ .
RUN npm run build_lib && npm run npm_pack
