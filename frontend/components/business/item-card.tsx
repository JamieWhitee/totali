import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ItemCardProps {
  id: string;
  name: string;
  category: string;
  value: number;
  purchaseDate: string;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function ItemCard({
  id,
  name,
  category,
  value,
  purchaseDate,
  onEdit,
  onView,
  className,
}: ItemCardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
          <Badge variant="secondary" className="shrink-0">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-primary">¥{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Purchase Date: {purchaseDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit?.(id)} className="flex-1">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="default" size="sm" onClick={() => onView?.(id)} className="flex-1">
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
