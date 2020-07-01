FROM node:latest as ng-builder
WORKDIR '/app'
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY ./ .
RUN npm run build_lib && npm run npm_pack
RUN ls ./dist/angular-app-utils-lib/
RUN cp ./dist/angular-app-utils-lib/angular-app-utils-lib-0.0.1.tgz ..
RUN rm -R ./*
