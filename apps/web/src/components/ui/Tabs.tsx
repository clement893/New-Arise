/**
 * Tabs Component
 * Tab navigation component for ERP applications
 */

'use client';

import { type ReactNode, useState } from 'react';
import { clsx } from 'clsx';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = 'default',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const variantClasses = {
    default: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive: boolean) =>
        clsx(
          'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
          isActive
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
        ),
    },
    pills: {
      container: 'flex gap-2',
      tab: (isActive: boolean) =>
        clsx(
          'px-4 py-2 text-sm font-medium rounded-full transition-colors',
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ),
    },
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive: boolean) =>
        clsx(
          'px-4 py-2 text-sm font-medium transition-colors relative',
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          isActive && 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
        ),
    },
  };

  const classes = variantClasses[variant];

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('flex', classes.container)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={clsx(
              classes.tab(activeTab === tab.id),
              tab.disabled && 'opacity-50 cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={clsx(
                  'ml-1 px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">{activeTabContent}</div>
    </div>
  );
}
