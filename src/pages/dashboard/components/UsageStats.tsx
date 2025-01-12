import { HardDrive, FileText, Award } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { formatBytes } from '@/lib/utils';
import { USER_STORAGE_LIMITS, USER_ROLE_NAMES } from '@/lib/constants';

export function UsageStats() {
  const { user } = useAuthStore();
  const { files } = useFilesStore();

  if (!user) return null;

  const storageUsed = files.reduce((total, file) => total + file.taille, 0);
  const storageLimit = USER_STORAGE_LIMITS[user.role];
  const fileCount = files.length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">Stockage Utilisé</h3>
        </div>
        <p className="mt-2 text-2xl font-semibold">{formatBytes(storageUsed)}</p>
        <p className="text-sm text-gray-500">sur {formatBytes(storageLimit)}</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className="font-medium">Fichiers</h3>
        </div>
        <p className="mt-2 text-2xl font-semibold">{fileCount}</p>
        <p className="text-sm text-gray-500">fichiers téléversés</p>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium">Niveau d'Accès</h3>
        </div>
        <p className="mt-2 text-2xl font-semibold">{USER_ROLE_NAMES[user.role]}</p>
        <p className="text-sm text-gray-500">
          {formatBytes(storageLimit)} de stockage
        </p>
      </div>
    </div>
  );
}