import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Micro-Interactions/Transitions',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Showcase of all micro-interactions and transitions available in the design system.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const FadeIn: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fade In Animation</h2>
      <div className="fade-in bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <p className="text-slate-600 dark:text-slate-300">This element fades in with a smooth 0.3s transition</p>
      </div>
    </div>
  )
};

export const SlideInUp: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Slide In Up Animation</h2>
      <div className="slide-in-up bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <p className="text-slate-600 dark:text-slate-300">This element slides in from bottom with a 0.4s transition</p>
      </div>
    </div>
  )
};

export const SlideInDown: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Slide In Down Animation</h2>
      <div className="slide-in-down bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <p className="text-slate-600 dark:text-slate-300">This element slides in from top with a 0.4s transition</p>
      </div>
    </div>
  )
};

export const ButtonScale: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Button Scale Interaction</h2>
      <p className="text-slate-600 dark:text-slate-300">Hover over the button to see scale animation</p>
      <button className="btn-scale px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold">
        Hover Me!
      </button>
    </div>
  )
};

export const CardLift: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Card Lift Interaction</h2>
      <p className="text-slate-600 dark:text-slate-300">Hover over the card to see lift and shadow effects</p>
      <div className="card-lift p-6 bg-white dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Interactive Card</h3>
        <p className="text-slate-600 dark:text-slate-400">This card lifts and shadows enhance on hover</p>
      </div>
    </div>
  )
};

export const GlassCard: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Glass Card Effect</h2>
      <p className="text-slate-600 dark:text-slate-300">Hover to see the enhanced glass morphism effect</p>
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Glass Morphism Card</h3>
        <p className="text-slate-700 dark:text-slate-300">Beautiful frosted glass effect with blur and transparency</p>
      </div>
    </div>
  )
};

export const FloatingAnimation: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center justify-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Float Animation</h2>
        <div className="float bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg inline-block">
          <p className="text-slate-600 dark:text-slate-300 text-center">Element floats gently up and down</p>
        </div>
      </div>
    </div>
  )
};

export const BounceAnimation: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center justify-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Bounce Soft Animation</h2>
        <div className="bounce-soft bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg inline-block">
          <p className="text-slate-600 dark:text-slate-300 text-center">Subtle bounce effect</p>
        </div>
      </div>
    </div>
  )
};

export const ShimmerEffect: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shimmer Loading Effect</h2>
      <p className="text-slate-600 dark:text-slate-300">Perfect for skeleton loading screens</p>
      <div className="space-y-3">
        <div className="shimmer h-12 rounded-lg"></div>
        <div className="shimmer h-4 w-3/4 rounded"></div>
        <div className="shimmer h-4 w-1/2 rounded"></div>
      </div>
    </div>
  )
};

export const PulseGlow: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pulse Glow Effect</h2>
      <p className="text-slate-600 dark:text-slate-300">Great for highlighting important elements</p>
      <button className="pulse-glow px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold">
        Pulse Glow
      </button>
    </div>
  )
};

export const GradientText: StoryObj = {
  render: () => (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gradient Text Effect</h2>
      <p className="gradient-text text-4xl font-bold">Beautiful gradient text</p>
    </div>
  )
};

export const AllTransitions: StoryObj = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-12">All Micro-Interactions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fade In */}
        <div className="fade-in bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fade In</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Smooth 0.3s fade entrance</p>
        </div>

        {/* Slide In Up */}
        <div className="slide-in-up bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Slide Up</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Entrance from bottom</p>
        </div>

        {/* Scale Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Button Scale</h3>
          <button className="btn-scale px-4 py-2 bg-orange-500 text-white rounded font-medium text-sm">
            Hover Me
          </button>
        </div>

        {/* Card Lift */}
        <div className="card-lift bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Card Lift</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Hover to lift and enhance shadow</p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-6 rounded-lg col-span-full">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Glass Morphism</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">Frosted glass effect with blur</p>
        </div>

        {/* Float */}
        <div className="float bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Float</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Gentle up-down movement</p>
        </div>

        {/* Pulse Glow */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pulse Glow</h3>
          <button className="pulse-glow px-4 py-2 bg-orange-500 text-white rounded font-medium text-sm">
            Important
          </button>
        </div>
      </div>
    </div>
  )
};
