import { USER_STORAGE_LIMITS } from './constants';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { logger } from './logger';
import { parseFile } from './parser';
import { formatBytes } from './utils';

export interface ProgresseTelechargement {
  progression: number;
  url?: string;
  erreur?: Error;
}

export const televerserFichier = async (
  fichier: File,
  utilisateurId: string,
  onProgresse: (progresse: ProgresseTelechargement) => void
): Promise<string> => {
  try {
    // Validate file size before starting
    if (fichier.size === 0) {
      throw new Error('Le fichier est vide');
    }

    const userRef = doc(db, 'users', utilisateurId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data();
    const storageLimit = USER_STORAGE_LIMITS[userData.role];
    const currentStorage = userData.stockageUtilise || 0;
    const remainingStorage = storageLimit - currentStorage;

    // Pre-check to ensure the user cannot upload beyond their limit
    if (fichier.size > remainingStorage) {
      throw new Error(
        `Espace de stockage insuffisant. Vous avez ${formatBytes(remainingStorage)} disponibles, ` +
        `mais ce fichier nécessite ${formatBytes(fichier.size)}.`
      );
    }

    // File size is within the limit, proceed to upload
    const nomFichier = `${Date.now()}_${fichier.name}`;
    const cheminStockage = `fichiers/${utilisateurId}/${nomFichier}`;
    const fichierRef = ref(storage, cheminStockage);

    const tache = uploadBytesResumable(fichierRef, fichier);

    return new Promise((resolve, reject) => {
      tache.on(
        'state_changed',
        (snapshot) => {
          const progression = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgresse({ progression });
        },
        (error) => {
          logger.error('Upload error:', error);
          onProgresse({ progression: 0, erreur: error });
          reject(error);
        },
        async () => {
          try {
            // Validate and finalize the transaction
            await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userRef);

              if (!userDoc.exists()) {
                throw new Error('Utilisateur non trouvé');
              }

              const userData = userDoc.data();
              const newTotalStorage = (userData.stockageUtilise || 0) + fichier.size;

              // Double-check the limit inside the transaction
              if (newTotalStorage > USER_STORAGE_LIMITS[userData.role]) {
                throw new Error(
                  `Limite de stockage dépassée. Vous avez ${formatBytes(storageLimit - userData.stockageUtilise)} disponibles, ` +
                  `mais le fichier fait ${formatBytes(fichier.size)}.`
                );
              }

              // Get the download URL
              const url = await getDownloadURL(fichierRef);

              // Create file document
              const fileRef = doc(collection(db, 'fichiers'));
              transaction.set(fileRef, {
                id: fileRef.id,
                utilisateurId,
                nom: fichier.name,
                nomStockage: nomFichier,
                type: fichier.name.split('.').pop(),
                taille: fichier.size,
                url,
                contenu: await parseFile(fichier),
                dateTelechargement: new Date(),
              });

              // Update user's storage usage
              transaction.update(userRef, {
                stockageUtilise: newTotalStorage,
                nombreFichiers: (userData.nombreFichiers || 0) + 1,
                derniereMiseAJour: new Date(),
              });

              resolve(url);
            });
          } catch (error) {
            logger.error('Error finalizing upload:', error);

            // Clean up partially uploaded file in Storage
            await deleteObject(fichierRef).catch((deleteError) =>
              logger.error('Error cleaning up file in storage:', deleteError)
            );

            reject(error);
          }
        }
      );
    });
  } catch (error) {
    logger.error('Initial upload error:', error);
    throw error;
  }
};
