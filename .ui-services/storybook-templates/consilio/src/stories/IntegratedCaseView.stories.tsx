import type { Meta, StoryObj } from '@storybook/react';
import { IntegratedCaseView } from '../components/IntegratedCaseView';

const meta = {
  title: 'Consilio/IntegratedCaseView',
  component: IntegratedCaseView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
    activeTab: {
      control: 'select',
      options: ['oversikt', 'dashboard', 'tidslinje', 'kommunikation', 'epost', 'dokument', 'uppgifter', 'kalender', 'uppladdning', 'matchning']
    }
  },
} satisfies Meta<typeof IntegratedCaseView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    backgroundColor: '#f9fafb',
    activeTab: 'oversikt',
  },
};

export const DashboardView: Story = {
  args: {
    backgroundColor: '#f9fafb',
    activeTab: 'dashboard',
  },
};

export const CommunicationView: Story = {
  args: {
    backgroundColor: '#f9fafb',
    activeTab: 'kommunikation',
  },
};
