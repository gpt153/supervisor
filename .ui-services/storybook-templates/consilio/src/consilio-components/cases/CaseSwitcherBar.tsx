import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useActiveCase } from '@/contexts/ActiveCaseContext';
import { useCaseSwitcherSettings } from '@/contexts/SettingsContext';
import { CaseButton } from './CaseButton';
import { useBadgeCounts } from '@/hooks/useBadgeCounts';
import type { Case } from '@/types/case.types';

export function CaseSwitcherBar(): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeCaseId, setActiveCaseId } = useActiveCase();
  const navigate = useNavigate();
  const { maxVisibleCases } = useCaseSwitcherSettings();

  // Fetch all cases
  const { data: casesData } = useQuery({
    queryKey: ['cases', 'all'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Case[] }>('/cases?limit=100');
      return response.data.data;
    },
  });

  // Fetch badge counts using optimized hook
  const { data: badgeData } = useBadgeCounts();

  // Limit visible cases based on user setting
  const visibleCases = useMemo(() => {
    if (!casesData) return [];
    const limit = parseInt(maxVisibleCases, 10);
    return casesData.slice(0, limit);
  }, [casesData, maxVisibleCases]);

  // Scroll active case into view
  useEffect(() => {
    if (activeCaseId && containerRef.current) {
      const activeButton = containerRef.current.querySelector(
        `[data-case-id="${activeCaseId}"]`
      );
      activeButton?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCaseId]);

  const handleCaseClick = (caseId: string): void => {
    setActiveCaseId(caseId);
    navigate(`/cases/${caseId}`);
  };

  // Keyboard shortcuts: Alt+1 through Alt+9 for first 9 cases (limited by visible cases)
  useEffect(() => {
    if (!visibleCases || visibleCases.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Check for Alt key + number (1-9)
      if (event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey) {
        const keyNum = parseInt(event.key, 10);
        if (keyNum >= 1 && keyNum <= 9) {
          event.preventDefault(); // Prevent browser default behavior
          const targetCase = visibleCases[keyNum - 1];
          if (targetCase) {
            handleCaseClick(targetCase.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleCases, handleCaseClick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visibleCases || visibleCases.length === 0) {
    return null; // Don't show case switcher if no cases
  }

  return (
    <div
      className="filing-tab-container hidden sm:block fixed top-16 left-0 right-0 z-40"
      style={{ backgroundColor: 'var(--case-nav-background)' }}
    >
      <div className="overflow-x-auto" ref={containerRef}>
        <div className="flex gap-0 p-2 min-w-max pb-0">
          {visibleCases.map((caseItem) => {
            const badges = badgeData?.find((b) => b.caseId === caseItem.id) || {
              unreadEmails: 0,
              urgentItems: 0,
              aiPending: 0,
            };

            return (
              <CaseButton
                key={caseItem.id}
                caseItem={caseItem}
                badgeCounts={badges}
                isActive={activeCaseId === caseItem.id}
                onClick={() => handleCaseClick(caseItem.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
