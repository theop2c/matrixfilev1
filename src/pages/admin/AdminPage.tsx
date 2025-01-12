import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { useMatrixStore } from '@/store/matrix';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AdminUsersList } from './components/AdminUsersList';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchUsers, loading } = useAdminStore();
  const { fetchMatrices } = useMatrixStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.email !== 'theo.saintadam@gmail.com') {
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchMatrices(user.id)
        ]);
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      }
    };

    loadData();
  }, [user, navigate, fetchUsers, fetchMatrices]);

  const handleRefresh = async () => {
    if (!user) return;
    try {
      await Promise.all([
        fetchUsers(),
        fetchMatrices(user.id)
      ]);
    } catch (err) {
      setError('Error refreshing data');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600">Manage users and roles</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <AdminUsersList />
        </div>
      </div>
    </div>
  );
}