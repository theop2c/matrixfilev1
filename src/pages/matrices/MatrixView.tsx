import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix/store';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MatrixDetails } from './components/MatrixDetails';

export function MatrixView() {
  const { matrixId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { matrices, fetchMatrices, loading, error } = useMatrixStore();

  useEffect(() => {
    if (user && matrixId) {
      fetchMatrices(user.id);
    }
  }, [user, matrixId, fetchMatrices]);

  const matrix = matrices.find(m => m.id === matrixId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !matrix) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              {error || 'Matrice introuvable'}
            </p>
            <Button
              onClick={() => navigate('/matrices')}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux matrices
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/matrices')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{matrix.name}</h1>
          </div>

          <MatrixDetails matrixId={matrixId} />
        </div>
      </div>
    </div>
  );
}