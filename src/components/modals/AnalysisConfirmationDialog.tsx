import { Button } from '../ui/button';
import { Save, X } from 'lucide-react';
import type { MatrixAnalysis } from '@/types/matrix';

interface AnalysisConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  analysisData: Omit<MatrixAnalysis, 'id' | 'createdAt'>;
}

export function AnalysisConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  analysisData
}: AnalysisConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Analysis Save</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Analysis Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><span className="font-medium">Name:</span> {analysisData.name}</p>
              <p><span className="font-medium">Matrix ID:</span> {analysisData.matrixId}</p>
              <p><span className="font-medium">File ID:</span> {analysisData.fileId}</p>
              <p><span className="font-medium">User ID:</span> {analysisData.userId}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Responses</h3>
            <div className="space-y-3">
              {analysisData.responses.map((response, index) => (
                <div key={response.questionId} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Question {index + 1}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {response.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Save className="w-4 h-4 mr-2" />
            Confirm & Save
          </Button>
        </div>
      </div>
    </div>
  );
}