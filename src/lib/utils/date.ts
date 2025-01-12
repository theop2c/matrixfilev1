import { logger } from '../logger';
import { Timestamp } from 'firebase/firestore';

export function parseFirestoreDate(date: Date | Timestamp | string | number | undefined | null): Date | null {
  try {
    if (!date) {
      return null;
    }

      // Handle Firestore Timestamp
    if (date instanceof Timestamp) {
      return date.toDate(); // Utilise la méthode fournie par Firebase pour convertir en Date
    }

    // Handle object with seconds and nanoseconds (fallback for non-Timestamp objects)
    if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
      return new Date(date.seconds * 1000 + date.nanoseconds / 1e6); // Convertit en millisecondes


    }


    
    // Handle Date object
    if (date instanceof Date) {
      return date;
    }

    // Handle string or number
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return null; // Si la date est invalide, retourne null
    }

    return parsed;
  } catch (error) {
    logger.error('Date parsing error:', error);
    return null;
  }
}

export function formatDate(date: Date | Timestamp | string | number | undefined | null): string {
  const parsed = parseFirestoreDate(date);
  if (!parsed) {
    console.warn('formatDate received invalid date:', date); // Log pour le débogage
    return 'Invalid date'; // Retourne un fallback clair
  }

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(parsed);
  } catch (error) {
    logger.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

export function formatRelativeTime(date: Date | Timestamp | string | number | undefined | null): string {
  const parsed = parseFirestoreDate(date);
  if (!parsed) {
    return 'Invalid date';
  }

  try {
    const now = new Date();
    const diff = now.getTime() - parsed.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return formatDate(parsed);
  } catch (error) {
    logger.error('Relative time formatting error:', error);
    return 'Invalid date';
  }
}