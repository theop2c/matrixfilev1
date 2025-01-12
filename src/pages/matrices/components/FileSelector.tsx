import { useState } from 'react';
import { useFilesStore } from '@/store/files';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { FichierTeleverse } from '@/types';

interface FileSelectorProps {
  onFileSelect: (file: FichierTeleverse) => void;
}

export function FileSelector({ onFileSelect }: FileSelectorProps) {
  const { files } = useFilesStore();
  const [selectedFile, setSelectedFile] = useState<FichierTeleverse | null>(null);
  const { t } = useTranslation();

  const handleSelect = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('matrices.selectDocument')}</h2>
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => setSelectedFile(file)}
            className={`w-full p-4 rounded-lg border text-left flex items-center space-x-3 transition-colors ${
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
      <div className="flex justify-end">
        <Button
          onClick={handleSelect}
          disabled={!selectedFile}
        >
          {t('common.analyze')}
        </Button>
      </div>
    </div>
  );
}