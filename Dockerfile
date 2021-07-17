FROM node:16-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN apk update && apk upgrade && apk add --no-cache bash git openssh docker-compose
EXPOSE 80
CMD [ "node", "app.js" ]
