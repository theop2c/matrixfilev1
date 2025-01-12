import { useState, useEffect } from 'react';
import { MessageList } from '@/pages/chat/components/MessageList';
import { MessageInput } from '@/pages/chat/components/MessageInput';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useFileChatStore } from '@/store/fileChat';
import type { FichierTeleverse } from '@/types';

interface FileChatProps {
  file: FichierTeleverse;
  onClose: () => void;
}

export function FileChat({ file, onClose }: FileChatProps) {
  const { messages, loading, error, sendMessage, clearChat, fetchMessages } = useFileChatStore();
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    fetchMessages(file.id);
  }, [file.id, fetchMessages]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl transition-all duration-300 ${
      isMinimized ? 'w-72 h-12' : 'w-96 h-[600px]'
    }`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate">{file.nom}</h3>
        <div className="flex items-center space-x-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '+' : '-'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto h-[calc(100%-8rem)]">
            <MessageList messages={messages} />
          </div>

          <MessageInput
            onSend={(content) => sendMessage(file.id, content)}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}