import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyTabContentProps {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

/**
 * Reusable empty state component for tab content placeholders
 * Used for tabs that are not yet implemented in the MVP
 */
export function EmptyTabContent({
  icon: Icon,
  title,
  description,
  comingSoon = true,
}: EmptyTabContentProps): JSX.Element {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
        {comingSoon && (
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            Coming Soon
          </div>
        )}
      </CardContent>
    </Card>
  );
}
