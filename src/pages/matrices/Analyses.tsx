import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Analyses() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { analyses, loading, error, fetchAllAnalyses } = useMatrixStore();

  useEffect(() => {
    if (user) {
      fetchAllAnalyses(user.id);
    } else {
      navigate('/');
    }
  }, [user, fetchAllAnalyses, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
              Back to Matrices
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {analyses.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analyses found</p>
              <Button
                onClick={() => navigate('/matrices')}
                className="mt-4"
              >
                Create your first analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map(analysis => (
                <div
                  key={analysis.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{analysis.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {analysis.responses.length} responses
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/matrices/analyses/${analysis.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}