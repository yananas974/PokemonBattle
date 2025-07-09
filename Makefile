# Pokemon Battle - Makefile
# Commandes rapides pour le développement et le déploiement

.PHONY: help install dev build start clean test lint typecheck docker

# Variables
DOCKER_COMPOSE = docker-compose
NPM = npm

## Aide - Affiche les commandes disponibles
help:
	@echo "🎮 Pokemon Battle - Commandes disponibles:"
	@echo ""
	@echo "📦 INSTALLATION:"
	@echo "  make install          - Installer toutes les dépendances"
	@echo "  make install-ci       - Installation pour CI/CD"
	@echo ""
	@echo "🚀 DÉVELOPPEMENT:"
	@echo "  make dev              - Lancer tout en mode développement"
	@echo "  make dev-backend      - Lancer seulement le backend"
	@echo "  make dev-frontend     - Lancer seulement le frontend"
	@echo "  make dev-shared       - Compiler shared en mode watch"
	@echo ""
	@echo "🏗️  BUILD:"
	@echo "  make build            - Build complet (shared -> backend -> frontend)"
	@echo "  make build-shared     - Build du package shared"
	@echo "  make build-backend    - Build du backend"
	@echo "  make build-frontend   - Build du frontend"
	@echo ""
	@echo "▶️  PRODUCTION:"
	@echo "  make start            - Lancer en production"
	@echo "  make start-backend    - Lancer backend en production"
	@echo "  make start-frontend   - Lancer frontend en production"
	@echo ""
	@echo "🧹 MAINTENANCE:"
	@echo "  make clean            - Nettoyer tous les dossiers de build"
	@echo "  make reset            - Reset complet (clean + reinstall)"
	@echo "  make typecheck        - Vérification TypeScript"
	@echo "  make lint             - Linting du code"
	@echo ""
	@echo "🗄️  BASE DE DONNÉES:"
	@echo "  make db-setup         - Configuration initiale de la DB"
	@echo "  make db-reset         - Reset de la DB"
	@echo "  make db-seed          - Seed de la DB"
	@echo "  make db-studio        - Ouvrir Drizzle Studio"
	@echo ""
	@echo "🐳 DOCKER:"
	@echo "  make docker-up        - Lancer les services Docker"
	@echo "  make docker-down      - Arrêter les services Docker"
	@echo "  make docker-logs      - Voir les logs Docker"
	@echo "  make docker-build     - Rebuild les images Docker"

## Installation des dépendances
install:
	@echo "📦 Installation des dépendances..."
	$(NPM) install
	@echo "✅ Installation terminée"

install-ci:
	@echo "📦 Installation CI/CD..."
	$(NPM) ci
	@echo "✅ Installation CI terminée"

## Développement
dev:
	@echo "🚀 Lancement en mode développement..."
	$(NPM) run dev

dev-backend:
	@echo "🚀 Lancement backend seulement..."
	$(NPM) run dev:backend

dev-frontend:
	@echo "🚀 Lancement frontend seulement..."
	$(NPM) run dev:frontend

dev-shared:
	@echo "🚀 Compilation shared en mode watch..."
	$(NPM) run dev:shared

## Build
build:
	@echo "🏗️ Build complet..."
	$(NPM) run build
	@echo "✅ Build terminé"

build-shared:
	@echo "🏗️ Build du package shared..."
	$(NPM) run build:shared

build-backend:
	@echo "🏗️ Build du backend..."
	$(NPM) run build:backend

build-frontend:
	@echo "🏗️ Build du frontend..."
	$(NPM) run build:frontend

## Production
start:
	@echo "▶️ Lancement en production..."
	$(NPM) run start

start-backend:
	@echo "▶️ Lancement backend en production..."
	$(NPM) run start:backend

start-frontend:
	@echo "▶️ Lancement frontend en production..."
	$(NPM) run start:frontend

## Maintenance
clean:
	@echo "🧹 Nettoyage..."
	$(NPM) run clean
	@echo "✅ Nettoyage terminé"

reset: clean
	@echo "🔄 Reset complet..."
	rm -rf node_modules */node_modules
	make install
	@echo "✅ Reset terminé"

typecheck:
	@echo "🔍 Vérification TypeScript..."
	$(NPM) run typecheck

lint:
	@echo "🔍 Linting du code..."
	$(NPM) run lint

test:
	@echo "🧪 Lancement des tests..."
	$(NPM) run test

## Base de données
db-setup:
	@echo "🗄️ Configuration de la base de données..."
	$(NPM) run db:setup

db-reset:
	@echo "🗄️ Reset de la base de données..."
	$(NPM) run db:reset

db-seed:
	@echo "🗄️ Seed de la base de données..."
	$(NPM) run seed

db-studio:
	@echo "🗄️ Ouverture de Drizzle Studio..."
	$(NPM) run db:studio

## Docker
docker-up:
	@echo "🐳 Lancement des services Docker..."
	$(DOCKER_COMPOSE) up -d

docker-down:
	@echo "🐳 Arrêt des services Docker..."
	$(DOCKER_COMPOSE) down

docker-logs:
	@echo "🐳 Logs Docker..."
	$(DOCKER_COMPOSE) logs -f

docker-build:
	@echo "🐳 Rebuild des images Docker..."
	$(DOCKER_COMPOSE) build --no-cache

## Commandes combinées pour le développement rapide
quick-start: install db-setup dev

production-deploy: clean install build start 