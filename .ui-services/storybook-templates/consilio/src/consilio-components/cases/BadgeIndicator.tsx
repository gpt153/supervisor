import { cn } from '@/lib/utils';
import { DEFAULT_BADGE_RULES, type UrgencyLevel } from '@/types/badges';

interface BadgeIndicatorProps {
  type: 'email' | 'urgent' | 'ai-pending';
  count: number;
  urgency?: UrgencyLevel; // For future urgency-based color coding
}

const badgeConfig = {
  email: {
    icon: '📧',
    bgVar: 'var(--badge-blue-bg)',
    textVar: 'var(--badge-blue-text)',
    label: 'unread emails',
  },
  urgent: {
    icon: '⚠️',
    bgVar: 'var(--badge-red-bg)',
    textVar: 'var(--badge-red-text)',
    label: 'urgent items',
  },
  'ai-pending': {
    icon: '🤖',
    bgVar: 'var(--badge-purple-bg)',
    textVar: 'var(--badge-purple-text)',
    label: 'AI pending approvals',
  },
} as const;

/**
 * Format badge count according to display rules
 * - Show "0" if count is 0 (but badge will be hidden)
 * - Show exact count for 1-99
 * - Show "99+" for count >= 100
 */
function formatBadgeCount(count: number): string {
  if (count === 0) return '0';
  if (count <= DEFAULT_BADGE_RULES.maxDisplay) return count.toString();
  return `${DEFAULT_BADGE_RULES.maxDisplay}+`;
}

export function BadgeIndicator({
  type,
  count,
}: BadgeIndicatorProps): JSX.Element | null {
  // Hide badge if count is 0 (per requirements)
  if (count === 0 && DEFAULT_BADGE_RULES.hideZero) {
    return null;
  }

  const config = badgeConfig[type];
  const displayCount = formatBadgeCount(count);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: config.bgVar,
        color: config.textVar,
      }}
      aria-label={`${count} ${config.label}`}
    >
      <span>{config.icon}</span>
      <span>{displayCount}</span>
    </div>
  );
}
