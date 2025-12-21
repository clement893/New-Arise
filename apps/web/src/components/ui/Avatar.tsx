/**
 * Avatar Component
 * User avatar component with fallback
 */

'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  onClick,
}: AvatarProps) {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fallbackText = typeof fallback === 'string' ? getInitials(fallback) : fallback;

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center',
        'rounded-full bg-gray-200 dark:bg-gray-700',
        'text-gray-600 dark:text-gray-300',
        'overflow-hidden',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium">{fallbackText ?? '?'}</span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={clsx('w-full h-full object-cover', className)} />;
}

export function AvatarFallback({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx('font-medium flex items-center justify-center w-full h-full', className)}>
      {children}
    </span>
  );
}
