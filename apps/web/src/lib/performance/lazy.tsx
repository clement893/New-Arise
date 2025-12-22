/**
 * Lazy Loading Utilities
 * Optimize component loading with dynamic imports
 * 
 * These utilities provide type-safe lazy loading for React components
 * with proper Suspense boundaries and loading fallbacks.
 */

import { ComponentType, lazy, Suspense, LazyExoticComponent } from 'react';
import Spinner from '@/components/ui/Spinner';

/**
 * Type helper for lazy-loaded components
 * This helps TypeScript understand the component props correctly
 */
type LazyComponentType<T extends ComponentType<unknown>> = LazyExoticComponent<T>;

/**
 * Creates a lazy-loaded component with a loading fallback.
 * 
 * @template T - The component type that extends ComponentType
 * @param importFn - Function that returns a promise resolving to the component module
 * @param fallback - Optional React node to display while loading (defaults to Spinner)
 * @returns A wrapper component that handles lazy loading with Suspense
 * 
 * @example
 * ```tsx
 * const LazyDashboard = createLazyComponent(() => import('./Dashboard'));
 * 
 * // Usage
 * <LazyDashboard userId="123" />
 * ```
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn) as LazyComponentType<T>;

  return function LazyWrapper(props: React.ComponentProps<T>) {
    // TypeScript limitation: LazyExoticComponent types don't properly propagate props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = LazyComponent as any;
    return (
      <Suspense fallback={fallback || <Spinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy loads a component with a custom loading component.
 * 
 * @template T - The component type that extends ComponentType
 * @param importFn - Function that returns a promise resolving to the component module
 * @param LoadingComponent - Optional component to display while loading (defaults to Spinner)
 * @returns A wrapper component that handles lazy loading with Suspense
 * 
 * @example
 * ```tsx
 * const LazyProfile = lazyLoad(
 *   () => import('./Profile'),
 *   () => <CustomLoader />
 * );
 * 
 * // Usage
 * <LazyProfile userId="123" />
 * ```
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent?: ComponentType
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn) as LazyComponentType<T>;

  return function LazyWrapper(props: React.ComponentProps<T>) {
    // TypeScript limitation: LazyExoticComponent types don't properly propagate props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = LazyComponent as any;
    const fallback = LoadingComponent ? <LoadingComponent /> : <Spinner />;
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}

