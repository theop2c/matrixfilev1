import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { MatrixState } from './types';
import { Timestamp } from 'firebase/firestore';

export const useMatrixStore = create<MatrixState>((set) => ({
  matrices: [],
  analyses: [],
  loading: false,
  error: null,

  fetchMatrices: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Fetch matrices
      const matricesRef = collection(db, 'matrices');
      const matricesSnapshot = await getDocs(matricesRef);
      const matrices = matricesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toDate()
          : new Date(doc.data().createdAt.seconds * 1000)
      }));

      // Fetch analyses
      const analysesRef = collection(db, 'matrices_analyses');
      const analysesSnapshot = await getDocs(analysesRef);
      const analyses = analysesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : new Date(doc.data().createdAt.seconds * 1000)
      }));

      set({ matrices, analyses, loading: false });
    } catch (error) {
      logger.error('Error fetching matrices and analyses:', error);
      set({ error: 'Failed to load data', loading: false });
    }
  },

  saveAnalysis: async (matrixId: string, fileId: string, userId: string, name: string, responses: Record<string, string>) => {
    try {
      set({ loading: true, error: null });

      if (!name.trim()) {
        throw new Error('Analysis name is required');
      }
      
      const analysis = {
        matrixId,
        fileId,
        userId,
        name: name.trim(),
        responses: Object.entries(responses).map(([questionId, response]) => ({
          questionId,
          response
        })),
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'matrices_analyses'), analysis);
      set({ loading: false });
    } catch (error) {
      logger.error('Error saving analysis:', error);
      set({ error: 'Failed to save analysis', loading: false });
    }
  }
}));