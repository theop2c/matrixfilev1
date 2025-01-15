import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { useFilesStore } from '@/store/files';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Clock, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { jsPDF } from 'jspdf';

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
        console.debug('Fetching analyses and files for user:', user.id);
        await Promise.all([fetchAllAnalyses(user.id), fetchFiles(user.id)]);
        console.debug('Analyses and files loaded successfully.');
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
  console.debug('Loaded analysis:', analysis);
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
  console.debug('Analysis matrixId:', analysis.matrixId);
  console.debug('All matrices:', matrices);
  console.debug('Found matrix:', matrix);

  if (!matrix) {
    console.error('Matrix not found for analysis. Matrix ID:', analysis.matrixId, 'Available matrices:', matrices);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Matrix not found for this analysis. Please contact support if the issue persists.</p>
          <Button onClick={() => navigate('/history')}>
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const file = files.find(f => f.id === analysis.fileId);
  console.debug('Associated file:', file);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Analysis Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Analysis Name: ${analysis.name}`, 20, 30); // Added analysis name
    doc.text(`Analysis ID: ${analysis.id}`, 20, 40);
    doc.text(`Document: ${file?.nom || 'Document removed'}`, 20, 50);
    doc.text(`Date: ${formatDate(analysis.createdAt)}`, 20, 60);

    doc.text(`Matrix: ${matrix.name}`, 20, 70);

    doc.text('Responses:', 20, 80);

    let yPosition = 90;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 20;
    const lineHeight = 10;

    analysis.responses.forEach((response, index) => {
      const question = matrix?.questions.find(q => q.id === response.questionId);
      if (question) {
        console.debug(`Adding question ${index + 1} to PDF:`, question.text);
        doc.text(`${index + 1}. ${question.text}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Response: ${response.response}`, 25, yPosition);
        yPosition += 10;
      } else {
        console.warn(`Question not found for response:`, response);
        doc.text(`${index + 1}. Question not found`, 20, yPosition);
        yPosition += 10;
      }
    });

    doc.save(`analysis-${analysis.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="absolute top-4 right-4">
          <button
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            onClick={handleDownloadPDF}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

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
                {analysis.name || matrix?.name || 'Analysis'}
              </h1>
              <p className="text-gray-600 text-sm">Nom de la matrix : {matrix.name}</p>
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
              console.debug(`Rendering question ${index + 1}:`, question);
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
