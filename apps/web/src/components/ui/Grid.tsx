/**
 * Grid Component
 * 
 * A flexible grid layout component with themeable gap spacing.
 * Supports responsive columns and custom gap values.
 * 
 * @example
 * ```tsx
 * // Basic grid with 3 columns
 * <Grid columns={3} gap="normal">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * 
 * // Responsive grid
 * <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="loose">
 *   {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </Grid>
 * ```
 */

'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { useLayout } from '@/lib/theme/use-layout';

export interface GridProps {
  /** Grid content */
  children: ReactNode;
  /** Number of columns (number or responsive object) */
  columns?: number | {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Gap size from theme (tight, normal, loose) */
  gap?: 'tight' | 'normal' | 'loose';
  /** Custom gap value (overrides theme gap) */
  gapValue?: string;
  /** Additional CSS classes */
  className?: string;
}

export default function Grid({
  children,
  columns = 3,
  gap = 'normal',
  gapValue,
  className,
}: GridProps) {
  const { getGap } = useLayout();
  
  // Get gap value from theme or use custom value
  const gapValueToUse = gapValue || getGap(gap);
  
  // Build responsive grid classes and styles
  const getGridConfig = () => {
    if (typeof columns === 'number') {
      // For fixed columns, use Tailwind classes directly
      const gridClassMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
      };
      return {
        className: gridClassMap[columns] || '',
        style: {} as React.CSSProperties,
      };
    }
    
    // For responsive columns, use Tailwind's responsive utilities
    const mobile = columns.mobile || 1;
    const tablet = columns.tablet || mobile;
    const desktop = columns.desktop || tablet;
    
    // Map to Tailwind classes
    const gridClassMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };
    
    const mobileClass = gridClassMap[mobile] || '';
    const tabletClass = tablet !== mobile ? `sm:${gridClassMap[tablet] || ''}` : '';
    const desktopClass = desktop !== tablet ? `lg:${gridClassMap[desktop] || ''}` : '';
    
    return {
      className: clsx(mobileClass, tabletClass, desktopClass),
      style: {} as React.CSSProperties,
    };
  };
  
  const gridConfig = getGridConfig();
  
  return (
    <div
      className={clsx(
        'grid',
        gridConfig.className,
        className
      )}
      style={{
        ...gridConfig.style,
        gap: gapValueToUse,
      }}
    >
      {children}
    </div>
  );
}
