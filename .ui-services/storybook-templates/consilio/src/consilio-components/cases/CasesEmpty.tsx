import { FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CasesEmptyProps {
  hasFilters: boolean;
  onCreateCase?: () => void;
  onClearFilters: () => void;
}

export function CasesEmpty({
  hasFilters,
  onCreateCase,
  onClearFilters,
}: CasesEmptyProps): JSX.Element {
  if (hasFilters) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cases found</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            No cases match your current filters. Try adjusting your search criteria.
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Get started by creating your first case. Cases help you track and manage client
          interactions.
        </p>
        {onCreateCase && (
          <Button onClick={onCreateCase}>
            <Plus className="mr-2 h-4 w-4" />
            Create case
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
