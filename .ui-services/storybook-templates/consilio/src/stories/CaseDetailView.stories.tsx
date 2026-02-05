import type { Meta, StoryObj } from '@storybook/react';
import { CaseDetailView } from '../components/CaseDetailView';

const meta = {
  title: 'Consilio/CaseDetailView',
  component: CaseDetailView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CaseDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightBlueBackground: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'oversikt',
  },
};

export const LightGreenBackground: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'dashboard',
  },
};

export const LightPurpleBackground: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'kommunikation',
  },
};

export const LightOrangeBackground: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'dokument',
  },
};

export const LightRedBackground: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'uppgifter',
  },
};

export const EmailTab: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'epost',
  },
};

export const TimelineTab: Story = {
  args: {
    backgroundColor: '#FFFFFF',
    activeTab: 'tidslinje',
  },
};
