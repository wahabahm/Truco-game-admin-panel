interface EnvConfig {
  VITE_API_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
}

export const validateEnv = (): void => {
};

export const getEnvConfig = (): EnvConfig => {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'https://srv983121.hstgr.cloud/api',
    MODE: import.meta.env.MODE || 'development',
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };
};

