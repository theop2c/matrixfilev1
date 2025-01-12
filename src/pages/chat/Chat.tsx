import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import { useFilesStore } from '@/store/files';
import { useAuthStore } from '@/store/auth';

export function Chat() {
  const navigate = useNavigate();
  const { fileId } = useParams();
  const { user } = useAuthStore();
  const { messages, loading, error, sendMessage, clearMessages, retryLastMessage, fetchMessages } = useChatStore();
  const { files, fetchFiles } = useFilesStore();

  useEffect(() => {
    if (!fileId || !user) {
      navigate('/chat');
      return;
    }

    fetchFiles(user.id).then(() => {
      fetchMessages(fileId);
    });
  }, [fileId, user, fetchFiles, fetchMessages, navigate]);

  const currentFile = files.find(f => f.id === fileId);

  const handleClearMessages = async () => {
    if (fileId && confirm('Are you sure you want to clear the chat history?')) {
      await clearMessages(fileId);
    }
  };

  if (!currentFile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Document not found</p>
          <Button onClick={() => navigate('/chat')}>
            Back to discussions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mt-8 flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chat')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-lg font-semibold">{currentFile.nom}</h2>
                <p className="text-sm text-gray-500">Chat about this document</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearMessages}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
          
          <MessageList messages={messages} />
          
          {error && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryLastMessage}
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <MessageInput
            onSend={sendMessage}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}