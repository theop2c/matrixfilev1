import { useState, useEffect } from 'react';
import { useMatrixStore } from '@/store/matrix';
import { Button } from '@/components/ui/button';
import { FileSearch } from 'lucide-react';
import { DocumentAnalysis } from './DocumentAnalysis';
import { AnalysisResults } from './AnalysisResults';

interface MatrixDetailsProps {
  matrixId: string;
}

export function MatrixDetails({ matrixId }: MatrixDetailsProps) {
  const { matrices, analyses, fetchAnalyses, loading } = useMatrixStore();
  const matrix = matrices.find(m => m.id === matrixId);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    if (matrixId) {
      fetchAnalyses(matrixId);
    }
  }, [matrixId, fetchAnalyses]);

  if (!matrix) return null;

  const matrixAnalyses = analyses.filter(a => a.matrixId === matrixId);
  const selectedAnalysis = matrixAnalyses.find(a => a.id === selectedAnalysisId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg text-gray-900">{matrix.name}</h3>
          <p className="text-sm text-gray-500">
            {matrix.questions.length} question{matrix.questions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowAnalysis(true)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          <FileSearch className="w-4 h-4 mr-2" />
          Nouvelle analyse
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Questions</h4>
        <div className="space-y-3">
          {matrix.questions.map((question, index) => (
            <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">
                {index + 1}. {question.text}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Type: {question.responseType}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Analyses effectuées</h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : matrixAnalyses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucune analyse n'a encore été effectuée
          </p>
        ) : (
          <div className="space-y-3">
            {matrixAnalyses.map(analysis => (
              <div 
                key={analysis.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setSelectedAnalysisId(analysis.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      Analyse du {new Date(analysis.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {analysis.responses.length} réponses
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir les résultats
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAnalysis && (
        <DocumentAnalysis
          matrixId={matrixId}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {selectedAnalysis && (
        <AnalysisResults
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysisId(null)}
        />
      )}
    </div>
  );
}