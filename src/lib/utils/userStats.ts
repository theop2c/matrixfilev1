import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { formatRelativeTime } from './date';
import type { Utilisateur } from '@/types';

export async function getUserStats(userId: string) {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get active files (only count non-deleted files)
    const filesRef = collection(db, 'fichiers');
    const filesQuery = query(
      filesRef, 
      where('utilisateurId', '==', userId),
      where('deleted', '!=', true)
    );
    const filesSnapshot = await getDocs(filesQuery);
    const activeFiles = filesSnapshot.size;

    // Get uploads in last 24h
    const recentUploadsQuery = query(
      filesRef,
      where('utilisateurId', '==', userId),
      where('dateTelechargement', '>=', Timestamp.fromDate(last24h)),
      where('deleted', '!=', true)
    );
    const recentUploadsSnapshot = await getDocs(recentUploadsQuery);
    const recentUploads = recentUploadsSnapshot.size;

    // Get total analyses
    const analysesRef = collection(db, 'analyses');
    const analysesQuery = query(analysesRef, where('userId', '==', userId));
    const analysesSnapshot = await getDocs(analysesQuery);
    const totalAnalyses = analysesSnapshot.size;

    // Get active matrices (non-deleted)
    const matricesRef = collection(db, 'matrices');
    const matricesQuery = query(
      matricesRef, 
      where('userId', '==', userId),
      where('deleted', '!=', true)
    );
    const matricesSnapshot = await getDocs(matricesQuery);
    const activeMatrices = matricesSnapshot.size;

    return {
      activeFiles,
      recentUploads,
      totalAnalyses,
      activeMatrices
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      activeFiles: 0,
      recentUploads: 0,
      totalAnalyses: 0,
      activeMatrices: 0
    };
  }
}

export function formatLastConnection(user: Utilisateur): string {
  if (!user.derniereConnexion) return 'Never';
  return formatRelativeTime(new Date(user.derniereConnexion));
}