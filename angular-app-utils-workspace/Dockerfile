FROM node:latest as ng-builder
WORKDIR '/app'
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY ./ .
#RUN npm run build_lib && npm run npm_pack
RUN pwd
RUN npm run build_lib_prod
WORKDIR '/angular-app-utils-workspace/dist/angular-app-utils-lib'
RUN pwd
RUN npm publish
#FROM node:latest
#WORKDIR '/'
#RUN mkdir AngularAppUtils
#WORKDIR '/AngularAppUtils'
#COPY --from=ng-builder /app/dist/angular-app-utils-lib/angular-app-utils-lib-0.0.1.tgz .
#ENTRYPOINT ["docker-entrypoint.sh"]
#CMD [ "node" ]
