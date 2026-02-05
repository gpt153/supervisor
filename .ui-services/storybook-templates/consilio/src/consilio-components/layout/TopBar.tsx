import { useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useActiveCase } from '@/contexts/ActiveCaseContext';
import { useCaseSwitcherSettings } from '@/contexts/SettingsContext';
import { CaseButton } from '@/components/cases/CaseButton';
import { useBadgeCounts } from '@/hooks/useBadgeCounts';
import type { Case } from '@/types/case.types';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeCaseId, setActiveCaseId } = useActiveCase();
  const navigate = useNavigate();
  const location = useLocation();
  const { maxVisibleCases } = useCaseSwitcherSettings();

  // Check if we're on a case detail page - case tabs only active when on case detail
  const isOnCaseDetailPage = location.pathname.includes('/cases/') && !location.pathname.endsWith('/cases');

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
  }, [visibleCases]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top bar with menu button */}
      <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Öppna meny"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Case tabs container - takes up remaining space */}
        {visibleCases && visibleCases.length > 0 && (
          <div className="hidden sm:block flex-1 overflow-x-auto">
            <div className="overflow-x-auto" ref={containerRef}>
              <div className="flex gap-0 min-w-max">
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
                      isActive={isOnCaseDetailPage && activeCaseId === caseItem.id}
                      onClick={() => handleCaseClick(caseItem.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
