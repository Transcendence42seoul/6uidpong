FROM node:latest

RUN apt-get update && \
    apt-get upgrade -y && \
    wget -O /usr/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 && \
    chmod +x /usr/bin/dumb-init

WORKDIR /app

COPY ./ ./

RUN npm install -g npm && \
    npm install && \
    npm run build && \
    npm install -g serve

EXPOSE 3000

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

CMD ["serve", "-s", "build", "-l", "3000"]