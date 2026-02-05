import type { Meta, StoryObj } from '@storybook/react';
import { CaseButtonRow } from '../components/CaseButtonRow';

const meta = {
  title: 'Consilio/CaseButtonRow',
  component: CaseButtonRow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CaseButtonRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FewCases: Story = {
  args: {
    cases: [
      {
        id: '1',
        title: 'Anna',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 3, urgentItems: 1, aiPending: 0 }
      },
      {
        id: '2',
        title: 'Erik',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 0, urgentItems: 0, aiPending: 2 }
      },
      {
        id: '3',
        title: 'Sofia',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 5, urgentItems: 3, aiPending: 1 }
      }
    ]
  },
};

export const ManyCases: Story = {
  args: {
    cases: [
      {
        id: '1',
        title: 'Anna',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 3, urgentItems: 1, aiPending: 0 }
      },
      {
        id: '2',
        title: 'Erik',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 0, urgentItems: 0, aiPending: 2 }
      },
      {
        id: '3',
        title: 'Sofia',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 5, urgentItems: 3, aiPending: 1 }
      },
      {
        id: '4',
        title: 'Johan',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 1, urgentItems: 0, aiPending: 0 }
      },
      {
        id: '5',
        title: 'Maria',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 0, urgentItems: 0, aiPending: 1 }
      },
      {
        id: '6',
        title: 'Lisa',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 2, urgentItems: 0, aiPending: 0 }
      },
      {
        id: '7',
        title: 'Peter',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 0, urgentItems: 1, aiPending: 0 }
      },
      {
        id: '8',
        title: 'Emma',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 4, urgentItems: 2, aiPending: 1 }
      }
    ]
  },
};
