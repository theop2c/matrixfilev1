import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMessageToOpenAI } from '@/lib/openai';
import { logger } from '@/lib/logger';
import type { Matrix, Question, MatrixAnalysis } from '@/types/matrix';

interface MatrixState {
  matrices: Matrix[];
  analyses: MatrixAnalysis[];
  loading: boolean;
  error: string | null;
  fetchMatrices: (userId: string) => Promise<void>;
  createMatrix: (name: string, questions: Question[], userId: string) => Promise<void>;
  updateMatrix: (matrixId: string, questions: Question[]) => Promise<void>;
  deleteMatrix: (matrixId: string) => Promise<void>;
  analyzeDocument: (matrixId: string, fileId: string) => Promise<Record<string, string>>;
  regenerateResponse: (matrixId: string, fileId: string, questionId: string) => Promise<string>;
  saveAnalysis: (matrixId: string, fileId: string, userId: string,  name: string, responses: Record<string, string>) => Promise<void>;
  fetchAnalyses: (userId: string) => Promise<void>;
  fetchAllAnalyses: (userId: string) => Promise<void>;
}

export const useMatrixStore = create<MatrixState>((set, get) => ({
  matrices: [],
  analyses: [],
  loading: false,
  error: null,

  fetchMatrices: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const matricesRef = collection(db, 'matrices');
      const q = query(matricesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const matrices = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Matrix[];
      
      set({ matrices, loading: false });
    } catch (error) {
      logger.error('Error fetching matrices:', error);
      set({ error: 'Failed to load matrices', loading: false });
    }
  },

  createMatrix: async (name: string, questions: Question[], userId: string) => {
    try {
      set({ loading: true, error: null });
      const matrix = {
        name,
        questions,
        userId,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'matrices'), matrix);
      get().fetchMatrices(userId);
    } catch (error) {
      logger.error('Error creating matrix:', error);
      set({ error: 'Failed to create matrix', loading: false });
    }
  },

  updateMatrix: async (matrixId: string, questions: Question[]) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'matrices', matrixId), { questions });
      set(state => ({
        matrices: state.matrices.map(m =>
          m.id === matrixId ? { ...m, questions } : m
        ),
        loading: false
      }));
    } catch (error) {
      logger.error('Error updating matrix:', error);
      set({ error: 'Failed to update matrix', loading: false });
    }
  },

  deleteMatrix: async (matrixId: string) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'matrices', matrixId));
      set(state => ({
        matrices: state.matrices.filter(m => m.id !== matrixId),
        loading: false
      }));
    } catch (error) {
      logger.error('Error deleting matrix:', error);
      set({ error: 'Failed to delete matrix', loading: false });
    }
  },

  analyzeDocument: async (matrixId: string, fileId: string) => {
    try {
      const matrix = get().matrices.find(m => m.id === matrixId);
      if (!matrix) throw new Error('Matrix not found matrix ts');

      const fileDoc = await getDocs(query(
        collection(db, 'fichiers'),
        where('id', '==', fileId)
      ));

      const fileData = fileDoc.docs[0].data();
      const fileContent = fileData.contenu;
      const responses: Record<string, string> = {};

      for (const question of matrix.questions) {
        const prompt = `Based on the following document content, please answer this question: "${question.text}"\n\nDocument content:\n${fileContent}`;
        
        const response = await sendMessageToOpenAI([
          { role: 'system', content: 'You are a document analysis assistant.' },
          { role: 'user', content: prompt }
        ], fileContent);

        responses[question.id] = response;
      }

      return responses;
    } catch (error) {
      logger.error('Error analyzing document:', error);
      throw error;
    }
  },

  regenerateResponse: async (matrixId: string, fileId: string, questionId: string) => {
    try {
      const matrix = get().matrices.find(m => m.id === matrixId);
      if (!matrix) throw new Error('Matrix not found matrix ts2');

      const question = matrix.questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');

      const fileDoc = await getDocs(query(
        collection(db, 'fichiers'),
        where('id', '==', fileId)
      ));

      const fileData = fileDoc.docs[0].data();
      const fileContent = fileData.contenu;
      const prompt = `Based on the following document content, please answer this question: "${question.text}"\n\nDocument content:\n${fileContent}`;
      
      return await sendMessageToOpenAI([
        { role: 'system', content: 'You are a document analysis assistant.' },
        { role: 'user', content: prompt }
      ], fileContent);
    } catch (error) {
      logger.error('Error regenerating response:', error);
      throw error;
    }
  },

saveAnalysis: async (matrixId: string, fileId: string, userId: string, name: string, responses: Record<string, string>) => {
  try {
    set({ loading: true, error: null });

    if (!name || typeof name !== 'string') {
      throw new Error('Invalid name. It must be a non-empty string.');
    }

    // Format the analysis document
    const analysis = {
      matrixId,
      fileId,
      userId,
      name: name.trim(), // Ensure name is a clean string
      responses: Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        response: response || '', // Ensure response is a valid string
      })),
      createdAt: new Date(), // Add timestamp
    };

    // TSA say here is the db is defined
    await addDoc(collection(db, 'matrices_analyses'), analysis);

    set({ loading: false });
  } catch (error) {
    logger.error('Error saving analysis:', error);
    set({ error: 'Failed to save analysis', loading: false });
  }
},

  fetchAnalyses: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const analysesRef = collection(db, 'matrices_analyses');
      const q = query(analysesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const analyses = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
      })) as MatrixAnalysis[];
      
      set({ analyses, loading: false });
    } catch (error) {
      logger.error('Error fetching analyses:', error);
      set({ error: 'Failed to load analyses', loading: false });
    }
  },

  fetchAllAnalyses: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const analysesRef = collection(db, 'matrices_analyses');
      const q = query(analysesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const analyses = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate()
      })) as MatrixAnalysis[];
      
      set({ analyses, loading: false });
    } catch (error) {
      logger.error('Error fetching all analyses:', error);
      set({ error: 'Failed to load analyses', loading: false });
    }
  }
}));