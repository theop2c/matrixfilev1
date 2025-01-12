import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/admin';
import { useFilesStore } from '@/store/files';
import { useMatrixStore } from '@/store/matrix';
import { formatBytes } from '@/lib/utils';
import { RoleSelect } from '@/components/admin/RoleSelect';
import { USER_STORAGE_LIMITS } from '@/lib/constants';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Utilisateur } from '@/types';

interface UserStats {
  filesCount: number;
  matricesCount: number;
  analysesCount: number;
  diskUsed: number;
  recentUploads: number;
  lastUpload: Date | null;
}

export function AdminUsersList() {
  const { users, loading, error, updateUserRole } = useAdminStore();
  const { files } = useFilesStore();
  const { matrices, analyses } = useMatrixStore();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [allTimeCounts, setAllTimeCounts] = useState<Record<string, { files: number; matrices: number; analyses: number }>>({});

  useEffect(() => {
    const fetchAllTimeCounts = async () => {
      const counts: Record<string, { files: number; matrices: number; analyses: number }> = {};
      
      for (const user of users) {
        try {
          const [filesSnapshot, matricesSnapshot, analysesSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'fichiers'), where('utilisateurId', '==', user.id))),
            getDocs(query(collection(db, 'matrices'), where('userId', '==', user.id))),
            getDocs(query(collection(db, 'matrices_analyses'), where('userId', '==', user.id)))
          ]);
          
          counts[user.id] = {
            files: filesSnapshot.size,
            matrices: matricesSnapshot.size,
            analyses: analysesSnapshot.size
          };
        } catch (error) {
          console.error('Error fetching counts for user:', user.id, error);
        }
      }
      
      setAllTimeCounts(counts);
    };

    if (users.length > 0) {
      fetchAllTimeCounts();
    }
  }, [users]);

  const getUserStats = (userId: string): UserStats => {
    const userFiles = files.filter(f => f.utilisateurId === userId);
    const userMatrices = matrices.filter(m => m.userId === userId);
    const userAnalyses = analyses.filter(a => a.userId === userId);
    
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentUploads = userFiles.filter(f => new Date(f.dateTelechargement) > last24h).length;
    
    const lastUpload = userFiles.length > 0 
      ? new Date(Math.max(...userFiles.map(f => new Date(f.dateTelechargement).getTime())))
      : null;

    return {
      filesCount: userFiles.length,
      matricesCount: userMatrices.length,
      analysesCount: userAnalyses.length,
      diskUsed: userFiles.reduce((sum, file) => sum + file.taille, 0),
      recentUploads,
      lastUpload
    };
  };

  const handleRoleChange = async (userId: string, role: Utilisateur['role']) => {
    try {
      setUpdateError(null);
      await updateUserRole(userId, role);
    } catch (error) {
      setUpdateError('Failed to update user role');
      console.error('Role update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || updateError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error || updateError}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Login</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Files</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Matrices</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Analyses</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">All Files Ever</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">All Matrices Ever</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">All Analyses Ever</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disk Used</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disk Allowance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => {
            const stats = getUserStats(user.id);
            const allTimeStats = allTimeCounts[user.id] || { files: 0, matrices: 0, analyses: 0 };
            const diskAllowance = USER_STORAGE_LIMITS[user.role];

            return (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleSelect
                    currentRole={user.role}
                    onRoleChange={(role) => handleRoleChange(user.id, role)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.premiereConnexion).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.derniereConnexion).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stats.filesCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stats.matricesCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stats.analysesCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {allTimeStats.files}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {allTimeStats.matrices}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {allTimeStats.analyses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatBytes(stats.diskUsed)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatBytes(diskAllowance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}