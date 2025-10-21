import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string; // Label para exibir no mobile
  hiddenOnMobile?: boolean; // Ocultar esta coluna no mobile
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  mobileCardTitle?: (item: T) => React.ReactNode;
  mobileCardSubtitle?: (item: T) => React.ReactNode;
}

/**
 * Tabela responsiva que se transforma em cards no mobile
 * Proporciona melhor experiência em dispositivos móveis
 */
export function ResponsiveTable<T>({
  data,
  columns,
  actions = [],
  keyExtractor,
  emptyState,
  mobileCardTitle,
  mobileCardSubtitle,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0 && emptyState) {
    return <div className="animate-fade-in">{emptyState}</div>;
  }

  // Renderização Mobile (Cards)
  if (isMobile) {
    return (
      <div className="space-y-3 animate-fade-in">
        {data.map((item, index) => (
          <Card 
            key={keyExtractor(item)} 
            className="hover-scale transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="pt-6">
              {/* Título e subtítulo do card */}
              {(mobileCardTitle || mobileCardSubtitle) && (
                <div className="mb-4 pb-4 border-b">
                  {mobileCardTitle && (
                    <div className="font-semibold text-lg mb-1">
                      {mobileCardTitle(item)}
                    </div>
                  )}
                  {mobileCardSubtitle && (
                    <div className="text-sm text-muted-foreground">
                      {mobileCardSubtitle(item)}
                    </div>
                  )}
                </div>
              )}

              {/* Dados */}
              <div className="space-y-3">
                {columns
                  .filter(col => !col.hiddenOnMobile)
                  .map((column) => (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.mobileLabel || column.header}:
                      </span>
                      <span className="text-sm text-right flex-1 ml-2">
                        {column.render 
                          ? column.render(item) 
                          : String((item as any)[column.key] || '-')}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Ações */}
              {actions.length > 0 && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={action.variant || "outline"}
                      onClick={() => action.onClick(item)}
                      className="flex-1"
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Renderização Desktop (Tabela tradicional)
  return (
    <div className="rounded-md border animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={keyExtractor(item)}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render 
                    ? column.render(item) 
                    : String((item as any)[column.key] || '-')}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {actions.map((action, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant={action.variant || "ghost"}
                        onClick={() => action.onClick(item)}
                        className="hover-scale"
                      >
                        {action.icon}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
