import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin';
import { useAuthStore } from '@/store/auth';
import { Navigate } from 'react-router-dom';
import { TokenUsage } from './components/TokenUsage';
import { UserQuotas } from './components/UserQuotas';
import { UsersList } from './components/UsersList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const { fetchUsers, loading } = useAdminStore();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
              <p className="text-gray-600">Gérez les utilisateurs et surveillez l'utilisation du système</p>
            </div>
            <Button
              onClick={() => fetchUsers()}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TokenUsage />
            <UserQuotas />
          </div>

          <UsersList />
        </div>
      </div>
    </div>
  );
}