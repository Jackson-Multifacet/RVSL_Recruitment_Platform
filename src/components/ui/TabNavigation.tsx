import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabNavigationProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

/**
 * TabNavigation - Reusable tab component
 * Replaces duplicated tab styling across dashboards
 * Supports horizontal and vertical layouts
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  items,
  activeTab,
  onChange,
  className = '',
  variant = 'horizontal',
}) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <div
      className={`
        ${isHorizontal ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1'}
        ${className}
      `}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`
            transition-smooth group relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
            ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }
          `}
        >
          {item.icon && <span className="w-5 h-5">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={`
                ml-auto px-2 py-0.5 text-xs font-bold rounded-full
                ${
                  activeTab === item.id
                    ? 'bg-white/30 text-white'
                    : 'bg-orange-500 text-white'
                }
              `}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * TabPanel - Container for tab content with animation
 */
export interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  activeTab,
  children,
  className = '',
}) => {
  const isActive = id === activeTab;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={`
        transition-opacity duration-300
        ${isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        ${className}
      `}
    >
      {isActive && children}
    </div>
  );
};

/**
 * MobileTabSelector - Dropdown tab selector for mobile screens
 */
export interface MobileTabSelectorProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const MobileTabSelector: React.FC<MobileTabSelectorProps> = ({
  items,
  activeTab,
  onChange,
}) => {
  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className="relative inline-block w-full md:hidden">
      <button
        className={`
          transition-smooth w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-semibold
          bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
          hover:bg-slate-200 dark:hover:bg-slate-700
          focus:outline-none focus:ring-2 focus:ring-orange-500
        `}
      >
        <span className="flex items-center gap-2">
          {activeItem?.icon && <span className="w-4 h-4">{activeItem.icon}</span>}
          {activeItem?.label}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      <div
        className={`
          absolute top-full left-0 right-0 mt-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg
          border border-slate-200 dark:border-slate-700 z-50
        `}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              w-full text-left px-4 py-2.5 transition-colors first:rounded-t-lg last:rounded-b-lg
              ${
                activeTab === item.id
                  ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
