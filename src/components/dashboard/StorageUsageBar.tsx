import { USER_STORAGE_LIMITS, USER_ROLE_NAMES } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';
import type { Utilisateur } from '@/types';

interface StorageUsageBarProps {
  used: number;
  role: Utilisateur['role'];
}

export function StorageUsageBar({ used, role }: StorageUsageBarProps) {
  // Ensure we have a valid limit for the role
  const limit = USER_STORAGE_LIMITS[role] || USER_STORAGE_LIMITS.freemium;
  const percentage = Math.min((used / limit) * 100, 100);
  
  const getBarColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">Storage Usage</h3>
          <p className="text-sm text-gray-500">
            {USER_ROLE_NAMES[role]} Plan
          </p>
        </div>
        <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
          percentage > 90 ? 'bg-red-100 text-red-800' :
          percentage > 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatBytes(used)} used</span>
          <span>{formatBytes(limit)} total</span>
        </div>
      </div>

      {percentage > 90 && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          Warning: You're running out of storage space. Consider upgrading your plan or removing unused files.
        </div>
      )}
    </div>
  );
}