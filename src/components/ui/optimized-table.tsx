import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OptimizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

/**
 * Tabela otimizada com React.memo e renderização condicional
 * Use para listas grandes de dados
 */
function OptimizedTableInner<T>({ 
  data, 
  columns, 
  keyExtractor,
  emptyMessage = "Nenhum registro encontrado"
}: OptimizedTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render 
                    ? column.render(item) 
                    : String((item as any)[column.key])
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const OptimizedTable = React.memo(
  OptimizedTableInner,
  (prevProps, nextProps) => {
    // Custom comparison - só re-renderizar se os dados mudaram
    return (
      prevProps.data === nextProps.data &&
      prevProps.columns === nextProps.columns
    );
  }
) as typeof OptimizedTableInner;
