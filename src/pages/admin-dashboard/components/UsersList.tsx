import { useState } from 'react';
import { useAdminStore } from '@/store/admin';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import type { Utilisateur } from '@/types';

export function UsersList() {
  const { users, loading, error, updateUserRole } = useAdminStore();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: Utilisateur['role']) => {
    try {
      await updateUserRole(userId, role);
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  };

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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichiers</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stockage</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Connexion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <select
                    className="text-sm border rounded p-1"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Utilisateur['role'])}
                  >
                    <option value="gratuit">Gratuit</option>
                    <option value="premium">Premium</option>
                    <option value="or">Or</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'or' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'premium' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}
                  >
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.nombreFichiers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatBytes(user.stockageUtilise)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.derniereMiseAJour).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                >
                  {editingUser === user.id ? 'Annuler' : 'Modifier'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}