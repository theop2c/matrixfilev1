import { useEffect } from 'react';
import { useMatrixStore } from '@/store/matrix';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { MatrixAnalysis } from '@/types/matrix';

interface AnalysisResultsProps {
  analysis: MatrixAnalysis;
  onClose: () => void;
}

export function AnalysisResults({ analysis, onClose }: AnalysisResultsProps) {
  const { matrices } = useMatrixStore();
  const matrix = matrices.find(m => m.id === analysis.matrixId);

  if (!matrix) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Résultats de l'analyse</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {analysis.responses.map((response, index) => {
            const question = matrix.questions.find(q => q.id === response.questionId);
            if (!question) return null;

            return (
              <div key={response.questionId} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">
                  {index + 1}. {question.text}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}