import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { logger } from '../logger';

export async function uploadFileToStorage(
  file: File,
  userId: string,
  onProgress: (progress: number) => void
): Promise<{ url: string; storagePath: string }> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `fichiers/${userId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          logger.error('Storage upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(storageRef);
            resolve({ url, storagePath });
          } catch (error) {
            logger.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    logger.error('Upload to storage failed:', error);
    throw error;
  }
}