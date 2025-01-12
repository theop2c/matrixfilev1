import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Edit2, Search, ArrowUpDown } from 'lucide-react';
import { MatrixEditor } from './MatrixEditor';
import { MatrixDeleteDialog } from '@/components/modals/MatrixDeleteDialog';
import { formatDate } from '@/lib/utils';
import type { Matrix } from '@/types/matrix';

const ITEMS_PER_PAGE = 10;

type SortDirection = 'asc' | 'desc';

export function MatrixList() {
  const navigate = useNavigate();
  const { matrices, loading, error, deleteMatrix } = useMatrixStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMatrix, setEditingMatrix] = useState<string | null>(null);
  const [matrixToDelete, setMatrixToDelete] = useState<Matrix | null>(null);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortDirection]);

  // Filter matrices based on search term
  const filteredMatrices = matrices.filter(matrix => 
    matrix.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort matrices by creation date
  const sortedMatrices = [...filteredMatrices].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedMatrices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMatrices = sortedMatrices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeleteConfirm = async () => {
    if (matrixToDelete) {
      await deleteMatrix(matrixToDelete.id);
      setMatrixToDelete(null);
    }
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search matrices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={toggleSort}
          className="flex items-center space-x-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort by Date {sortDirection === 'asc' ? '(Oldest)' : '(Newest)'}</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Matrix List */}
      {filteredMatrices.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No matching matrices found' : 'No matrices created yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedMatrices.map((matrix) => (
              <div 
                key={matrix.id} 
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{matrix.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <span>{matrix.questions.length} questions</span>
                      <span>{formatDate(matrix.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMatrix(matrix.id)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/matrices/${matrix.id}/analyze`)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMatrixToDelete(matrix)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {editingMatrix && (
        <MatrixEditor
          matrix={matrices.find(m => m.id === editingMatrix)!}
          onClose={() => setEditingMatrix(null)}
          onSave={() => setEditingMatrix(null)}
        />
      )}

      <MatrixDeleteDialog
        isOpen={!!matrixToDelete}
        matrixName={matrixToDelete?.name || ''}
        onClose={() => setMatrixToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}