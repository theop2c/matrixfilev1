import { create } from 'zustand';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Utilisateur } from '../types';
import { logger } from '../lib/logger';

interface AdminState {
  users: Utilisateur[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: Utilisateur['role']) => Promise<void>;
  blockUser: (userId: string, blocked: boolean) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(query(usersRef));
      
      const users = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Utilisateur[];
      
      set({ users, loading: false });
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      set({ error: 'Échec du chargement des utilisateurs', loading: false });
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: Utilisateur['role']) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, role } : user
        )
      }));
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
  },

  blockUser: async (userId: string, blocked: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { blocked });
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, blocked } : user
        )
      }));
    } catch (error) {
      logger.error('Erreur lors du blocage/déblocage:', error);
      throw error;
    }
  }
}));