import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  className,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');

  // 过滤数据 - 类型安全的搜索
  const filteredData =
    searchKey && searchValue
      ? data.filter((item) => {
          const value = item[searchKey];
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchValue.toLowerCase());
        })
      : data;

  return (
    <div className={cn('space-y-4', className)}>
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : (() => {
                            const value = row[column.key as keyof T];
                            return value !== null && value !== undefined ? value.toString() : '-';
                          })()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
