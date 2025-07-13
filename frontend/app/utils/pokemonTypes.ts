// Utilitaire centralisé pour les types de Pokémon
// Gère les traductions, couleurs, gradients et emojis
import type { Pokemon } from '@pokemon-battle/shared';

export function getUniquePokemonTypes(pokemons: Pokemon[]): string[] {
  return Array.from(new Set(pokemons.map(p => p.type)));
}

// Mapping des types français vers anglais
export const FRENCH_TO_ENGLISH_TYPES: { [key: string]: string } = {
  'Feu': 'Fire',
  'Eau': 'Water', 
  'Électrik': 'Electric',
  'Plante': 'Grass',
  'Glace': 'Ice',
  'Combat': 'Fighting',
  'Poison': 'Poison',
  'Sol': 'Ground',
  'Vol': 'Flying',
  'Psy': 'Psychic',
  'Insecte': 'Bug',
  'Roche': 'Rock',
  'Spectre': 'Ghost',
  'Dragon': 'Dragon',
  'Ténèbres': 'Dark',
  'Acier': 'Steel',
  'Fée': 'Fairy',
  'Normal': 'Normal'
};

// Mapping des types anglais vers français
export const ENGLISH_TO_FRENCH_TYPES: { [key: string]: string } = {
  'Fire': 'Feu',
  'Water': 'Eau',
  'Electric': 'Électrik',
  'Grass': 'Plante',
  'Ice': 'Glace',
  'Fighting': 'Combat',
  'Poison': 'Poison',
  'Ground': 'Sol',
  'Flying': 'Vol',
  'Psychic': 'Psy',
  'Bug': 'Insecte',
  'Rock': 'Roche',
  'Ghost': 'Spectre',
  'Dragon': 'Dragon',
  'Dark': 'Ténèbres',
  'Steel': 'Acier',
  'Fairy': 'Fée',
  'Normal': 'Normal'
};

// Gradients Tailwind pour les types (basés sur les types anglais)
const TYPE_GRADIENTS: { [key: string]: string } = {
  'Normal': 'from-gray-400 to-gray-600',
  'Fire': 'from-red-500 to-orange-600',
  'Water': 'from-blue-500 to-cyan-600',
  'Electric': 'from-yellow-400 to-yellow-600',
  'Grass': 'from-green-500 to-emerald-600',
  'Ice': 'from-cyan-300 to-blue-400',
  'Fighting': 'from-red-600 to-red-800',
  'Poison': 'from-purple-500 to-purple-700',
  'Ground': 'from-yellow-600 to-amber-700',
  'Flying': 'from-indigo-400 to-blue-500',
  'Psychic': 'from-pink-500 to-purple-600',
  'Bug': 'from-green-600 to-lime-600',
  'Rock': 'from-yellow-700 to-stone-600',
  'Ghost': 'from-purple-600 to-indigo-800',
  'Dragon': 'from-indigo-600 to-purple-700',
  'Dark': 'from-gray-700 to-gray-900',
  'Steel': 'from-gray-500 to-slate-600',
  'Fairy': 'from-pink-400 to-rose-500'
};

// Couleurs de background simples pour les types
const TYPE_COLORS: { [key: string]: string } = {
  'Normal': 'bg-gray-500',
  'Fire': 'bg-red-500',
  'Water': 'bg-blue-500',
  'Electric': 'bg-yellow-500',
  'Grass': 'bg-green-500',
  'Ice': 'bg-cyan-500',
  'Fighting': 'bg-red-700',
  'Poison': 'bg-purple-500',
  'Ground': 'bg-yellow-700',
  'Flying': 'bg-indigo-500',
  'Psychic': 'bg-pink-500',
  'Bug': 'bg-green-700',
  'Rock': 'bg-yellow-800',
  'Ghost': 'bg-purple-700',
  'Dragon': 'bg-indigo-700',
  'Dark': 'bg-gray-800',
  'Steel': 'bg-gray-400',
  'Fairy': 'bg-pink-300'
};

// Emojis pour les types
const TYPE_EMOJIS: { [key: string]: string } = {
  'Fire': '🔥',
  'Water': '💧',
  'Electric': '⚡',
  'Grass': '🌿',
  'Ice': '❄️',
  'Fighting': '👊',
  'Poison': '☠️',
  'Ground': '🌍',
  'Flying': '🦅',
  'Psychic': '🔮',
  'Bug': '🐛',
  'Rock': '🪨',
  'Ghost': '👻',
  'Dragon': '🐲',
  'Dark': '🌙',
  'Steel': '⚙️',
  'Fairy': '✨',
  'Normal': '⭐'
};

// Fonction pour normaliser un type vers l'anglais
export const normalizeTypeToEnglish = (type: string): string => {
  if (!type) return 'Normal';
  
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  
  // Si c'est déjà en anglais, retourner tel quel
  if (TYPE_GRADIENTS[capitalizedType]) {
    return capitalizedType;
  }
  
  // Sinon, essayer de traduire du français vers l'anglais
  return FRENCH_TO_ENGLISH_TYPES[capitalizedType] || 'Normal';
};

// Fonction pour obtenir le gradient d'un type
export const getTypeGradient = (type: string): string => {
  const normalizedType = normalizeTypeToEnglish(type);
  return TYPE_GRADIENTS[normalizedType] || TYPE_GRADIENTS['Normal'];
};

// Fonction pour obtenir la couleur d'un type
export const getTypeColor = (type: string): string => {
  const normalizedType = normalizeTypeToEnglish(type);
  return TYPE_COLORS[normalizedType] || TYPE_COLORS['Normal'];
};

// Fonction pour obtenir l'emoji d'un type
export const getTypeEmoji = (type: string): string => {
  const normalizedType = normalizeTypeToEnglish(type);
  return TYPE_EMOJIS[normalizedType] || TYPE_EMOJIS['Normal'];
};

// Fonction pour traduire un type vers le français
export const translateTypeToFrench = (type: string): string => {
  const normalizedType = normalizeTypeToEnglish(type);
  return ENGLISH_TO_FRENCH_TYPES[normalizedType] || type;
};

// Fonction pour traduire un type vers l'anglais
export const translateTypeToEnglish = (type: string): string => {
  return normalizeTypeToEnglish(type);
};

// Fonction utilitaire pour obtenir toutes les informations d'un type
export const getTypeInfo = (type: string) => {
  const normalizedType = normalizeTypeToEnglish(type);
  return {
    english: normalizedType,
    french: ENGLISH_TO_FRENCH_TYPES[normalizedType] || normalizedType,
    gradient: TYPE_GRADIENTS[normalizedType] || TYPE_GRADIENTS['Normal'],
    color: TYPE_COLORS[normalizedType] || TYPE_COLORS['Normal'],
    emoji: TYPE_EMOJIS[normalizedType] || TYPE_EMOJIS['Normal']
  };
}; 