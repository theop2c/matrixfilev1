// config.ts
import type { LogLevel } from './types';

export const LOG_CONFIG = {
  level: (import.meta.env.DEV ? 'debug' : 'info') as LogLevel, // Ensure this is set to 'debug' in development mode
  enabled: true,
  persistLogs: import.meta.env.PROD
};