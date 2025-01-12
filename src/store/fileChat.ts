import { create } from 'zustand';
import { collection, query, orderBy, addDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MessageChat } from '@/types';
import { sendMessageToOpenAI } from '@/lib/openai';
import { logger } from '@/lib/logger';
import { useAuthStore } from './auth';

interface FileChatState {
  messages: MessageChat[];
  loading: boolean;
  error: string | null;
  fetchMessages: (fileId: string) => Promise<void>;
  sendMessage: (fileId: string, content: string) => Promise<void>;
  clearChat: (fileId: string) => Promise<void>;
}

export const useFileChatStore = create<FileChatState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  
  fetchMessages: async (fileId: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const messagesRef = collection(db, 'fileMessages');
      const q = query(
        messagesRef,
        where('fichierId', '==', fileId),
        orderBy('horodatage', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        horodatage: doc.data().horodatage.toDate()
      })) as MessageChat[];

      set({ messages });
    } catch (error) {
      logger.error('Error fetching file messages:', error);
      set({ error: 'Impossible de charger l\'historique du chat' });
    }
  },

  sendMessage: async (fileId: string, content: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Utilisateur non connecté');

      set({ loading: true, error: null });

      // Get file content from Firestore
      const fileDoc = await getDocs(query(
        collection(db, 'fichiers'),
        where('id', '==', fileId)
      ));

      const fileData = fileDoc.docs[0].data();
      const fileContext = fileData.contenu;

      const userMessage: MessageChat = {
        id: '',
        fichierId: fileId,
        utilisateurId: user.id,
        contenu: content,
        role: 'utilisateur',
        horodatage: new Date(),
      };

      const userMessageRef = await addDoc(collection(db, 'fileMessages'), userMessage);
      userMessage.id = userMessageRef.id;

      set(state => ({
        messages: [...state.messages, userMessage],
      }));

      // Prepare context for OpenAI
      const systemPrompt = `Vous êtes un assistant spécialisé dans l'analyse de documents. 
      Voici le contenu du document à analyser:\n\n${fileContext}\n\nRépondez aux questions 
      en vous basant sur ce contenu.`;

      const aiResponse = await sendMessageToOpenAI([
        { role: 'system', content: systemPrompt },
        ...get().messages.map(msg => ({
          role: msg.role === 'utilisateur' ? 'user' : 'assistant',
          content: msg.contenu,
        })),
        { role: 'user', content }
      ]);

      const assistantMessage: MessageChat = {
        id: '',
        fichierId: fileId,
        utilisateurId: user.id,
        contenu: aiResponse,
        role: 'assistant',
        horodatage: new Date(),
      };

      const assistantMessageRef = await addDoc(collection(db, 'fileMessages'), assistantMessage);
      assistantMessage.id = assistantMessageRef.id;

      set(state => ({
        messages: [...state.messages, assistantMessage],
        loading: false,
      }));
    } catch (error) {
      logger.error('Error in sendMessage:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  },

  clearChat: async (fileId: string) => {
    try {
      const messagesRef = collection(db, 'fileMessages');
      const q = query(messagesRef, where('fichierId', '==', fileId));
      const snapshot = await getDocs(q);

      await Promise.all(snapshot.docs.map(doc => doc.delete()));
      set({ messages: [], error: null });
    } catch (error) {
      logger.error('Error clearing file chat:', error);
      set({ error: 'Impossible d\'effacer l\'historique du chat' });
    }
  },
}));