# ══════════════════════════════════════════════════════════════
#  AI Trainer English — Makefile
# ══════════════════════════════════════════════════════════════

DC      = docker compose
DC_PROD = docker compose -f docker-compose.prod.yml

.PHONY: help up down build restart logs \
        logs-be logs-fe logs-db \
        shell-be shell-fe shell-db \
        prod-up prod-down prod-build \
        clean nuke install

# ── Default target ─────────────────────────────────────────────
help:
	@echo ""
	@echo "  AI Trainer English — Available commands"
	@echo "  ─────────────────────────────────────────"
	@echo "  Development:"
	@echo "    make up          Start all services (dev)"
	@echo "    make down        Stop all services"
	@echo "    make build       Build / rebuild images"
	@echo "    make restart     Restart all services"
	@echo "    make logs        Follow logs (all services)"
	@echo "    make logs-be     Follow backend logs"
	@echo "    make logs-fe     Follow frontend logs"
	@echo "    make logs-db     Follow mongo logs"
	@echo "    make shell-be    Open shell in backend container"
	@echo "    make shell-fe    Open shell in frontend container"
	@echo "    make shell-db    Open mongosh in mongo container"
	@echo ""
	@echo "  Production:"
	@echo "    make prod-up     Start all services (prod)"
	@echo "    make prod-down   Stop production services"
	@echo "    make prod-build  Build production images"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean       Remove stopped containers & unused images"
	@echo "    make nuke        Remove everything incl. volumes (DANGER)"
	@echo ""

# ── Development ────────────────────────────────────────────────
up:
	$(DC) up -d
	@echo "Services running:"
	@echo "  FE  → http://localhost:3000"
	@echo "  BE  → http://localhost:8000"
	@echo "  DB  → mongodb://localhost:27017"

down:
	$(DC) down

build:
	$(DC) build

restart:
	$(DC) restart

logs:
	$(DC) logs -f

logs-be:
	$(DC) logs -f be

logs-fe:
	$(DC) logs -f fe

logs-db:
	$(DC) logs -f mongo

shell-be:
	$(DC) exec be sh

shell-fe:
	$(DC) exec fe sh

shell-db:
	$(DC) exec mongo mongosh ai_trainer_english

# ── Production ─────────────────────────────────────────────────
prod-up:
	$(DC_PROD) up -d
	@echo "Production services running:"
	@echo "  FE  → http://localhost:80"
	@echo "  BE  → http://localhost:8000"

prod-down:
	$(DC_PROD) down

prod-build:
	$(DC_PROD) build --no-cache

# ── Cleanup ────────────────────────────────────────────────────
clean:
	$(DC) down --remove-orphans
	docker image prune -f

nuke:
	@echo "WARNING: This will delete ALL containers, images, and volumes!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(DC) down -v --remove-orphans
	docker system prune -af --volumes
