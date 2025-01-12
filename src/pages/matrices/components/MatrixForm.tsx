import { useState } from 'react';
import { useMatrixStore } from '@/store/matrix';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Plus, Save, X } from 'lucide-react';
import type { Question } from '@/types/matrix';

interface MatrixFormProps {
  onComplete: () => void;
}

export function MatrixForm({ onComplete }: MatrixFormProps) {
  const { user } = useAuthStore();
  const { createMatrix, loading, error } = useMatrixStore();
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  if (!user) return null;

  const addQuestion = () => {
    if (questions.length >= 10) {
      alert('Maximum 10 questions par matrice');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      responseType: 'text'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Veuillez donner un nom à la matrice');
      return;
    }
    if (questions.length === 0) {
      alert('Ajoutez au moins une question');
      return;
    }
    if (questions.some(q => !q.text.trim())) {
      alert('Toutes les questions doivent avoir un texte');
      return;
    }

    try {
      await createMatrix(name, questions, user.id);
      setName('');
      setQuestions([]);
      onComplete();
    } catch (error) {
      console.error('Failed to create matrix:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nom de la matrice
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ex: Analyse de contrats"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 10}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une question
          </Button>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-500">
                Question {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <input
              type="text"
              value={question.text}
              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Votre question..."
            />

            <select
              value={question.responseType}
              onChange={(e) => updateQuestion(question.id, { 
                responseType: e.target.value as Question['responseType']
              })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="text">Réponse libre</option>
              <option value="multiple">Choix multiples</option>
              <option value="number">Numérique</option>
              <option value="boolean">Oui/Non</option>
            </select>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !name.trim() || questions.length === 0}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        Enregistrer la matrice
      </Button>
    </form>
  );
}