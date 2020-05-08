FROM node:10 as web

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

#ARG version
#RUN ${version}=${( npm version | grep covid19liveupdates | sed "s/'(.*?)'//g")}
#ENV CONTAINER_VERSION=${version}

COPY dist .
CMD node server.js
