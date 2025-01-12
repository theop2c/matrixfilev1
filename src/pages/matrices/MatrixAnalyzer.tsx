import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { FileSelector } from './components/FileSelector';
import { QuestionResponse } from './components/QuestionResponse';
import { AnalysisConfirmationDialog } from '@/components/modals/AnalysisConfirmationDialog';
import type { FichierTeleverse } from '@/types';
import { logger } from '@/lib/logger';

interface ResponseState {
  [questionId: string]: {
    content: string;
    loading: boolean;
    history: string[];
    currentIndex: number;
  };
}

export function MatrixAnalyzer() {
  const { matrixId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { matrices, analyzeDocument, regenerateResponse, saveAnalysis } = useMatrixStore();
  
  const [selectedFile, setSelectedFile] = useState<FichierTeleverse | null>(null);
  const [responses, setResponses] = useState<ResponseState>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [analysisName, setAnalysisName] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const matrix = matrices.find(m => m.id === matrixId);

  useEffect(() => {
    if (!user || !matrixId) {
      navigate('/matrices');
    }
  }, [user, matrixId, navigate]);

  const handleFileSelect = async (file: FichierTeleverse) => {
    setSelectedFile(file);
    if (!matrix) return;

    const initialResponses: ResponseState = {};
    matrix.questions.forEach(q => {
      initialResponses[q.id] = {
        content: '',
        loading: true,
        history: [],
        currentIndex: 0
      };
    });
    setResponses(initialResponses);

    try {
      const results = await analyzeDocument(matrixId, file.id);
      const updatedResponses: ResponseState = {};
      
      Object.entries(results).forEach(([questionId, response]) => {
        updatedResponses[questionId] = {
          content: response,
          loading: false,
          history: [response],
          currentIndex: 0
        };
      });
      
      setResponses(updatedResponses);
    } catch (error) {
      logger.error('Analysis failed:', error);
    }
  };

  const handleRegenerate = async (questionId: string) => {
    if (!matrix || !selectedFile) return;

    setLoading(prev => ({ ...prev, [questionId]: true }));
    try {
      const newResponse = await regenerateResponse(matrixId!, selectedFile.id, questionId);
      setResponses(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          content: newResponse,
          history: [...prev[questionId].history, newResponse],
          currentIndex: prev[questionId].history.length
        }
      }));
    } catch (error) {
      logger.error('Regeneration failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleNavigate = (questionId: string, direction: 'prev' | 'next') => {
    setResponses(prev => {
      const response = prev[questionId];
      const newIndex = direction === 'prev' 
        ? Math.max(0, response.currentIndex - 1)
        : Math.min(response.history.length - 1, response.currentIndex + 1);
      
      return {
        ...prev,
        [questionId]: {
          ...response,
          content: response.history[newIndex],
          currentIndex: newIndex
        }
      };
    });
  };

  const handleSave = async () => {
    if (!matrix || !selectedFile || !analysisName.trim() || !user) return;
    
    const finalResponses = Object.entries(responses).map(([questionId, data]) => ({
      questionId,
      response: data.content.trim()
    }));

    setAnalysisData({
      matrixId: matrix.id,
      fileId: selectedFile.id,
      userId: user.id,
      name: analysisName.trim(),
      responses: finalResponses
    });
    
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!analysisData) return;
    
    try {
      await saveAnalysis(
        analysisData.matrixId,
        analysisData.fileId,
        analysisData.userId,
        analysisData.name,
        Object.fromEntries(analysisData.responses.map((r: any) => [r.questionId, r.response]))
      );
      navigate('/history');
    } catch (error) {
      logger.error('Failed to save analysis:', error);
    }
  };

  if (!matrix) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Matrix not found</p>
          <Button onClick={() => navigate('/matrices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to matrices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/matrices')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to matrices
            </Button>
            <h1 className="text-2xl font-bold">{matrix.name}</h1>
          </div>

          {!selectedFile ? (
            <FileSelector onFileSelect={handleFileSelect} />
          ) : (
            <>
              <div className="space-y-6">
                {matrix.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-medium mb-4">
                      {index + 1}. {question.text}
                    </h3>
                    <QuestionResponse
                      questionId={question.id}
                      content={responses[question.id]?.content || ''}
                      loading={loading[question.id] || false}
                      history={responses[question.id]?.history}
                      currentIndex={responses[question.id]?.currentIndex}
                      onRegenerate={handleRegenerate}
                      onNavigate={handleNavigate}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    placeholder="Give this analysis a name..."
                    className="w-full p-2 border rounded"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={!analysisName.trim()}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AnalysisConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSave}
        analysisData={analysisData}
      />
    </div>
  );
}