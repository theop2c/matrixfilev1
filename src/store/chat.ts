import { create } from 'zustand';
import { collection, query, orderBy, addDoc, getDocs, deleteDoc, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MessageChat } from '@/types';
import { sendMessageToOpenAI } from '@/lib/openai';
import { logger } from '@/lib/logger';
import { useAuthStore } from './auth';

interface ChatState {
  messages: MessageChat[];
  loading: boolean;
  error: string | null;
  currentFileId: string | null;
  fetchMessages: (fileId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: (fileId: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  setCurrentFileId: (fileId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  currentFileId: null,

  setCurrentFileId: (fileId: string) => {
    set({ currentFileId: fileId });
  },
  
  fetchMessages: async (fileId: string) => {
    try {
      set({ loading: true, error: null, currentFileId: fileId });
      
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('fichierId', '==', fileId),
        where('utilisateurId', '==', user.id),
        orderBy('horodatage', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        horodatage: doc.data().horodatage.toDate()
      })) as MessageChat[];

      set({ messages, loading: false, error: null });
      logger.debug('Messages loaded successfully', { count: messages.length });
    } catch (error) {
      logger.error('Error fetching messages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des messages',
        loading: false,
        messages: [] 
      });
    }
  },

  sendMessage: async (content: string) => {
    try {
      const user = useAuthStore.getState().user;
      const currentFileId = get().currentFileId;
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      if (!currentFileId) {
        throw new Error('Aucun fichier sélectionné');
      }

      set({ loading: true, error: null });

      // Get the file document
      const fileDoc = await getDoc(doc(db, 'fichiers', currentFileId));
      if (!fileDoc.exists()) {
        throw new Error('Document introuvable');
      }

      const fileData = fileDoc.data();
      if (!fileData?.contenu) {
        logger.error('Missing document content:', { 
          fileId: currentFileId,
          hasData: !!fileData,
          hasContent: !!fileData?.contenu 
        });
        throw new Error('Le contenu du document n\'est pas disponible');
      }

      // Save user message
      const userMessage: Omit<MessageChat, 'id'> = {
        fichierId: currentFileId,
        utilisateurId: user.id,
        contenu: content,
        role: 'utilisateur',
        horodatage: new Date()
      };

      const userMessageRef = await addDoc(collection(db, 'messages'), userMessage);

      set(state => ({
        messages: [...state.messages, { ...userMessage, id: userMessageRef.id }]
      }));

      // Get AI response
      const aiResponse = await sendMessageToOpenAI(
        get().messages.map(msg => ({
          role: msg.role === 'utilisateur' ? 'user' : 'assistant',
          content: msg.contenu
        })),
        fileData.contenu
      );

      // Save AI response
      const assistantMessage: Omit<MessageChat, 'id'> = {
        fichierId: currentFileId,
        utilisateurId: user.id,
        contenu: aiResponse,
        role: 'assistant',
        horodatage: new Date()
      };

      const assistantMessageRef = await addDoc(collection(db, 'messages'), assistantMessage);

      set(state => ({
        messages: [...state.messages, { ...assistantMessage, id: assistantMessageRef.id }],
        loading: false,
        error: null
      }));
    } catch (error) {
      logger.error('Error sending message:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message'
      });
    }
  },

  clearMessages: async (fileId: string) => {
    try {
      set({ loading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef, 
        where('fichierId', '==', fileId),
        where('utilisateurId', '==', user.id)
      );
      
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      set({ messages: [], loading: false, error: null });
    } catch (error) {
      logger.error('Error clearing messages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression des messages',
        loading: false 
      });
    }
  },

  retryLastMessage: async () => {
    const state = get();
    const lastUserMessage = [...state.messages]
      .reverse()
      .find(msg => msg.role === 'utilisateur');
    
    if (lastUserMessage) {
      set(state => ({
        messages: state.messages.slice(0, -1),
        error: null
      }));
      await get().sendMessage(lastUserMessage.contenu);
    }
  }
}));