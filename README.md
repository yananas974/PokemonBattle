# 🎮 Pokemon Battle - Application de Combat Pokémon

Une application complète de combat Pokémon développée avec TypeScript, React, et Hono. L'application permet de créer des équipes, simuler des combats, et gérer des amis avec des effets météo en temps réel.

## 📋 Table des matières

- [🎮 Pokemon Battle - Application de Combat Pokémon](#-pokemon-battle---application-de-combat-pokémon)
  - [📋 Table des matières](#-table-des-matières)
  - [✨ Fonctionnalités](#-fonctionnalités)
  - [🏗️ Architecture](#️-architecture)
  - [📋 Prérequis](#-prérequis)
  - [🚀 Installation rapide](#-installation-rapide)
  - [📦 Installation détaillée](#-installation-détaillée)
  - [🐳 Utilisation avec Docker (Recommandé)](#-utilisation-avec-docker-recommandé)
  - [💻 Développement local](#-développement-local)
  - [🌍 Configuration des variables d'environnement](#-configuration-des-variables-denvironnement)
  - [🗄️ Base de données](#️-base-de-données)
  - [🔧 Scripts disponibles](#-scripts-disponibles)
  - [🧪 Tests](#-tests)
  - [📱 Utilisation de l'application](#-utilisation-de-lapplication)
  - [🔍 Débogage](#-débogage)
  - [🚀 Déploiement](#-déploiement)
  - [🤝 Contribution](#-contribution)
  - [📄 Licence](#-licence)

## ✨ Fonctionnalités

- **🎯 Système de combat complet** : Combats interactifs et simulés
- **👥 Gestion d'équipes** : Création et gestion d'équipes Pokémon
- **🌦️ Effets météo** : Intégration avec OpenWeatherMap pour des effets réalistes
- **👫 Système d'amis** : Ajout d'amis et consultation de leurs équipes
- **🔐 Authentification** : Système complet avec JWT
- **📊 Statistiques** : Analyses détaillées des combats
- **🎨 Interface moderne** : Design responsive avec Tailwind CSS
- **🔊 Effets sonores** : Ambiance audio pour les combats

## 🏗️ Architecture

```
pokemon-battle/
├── frontend/          # Application React (Remix)
├── backend/           # API REST (Hono)
├── shared/            # Types et utilitaires partagés
├── database/          # Scripts de base de données
├── pgadmin/           # Configuration PgAdmin
└── docker-compose.yml # Orchestration Docker
```

## 📋 Prérequis

- **Node.js** : Version 20.0.0 ou supérieure
- **npm** : Version 10.0.0 ou supérieure
- **Docker** : Version 20.0.0 ou supérieure (optionnel mais recommandé)
- **Docker Compose** : Version 2.0.0 ou supérieure
- **PostgreSQL** : Version 15 ou supérieure (si pas Docker)

## 🚀 Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/pokemon-battle.git
cd pokemon-battle

# 2. Lancer avec Docker (recommandé)
make docker-up

# 3. Ou installation manuelle
make install
make db-setup
make dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001
- **PgAdmin** : http://localhost:5050

> **🌱 Seed automatique** : Lors du premier lancement avec Docker, la base de données sera automatiquement remplie avec 151 Pokémon, leurs attaques et toutes les données nécessaires. Aucune configuration manuelle requise !

## 📦 Installation détaillée

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/pokemon-battle.git
cd pokemon-battle
```

### 2. Installer les dépendances

```bash
# Installation de toutes les dépendances (monorepo)
npm install

# Ou utiliser le Makefile
make install
```

### 3. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env
```

Éditez le fichier `backend/.env` avec vos valeurs :

```env
# Base de données
DATABASE_URL=postgresql://pokemon_user:lOgan@localhost:5432/pokemon_battle
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokemon_battle
DB_USER=pokemon_user
DB_PASSWORD=lOgan

# JWT
JWT_SECRET=votre_cle_secrete_jwt_super_securisee_ici_123456789

# OpenWeatherMap API (optionnel)
OPENWEATHER_API_KEY=votre_cle_api_ici

# Serveur
PORT=3001
NODE_ENV=development
```

## 🐳 Utilisation avec Docker (Recommandé)

### Lancement rapide

```bash
# Lancer tous les services
make docker-up

# Ou manuellement
docker-compose up -d
```

### Services disponibles

- **PostgreSQL** : Base de données (port 5432)
- **Backend** : API REST (port 3001)
- **Frontend** : Interface utilisateur (port 3000)
- **PgAdmin** : Interface d'administration DB (port 5050)

### Commandes Docker utiles

```bash
# Voir les logs
make docker-logs

# Arrêter les services
make docker-down

# Rebuild les images
make docker-build
```

## 💻 Développement local

### Sans Docker

```bash
# 1. Installer PostgreSQL localement
# 2. Créer la base de données
createdb pokemon_battle

# 3. Configurer la base de données
make db-setup

# 4. Lancer en mode développement
make dev
```

### Développement par service

```bash
# Lancer seulement le backend
make dev-backend

# Lancer seulement le frontend
make dev-frontend

# Compiler shared en mode watch
make dev-shared
```

## 🌍 Configuration des variables d'environnement

### Backend (.env)

```env
# Base de données
DATABASE_URL=postgresql://pokemon_user:lOgan@localhost:5432/pokemon_battle
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokemon_battle
DB_USER=pokemon_user
DB_PASSWORD=lOgan

# Authentification
JWT_SECRET=votre_cle_secrete_jwt_super_securisee_ici_123456789

# API externe
OPENWEATHER_API_KEY=votre_cle_api_openweathermap

# Serveur
PORT=3001
NODE_ENV=development

# Docker
DOCKER_AUTO_SEED=true
FIRST_INSTALL_THRESHOLD=0
```

### Obtenir une clé OpenWeatherMap

1. Allez sur [OpenWeatherMap API](https://openweathermap.org/api)
2. Créez un compte gratuit
3. Obtenez votre clé API (1000 appels/jour gratuits)
4. Ajoutez-la dans votre fichier `.env`

> **Note** : L'application fonctionne sans clé API mais utilisera des données météo par défaut.

## 🗄️ Base de données

### Configuration initiale

```bash
# Setup complet de la DB
make db-setup

# Ou manuellement
npm run db:generate
npm run db:migrate
npm run seed
```

### Commandes utiles

```bash
# Reset de la base de données
make db-reset

# Seed des données
make db-seed

# Ouvrir Drizzle Studio
make db-studio
```

### Accès PgAdmin

- **URL** : http://localhost:5050
- **Email** : admin@pokemon.com
- **Mot de passe** : lOgan

## 🔧 Scripts disponibles

### Scripts principaux

```bash
# Développement
make dev              # Lancer tout en développement
make dev-backend      # Backend seulement
make dev-frontend     # Frontend seulement

# Build
make build            # Build complet
make build-backend    # Build backend
make build-frontend   # Build frontend

# Production
make start            # Lancer en production
make start-backend    # Backend en production
make start-frontend   # Frontend en production

# Maintenance
make clean            # Nettoyer les builds
make reset            # Reset complet
make typecheck        # Vérification TypeScript
make lint             # Linting du code
```

### Scripts npm

```bash
# Développement
npm run dev                    # Lancer tout
npm run dev:backend           # Backend seulement
npm run dev:frontend          # Frontend seulement

# Build
npm run build                 # Build complet
npm run build:backend         # Build backend
npm run build:frontend        # Build frontend

# Base de données
npm run db:setup              # Setup DB
npm run db:reset              # Reset DB
npm run seed                  # Seed DB
npm run db:studio             # Drizzle Studio
```

## 🧪 Tests

```bash
# Lancer tous les tests
make test

# Tests par service
npm run test --workspace=backend
npm run test --workspace=frontend
```

## 📱 Utilisation de l'application

### 1. Créer un compte

1. Allez sur http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire

### 2. Créer une équipe

1. Allez dans "Équipes"
2. Cliquez sur "Créer une équipe"
3. Sélectionnez vos Pokémon
4. Sauvegardez votre équipe

### 3. Lancer un combat

1. Allez dans "Combats"
2. Choisissez le type de combat :
   - **Interactif** : Contrôlez chaque tour
   - **Simulé** : Combat automatique
3. Sélectionnez vos équipes
4. Profitez du combat !

### 4. Gérer des amis

1. Allez dans "Amis"
2. Recherchez des utilisateurs
3. Envoyez des demandes d'amitié
4. Consultez les équipes de vos amis

## 🔍 Débogage

### Logs Docker

```bash
# Voir tous les logs
make docker-logs

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Vérification des services

```bash
# Vérifier que tous les services sont up
docker-compose ps

# Tester la connexion backend
curl http://localhost:3001/health

# Tester la connexion frontend
curl http://localhost:3000
```

### Problèmes courants

1. **Port déjà utilisé** : Modifiez les ports dans `docker-compose.yml`
2. **Base de données non accessible** : Vérifiez que PostgreSQL est démarré
3. **Erreur de build** : Lancez `make clean` puis `make install`

## 🚀 Déploiement

### Production avec Docker

```bash
# Build pour la production
make build

# Lancer en production
make start

# Ou avec Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'environnement production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=votre_cle_secrete_production_tres_securisee
OPENWEATHER_API_KEY=votre_cle_api_production
```

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- **TypeScript** : Strict mode activé
- **ESLint** : Configuration fournie
- **Prettier** : Formatage automatique
- **Tests** : Obligatoires pour les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les [issues GitHub](https://github.com/votre-username/pokemon-battle/issues)
2. Consultez la documentation des technologies utilisées
3. Ouvrez une nouvelle issue avec un maximum de détails

## 🔗 Liens utiles

- [Documentation Remix](https://remix.run/docs)
- [Documentation Hono](https://hono.dev/)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [OpenWeatherMap API](https://openweathermap.org/api)

---

**Développé avec ❤️ par l'équipe Pokemon Battle** 