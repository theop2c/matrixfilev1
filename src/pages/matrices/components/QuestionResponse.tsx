import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionResponseProps {
  questionId: string;
  content: string;
  loading: boolean;
  error?: string;
  history?: string[];
  currentIndex?: number;
  onRegenerate: (questionId: string) => void;
  onNavigate: (questionId: string, direction: 'prev' | 'next') => void;
}

export function QuestionResponse({
  questionId,
  content,
  loading,
  error,
  history,
  currentIndex,
  onRegenerate,
  onNavigate
}: QuestionResponseProps) {
  return (
    <div className="space-y-2">
      <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="whitespace-pre-wrap">{content || ''}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate(questionId)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Régénérer
        </Button>
        {history && history.length > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(questionId, 'prev')}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-500">
              {(currentIndex || 0) + 1} / {history.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(questionId, 'next')}
              disabled={currentIndex === history.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}