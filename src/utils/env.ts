/**
 * Environment variables adapter for Vite
 * 
 * This utility provides a consistent interface for accessing environment
 * variables across both development and production builds with Vite.
 */

export const env = {
  // OpenRouter Configuration
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY as string,
  OPENROUTER_MODEL: import.meta.env.VITE_OPENROUTER_MODEL as string,
  DEFAULT_MODEL_PROVIDER: import.meta.env.VITE_DEFAULT_MODEL_PROVIDER as string,
  APP_URL: import.meta.env.VITE_APP_URL as string,
  
  // Database Configuration
  DATABASE_URL: import.meta.env.VITE_DATABASE_URL as string,
  
  // Application Settings
  NODE_ENV: import.meta.env.VITE_NODE_ENV as string,
  
  // Helper methods
  isDevelopment: () => import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: () => import.meta.env.VITE_NODE_ENV === 'production',
};

export default env;
