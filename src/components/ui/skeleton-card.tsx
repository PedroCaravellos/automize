import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  showHeader?: boolean;
  lines?: number;
}

export function SkeletonCard({ showHeader = true, lines = 3 }: SkeletonCardProps) {
  return (
    <Card className="animate-fade-in">
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 10}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}
