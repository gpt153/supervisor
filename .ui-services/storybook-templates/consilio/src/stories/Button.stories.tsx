import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Button',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    label: 'Button',
    variant: 'outline',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    size: 'large',
  },
};
