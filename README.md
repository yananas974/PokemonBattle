# Pokemon Battle

## Description

Pokemon Battle est une application web complète permettant de créer et gérer des équipes de Pokémon pour des combats. L'application utilise l'API PokeAPI pour récupérer les données des Pokémon et permet aux utilisateurs de constituer leur équipe personnalisée.

### Technologies utilisées

- **Frontend**: Remix (React) avec TypeScript
- **Backend**: Hono (Node.js) avec TypeScript  
- **Base de données**: PostgreSQL
- **Containerisation**: Docker & Docker Compose
- **API externe**: PokeAPI (https://pokeapi.co/)

## Installation

### Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)
- Git

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd pokemonTest
   ```

2. **Lancer l'application avec Docker**
   ```bash
   docker compose up --build
   ```

3. **Accéder à l'application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Base de données PostgreSQL: localhost:5432
   - pgAdmin (Interface de gestion BDD): http://localhost:5050

## Usage

### Interface utilisateur

1. **Parcourir les Pokémon**: Consultez la liste des 151 premiers Pokémon avec leurs statistiques
2. **Ajouter à l'équipe**: Cliquez sur "Ajouter à mon équipe" pour enregistrer un Pokémon en base de données
3. **Voir les détails**: Chaque Pokémon affiche ses types, statistiques et attaques

### API Endpoints

- `GET /api/pokemon` - Récupérer tous les Pokémon de votre équipe
- `POST /api/pokemon` - Ajouter un Pokémon à votre équipe
- `DELETE /api/pokemon/:id` - Retirer un Pokémon de votre équipe
- `GET /api/health` - Vérifier l'état de l'API

### Structure du projet

```
pokemon-battle/
├── docker-compose.yml          # Configuration Docker
├── frontend/                   # Application Remix
│   ├── app/
│   │   ├── routes/
│   │   │   ├── _index.tsx     # Page principale
│   │   │   └── pokemon.$id.tsx # Détails d'un Pokémon
│   │   └── root.tsx           # Layout principal
│   ├── Dockerfile
│   └── package.json
├── backend/                    # API Hono
│   ├── src/
│   │   └── index.ts           # Serveur principal
│   ├── Dockerfile
│   └── package.json
└── database/
    └── init.sql               # Script d'initialisation PostgreSQL
```

### Commandes utiles

```bash
# Reconstruire et relancer tous les services
docker compose up --build

# Arrêter les services
docker compose down

# Supprimer les volumes (reset complet de la BDD)
docker compose down -v

# Voir les logs
docker compose logs -f

# Accéder à la base de données via CLI
docker compose exec postgres psql -U pokemon_user -d pokemon_battle

# Développement local (sans Docker)
cd frontend && npm run dev
cd backend && npm run dev
```

### Accès à pgAdmin

1. **Ouvrir pgAdmin** : http://localhost:5050
2. **Se connecter** :
   - Email: `admin@pokemon.com`
   - Mot de passe: `pokemon123`
3. **Connexion à la base de données** :
   - Le serveur "Pokemon Battle Database" devrait être pré-configuré
   - Si besoin, créer une nouvelle connexion avec :
     - Host: `postgres`
     - Port: `5432`
     - Database: `pokemon_battle`
     - Username: `pokemon_user`
     - Password: `pokemon_password`

## Fonctionnalités

### Actuelles
- ✅ Affichage de tous les Pokémon (Génération 1)
- ✅ Ajout de Pokémon à l'équipe personnelle
- ✅ Stockage en base de données PostgreSQL
- ✅ Interface responsive et moderne
- ✅ API REST complète
- ✅ Gestion des erreurs et validations

### À venir
- 🔄 Système de combat entre Pokémon
- 🔄 Gestion des niveaux et évolutions
- 🔄 Interface d'administration
- 🔄 Authentification utilisateur
- 🔄 Sauvegarde/chargement d'équipes

## Contribution

### Développement

1. **Fork** le projet
2. **Créer une branche** pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. **Pusher** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Créer une Pull Request**

### Standards de code

- Utiliser TypeScript pour tous les nouveaux fichiers
- Suivre les conventions de nommage React/Node.js
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les nouvelles API endpoints

### Base de données

La base de données utilise PostgreSQL avec les tables suivantes :
- `pokemon` : Stockage des Pokémon de l'équipe
- `battles` : Historique des combats (à venir)

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour les fans de Pokémon** 