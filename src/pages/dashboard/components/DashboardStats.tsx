import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { HardDrive, FileText, Clock, Upload } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/date';
import { StorageUsageBar } from '@/components/dashboard/StorageUsageBar';

export function DashboardStats() {
  const { user } = useAuthStore();
  const { files } = useFilesStore();
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentUploads = files.filter(f => new Date(f.dateTelechargement) > last24h);
    setUploadCount(recentUploads.length);
  }, [files]);

  if (!user) return null;

  const storageUsed = files.reduce((total, file) => total + file.taille, 0);
  const lastUpload = files[0]?.dateTelechargement;

  return (
    <div className="space-y-6">
      <StorageUsageBar used={storageUsed} role={user.role} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Total Files</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{files.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Upload className="w-6 h-6 text-purple-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Recent Uploads</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{uploadCount}</p>
          <p className="text-xs text-gray-500">In the last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-500" />
            <h3 className="ml-2 text-sm font-medium text-gray-600">Last Upload</h3>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {lastUpload ? formatRelativeTime(lastUpload) : 'No uploads yet'}
          </p>
        </div>
      </div>
    </div>
  );
}