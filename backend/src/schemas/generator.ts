import { z } from 'zod';

/**
 * ✅ Utilitaires pour créer des schémas Zod réutilisables
 * Basé sur les bonnes pratiques de ts-to-zod
 */

// ✅ Générateur de schémas pour les types de base
export const createIdSchema = (entityName: string) => 
  z.number().min(1, `${entityName} ID must be positive`);

export const createNameSchema = (entityName: string, minLength = 1, maxLength = 100) =>
  z.string()
    .min(minLength, `${entityName} name must be at least ${minLength} characters`)
    .max(maxLength, `${entityName} name must be at most ${maxLength} characters`);

export const createStatSchema = (statName: string) =>
  z.number().min(1, `${statName} must be positive`);

// ✅ Générateur de schémas pour les types optionnels
export const createOptionalSchema = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional();

export const createOptionalWithDefault = <T extends z.ZodTypeAny>(
  schema: T, 
  defaultValue: z.infer<T>
) => schema.optional().default(defaultValue);

// ✅ Générateur de schémas composés
export const createEntitySchema = <T extends Record<string, z.ZodTypeAny>>(
  fields: T,
  entityName: string
) => z.object(fields).describe(`Schema for ${entityName}`);

// ✅ Générateur pour les tableaux avec validation
export const createArraySchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
  minItems = 0,
  maxItems?: number
) => {
  let arraySchema = z.array(itemSchema).min(minItems, `Array must have at least ${minItems} items`);
  
  if (maxItems) {
    arraySchema = arraySchema.max(maxItems, `Array must have at most ${maxItems} items`);
  }
  
  return arraySchema;
};

// ✅ Générateur pour les enums typés
export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T,
  entityName: string
) => z.enum(values, {
  errorMap: () => ({ message: `Invalid ${entityName}. Must be one of: ${values.join(', ')}` })
});

// ✅ Générateur pour les schémas avec relations
export const createRelationSchema = <T extends z.ZodTypeAny>(
  relationSchema: T,
  relationName: string,
  isRequired = true
) => {
  const schema = relationSchema.describe(`${relationName} relation`);
  return isRequired ? schema : schema.optional();
};

// ✅ Générateur pour les schémas partiels (pour les updates)
export const createPartialSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>
) => baseSchema.partial();

// ✅ Générateur pour les schémas de création (omit id, created_at, etc.)
export const createCreationSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  omitFields: string[] = ['id', 'created_at', 'updated_at']
) => {
  const omitObject = omitFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
  return baseSchema.omit(omitObject as any);
};

// ✅ Type helpers pour l'inférence TypeScript
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;

// ✅ Exemple d'utilisation avec factory pattern
export class SchemaFactory {
  static createPokemonSchema(variant: 'base' | 'complete' | 'battle' = 'base') {
    const baseFields = {
      pokemon_id: createIdSchema('Pokemon'),
      name_fr: createNameSchema('Pokemon'),
      type: z.string().min(1, 'Pokemon type is required'),
      hp: createStatSchema('HP'),
      attack: createStatSchema('Attack'),
      defense: createStatSchema('Defense'),
      speed: createStatSchema('Speed'),
      sprite_url: z.string().url().optional()
    };

    if (variant === 'complete') {
      return createEntitySchema({
        ...baseFields,
        id: createIdSchema('Database'),
        name: createNameSchema('Pokemon'),
        level: z.number().min(1).max(100).default(50),
        height: z.number().min(0),
        weight: z.number().min(0),
        back_sprite_url: z.string().url().optional(),
        user_id: createIdSchema('User'),
        created_at: z.date().optional()
      }, 'Complete Pokemon');
    }

    if (variant === 'battle') {
      return createEntitySchema({
        ...baseFields,
        currentHp: z.number().min(0).optional(),
        status: createEnumSchema(
          ['normal', 'poisoned', 'paralyzed', 'burned', 'frozen', 'sleeping'] as const,
          'status'
        ).default('normal')
      }, 'Battle Pokemon');
    }

    return createEntitySchema(baseFields, 'Base Pokemon');
  }

  static createTeamSchema(pokemonVariant: 'base' | 'complete' | 'battle' = 'base') {
    return createEntitySchema({
      id: z.string().min(1, 'Team ID is required'),
      teamName: createNameSchema('Team'),
      pokemon: createArraySchema(
        this.createPokemonSchema(pokemonVariant),
        1
      )
    }, 'Team');
  }
} 