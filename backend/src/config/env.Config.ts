// ✅ CONFIGURATION D'ENVIRONNEMENT SÉCURISÉE
interface RequiredEnvVars {
  DATABASE_URL: string;
  JWT_SECRET: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

interface OptionalEnvVars {
  PORT: string;
  NODE_ENV: string;
  OPENWEATHER_API_KEY: string;
  CORS_ORIGIN: string;
}

function validateRequiredEnvVars(): RequiredEnvVars {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT', 
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `❌ Variables d'environnement manquantes: ${missing.join(', ')}\n` +
      `Veuillez configurer ces variables dans votre fichier .env`
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: process.env.DB_PORT!,
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!
  };
}

function getOptionalEnvVars(): OptionalEnvVars {
  return {
    PORT: process.env.PORT || '3001',
    NODE_ENV: process.env.NODE_ENV || 'development',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
  };
}

// Validation au chargement du module
const requiredEnv = validateRequiredEnvVars();
const optionalEnv = getOptionalEnvVars();

// Exports sécurisés
export const PORT = parseInt(optionalEnv.PORT, 10);
export const NODE_ENV = optionalEnv.NODE_ENV;
export const DATABASE_URL = requiredEnv.DATABASE_URL;
export const JWT_SECRET = requiredEnv.JWT_SECRET;
export const DB_CONFIG = {
  host: requiredEnv.DB_HOST,
  port: parseInt(requiredEnv.DB_PORT, 10),
  database: requiredEnv.DB_NAME,
  user: requiredEnv.DB_USER,
  password: requiredEnv.DB_PASSWORD
};
export const OPENWEATHER_API_KEY = optionalEnv.OPENWEATHER_API_KEY;
export const CORS_ORIGIN = optionalEnv.CORS_ORIGIN;

// Utilitaires
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

// Validation de la configuration au démarrage
export function validateConfiguration() {
  console.log('🔧 Validation de la configuration...');
  
  if (PORT < 1000 || PORT > 65535) {
    throw new Error(`❌ Port invalide: ${PORT}`);
  }
  
  if (JWT_SECRET.length < 32) {
    throw new Error('❌ JWT_SECRET trop court (minimum 32 caractères)');
  }
  
  if (isProduction && !OPENWEATHER_API_KEY) {
    console.warn('⚠️  OPENWEATHER_API_KEY manquant en production');
  }
  
  console.log('✅ Configuration validée avec succès');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🏗️  Environnement: ${NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
}