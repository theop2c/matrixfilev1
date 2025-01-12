import type { LogEntry } from './types';

export function formatLogEntry(entry: LogEntry): string {
  const timestamp = entry.timestamp.toISOString();
  const level = entry.level.toUpperCase().padEnd(5);
  const message = entry.message;
  const data = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
  
  return `[${timestamp}] ${level} ${message}${data}`;
}