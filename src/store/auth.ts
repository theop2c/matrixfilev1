import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '../lib/firebase';
import { signInWithGoogle, signOutUser } from '../lib/firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Utilisateur as User } from '../types';
import { logger } from '../lib/logger';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      initialized: false,

      initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userRef = doc(db, 'users', firebaseUser.uid);
              const userDoc = await getDoc(userRef);
              
              if (userDoc.exists()) {
                await setDoc(userRef, {
                  derniereConnexion: serverTimestamp()
                }, { merge: true });

                set({ 
                  user: {
                    ...userDoc.data(),
                    id: userDoc.id,
                    derniereConnexion: new Date(),
                  } as User,
                  loading: false,
                  initialized: true 
                });
              } else {
                set({ user: null, loading: false, initialized: true });
              }
            } else {
              set({ user: null, loading: false, initialized: true });
            }
          } catch (error) {
            logger.error('Auth state change error:', error);
            set({ 
              error: error as Error, 
              loading: false,
              initialized: true 
            });
          }
        });

        return unsubscribe;
      },

      signIn: async () => {
        try {
          set({ loading: true, error: null });
          const firebaseUser = await signInWithGoogle();
          if (!firebaseUser) {
            set({ loading: false });
            return;
          }

          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          const now = new Date();
          
          if (!userDoc.exists()) {
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              role: 'freemium',
              stockageUtilise: 0,
              nombreFichiers: 0,
              premiereConnexion: now,
              derniereConnexion: now,
              derniereMiseAJour: now,
              jetonUtilises: {
                entree: 0,
                sortie: 0
              }
            };
            
            await setDoc(userRef, newUser);
            set({ user: newUser, loading: false, error: null });
          } else {
            const userData = userDoc.data();
            await setDoc(userRef, {
              derniereConnexion: now
            }, { merge: true });

            set({ 
              user: { 
                ...userData,
                id: userDoc.id,
                derniereConnexion: now
              } as User, 
              loading: false, 
              error: null 
            });
          }
        } catch (error) {
          logger.error('Sign in error:', error);
          set({ error: error as Error, loading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          await signOutUser();
          set({ user: null, loading: false, error: null });
        } catch (error) {
          logger.error('Sign out error:', error);
          set({ error: error as Error, loading: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);