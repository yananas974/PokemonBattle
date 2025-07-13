# Utilitaires Pokémon

Ce dossier contient les utilitaires centralisés pour gérer les types de Pokémon dans l'application.

## pokemonTypes.ts

Utilitaire centralisé pour gérer les types de Pokémon avec support des traductions français/anglais.

### Fonctionnalités

- **Traductions bidirectionnelles** : Français ↔ Anglais
- **Couleurs et gradients** : Couleurs Tailwind CSS pour chaque type
- **Emojis** : Représentations visuelles des types
- **Normalisation** : Conversion automatique vers l'anglais
- **API unifiée** : Une seule source de vérité pour tous les types

### Utilisation

```typescript
import { 
  getTypeGradient, 
  getTypeColor, 
  getTypeEmoji, 
  getTypeInfo,
  translateTypeToFrench,
  translateTypeToEnglish 
} from '~/utils/pokemonTypes';

// Obtenir le gradient d'un type (français ou anglais)
const gradient = getTypeGradient('Feu'); // "from-red-500 to-orange-600"
const gradient2 = getTypeGradient('Fire'); // "from-red-500 to-orange-600"

// Obtenir la couleur d'un type
const color = getTypeColor('Eau'); // "bg-blue-500"

// Obtenir l'emoji d'un type
const emoji = getTypeEmoji('Électrik'); // "⚡"

// Obtenir toutes les informations d'un type
const info = getTypeInfo('Feu');
/*
{
  english: 'Fire',
  french: 'Feu',
  gradient: 'from-red-500 to-orange-600',
  color: 'bg-red-500',
  emoji: '🔥'
}
*/

// Traductions
const french = translateTypeToFrench('Fire'); // "Feu"
const english = translateTypeToEnglish('Feu'); // "Fire"
```

### Types supportés

| Français | Anglais | Emoji | Couleur |
|----------|---------|-------|---------|
| Normal | Normal | ⭐ | Gris |
| Feu | Fire | 🔥 | Rouge |
| Eau | Water | 💧 | Bleu |
| Électrik | Electric | ⚡ | Jaune |
| Plante | Grass | 🌿 | Vert |
| Glace | Ice | ❄️ | Cyan |
| Combat | Fighting | 👊 | Rouge foncé |
| Poison | Poison | ☠️ | Violet |
| Sol | Ground | 🌍 | Brun |
| Vol | Flying | 🦅 | Indigo |
| Psy | Psychic | 🔮 | Rose |
| Insecte | Bug | 🐛 | Vert lime |
| Roche | Rock | 🪨 | Brun |
| Spectre | Ghost | 👻 | Violet foncé |
| Dragon | Dragon | 🐲 | Indigo |
| Ténèbres | Dark | 🌙 | Noir |
| Acier | Steel | ⚙️ | Gris |
| Fée | Fairy | ✨ | Rose |

### Avantages de la centralisation

1. **Cohérence** : Tous les composants utilisent les mêmes couleurs et traductions
2. **Maintenabilité** : Un seul endroit pour modifier les types
3. **Performance** : Évite la duplication de code
4. **Flexibilité** : Support automatique des types français et anglais
5. **Extensibilité** : Facile d'ajouter de nouveaux types

### Migration

Les anciens mappings dans les composants ont été remplacés par les imports de cet utilitaire :

```typescript
// Avant
const getTypeGradient = (type: string) => {
  const gradients = { /* ... */ };
  return gradients[type] || 'default';
};

// Après
import { getTypeGradient } from '~/utils/pokemonTypes';
```

### Tests

Exécuter les tests avec :

```bash
npx ts-node frontend/app/utils/pokemonTypes.test.ts
``` 