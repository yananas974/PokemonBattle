# 🎮 Pokemon Battle - Application Full-Stack

Une application de combat Pokémon développée avec une architecture moderne full-stack permettant aux utilisateurs de créer des équipes, défier leurs amis et simuler des combats épiques !

## 🚀 Fonctionnalités

- **🔐 Système d'authentification** : Inscription, connexion et gestion des sessions
- **👥 Système d'amis** : Ajout d'amis, demandes d'amitié et gestion des relations
- **⚔️ Combats Pokémon** : Système de combat au tour par tour avec effets météo
- **🎲 Équipes personnalisées** : Création et gestion d'équipes Pokémon
- **🌤️ Effets météorologiques** : Intégration avec l'API météo pour des combats dynamiques
- **📊 Interface moderne** : Interface utilisateur réactive avec Tailwind CSS

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **TypeScript**
- **Hono** - Framework web ultra-rapide
- **PostgreSQL** - Base de données relationnelle
- **Drizzle ORM** - ORM TypeScript moderne
- **JWT** - Authentification par tokens
- **Zod** - Validation de schémas

### Frontend
- **React** avec **TypeScript**
- **Remix** - Framework full-stack React
- **Tailwind CSS** - Framework CSS utilitaire
- **Vite** - Outil de build moderne

### Infrastructure
- **Docker & Docker Compose** - Conteneurisation
- **pgAdmin** - Interface d'administration PostgreSQL

## 📋 Prérequis

- **Node.js** >= 20.0.0
- **Docker** et **Docker Compose**
- **Git**

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone <url-du-repository>
cd pokemonTest
```

### 2. Démarrer l'application avec Docker

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

### 3. Accéder aux services

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **pgAdmin** : http://localhost:5050
  - Email : `admin@pokemon.com`
  - Mot de passe : `lOgan`

## 🏗️ Développement Local

### Installation des dépendances

```bash
# Dépendances racine
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Démarrage en mode développement

```bash
# Backend (port 3001)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm run dev
```

## 🗄️ Base de Données

### Commandes utiles

```bash
cd backend

# Réinitialiser la base de données
npm run db:reset

# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Réinitialisation complète + seed
npm run seed:force

# Interface Drizzle Studio
npm run db:studio
```

### Configuration

La base de données PostgreSQL est configurée avec :
- **Nom** : `pokemon_battle`
- **Utilisateur** : `pokemon_user`
- **Mot de passe** : `lOgan`
- **Port** : `5432`

## 🔧 Configuration

### Variables d'environnement

Le projet utilise les variables d'environnement suivantes :

#### Backend
```env
NODE_ENV=development
DATABASE_URL=postgresql://pokemon_user:lOgan@postgres:5432/pokemon_battle
PORT=3001
JWT_SECRET=votre_cle_secrete_jwt_super_securisee_ici_123456789
```

#### Frontend
```env
NODE_ENV=development
API_URL=http://backend:3001
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion

### Équipes
- `GET /api/teams` - Liste des équipes
- `POST /api/teams` - Créer une équipe
- `GET /api/teams/:id` - Détails d'une équipe

### Amis
- `GET /api/friends` - Liste des amis
- `POST /api/friends/request` - Demande d'amitié
- `PUT /api/friends/accept/:id` - Accepter une demande

### Combats
- `POST /api/battles` - Créer un combat
- `GET /api/battles/:id` - État d'un combat

## 🎮 Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous
2. **Création d'équipe** : Composez votre équipe de Pokémon
3. **Ajout d'amis** : Recherchez et ajoutez des amis
4. **Combat** : Défiez vos amis en combat au tour par tour
5. **Météo** : Les conditions météo influencent les combats

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📁 Structure du Projet

```
pokemonTest/
├── backend/                 # API Backend (Hono + TypeScript)
│   ├── src/
│   │   ├── controllers/     # Contrôleurs
│   │   ├── services/        # Logique métier
│   │   ├── routes/          # Définition des routes
│   │   ├── models/          # Interfaces et types
│   │   ├── db/              # Configuration base de données
│   │   └── utils/           # Utilitaires
│   └── drizzle/             # Migrations de base de données
├── frontend/                # Interface utilisateur (Remix + React)
│   ├── app/
│   │   ├── components/      # Composants React
│   │   ├── routes/          # Pages de l'application
│   │   ├── services/        # Services API
│   │   └── types/           # Types TypeScript
├── database/                # Scripts de base de données
└── docker-compose.yml       # Configuration Docker
```

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 📜 Conventions de Code

- **TypeScript** : Typage strict activé
- **Composants** : Composants fonctionnels avec hooks
- **Nommage** : camelCase pour les variables, PascalCase pour les composants
- **Styling** : Tailwind CSS avec classes utilitaires

## 🐛 Résolution de Problèmes

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifiez que PostgreSQL est démarré
   - Contrôlez les variables d'environnement

2. **Port déjà utilisé**
   ```bash
   # Arrêter tous les conteneurs
   docker-compose down
   
   # Redémarrer
   docker-compose up --build
   ```

3. **Problèmes de migrations**
   ```bash
   cd backend
   npm run db:fresh
   ```

## 📋 TODO

- [ ] Tests unitaires et d'intégration
- [ ] Système de notifications en temps réel
- [ ] Mode spectateur pour les combats
- [ ] Statistiques de combat avancées
- [ ] Intégration avec l'API Pokémon officielle
- [ ] Mode tournoi
- [ ] Chat en temps réel

## 📞 Support

Pour toute question ou problème, n'hésitez pas à :
- Ouvrir une issue GitHub
- Consulter la documentation des API utilisées
- Vérifier les logs des conteneurs Docker

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

⚡ **Développé avec passion pour la communauté Pokémon !** ⚡ 