import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'interactive', 'glass'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-bold mb-2">Card Title</h3>
        <p className="text-slate-600 dark:text-slate-400">
          This is a default card component with standard styling.
        </p>
      </div>
    ),
    variant: 'default',
  },
};

export const Interactive: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-bold mb-2">Interactive Card</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Hover over this card to see the interactive effect.
        </p>
      </div>
    ),
    variant: 'interactive',
    hover: true,
  },
};

export const Glassmorphism: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-bold mb-2">Glassmorphic Card</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Modern frosted glass effect with backdrop blur.
        </p>
      </div>
    ),
    variant: 'glass',
  },
  decorators: [
    (Story) => (
      <div className="w-full h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card variant="default" padding="md">
        <h3 className="font-bold mb-2">Default</h3>
        <p className="text-sm text-slate-600">Standard card</p>
      </Card>
      <Card variant="interactive" padding="md" hover>
        <h3 className="font-bold mb-2">Interactive</h3>
        <p className="text-sm text-slate-600">Hoverable card</p>
      </Card>
      <Card variant="glass" padding="md">
        <h3 className="font-bold mb-2">Glass</h3>
        <p className="text-sm text-slate-600">Frosted effect</p>
      </Card>
    </div>
  ),
};
