import { GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './index';
import { logger } from '../logger';

export const googleProvider = new GoogleAuthProvider();

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    logger.info('Firebase auth persistence set to LOCAL');
  })
  .catch((error) => {
    logger.error('Error setting auth persistence:', error);
  });

export const signInWithGoogle = async () => {
  try {
    logger.info('Attempting Google sign in');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    logger.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    logger.error('Error signing out:', error);
    throw error;
  }
};