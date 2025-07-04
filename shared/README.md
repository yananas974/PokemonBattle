# Types Partagés Pokemon Battle

Ce package contient tous les types TypeScript partagés entre le frontend et le backend de l'application Pokemon Battle.

## Structure

```
shared/
├── src/
│   ├── types/
│   │   ├── pokemon.ts     # Types liés aux Pokémon
│   │   ├── team.ts        # Types liés aux équipes
│   │   ├── user.ts        # Types liés aux utilisateurs
│   │   ├── battle.ts      # Types liés aux combats
│   │   └── common.ts      # Types communs
│   └── index.ts           # Export central
├── package.json
├── tsconfig.json
└── README.md
```

## Utilisation

### Dans le backend
```typescript
import { Pokemon, PokemonDetail, User } from '@pokemon-battle/shared';
```

### Dans le frontend
```typescript
import { Pokemon, Team, BattleResponse } from '@pokemon-battle/shared';
```

## Types principaux

- **Pokemon** : Interface de base pour un Pokémon
- **PokemonDetail** : Pokémon avec détails complets
- **Team** : Interface pour une équipe
- **User** : Interface utilisateur
- **Battle** : Interface pour les combats

## Build

```bash
npm run build
```

Le build génère les fichiers `.d.ts` dans le dossier `dist/`. 