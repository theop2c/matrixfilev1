import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface AnalysisPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: Record<string, any>;
}

export function AnalysisPreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  data
}: AnalysisPreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Analysis Data</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Analysis Name: {data.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-6">
            {Object.entries(data.responses).map(([id, response]: [string, any]) => (
              <div key={id} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{response.question}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="default">
            Save Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}