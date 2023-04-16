FROM node:latest

RUN apt-get update && apt-get upgrade -y

WORKDIR /app
COPY ./script.sh /tmp/
RUN chmod +x /tmp/script.sh 

EXPOSE 8080

CMD ["sh", "-c", "/tmp/script.sh"]