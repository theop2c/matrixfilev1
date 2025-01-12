import { useState } from 'react';
import { MatrixForm } from './components/MatrixForm';
import { MatrixList } from './components/MatrixList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Matrices() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analysis Matrices</h1>
              <p className="text-gray-600">Create and manage your analysis matrices</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancel' : 'New Matrix'}
            </Button>
          </div>

          {showForm ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <MatrixForm onComplete={() => setShowForm(false)} />
            </div>
          ) : (
            <MatrixList />
          )}
        </div>
      </div>
    </div>
  );
}