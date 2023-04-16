FROM node:latest-alpine

RUN apt-get update && apt-get upgrade -y && npm install && npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]