/**
 * Environment variable validation and helpers
 */

interface EnvConfig {
  VITE_API_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
}

const requiredEnvVars = ['VITE_API_URL'] as const;

export const validateEnv = (): void => {
  const missing: string[] = [];

  requiredEnvVars.forEach((key) => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }
};

export const getEnvConfig = (): EnvConfig => {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    MODE: import.meta.env.MODE || 'development',
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };
};

// Validate on import (only in production)
if (import.meta.env.PROD) {
  validateEnv();
}


