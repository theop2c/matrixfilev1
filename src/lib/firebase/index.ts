import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { logger } from '../logger';

logger.info('Initializing Firebase');

let auth, db, storage;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  logger.info('Firebase initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase:', error);
  throw error;
}

export { auth, db, storage };