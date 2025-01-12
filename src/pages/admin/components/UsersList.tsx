import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/admin';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils/format';
import { getUserStats, formatLastConnection } from '@/lib/utils/userStats';
import { Loader2 } from 'lucide-react';
import type { Utilisateur } from '@/types';

interface UserStats {
  activeFiles: number;
  recentUploads: number;
  totalAnalyses: number;
  activeMatrices: number;
}

interface UserStatsMap {
  [userId: string]: UserStats;
}

export function UsersList() {
  const { users, loading, error, updateUserRole } = useAdminStore();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStatsMap>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoadingStats(true);
        const stats: UserStatsMap = {};
        for (const user of users) {
          stats[user.id] = await getUserStats(user.id);
        }
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (users.length > 0) {
      loadUserStats();
    }
  }, [users]);

  const handleRoleChange = async (userId: string, role: Utilisateur['role']) => {
    try {
      await updateUserRole(userId, role);
      setEditingUser(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        {/* ... table header remains the same ... */}
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm">{user.email}</td>
              {/* ... role cell remains the same ... */}
              <td className="px-4 py-4 whitespace-nowrap text-sm">{formatBytes(user.stockageUtilise)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  userStats[user.id]?.activeFiles || 0
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  userStats[user.id]?.recentUploads || 0
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  userStats[user.id]?.totalAnalyses || 0
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  userStats[user.id]?.activeMatrices || 0
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">{formatLastConnection(user)}</td>
              {/* ... actions cell remains the same ... */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}