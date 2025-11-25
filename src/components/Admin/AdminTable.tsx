import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  width?: string;
}

interface AdminTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  rowActions?: (row: Record<string, unknown>) => React.ReactNode;
  isLoading?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
}

export const AdminTable = ({
  columns,
  data,
  onRowClick,
  rowActions,
  isLoading = false,
  searchPlaceholder = 'Search...',
  itemsPerPage = 10
}: AdminTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const filteredData = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0);
          }}
          className="pl-10 glass-effect"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left py-3 px-4 font-semibold text-sm ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
              {rowActions && <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="py-8 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {paginatedData.map((row, index) => (
                  <motion.tr
                    key={`${row.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-border hover:bg-muted/40 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 text-sm">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] || 'N/A'}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="py-3 px-4 text-right">
                        {rowActions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages} • {filteredData.length} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="glass-effect"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="glass-effect"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
