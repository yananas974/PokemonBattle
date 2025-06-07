# Service Pattern - Guide de Développement

## 📋 Pattern Standard pour tous les Services

Voici le pattern à suivre pour créer des services cohérents dans l'application :

### 🔧 Structure de Base

```typescript
import { db } from "../../config/drizzle.config";
import { eq } from "drizzle-orm";
import { tableName } from "../../db/schema";

// CREATE
export const createEntity = async (data: EntityData) => {
  try {
    const result = await db.insert(tableName).values(data).returning();
    
    if (!result[0]) {
      throw new Error('No entity returned after insert');
    }
    
    console.log('Entity created:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in createEntity:', error);
    throw error;
  }
};

// READ BY ID
export const getEntityById = async (id: number) => {
  try {
    const result = await db.select().from(tableName).where(eq(tableName.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getEntityById:', error);
    throw error;
  }
};

// READ ALL
export const getAllEntities = async () => {
  try {
    const result = await db.select().from(tableName);
    return result;
  } catch (error) {
    console.error('Error in getAllEntities:', error);
    throw error;
  }
};

// UPDATE
export const updateEntity = async (id: number, data: Partial<EntityData>) => {
  try {
    const result = await db.update(tableName)
      .set({
        ...data,
        updated_at: new Date() // Si la table a ce champ
      })
      .where(eq(tableName.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No entity found with id ${id}`);
    }
    
    console.log('Entity updated:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in updateEntity:', error);
    throw error;
  }
};

// DELETE
export const deleteEntity = async (id: number) => {
  try {
    const result = await db.delete(tableName)
      .where(eq(tableName.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No entity found with id ${id}`);
    }
    
    console.log('Entity deleted:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in deleteEntity:', error);
    throw error;
  }
};

// RECHERCHES PERSONNALISÉES
export const getEntityByField = async (field: string, value: any) => {
  try {
    const result = await db.select().from(tableName).where(eq(tableName[field], value));
    return result;
  } catch (error) {
    console.error('Error in getEntityByField:', error);
    throw error;
  }
};
```

### ✅ Avantages de ce Pattern

1. **Consistance** : Même structure partout
2. **Gestion d'erreurs** : Uniformisée avec logs
3. **Validation** : Vérification des résultats
4. **Debugging** : Logs clairs pour chaque opération
5. **Maintenabilité** : Code facile à comprendre et modifier

### 📚 Exemples d'Implémentation

- `authService/auth.service.ts` - Service utilisateurs
- `createTeamService/createTeam.service.ts` - Service équipes

### 🔄 Pour créer un nouveau service :

1. Copier le pattern ci-dessus
2. Remplacer `Entity` par le nom de votre entité
3. Remplacer `tableName` par votre table
4. Adapter les champs selon votre schéma
5. Ajouter des méthodes spécifiques si nécessaire 