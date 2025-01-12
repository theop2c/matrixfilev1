// console.ts
import type { Logger, LogEntry } from './types';
import { LOG_CONFIG } from './config';
import { formatLogEntry } from './formatters';

class ConsoleLogger implements Logger {
  private createEntry(level: LogEntry['level'], message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      data
    };
  }

  private log(entry: LogEntry): void {
    if (!LOG_CONFIG.enabled) return;

    const formattedLog = formatLogEntry(entry);
    
    switch (entry.level) {
      case 'debug':
        if (LOG_CONFIG.level === 'debug') {
          console.debug(formattedLog);
        }
        break;
      case 'info':
        if (LOG_CONFIG.level === 'debug' || LOG_CONFIG.level === 'info') {
          console.info(formattedLog);
        }
        break;
      case 'warn':
        if (LOG_CONFIG.level !== 'error') {
          console.warn(formattedLog);
        }
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }
  }

  debug(message: string, ...data: unknown[]): void {
    this.log(this.createEntry('debug', message, data.length ? data : undefined));
  }

  info(message: string, ...data: unknown[]): void {
    this.log(this.createEntry('info', message, data.length ? data : undefined));
  }

  warn(message: string, ...data: unknown[]): void {
    this.log(this.createEntry('warn', message, data.length ? data : undefined));
  }

  error(message: string, ...data: unknown[]): void {
    this.log(this.createEntry('error', message, data.length ? data : undefined));
  }
}

export const consoleLogger = new ConsoleLogger();