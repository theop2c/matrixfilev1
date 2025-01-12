import { Logging } from '@google-cloud/logging';

// Initialize Google Cloud Logging client
const logging = new Logging();
const log = logging.log('ai-file-analyzer');

// Default metadata for all log entries
const metadata = {
  resource: {
    type: 'global',
    labels: {
      project_id: process.env.VITE_FIREBASE_PROJECT_ID,
      environment: import.meta.env.DEV ? 'development' : 'production'
    }
  }
};

export const cloudLogger = {
  debug: (message: string, ...args: unknown[]) => {
    const entry = log.entry(metadata, {
      severity: 'DEBUG',
      message,
      data: args.length ? args : undefined
    });
    log.write(entry).catch(console.error);
  },

  info: (message: string, ...args: unknown[]) => {
    const entry = log.entry(metadata, {
      severity: 'INFO',
      message,
      data: args.length ? args : undefined
    });
    log.write(entry).catch(console.error);
  },

  warn: (message: string, ...args: unknown[]) => {
    const entry = log.entry(metadata, {
      severity: 'WARNING',
      message,
      data: args.length ? args : undefined
    });
    log.write(entry).catch(console.error);
  },

  error: (message: string, ...args: unknown[]) => {
    const entry = log.entry(metadata, {
      severity: 'ERROR',
      message,
      data: args.length ? args : undefined,
      // Include stack trace if available
      stack: args[0] instanceof Error ? args[0].stack : undefined
    });
    log.write(entry).catch(console.error);
  }
};