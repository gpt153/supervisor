import { formatDate } from '@/lib/date';
import type { TimelineEvent } from '@/types/case.types';

interface CaseTimelineProps {
  events: TimelineEvent[];
}

export function CaseTimeline({ events }: CaseTimelineProps): JSX.Element {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index < events.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-px bg-border" />
          )}

          {/* Timeline dot */}
          <div className="relative z-10 mt-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
          </div>

          {/* Event content */}
          <div className="flex-1 space-y-1 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{event.action}</p>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(event.created_at, 'MMM d, yyyy')}
              </time>
            </div>
            {event.user && (
              <p className="text-xs text-muted-foreground">by {event.user.full_name}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
