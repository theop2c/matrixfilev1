import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilesStore } from '@/store/files';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { File, Trash2, MessageSquare } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { formatBytes } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { SortControls, type SortField, type SortOrder } from '@/components/dashboard/SortControls';
import type { FichierTeleverse } from '@/types';

export function FileList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { files, loading, error, fetchFiles, deleteFile } = useFilesStore();
  const [fileToDelete, setFileToDelete] = useState<FichierTeleverse | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (user) {
      fetchFiles(user.id);
    }
  }, [user, fetchFiles]);

  const handleChatClick = (fileId: string) => {
    navigate(`/chat/${fileId}`);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete);
      setFileToDelete(null);
    }
  };

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.dateTelechargement).getTime();
      const dateB = new Date(b.dateTelechargement).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by size
      return sortOrder === 'asc' ? a.taille - b.taille : b.taille - a.taille;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Files</h2>
          <SortControls
            onSort={handleSort}
            currentField={sortField}
            currentOrder={sortOrder}
          />
        </div>

        <div className="space-y-2">
          {sortedFiles.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">{file.nom}</p>
                  <p className="text-sm text-gray-500">
                    {formatBytes(file.taille)} • {formatDate(file.dateTelechargement)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChatClick(file.id)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileToDelete(file)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!fileToDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.nom}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFileToDelete(null)}
      />
    </>
  );
}