import { ref, deleteObject } from 'firebase/storage';
import { storage, db } from './index';
import { collection, query, where, getDocs, deleteDoc, doc, runTransaction } from 'firebase/firestore';
import type { FichierTeleverse } from '../types';
import { logger } from '../logger';

export const supprimerFichier = async (fichier: FichierTeleverse) => {
  try {
    logger.info('Starting file deletion:', fichier.id);
    
    // First, get all related messages to delete
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(messagesRef, where('fichierId', '==', fichier.id));
    const messagesSnapshot = await getDocs(messagesQuery);
    const messageRefs = messagesSnapshot.docs.map(doc => doc.ref);

    // Then perform the transaction
    await runTransaction(db, async (transaction) => {
      // Get user document
      const userRef = doc(db, 'users', fichier.utilisateurId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Get file document
      const fileRef = doc(db, 'fichiers', fichier.id);
      const fileDoc = await transaction.get(fileRef);
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data();
      const storageRef = ref(storage, `fichiers/${fichier.utilisateurId}/${fileData.nomStockage}`);
      
      try {
        // Delete from Storage
        await deleteObject(storageRef);
      } catch (error: any) {
        // If file doesn't exist in storage, continue with cleanup
        if (error.code !== 'storage/object-not-found') {
          throw error;
        }
        logger.warn('File not found in storage, continuing with cleanup');
      }
      
      // Update user's storage usage
      const userData = userDoc.data();
      transaction.update(userRef, {
        stockageUtilise: Math.max(0, (userData.stockageUtilise || 0) - fileData.taille),
        nombreFichiers: Math.max(0, (userData.nombreFichiers || 0) - 1),
        derniereMiseAJour: new Date()
      });
      
      // Delete all related messages
      messageRefs.forEach(ref => {
        transaction.delete(ref);
      });

      // Delete the file document
      transaction.delete(fileRef);
    });
    
    logger.info('File deletion completed successfully');
  } catch (error) {
    logger.error('File deletion failed:', error);
    throw error;
  }
};

export const recupererFichiers = async (utilisateurId: string): Promise<FichierTeleverse[]> => {
  try {
    const fichiersRef = collection(db, 'fichiers');
    const q = query(fichiersRef, where('utilisateurId', '==', utilisateurId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      contenu: doc.data().contenu,
      dateTelechargement: doc.data().dateTelechargement.toDate(),
      nom: doc.data().nom,
      nomStockage: doc.data().nomStockage,
      taille: doc.data().taille,
      type: doc.data().type,
      url: doc.data().url,
      utilisateurId: doc.data().utilisateurId
    })) as FichierTeleverse[];
  } catch (error) {
    logger.error('Error fetching files:', error);
    throw error;
  }
};
