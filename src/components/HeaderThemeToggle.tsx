import React from 'react';
import { useTheme } from './ThemeProvider';

interface HeaderThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HeaderThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: HeaderThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const icon = isDark ? '☀️' : '🌙';

  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-full
        bg-var(--color-surface)
        text-var(--color-text-primary)
        border border-var(--color-border-subtle)
        shadow-var(--shadow-sm)
        hover:shadow-var(--shadow-md)
        focus:outline-none focus:ring-2 focus:ring-var(--color-primary-500) focus:ring-offset-2
        transition-all duration-var(--duration-normal) ease-var(--ease-in-out)
        ${sizeClasses[size]}
        ${className}
      `}
      title={label}
    >
      <span className={`${iconSize[size]} transition-transform duration-var(--duration-normal)`}>
        {icon}
      </span>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

// Alternative version with custom icons
export function HeaderThemeToggleCustom({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: HeaderThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-full
        bg-var(--color-surface)
        text-var(--color-text-primary)
        border border-var(--color-border-subtle)
        shadow-var(--shadow-sm)
        hover:shadow-var(--shadow-md)
        focus:outline-none focus:ring-2 focus:ring-var(--color-primary-500) focus:ring-offset-2
        transition-all duration-var(--duration-normal) ease-var(--ease-in-out)
        ${sizeClasses[size]}
        ${className}
      `}
      title={label}
    >
      <svg
        className={`${iconSize[size]} transition-all duration-var(--duration-normal)`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isDark ? (
          // Sun icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        ) : (
          // Moon icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        )}
      </svg>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
