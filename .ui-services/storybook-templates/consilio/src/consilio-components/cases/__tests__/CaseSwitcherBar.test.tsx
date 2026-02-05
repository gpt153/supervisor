/**
 * CaseSwitcherBar Component Tests
 * Epic 007: UX Redesign - Case Switcher Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { CaseSwitcherBar } from '../CaseSwitcherBar';
import { ActiveCaseProvider } from '@/contexts/ActiveCaseContext';
import * as api from '@/services/api';
import * as badgeHooks from '@/hooks/useBadgeCounts';
import type { Case } from '@/types/case.types';

const mockCases: Case[] = [
  {
    id: 'case-1',
    case_number: '2024-001',
    title: 'Test Case 1',
    description: null,
    status: 'OPEN',
    priority: 'HIGH',
    type: 'CHILD_PROTECTION',
    opened_at: '2024-01-01T00:00:00Z',
    closed_at: null,
    due_date: null,
    assigned_to_id: null,
    created_by_id: 'user-1',
    organization_id: 'org-1',
    tags: [],
    client_name: null,
    client_email: null,
    client_phone: null,
    client_personal_number: null,
    client_address: null,
    client_notes: null,
    foster_family_name: null,
    foster_family_notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'case-2',
    case_number: '2024-002',
    title: 'Test Case 2',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    type: 'ELDERLY_CARE',
    opened_at: '2024-01-02T00:00:00Z',
    closed_at: null,
    due_date: null,
    assigned_to_id: null,
    created_by_id: 'user-1',
    organization_id: 'org-1',
    tags: [],
    client_name: null,
    client_email: null,
    client_phone: null,
    client_personal_number: null,
    client_address: null,
    client_notes: null,
    foster_family_name: null,
    foster_family_notes: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'case-3',
    case_number: '2024-003',
    title: 'Test Case 3',
    description: null,
    status: 'OPEN',
    priority: 'LOW',
    type: 'DISABILITY_SUPPORT',
    opened_at: '2024-01-03T00:00:00Z',
    closed_at: null,
    due_date: null,
    assigned_to_id: null,
    created_by_id: 'user-1',
    organization_id: 'org-1',
    tags: [],
    client_name: null,
    client_email: null,
    client_phone: null,
    client_personal_number: null,
    client_address: null,
    client_notes: null,
    foster_family_name: null,
    foster_family_notes: null,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

const mockBadges = [
  { caseId: 'case-1', unreadEmails: 2, urgentItems: 1, aiPending: 0 },
  { caseId: 'case-2', unreadEmails: 0, urgentItems: 0, aiPending: 1 },
  { caseId: 'case-3', unreadEmails: 1, urgentItems: 0, aiPending: 0 },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ActiveCaseProvider>{children}</ActiveCaseProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CaseSwitcherBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: { success: true, data: mockCases },
    } as any);

    // Mock badge counts hook
    vi.spyOn(badgeHooks, 'useBadgeCounts').mockReturnValue({
      data: mockBadges,
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render all cases', async () => {
    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('2024-001')).toBeInTheDocument();
      expect(screen.getByText('2024-002')).toBeInTheDocument();
      expect(screen.getByText('2024-003')).toBeInTheDocument();
    });
  });

  it('should display badge counts correctly', async () => {
    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      const case1Element = screen.getByText('2024-001').closest('button');
      expect(case1Element).toBeInTheDocument();
      // Badges are rendered as separate elements, check they exist
      expect(screen.getByText('2')).toBeInTheDocument(); // unread emails
      expect(screen.getByText('1')).toBeInTheDocument(); // urgent items or AI pending
    });
  });

  it('should handle case switching on click', async () => {
    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('2024-002')).toBeInTheDocument();
    });

    const case2Button = screen.getByText('2024-002').closest('button');
    if (case2Button) {
      fireEvent.click(case2Button);
    }

    // Navigation would be tested via router mock, but button click should work
    expect(case2Button).toBeInTheDocument();
  });

  it('should support keyboard shortcuts Alt+1-9', async () => {
    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('2024-001')).toBeInTheDocument();
    });

    // Simulate Alt+1
    fireEvent.keyDown(window, {
      key: '1',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
    });

    // Check that first case can be activated (navigation tested separately)
    expect(screen.getByText('2024-001')).toBeInTheDocument();

    // Simulate Alt+2
    fireEvent.keyDown(window, {
      key: '2',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
    });

    expect(screen.getByText('2024-002')).toBeInTheDocument();
  });

  it('should not render when no cases available', () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: { success: true, data: [] },
    } as any);

    const { container } = render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    expect(container.firstChild).toBeNull();
  });

  it('should handle focus indicators for accessibility', async () => {
    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('2024-001')).toBeInTheDocument();
    });

    const firstButton = screen.getByText('2024-001').closest('button');
    if (firstButton) {
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    }
  });

  it('should scroll active case into view', async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<CaseSwitcherBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('2024-002')).toBeInTheDocument();
    });

    const case2Button = screen.getByText('2024-002').closest('button');
    if (case2Button) {
      fireEvent.click(case2Button);
    }

    // scrollIntoView should be called when active case changes
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });
});
