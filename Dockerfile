FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Expose the ports the apps bind to
EXPOSE 3001 3002 3003 3004

# The default command (this will be overridden in docker-compose.yml)
CMD [ "node", "logs-service.js" ]
