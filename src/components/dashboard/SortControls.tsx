import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortField = 'date' | 'size';
export type SortOrder = 'asc' | 'desc';

interface SortControlsProps {
  onSort: (field: SortField, order: SortOrder) => void;
  currentField: SortField;
  currentOrder: SortOrder;
}

export function SortControls({ onSort, currentField, currentOrder }: SortControlsProps) {
  const toggleSort = (field: SortField) => {
    if (currentField === field) {
      // Toggle order if same field
      onSort(field, currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      onSort(field, 'desc');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleSort('date')}
        className={`flex items-center space-x-1 ${currentField === 'date' ? 'text-blue-600' : ''}`}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>Date {currentField === 'date' && (currentOrder === 'asc' ? '↑' : '↓')}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleSort('size')}
        className={`flex items-center space-x-1 ${currentField === 'size' ? 'text-blue-600' : ''}`}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>Size {currentField === 'size' && (currentOrder === 'asc' ? '↑' : '↓')}</span>
      </Button>
    </div>
  );
}