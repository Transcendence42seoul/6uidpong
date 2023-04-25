FROM node:latest

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs 

RUN npm i -g npm

WORKDIR /app

COPY . /app/
COPY package.json /app/
COPY package-lock.json /app/

RUN npm i && \
    npm run build && \
    npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]