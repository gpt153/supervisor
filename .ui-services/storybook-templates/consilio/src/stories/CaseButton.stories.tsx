import type { Meta, StoryObj } from '@storybook/react';
import { CaseButton } from '../components/CaseButton';

const meta = {
  title: 'Consilio/CaseButton',
  component: CaseButton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CaseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Modern: Story = {
  args: {
    title: 'Anna',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 3,
      urgentItems: 1,
      aiPending: 0
    },
    isActive: false,
  },
};

export const ModernActive: Story = {
  args: {
    title: 'Erik',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 0,
      urgentItems: 0,
      aiPending: 2
    },
    isActive: true,
  },
};

export const HighActivity: Story = {
  args: {
    title: 'Sofia',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 5,
      urgentItems: 3,
      aiPending: 1
    },
    isActive: false,
  },
};

export const LowActivity: Story = {
  args: {
    title: 'Johan',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 1,
      urgentItems: 0,
      aiPending: 0
    },
    isActive: false,
  },
};

export const NoActivity: Story = {
  args: {
    title: 'Maria',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 0,
      urgentItems: 0,
      aiPending: 0
    },
    isActive: false,
  },
};

export const VeryHighActivity: Story = {
  args: {
    title: 'David',
    backgroundColor: '#FFFFFF',
    badgeCounts: {
      unreadEmails: 12,
      urgentItems: 5,
      aiPending: 3
    },
    isActive: false,
  },
};
