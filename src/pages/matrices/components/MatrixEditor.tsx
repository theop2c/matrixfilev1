import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import { useMatrixStore } from '@/store/matrix';
import { useTranslation } from '@/hooks/useTranslation';
import type { Matrix, Question } from '@/types/matrix';

interface MatrixEditorProps {
  matrix: Matrix;
  onClose: () => void;
  onSave: () => void;
}

export function MatrixEditor({ matrix, onClose, onSave }: MatrixEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(matrix.questions);
  const [loading, setLoading] = useState(false);
  const { updateMatrix } = useMatrixStore();
  const { t } = useTranslation();

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text } : q
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMatrix(matrix.id, questions);
      onSave();
    } catch (error) {
      console.error('Failed to update matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('matrices.editMatrix')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('matrices.questions')} {index + 1}
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}