import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useActiveCase } from '@/contexts/ActiveCaseContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BadgeIndicator } from './BadgeIndicator';
import type { Case } from '@/types/case.types';

interface BadgeCounts {
  caseId: string;
  unreadEmails: number;
  urgentItems: number;
  aiPending: number;
}

export function CaseSwitcherDropdown(): JSX.Element | null {
  const { activeCaseId, setActiveCaseId } = useActiveCase();
  const navigate = useNavigate();

  // Fetch all cases
  const { data: casesData } = useQuery({
    queryKey: ['cases', 'all'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Case[] }>('/cases?limit=100');
      return response.data.data;
    },
  });

  // Fetch badge counts
  const { data: badgeData } = useQuery({
    queryKey: ['cases', 'badge-counts'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: BadgeCounts[] }>(
        '/cases/badge-counts'
      );
      return response.data.data;
    },
  });

  const handleValueChange = (value: string): void => {
    setActiveCaseId(value);
    navigate(`/cases/${value}`);
  };

  if (!casesData || casesData.length === 0) {
    return null; // Don't show case switcher if no cases
  }

  return (
    <div className="sm:hidden p-2 border-b bg-background sticky top-16 z-10">
      <Select value={activeCaseId || undefined} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full min-h-[48px]">
          <SelectValue placeholder="Select a case" />
        </SelectTrigger>
        <SelectContent>
          {casesData.map((caseItem) => {
            const badges = badgeData?.find((b) => b.caseId === caseItem.id) || {
              unreadEmails: 0,
              urgentItems: 0,
              aiPending: 0,
            };

            return (
              <SelectItem key={caseItem.id} value={caseItem.id}>
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{caseItem.case_number}</div>
                    <div className="text-xs text-muted-foreground">{caseItem.title}</div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <BadgeIndicator type="email" count={badges.unreadEmails} />
                    <BadgeIndicator type="urgent" count={badges.urgentItems} />
                    <BadgeIndicator type="ai-pending" count={badges.aiPending} />
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
