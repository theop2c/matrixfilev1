import { create } from 'zustand';
import { recupererFichiers, supprimerFichier } from '../lib/firebase/storage';
import type { FichierTeleverse } from '../types';
import { logger } from '../lib/logger';

interface FilesState {
  files: FichierTeleverse[];
  currentFile: FichierTeleverse | null;
  loading: boolean;
  error: string | null;
  fetchFiles: (userId: string) => Promise<void>;
  deleteFile: (file: FichierTeleverse) => Promise<void>;
  setCurrentFile: (file: FichierTeleverse | null) => void;
}

export const useFilesStore = create<FilesState>((set) => ({
  files: [],
  currentFile: null,
  loading: false,
  error: null,
  fetchFiles: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const files = await recupererFichiers(userId);
      set({ files, loading: false });
    } catch (error) {
      logger.error('Error fetching files:', error);
      set({ 
        error: 'Failed to load files', 
        loading: false 
      });
    }
  },
  deleteFile: async (file: FichierTeleverse) => {
    try {
      await supprimerFichier(file);
      set(state => ({
        files: state.files.filter(f => f.id !== file.id),
        currentFile: state.currentFile?.id === file.id ? null : state.currentFile
      }));
    } catch (error) {
      logger.error('Error deleting file:', error);
      set({ error: 'Failed to delete file' });
      throw error;
    }
  },
  setCurrentFile: (file) => set({ currentFile: file })
}));