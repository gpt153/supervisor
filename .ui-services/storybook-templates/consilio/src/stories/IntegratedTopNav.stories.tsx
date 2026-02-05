import type { Meta, StoryObj } from '@storybook/react';
import { IntegratedTopNav } from '../components/IntegratedTopNav';

const meta = {
  title: 'Consilio/IntegratedTopNav',
  component: IntegratedTopNav,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IntegratedTopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
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
        title: 'Lars',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 2, urgentItems: 0, aiPending: 1 }
      },
      {
        id: '7',
        title: 'Karin',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 0, urgentItems: 2, aiPending: 0 }
      },
      {
        id: '8',
        title: 'Per',
        backgroundColor: '#FFFFFF',
        badgeCounts: { unreadEmails: 4, urgentItems: 1, aiPending: 3 }
      }
    ]
  },
};
