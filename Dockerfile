FROM node:10 as web

WORKDIR /usr/src/app
ENV CONTAINER_VERSION '2.1.0'

COPY package*.json ./
RUN npm install --production

COPY dist/server.js .
CMD node server.js
