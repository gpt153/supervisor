import { CheckSquare } from 'lucide-react';
import { EmptyTabContent } from './EmptyTabContent';

/**
 * Tasks tab component (placeholder for MVP)
 * Will display task list with deadlines and assignments
 */
export function CaseTasks(): JSX.Element {
  return (
    <EmptyTabContent
      icon={CheckSquare}
      title="Tasks"
      description="Manage all case-related tasks, deadlines, and action items. Track progress and assignments."
      comingSoon
    />
  );
}
