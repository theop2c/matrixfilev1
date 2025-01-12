import { collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';
import type { FichierTeleverse } from '../../types';

export async function saveFileToDatabase(
  userId: string,
  file: File,
  url: string,
  storagePath: string,
  content: string
): Promise<FichierTeleverse> {
  try {
    const fileDoc = await runTransaction(db, async (transaction) => {
      // Get user document to update storage usage
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Create new file document
      const fileRef = doc(collection(db, 'fichiers'));
      const fileData = {
        id: fileRef.id,
        utilisateurId: userId,
        nom: file.name,
        nomStockage: storagePath,
        type: file.name.split('.').pop(),
        taille: file.size,
        url,
        contenu: content,
        dateTelechargement: new Date()
      };

      // Update user's storage usage
      const userData = userDoc.data();
      transaction.update(userRef, {
        stockageUtilise: (userData.stockageUtilise || 0) + file.size,
        nombreFichiers: (userData.nombreFichiers || 0) + 1,
        derniereMiseAJour: new Date()
      });

      // Save file document
      transaction.set(fileRef, fileData);
      
      return fileData;
    });

    return fileDoc as FichierTeleverse;
  } catch (error) {
    logger.error('Database save failed:', error);
    throw error;
  }
}