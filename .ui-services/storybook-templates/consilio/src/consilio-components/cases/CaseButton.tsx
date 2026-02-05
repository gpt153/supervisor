import { cn } from '@/lib/utils';
import { BadgeIndicator } from './BadgeIndicator';

interface CaseButtonProps {
  caseItem: {
    id: string;
    case_number: string;
    title: string;
  };
  badgeCounts: {
    unreadEmails: number;
    urgentItems: number;
    aiPending: number;
  };
  isActive: boolean;
  onClick: () => void;
}

export function CaseButton({ caseItem, badgeCounts, isActive, onClick }: CaseButtonProps): JSX.Element {
  return (
    <button
      data-case-id={caseItem.id}
      onClick={onClick}
      className={cn(
        'filing-tab relative flex flex-col gap-2 px-4 pt-2 pb-1 min-w-[180px] max-w-[260px] h-14',
        // Filing tab base styling - rounded top corners
        'border-l border-r border-t rounded-t-lg',
        // Z-index and positioning for layering effect with CSS variable colors
        isActive
          ? 'filing-tab--active z-10 shadow-sm'
          : 'z-0 hover:opacity-90',
        // Smooth transitions using CSS variables
        'transition-all duration-200'
      )}
      style={{
        backgroundColor: isActive ? 'var(--case-tab-active)' : 'var(--case-tab-inactive)',
        color: isActive ? 'var(--case-tab-text-active)' : 'var(--case-tab-text-inactive)',
        borderColor: isActive ? 'var(--case-tab-border-active)' : 'var(--case-tab-border-inactive)',
      }}
    >
      <div className="text-left">
        <div className={cn(
          'text-sm font-medium truncate'
        )}>
          {caseItem.title}
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        <BadgeIndicator type="email" count={badgeCounts.unreadEmails} />
        <BadgeIndicator type="urgent" count={badgeCounts.urgentItems} />
        <BadgeIndicator type="ai-pending" count={badgeCounts.aiPending} />
      </div>
    </button>
  );
}
