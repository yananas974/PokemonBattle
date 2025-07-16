# 🎵 Guide de Migration Audio

## ✅ Système Audio Unifié

Le projet utilise maintenant un système audio unifié basé sur `globalAudioManager` pour éviter les conflits et améliorer les performances.

## 🔄 Migrations Nécessaires

### 1. Hook Principal Recommandé

```typescript
// ✅ NOUVEAU - À utiliser
import { useGlobalAudio } from '~/hooks/useGlobalAudio';

const { playDashboard, playBattle, stop, setVolume, isPlaying } = useGlobalAudio();
```

### 2. Anciens Hooks (À Remplacer)

```typescript
// ❌ OBSOLÈTE - Ne plus utiliser
import { useAudio } from '~/hooks/useAudio';
import { useAudioManager } from '~/hooks/useAudioManager';
import { useAudioContext } from '~/contexts/AudioContext';
```

### 3. Exemples de Migration

#### Avant (AudioContext)
```typescript
const { playTrack, stopCurrentTrack } = useAudioContext();
playTrack('dashboard');
stopCurrentTrack();
```

#### Après (GlobalAudio)
```typescript
const { playDashboard, stop } = useGlobalAudio();
playDashboard();
stop();
```

#### Avant (useAudio)
```typescript
const { play, stop, setVolume } = useAudio('/audio/song.mp3');
```

#### Après (GlobalAudio)
```typescript
const { playDashboard, stop, setVolume } = useGlobalAudio();
playDashboard(); // Gère automatiquement le fichier audio
```

## 📋 Checklist de Migration

- [ ] Remplacer `useAudioContext` par `useGlobalAudio`
- [ ] Remplacer `useAudio` par `useGlobalAudio`
- [ ] Remplacer `useAudioManager` par `useGlobalAudio`
- [ ] Vérifier que les pistes audio fonctionnent correctement
- [ ] Supprimer les imports inutiles

## 🎯 Avantages du Nouveau Système

1. **Unique Source de Vérité** - Un seul gestionnaire audio
2. **Pas de Conflits** - Empêche plusieurs pistes simultanées
3. **Meilleure Performance** - Une seule instance HTMLAudioElement
4. **Gestion Autoplay** - Déblocage automatique après interaction
5. **API Simplifiée** - Fonctions dédiées par type de musique

## 🔧 Fonctions Disponibles

```typescript
const globalAudio = useGlobalAudio();

// Contrôles principaux
globalAudio.playDashboard();  // Musique du dashboard
globalAudio.playBattle();     // Musique de combat
globalAudio.stop();           // Arrêter complètement
globalAudio.pause();          // Pause (peut reprendre)
globalAudio.resume();         // Reprendre après pause

// Informations d'état
globalAudio.isPlaying;        // boolean
globalAudio.currentTrack;     // string | null
globalAudio.volume;           // number (0-1)

// Contrôles avancés
globalAudio.setVolume(0.5);   // Changer le volume
```

## 🚨 Important

- Le `AudioProvider` dans `root.tsx` peut maintenant être supprimé
- Les anciens hooks redirigent vers le nouveau système (compatibilité)
- Tester tous les changements de musique dans l'application