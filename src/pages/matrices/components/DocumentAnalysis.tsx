import { useState } from 'react';
import { useMatrixStore } from '@/store/matrix';
import { useFilesStore } from '@/store/files';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import type { FichierTeleverse } from '@/types';

interface DocumentAnalysisProps {
  matrixId: string;
  onClose: () => void;
}

export function DocumentAnalysis({ matrixId, onClose }: DocumentAnalysisProps) {
  const { files } = useFilesStore();
  const { analyzeDocument, loading, error } = useMatrixStore();
  const [selectedFile, setSelectedFile] = useState<FichierTeleverse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      setAnalyzing(true);
      await analyzeDocument(matrixId, selectedFile.id, selectedFile.contenu);
      onClose();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-semibold">Sélectionner un document</h2>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`w-full p-3 rounded-lg border text-left flex items-center space-x-3 transition-colors ${
                selectedFile?.id === file.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.nom}</p>
                <p className="text-sm text-gray-500">
                  {new Date(file.dateTelechargement).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={analyzing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              'Analyser le document'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}