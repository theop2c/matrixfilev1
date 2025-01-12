import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { uploadFile } from '@/lib/upload/index';
import { useFilesStore } from '@/store/files';
import { logger } from '@/lib/logger';

export function FileUpload() {
  const { user } = useAuthStore();
  const { fetchFiles } = useFilesStore();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setError(null);
    setProgress(0);
    
    try {
      for (const file of files) {
        await uploadFile(file, user.id, ({ progress, error }) => {
          if (error) {
            setError(error.message);
            setProgress(null);
          } else {
            setProgress(progress);
          }
        });
      }
      
      // Refresh file list after successful upload
      await fetchFiles(user.id);
      
      // Reset progress after a short delay
      setTimeout(() => setProgress(null), 2000);
    } catch (error) {
      logger.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400 transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">
            Drop your files here or click to upload
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Word, Excel, PDF (max 5 MB per file)
          </span>
          <input
            type="file"
            className="hidden"
            accept=".docx,.xlsx,.pdf"
            multiple
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {progress !== null && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress === 100 ? 'Upload complete!' : `Uploading... ${Math.round(progress)}%`}
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}