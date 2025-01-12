import type { LogLevel } from './types';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

export function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  return levels[messageLevel] >= levels[currentLevel];
}

export function formatLogMessage(level: LogLevel, args: unknown[]): string {
  return `[${level.toUpperCase()}] ${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ')}`;
}