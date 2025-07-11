# 🤝 Guide de Contribution - Pokemon Battle

Merci de votre intérêt pour contribuer au projet Pokemon Battle ! Ce guide vous aidera à démarrer.

## 📋 Prérequis pour les Contributeurs

- Node.js 20.0.0+
- npm 10.0.0+
- Docker et Docker Compose (recommandé)
- Git
- Un éditeur de code (VS Code recommandé)

## 🚀 Configuration de l'Environnement de Développement

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub, puis :
git clone https://github.com/votre-username/pokemon-battle.git
cd pokemon-battle

# Ajouter le repository original comme remote
git remote add upstream https://github.com/original-owner/pokemon-battle.git
```

### 2. Installation

```bash
# Installation des dépendances
make install

# Ou avec Docker
make docker-up
```

### 3. Configuration

```bash
# Copier le fichier d'environnement
cp backend/.env.example backend/.env

# Éditer avec vos valeurs si nécessaire
```

## 🏗️ Architecture du Projet

```
pokemon-battle/
├── frontend/          # React (Remix) - Interface utilisateur
├── backend/           # Hono - API REST
├── shared/            # Types et utilitaires partagés
├── database/          # Scripts et migrations
└── docker-compose.yml # Configuration Docker
```

## 🔧 Workflow de Développement

### 1. Créer une Branche

```bash
# Créer une branche pour votre feature
git checkout -b feature/nom-de-votre-feature

# Ou pour un bugfix
git checkout -b fix/description-du-bug
```

### 2. Développement

```bash
# Lancer en mode développement
make dev

# Ou services individuels
make dev-backend    # Backend seulement
make dev-frontend   # Frontend seulement
make dev-shared     # Shared en mode watch
```

### 3. Tests et Vérifications

```bash
# Vérification TypeScript
make typecheck

# Linting
make lint

# Tests
make test

# Build pour vérifier
make build
```

## 📝 Standards de Code

### TypeScript

- **Strict mode** activé
- Types explicites pour les fonctions publiques
- Éviter `any`, utiliser `unknown` si nécessaire
- Interfaces pour les objets complexes

```typescript
// ✅ Bon
interface PokemonData {
  id: number;
  name: string;
  types: string[];
}

const fetchPokemon = async (id: number): Promise<PokemonData> => {
  // ...
};

// ❌ Éviter
const fetchPokemon = async (id: any): Promise<any> => {
  // ...
};
```

### React/Frontend

- Composants fonctionnels avec hooks
- Props typées avec interfaces
- Mémorisation avec `React.memo()` si nécessaire
- Noms de composants en PascalCase

```tsx
// ✅ Bon
interface PokemonCardProps {
  pokemon: PokemonData;
  onSelect: (id: number) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect }) => {
  // ...
};
```

### Backend/API

- Handlers typés avec Hono
- Validation avec Zod
- Gestion d'erreurs appropriée
- Middleware pour les fonctionnalités communes

```typescript
// ✅ Bon
const pokemonHandler = new Hono()
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const pokemon = await pokemonService.findById(Number(id));
    return c.json(pokemon);
  });
```

### Base de Données

- Utiliser Drizzle ORM
- Migrations pour les changements de schéma
- Pas de requêtes SQL directes (sauf cas spéciaux)

## 🧪 Tests

### Structure des Tests

```
src/
├── components/
│   ├── PokemonCard.tsx
│   └── __tests__/
│       └── PokemonCard.test.tsx
├── services/
│   ├── pokemonService.ts
│   └── __tests__/
│       └── pokemonService.test.ts
```

### Types de Tests

- **Unit tests** : Fonctions et composants isolés
- **Integration tests** : Services avec base de données
- **E2E tests** : Parcours utilisateur complets

## 📦 Commits et Pull Requests

### Convention de Commits

```bash
# Format
type(scope): description

# Exemples
feat(pokemon): add new pokemon card component
fix(battle): resolve turn calculation bug
docs(readme): update installation instructions
refactor(shared): extract common types
test(battle): add unit tests for damage calculation
```

### Types de Commits

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (sans changement de logique)
- `refactor`: Refactoring (sans nouvelle fonctionnalité)
- `test`: Ajout/modification de tests
- `chore`: Maintenance (deps, config, etc.)

### Pull Request

1. **Titre clair** : Décrivez ce que fait votre PR
2. **Description** : Expliquez le contexte et les changements
3. **Tests** : Ajoutez des tests si nécessaire
4. **Screenshots** : Pour les changements UI
5. **Checklist** : Vérifiez tous les points

Template de PR :

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent

## Checklist
- [ ] Le code suit les standards du projet
- [ ] Les tests passent
- [ ] La documentation est à jour
- [ ] Pas de conflits avec main
```

## 🔍 Debugging

### Logs Docker

```bash
# Voir tous les logs
make docker-logs

# Logs d'un service
docker-compose logs -f backend
```

### Base de Données

```bash
# Ouvrir Drizzle Studio
make db-studio

# Ou PgAdmin
# http://localhost:5050
```

### Frontend

```bash
# Logs de développement
npm run dev --workspace=frontend

# Build pour vérifier les erreurs
npm run build --workspace=frontend
```

## 🚀 Déploiement

Les déploiements sont automatisés via GitHub Actions. Assurez-vous que :

- Tous les tests passent
- Le build réussit
- Les variables d'environnement sont configurées

## 📞 Support

- **Issues** : Ouvrez une issue GitHub pour les bugs
- **Discussions** : Utilisez les discussions GitHub pour les questions
- **Discord** : Rejoignez notre serveur Discord (lien dans le README)

## 🎯 Bonnes Pratiques

### Performance

- Utilisez `React.memo()` pour les composants coûteux
- Optimisez les requêtes de base de données
- Implémentez le lazy loading pour les images

### Sécurité

- Validez toujours les inputs utilisateur
- Utilisez HTTPS en production
- Gardez les dépendances à jour

### Accessibilité

- Utilisez les attributs ARIA appropriés
- Testez avec un lecteur d'écran
- Respectez les contrastes de couleur

## 🏆 Reconnaissance

Tous les contributeurs sont reconnus dans le README principal. Merci pour votre aide !

---

**Prêt à contribuer ? Créez votre première issue ou PR !** 🚀 