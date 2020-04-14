FROM node:10 as web

WORKDIR /usr/src/app
ENV ENVIRONMENT_NAME 'production'
ENV CONTAINER_VERSION '2.0.0'

COPY package*.json ./
RUN npm install --production

COPY . .
CMD node dist/server.js

###

#FROM node:10 as demo
## Create app directory
#WORKDIR /usr/src/app
#ENV ENVIRONMENT_NAME 'production'
#ENV CONTAINER_VERSION '1.5.0'
#
## Install app dependencies
## A wildcard is used to ensure both package.json AND package-lock.json are copied
## where available (npm@5+)
#COPY package*.json ./
#RUN npm install --production
## If you are building your code for production
## RUN npm ci --only=production
##COPY . .
## Bundle app source
##RUN npm run build
#
#COPY . .
#
#CMD node dist/server.js

