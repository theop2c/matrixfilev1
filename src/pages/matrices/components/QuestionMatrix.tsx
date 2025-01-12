import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  reponseType: 'texte' | 'choix' | 'nombre';
  options?: string[];
}

export function QuestionMatrix() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      reponseType: 'texte'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Matrice de Questions</h2>
        <Button onClick={addQuestion} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Votre question..."
                className="w-full p-2 border rounded"
              />
              
              <select
                value={question.reponseType}
                onChange={(e) => updateQuestion(question.id, { 
                  reponseType: e.target.value as Question['reponseType']
                })}
                className="p-2 border rounded"
              >
                <option value="texte">Texte</option>
                <option value="choix">Choix Multiple</option>
                <option value="nombre">Nombre</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <Button className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer la Matrice
        </Button>
      )}
    </div>
  );
}