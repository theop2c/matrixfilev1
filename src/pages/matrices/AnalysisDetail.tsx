import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { useFilesStore } from '@/store/files';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function AnalysisDetail() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { matrices, analyses, loading: matricesLoading, fetchAllAnalyses } = useMatrixStore();
  const { files, loading: filesLoading, fetchFiles } = useFilesStore();

  useEffect(() => {
    async function loadData() {
      if (!user) {
        navigate('/history');
        return;
      }

      try {
        await Promise.all([fetchAllAnalyses(user.id), fetchFiles(user.id)]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData();
  }, [user, fetchAllAnalyses, fetchFiles, navigate]);

  if (matricesLoading || filesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const analysis = analyses.find(a => a.id === analysisId);
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Analysis not found</p>
          <Button onClick={() => navigate('/history')}>
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const matrix = matrices.find(m => m.id === analysis.matrixId);
  const file = files.find(f => f.id === analysis.fileId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/history')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {matrix?.name || 'Analysis'}
              </h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {file?.nom || 'Document removed'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(analysis.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {analysis.responses.map((response, index) => {
              const question = matrix?.questions.find(q => q.id === response.questionId);
              if (!question) return null;

              return (
                <div key={response.questionId} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-medium text-lg mb-4">
                    {index + 1}. {question.text}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {response.response}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}