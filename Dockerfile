FROM node:24.15-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
