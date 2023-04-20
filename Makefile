DOCKER_COMPOSE	:=	docker-compose
DOCKER_COMPOSE_FILE	:=	srcs/docker-compose.yml
PROJECT_NAME	:=	transcendence

all:
	sh make_dir.sh
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up --build -d

up:
	sh make_dir.sh
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up

down:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

clean: down
	docker system prune -f --all

fclean: clean
	rm -rf ~/data
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --volumes --rmi all

re: fclean all

.PHONY: all up down clean fclean re