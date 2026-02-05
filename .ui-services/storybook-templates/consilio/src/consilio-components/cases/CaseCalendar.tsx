import { CalendarDays } from 'lucide-react';
import { EmptyTabContent } from './EmptyTabContent';

/**
 * Calendar tab component (placeholder for MVP)
 * Will display meetings, deadlines, and scheduled actions
 */
export function CaseCalendar(): JSX.Element {
  return (
    <EmptyTabContent
      icon={CalendarDays}
      title="Calendar"
      description="View all scheduled meetings, deadlines, reminders, and important dates related to this case."
      comingSoon
    />
  );
}
