FROM node:lts-alpine3.17

RUN apk update && \
    apk upgrade

WORKDIR /app

COPY nest .

RUN npm install && \
    npm run build

EXPOSE 8080

CMD ["npm", "run", "start:dev"]