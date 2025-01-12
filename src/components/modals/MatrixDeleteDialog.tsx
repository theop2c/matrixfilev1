import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface MatrixDeleteDialogProps {
  isOpen: boolean;
  matrixName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function MatrixDeleteDialog({
  isOpen,
  matrixName,
  onClose,
  onConfirm
}: MatrixDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Delete Matrix</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete "{matrixName}"? This action cannot be undone and all associated analyses will be permanently deleted.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Delete Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}