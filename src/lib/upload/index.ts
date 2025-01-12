import { uploadFileToStorage } from './storage';
import { saveFileToDatabase } from './database';
import { parseFile } from '../parser';
import { logger } from '../logger';

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: Error;
}

export async function uploadFile(
  file: File,
  userId: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Parse file content first
    const content = await parseFile(file);
    if (!content) {
      throw new Error('No content could be extracted from file');
    }

    // Upload to storage
    const { url, storagePath } = await uploadFileToStorage(file, userId, (progress) => {
      onProgress({ progress });
    });

    // Save to database
    await saveFileToDatabase(userId, file, url, storagePath, content);

    onProgress({ progress: 100, url });
    return url;
  } catch (error) {
    logger.error('File upload failed:', error);
    onProgress({ progress: 0, error: error as Error });
    throw error;
  }
}