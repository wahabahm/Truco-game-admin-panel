/**
 * Environment variable validation and helpers
 */

interface EnvConfig {
  VITE_API_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
}

// VITE_API_URL is optional - we have fallback URLs in the code
// const requiredEnvVars = ['VITE_API_URL'] as const;

export const validateEnv = (): void => {
  // No longer required since we have fallback URLs
  // This function is kept for future use if needed
};

export const getEnvConfig = (): EnvConfig => {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD
      ? 'https://truco-game-admin-panel-production.up.railway.app/api'
      : 'http://localhost:3000/api'),
    MODE: import.meta.env.MODE || 'development',
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };
};

// Validation disabled since we have fallback URLs
// VITE_API_URL will use Railway URL in production if not set via env variable


