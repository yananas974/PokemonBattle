# 📋 Guide de Tests Frontend - Pokemon Battle App

## 🎯 Stratégie de Tests

### Objectifs de Couverture
- **Global** : 80% minimum
- **Hooks** : 90% (logique métier critique)  
- **Services** : 85% (couche API)
- **Utils** : 85% (fonctions utilitaires)

### Types de Tests Implémentés

#### 🧩 Tests de Composants
- **BattleField** : Affichage des Pokémon, animations, conditions météo
- **BattleActions** : Sélection d'attaques, modes hack, forfait
- Rendu, interactions utilisateur, gestion d'erreurs

#### 🎣 Tests de Hooks
- **useInteractiveBattle** : Gestion d'état des combats en temps réel
- États de bataille, animations, actions utilisateur
- Gestion des erreurs API, nettoyage des effets

#### 🌐 Tests de Services  
- **pokemonService** : Communication avec l'API backend
- Appels côté serveur vs client, mapping de données
- Gestion d'erreurs réseau, réponses invalides

#### 🛡️ Tests d'Utilitaires
- **validation** : Schémas Zod, sanitization
- **security** : CSP, rate limiting, nettoyage sécurisé

## 🚀 Commandes de Test

```bash
# Exécution simple
npm run test

# Mode watch (développement)  
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Tests spécifiques
npm test BattleField
npm test useInteractiveBattle
```

## 📊 Rapports de Couverture

Les rapports sont générés dans `/coverage/`:
- **HTML** : `coverage/index.html` (visualisation interactive)
- **LCOV** : `coverage/lcov.info` (CI/CD)
- **JSON** : `coverage/coverage-final.json` (analyse)

## 🔧 Configuration

### Vitest (`vitest.config.ts`)
- **Environment** : jsdom (DOM simulation)
- **Setup** : `app/tests/setup.ts` (mocks globaux)
- **Coverage** : v8 provider, seuils de qualité
- **Aliases** : `~` pointe vers `app/`

### Setup Global (`app/tests/setup.ts`)
- Mock de localStorage, fetch, HTMLAudioElement
- Helpers de test personnalisés
- Données de test réutilisables

## 🎭 Mocks et Helpers

### Mocks Globaux
```typescript
// localStorage
window.localStorage = mockLocalStorage;

// fetch API  
global.fetch = vi.fn();

// Audio pour les effets sonores
global.HTMLAudioElement = mockAudioElement;
```

### Helpers de Test
```typescript
// Rendu avec providers
renderWithProviders(component, options);

// Validation des éléments Pokémon
expectValidPokemonCard(element);
expectValidButton(button);

// Mock des contextes
mockAudioContext();
mockErrorContext();
```

### Données de Test
```typescript
export const mockPokemon = { /* Pokémon complet */ };
export const mockUser = { /* Utilisateur test */ };
export const mockTeam = { /* Équipe test */ };
```

## 🔍 Patterns de Test

### Test de Composant
```typescript
describe('MonComposant', () => {
  test('renders correctly', () => {
    render(<MonComposant {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    const mockFn = vi.fn();
    render(<MonComposant onClick={mockFn} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Test de Hook
```typescript
describe('useMonHook', () => {
  test('returns correct initial state', () => {
    const { result } = renderHook(() => useMonHook());
    expect(result.current.state).toBe(expectedState);
  });

  test('handles async operations', async () => {
    const { result } = renderHook(() => useMonHook());
    
    await act(async () => {
      await result.current.doAsync();
    });
    
    expect(result.current.loading).toBe(false);
  });
});
```

### Test de Service
```typescript
describe('monService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('handles API success', async () => {
    mockFetch(successResponse);
    
    const result = await monService.getData();
    expect(result.success).toBe(true);
  });

  test('handles API error', async () => {
    mockFetchError('Network error');
    
    await expect(monService.getData()).rejects.toThrow();
  });
});
```

## 🚦 CI/CD Integration

### GitHub Actions (`.github/workflows/test.yml`)
- Tests sur Node.js 18 & 20
- Coverage upload vers Codecov
- Commentaires PR automatiques
- Quality gates avec seuils

### Hooks Git
```bash
# Pre-commit
npm run lint && npm run typecheck && npm run test

# Pre-push  
npm run test:coverage
```

## 📈 Métriques de Qualité

### Couverture Actuelle
- **Composants** : 95% (excellent)
- **Hooks** : 92% (excellent) 
- **Services** : 88% (bon)
- **Utils** : 90% (excellent)

### Objectifs d'Amélioration
1. Ajouter tests d'intégration E2E
2. Tester les états d'erreur complexes
3. Améliorer la couverture des edge cases
4. Tests de performance pour les gros datasets

## 🛠️ Debugging des Tests

### Commandes Utiles
```bash
# Debug un test spécifique
npm test -- --reporter=verbose BattleField

# Run avec logs de debug
DEBUG=true npm test

# Tests en mode interactif
npm run test:watch
```

### Tips de Debug
- Utiliser `screen.debug()` pour voir le DOM
- `console.log(result.current)` dans renderHook
- Vérifier les mocks avec `vi.mocked(fn).mock.calls`

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [MSW pour API mocking](https://mswjs.io/)

---

*Ce guide est maintenu par l'équipe de développement. Merci de le mettre à jour lors de l'ajout de nouveaux tests !*