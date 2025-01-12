import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { parseFirestoreDate } from '@/lib/utils/date';
import type { Matrix, MatrixAnalysis, MatrixResponse } from '@/types/matrix';

export async function fetchUserMatrices(userId: string): Promise<Matrix[]> {
  try {
    const matricesRef = collection(db, 'matrices');
    const q = query(matricesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = parseFirestoreDate(data.createdAt);

       if (!createdAt) {
        logger.warn(`Invalid date found for matrix with id ${doc.id}`, data.createdAt);
      }
      
      return {
        ...data,
        id: doc.id,
        createdAt: createdAt || null, // Fallback si la date est invalide
      } as Matrix;
    });
  } catch (error) {
    logger.error('Error fetching user matrices:', error);
    throw new Error('Failed to fetch matrices');
  }
}

export async function fetchUserAnalyses(userId: string): Promise<MatrixAnalysis[]> {
  try {
    const analysesRef = collection(db, 'matrices_analyses');
    const q = query(analysesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = parseFirestoreDate(data.createdAt);
      
      return {
        ...data,
        id: doc.id,
        createdAt: createdAt || new Date(),
      } as MatrixAnalysis;
    });
  } catch (error) {
    logger.error('Error fetching user analyses:', error);
    throw new Error('Failed to fetch analyses');
  }
}

export async function saveMatrixAnalysisToDb(
  matrixId: string,
  fileId: string,
  userId: string,
  name: string,
  responses: MatrixResponse[]
): Promise<string> {
  try {
    const analysisData = {
      matrixId,
      fileId,
      userId,
      name: name.trim(),
      responses,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'matrices_analyses'), analysisData);
    return docRef.id;
  } catch (error) {
    logger.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }
}