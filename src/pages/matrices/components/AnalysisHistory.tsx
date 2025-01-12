import { useEffect, useState } from 'react';
import { useMatrixStore } from '@/store/matrix';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AnalysisHistoryProps {
  matrixId: string;
  onSelectAnalysis: (analysisId: string) => void;
}

export function AnalysisHistory({ matrixId, onSelectAnalysis }: AnalysisHistoryProps) {
  const { user } = useAuthStore();
  const { analyses, fetchAnalyses, loading } = useMatrixStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        setError(null);
        await fetchAnalyses(user.id);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError("Impossible de charger l'historique des analyses");
      }
    }

    loadData();
  }, [user, fetchAnalyses]);

  const matrixAnalyses = analyses.filter(analysis => analysis.matrixId === matrixId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" onClick={() => user && fetchAnalyses(user.id)}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!matrixAnalyses.length) {
    return <div className="text-center py-6 text-gray-500">Aucune analyse effectuée pour cette matrice.</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Analyses précédentes</h3>
      {matrixAnalyses.map(analysis => (
        <Button
          key={analysis.id}
          variant="outline"
          className="w-full justify-start text-left hover:bg-gray-50"
          onClick={() => onSelectAnalysis(analysis.id)}
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{analysis.name || 'Analyse sans nom'}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(analysis.createdAt)}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}
