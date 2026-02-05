import type { Meta, StoryObj } from '@storybook/react';
import { CompleteConsilioLayout } from '../components/CompleteConsilioLayout';

// Mock data for cases
const mockCases = [
  {
    id: '1',
    case_number: 'CASE-001',
    title: 'Andersson Family',
  },
  {
    id: '2',
    case_number: 'CASE-002',
    title: 'Johansson Child',
  },
  {
    id: '3',
    case_number: 'CASE-003',
    title: 'Karlsson Emergency',
  },
  {
    id: '4',
    case_number: 'CASE-004',
    title: 'Nilsson Adoption',
  },
  {
    id: '5',
    case_number: 'CASE-005',
    title: 'Eriksson Custody',
  },
];

const mockBadgeData = [
  { caseId: '1', unreadEmails: 3, urgentItems: 1, aiPending: 0 },
  { caseId: '2', unreadEmails: 0, urgentItems: 2, aiPending: 1 },
  { caseId: '3', unreadEmails: 15, urgentItems: 5, aiPending: 2 },
  { caseId: '4', unreadEmails: 0, urgentItems: 0, aiPending: 0 },
  { caseId: '5', unreadEmails: 7, urgentItems: 0, aiPending: 3 },
];

const meta = {
  title: 'Complete/ConsilioLayout',
  component: CompleteConsilioLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Complete Consilio Layout

A fully integrated, **gap-free**, **border-free** Consilio layout with perfect alignment.

## Features

### Fixed Elements
- **Top Bar**: Case filing tabs stay at the top when scrolling
- **Left Sidebar**: Vertical navigation tabs fixed on the left
- **Navigation Tabs**: Horizontal content tabs below top bar
- All elements remain fixed during scroll

### Perfect Alignment
- ✅ Top tabs aligned to bottom (no gap below)
- ✅ Left tabs aligned to right (connects to main window)
- ✅ All borders removed at connection points
- ✅ Seamless integration throughout

### Color System
- **Active tabs**: #f9fafb (off-white)
- **Inactive tabs**: #e5e7eb (gray)
- **Main content**: #f9fafb (off-white)
- **Input fields**: #ffffff (white - stands out)

## Usage

This is a complete, production-ready layout that can be:
1. Viewed and tested in Storybook
2. Adjusted and iterated easily
3. Integrated back into Consilio when satisfied
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialActiveCaseId: {
      control: 'select',
      options: mockCases.map(c => c.id),
      description: 'The initially active case',
    },
    initialActiveTab: {
      control: 'select',
      options: ['oversikt', 'dashboard', 'tidslinje', 'kommunikation', 'epost', 'dokument', 'uppgifter', 'kalender', 'matchning'],
      description: 'The initially active navigation tab',
    },
  },
} satisfies Meta<typeof CompleteConsilioLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the complete layout with case detail view.
 * - All 5 cases visible in top bar
 * - First case active
 * - Översikt tab active
 * - Shows perfect alignment and no gaps/borders
 */
export const Default: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '1',
    initialActiveTab: 'oversikt',
  },
};

/**
 * Dashboard view - shows the layout with the dashboard tab active.
 * Perfect for testing navigation between different content tabs.
 */
export const WithDashboard: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '1',
    initialActiveTab: 'dashboard',
  },
};

/**
 * Emergency case selected - shows case with high badge counts.
 * - Karlsson Emergency case active (15 emails, 5 urgent, 2 AI pending)
 * - Demonstrates badge display on active tab
 */
export const WithEmergencyCase: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '3',
    initialActiveTab: 'oversikt',
  },
};

/**
 * Email tab active - shows the e-post content view.
 * Perfect for testing email-related features.
 */
export const WithEmailTab: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '1',
    initialActiveTab: 'epost',
  },
};

/**
 * Documents tab - shows document management view.
 */
export const WithDocumentsTab: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '2',
    initialActiveTab: 'dokument',
  },
};

/**
 * Timeline view - shows the tidslinje (timeline) tab.
 */
export const WithTimelineTab: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '4',
    initialActiveTab: 'tidslinje',
  },
};

/**
 * Many cases - shows layout with 10 cases to test horizontal scrolling.
 * - Demonstrates case tab scrolling behavior
 * - Shows how active case is scrolled into view
 */
export const WithManyCases: Story = {
  args: {
    cases: [
      ...mockCases,
      { id: '6', case_number: 'CASE-006', title: 'Persson Foster Care' },
      { id: '7', case_number: 'CASE-007', title: 'Gustafsson Review' },
      { id: '8', case_number: 'CASE-008', title: 'Larsson Assessment' },
      { id: '9', case_number: 'CASE-009', title: 'Olsson Support' },
      { id: '10', case_number: 'CASE-010', title: 'Lindberg Follow-up' },
    ],
    badgeData: [
      ...mockBadgeData,
      { caseId: '6', unreadEmails: 2, urgentItems: 0, aiPending: 1 },
      { caseId: '7', unreadEmails: 0, urgentItems: 1, aiPending: 0 },
      { caseId: '8', unreadEmails: 5, urgentItems: 3, aiPending: 2 },
      { caseId: '9', unreadEmails: 1, urgentItems: 0, aiPending: 0 },
      { caseId: '10', unreadEmails: 8, urgentItems: 1, aiPending: 4 },
    ],
    initialActiveCaseId: '8',
    initialActiveTab: 'oversikt',
  },
};

/**
 * Scrollable content - demonstrates that all fixed elements stay in place.
 * - Long content to test scroll behavior
 * - Top bar, sidebar, and nav tabs all remain fixed
 */
export const ScrollableContent: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '1',
    initialActiveTab: 'oversikt',
  },
  parameters: {
    docs: {
      description: {
        story: 'Scroll down to verify that the top bar, sidebar, and navigation tabs all remain fixed in position.',
      },
    },
  },
};

/**
 * Clean case (no badges) - shows case with no notifications.
 * Perfect for testing the clean state of the UI.
 */
export const WithCleanCase: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '4',
    initialActiveTab: 'oversikt',
  },
};

/**
 * Custom content - shows how to use the layout with custom children.
 */
export const WithCustomContent: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '1',
    initialActiveTab: 'oversikt',
    children: (
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Custom Content</h2>
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            You can pass custom content
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
            This story demonstrates how you can pass custom children to the layout component.
            This is useful for testing specific views or components within the layout.
          </p>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Form Example</h4>
            <input
              type="text"
              placeholder="Name"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                display: 'block',
              }}
            />
            <input
              type="email"
              placeholder="Email"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                display: 'block',
              }}
            />
            <textarea
              placeholder="Message"
              rows={4}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                display: 'block',
                resize: 'vertical',
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    ),
  },
};

/**
 * All tabs showcase - demonstrates navigation through all available tabs.
 * Click through each tab to see the layout in action.
 */
export const AllTabsShowcase: Story = {
  args: {
    cases: mockCases,
    badgeData: mockBadgeData,
    initialActiveCaseId: '2',
    initialActiveTab: 'kommunikation',
  },
  parameters: {
    docs: {
      description: {
        story: `
Click through all the navigation tabs to see how the layout handles different views:
- Översikt
- Dashboard
- Tidslinje
- Kommunikation
- E-post
- Dokument
- Uppgifter
- Kalender
- Matchning

All tabs maintain perfect alignment and the active state is clearly visible.
        `,
      },
    },
  },
};
