// src/components/ui/professional/Table.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <table className={cn('min-w-full divide-y divide-gray-200', className)}>{children}</table>
  </div>
);

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={cn('bg-gray-50', className)}>{children}</thead>
);

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody className={cn('divide-y divide-gray-200 bg-white', className)}>{children}</tbody>
);

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, hover = true }) => (
  <tr className={cn(hover && 'hover:bg-gray-50', className)}>{children}</tr>
);

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => (
  <th
    className={cn(
      'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
      className
    )}
  >
    {children}
  </th>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => (
  <td className={cn('whitespace-nowrap px-6 py-4 text-sm text-gray-900', className)}>{children}</td>
);
