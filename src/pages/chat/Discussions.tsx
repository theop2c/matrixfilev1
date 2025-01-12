import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Discussions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { files, loading, error, fetchFiles } = useFilesStore();

  useEffect(() => {
    if (user) {
      fetchFiles(user.id);
    }
  }, [user, fetchFiles]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Your Discussions</h2>
              <p className="text-sm text-gray-500">Resume an existing conversation</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="divide-y">
            {files.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No discussions found
              </div>
            ) : (
              files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => navigate(`/chat/${file.id}`)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center text-left"
                >
                  <MessageSquare className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.nom}</p>
                    <p className="text-sm text-gray-500">
                      Last modified: {formatDate(file.dateTelechargement)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}