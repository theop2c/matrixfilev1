import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { uploadFile } from '@/lib/upload/index';
import { useFilesStore } from '@/store/files';
import { logger } from '@/lib/logger';
import { USER_STORAGE_LIMITS } from '@/lib/constants';
import { calculateTotalDiskUsage } from '@/lib/utils/storage';

export function FileUpload() {
  const { user } = useAuthStore();
  const { fetchFiles, files } = useFilesStore();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const totalDiskUsage = calculateTotalDiskUsage(files);
  const userRole = user.role;
  const diskUsageLimit = USER_STORAGE_LIMITS[userRole] || 0;
  let remainingAllowance = diskUsageLimit - totalDiskUsage;

  console.debug(`User Role: ${userRole}`);
  console.debug(`Total Disk Usage: ${totalDiskUsage} bytes`);
  console.debug(`Disk Usage Limit: ${diskUsageLimit} bytes`);
  console.debug(`Remaining Allowance: ${remainingAllowance} bytes`);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    setProgress(0);

    try {
      const filesToUpload = Array.from(files);
      const totalFileSize = filesToUpload.reduce((acc, file) => acc + file.size, 0);

      if (totalFileSize > remainingAllowance) {
        setError(
          `The total size of selected files (${Math.round(totalFileSize / (1024 * 1024))} MB) exceeds your remaining disk space allowance of ${Math.round(remainingAllowance / (1024 * 1024))} MB.`
        );
        return;
      }

      for (const file of filesToUpload) {
        if (file.size > remainingAllowance) {
          setError(`File ${file.name} exceeds your remaining disk space allowance.`);
          continue;
        }

        await uploadFile(file, user.id, ({ progress, error }) => {
          if (error) {
            setError(error.message);
            setProgress(null);
          } else {
            setProgress(progress);
          }
        });

        remainingAllowance -= file.size;
      }

      await fetchFiles(user.id);
      setProgress(null);
    } catch (error) {
      logger.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  if (remainingAllowance <= 0) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
        You have exceeded your storage limit. Please delete some files or upgrade your plan to upload more files.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400 transition-colors">
        <label
          className="flex flex-col items-center cursor-pointer"
          htmlFor="file-upload"
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">
            Drop your files here or click to upload
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Word, Excel, PDF (within your disk usage allowance)
          </span>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".docx,.xlsx,.pdf"
            multiple
            onChange={handleFileUpload}
            aria-label="Upload files"
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
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </div>
  );
}
