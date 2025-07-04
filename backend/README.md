# Configuration Backend - Pokemon Battle App

## Variables d'environnement

### Configuration initiale
1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Obtenez une clé API OpenWeatherMap (gratuite) :
   - Allez sur [OpenWeatherMap API](https://openweathermap.org/api)
   - Créez un compte gratuit
   - Obtenez votre clé API (1000 appels/jour gratuits)

3. Editez le fichier `.env` et remplacez les valeurs :
   ```bash
   # Remplacez par votre vraie clé API
   OPENWEATHER_API_KEY=votre_cle_api_ici
   ```

### Variables disponibles
- `OPENWEATHER_API_KEY` : Clé API OpenWeatherMap pour la météo en temps réel
- `JWT_SECRET` : Secret pour l'authentification JWT
- `DATABASE_URL` : URL de connexion à la base de données
- `NODE_ENV` : Environnement (development/production)
- `PORT` : Port d'écoute du serveur (défaut: 3001)

### Fonctionnalités météo
L'application utilise la météo réelle pour influencer les combats Pokémon :
- ☀️ Temps ensoleillé : Bonus pour les types feu, plante
- 🌧️ Pluie : Bonus pour les types eau, électrique
- ❄️ Neige : Malus général mais bonus pour les types glace
- ⛈️ Orage : Gros bonus pour les types électrique

### Sans clé API
L'application peut fonctionner sans clé OpenWeatherMap mais utilisera des données météo par défaut.
