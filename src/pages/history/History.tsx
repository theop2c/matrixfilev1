import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatrixStore } from '@/store/matrix';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Search, ArrowUpDown } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

type SortDirection = 'asc' | 'desc';

export function History() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { analyses, matrices, loading: matricesLoading, error, fetchAllAnalyses } = useMatrixStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchAllAnalyses(user.id);
    }
  }, [user, fetchAllAnalyses]);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) =>
      analysis.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analyses, searchTerm]);

  const sortedAnalyses = useMemo(() => {
    return [...filteredAnalyses].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredAnalyses, sortDirection]);

  const totalPages = Math.ceil(sortedAnalyses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAnalyses = sortedAnalyses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1);
  };

  const getMatrixName = (matrixId: string) => {
    const matrix = matrices.find((m) => m.id === matrixId);
    return matrix ? matrix.name : 'Unknown Matrix';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-600">View all your past analyses</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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

          {matricesLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No matching analyses found' : 'No analyses yet'}
              </p>
              <Button onClick={() => navigate('/matrices')} className="mt-4">
                Create an analysis
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{analysis.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(analysis.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Matrix: {getMatrixName(analysis.matrixId)} - {analysis.responses.length} responses
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/matrices/analyses/${analysis.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
