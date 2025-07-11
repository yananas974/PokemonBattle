# 🚀 Guide de Démarrage Rapide - Pokemon Battle

## Pour le Lead Developer

Ce guide vous permettra de mettre en place l'application Pokemon Battle sur votre machine en moins de 10 minutes.

## 📋 Prérequis

Vérifiez que vous avez installé :

```bash
# Vérifier Node.js (version 20+)
node --version

# Vérifier npm (version 10+)
npm --version

# Vérifier Docker (optionnel mais recommandé)
docker --version
docker-compose --version
```

Si vous n'avez pas ces outils, installez-les :
- **Node.js** : https://nodejs.org/
- **Docker** : https://www.docker.com/get-started

## 🏃‍♂️ Installation Ultra-Rapide (Docker)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/pokemon-battle.git
cd pokemon-battle

# 2. Lancer avec Docker (tout automatique)
make docker-up

# 3. Attendre 2-3 minutes que tout se lance
```

**C'est tout !** L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001  
- **Base de données** : http://localhost:5050 (PgAdmin)

> **🌱 Seed automatique** : La base de données sera automatiquement remplie avec 151 Pokémon et toutes les données nécessaires lors du premier lancement !

## 🔧 Installation Manuelle (Sans Docker)

Si vous préférez ne pas utiliser Docker :

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/pokemon-battle.git
cd pokemon-battle

# 2. Installer les dépendances
make install

# 3. Configurer la base de données
# Vous devez avoir PostgreSQL installé localement
make db-setup

# 4. Lancer l'application
make dev
```

## 🌍 Configuration des Variables d'Environnement

### Option 1 : Configuration minimale (Docker)

Rien à faire ! Docker utilise des valeurs par défaut.

### Option 2 : Configuration personnalisée

Créez le fichier `backend/.env` :

```env
# Base de données
DATABASE_URL=postgresql://pokemon_user:lOgan@localhost:5432/pokemon_battle

# JWT (gardez cette valeur ou changez-la)
JWT_SECRET=votre_cle_secrete_jwt_super_securisee_ici_123456789

# OpenWeatherMap API (optionnel)
OPENWEATHER_API_KEY=votre_cle_api_ici

# Serveur
PORT=3001
NODE_ENV=development
```

## 🎯 Tester que Tout Fonctionne

```bash
# Vérifier que les services sont up
curl http://localhost:3001/health
curl http://localhost:3000

# Ou avec Docker
docker-compose ps
```

## 🔍 Commandes Utiles

```bash
# Voir les logs
make docker-logs

# Arrêter l'application
make docker-down

# Redémarrer
make docker-up

# Nettoyer et recommencer
make docker-down
make docker-build
make docker-up
```

## 🎮 Utiliser l'Application

1. **Ouvrez** http://localhost:3000
2. **Créez un compte** (Register)
3. **Créez une équipe** (Teams > Create Team)
4. **Lancez un combat** (Battle > Simulate ou Interactive)

## 🆘 Problèmes Courants

### Port déjà utilisé
```bash
# Changer les ports dans docker-compose.yml
# Ou tuer les processus existants
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Base de données non accessible
```bash
# Redémarrer PostgreSQL
make docker-down
make docker-up
```

### Erreur de build
```bash
# Nettoyer et recommencer
make clean
make install
make docker-build
```

## 📱 Fonctionnalités Disponibles

- ✅ **Authentification** : Register/Login
- ✅ **Création d'équipes** : Sélection de Pokémon
- ✅ **Combat interactif** : Contrôle tour par tour
- ✅ **Combat simulé** : Automatique avec résultats détaillés
- ✅ **Système d'amis** : Ajout et consultation d'équipes
- ✅ **Effets météo** : Bonus/malus selon la météo réelle
- ✅ **Statistiques** : Analyses détaillées des combats

## 🔗 URLs Importantes

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend | http://localhost:3001 | - |
| PgAdmin | http://localhost:5050 | admin@pokemon.com / lOgan |
| API Health | http://localhost:3001/health | - |

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `make docker-logs`
2. Vérifiez les services : `docker-compose ps`
3. Redémarrez : `make docker-down && make docker-up`
4. Contactez l'équipe si le problème persiste

---

**Temps estimé d'installation : 5-10 minutes** ⏱️ 