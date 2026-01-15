import { ButtonHTMLAttributes, ReactNode, memo } from 'react';
import { clsx } from 'clsx';
import { ButtonVariant, Size } from './types';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import { mergeVariantConfig, applyVariantConfigAsStyles } from '@/lib/theme/variant-helpers';

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports loading state, full width, and all standard button HTML attributes.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * // Loading state
 * <Button variant="primary" loading>
 *   Processing...
 * </Button>
 * 
 * // Full width button
 * <Button variant="primary" fullWidth>
 *   Submit
 * </Button>
 * ```
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: Size;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
  /** Render as child element (for use with Link) */
  asChild?: boolean;
}

// Base styles
const baseStyles = [
  'font-medium',
  'rounded-lg',
  'transition-all',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
].join(' ');

// Variant styles - Split into arrays for better readability
// Use string concatenation instead of template literals to avoid Turbopack parsing issues
const createVariantStyles = (base: string[], hover: string[], focus: string[], cssVar: string) =>
  [
    ...base,
    ...hover,
    ...focus,
    '[background-color:var(--' + cssVar + ')]',
  ].join(' ');

const variants = {
  primary: createVariantStyles(
    ['bg-primary-600', 'dark:bg-primary-500', 'text-white'],
    ['hover:bg-primary-700', 'dark:hover:bg-primary-600'],
    ['focus:ring-primary-500', 'dark:focus:ring-primary-400'],
    'color-primary-500'
  ),
  secondary: createVariantStyles(
    ['bg-secondary-600', 'dark:bg-secondary-500', 'text-white'],
    ['hover:bg-secondary-700', 'dark:hover:bg-secondary-600'],
    ['focus:ring-secondary-500', 'dark:focus:ring-secondary-400'],
    'color-secondary-500'
  ),
  outline: [
    'border-2',
    'bg-transparent',
    'focus:ring-2',
    'focus:ring-offset-2',
    '[border-color:#0F4C56]',
    '[color:#0F4C56]',
    'hover:[background-color:rgba(15,76,86,0.1)]',
    'focus:[ring-color:#0F4C56]',
    'transition-colors',
  ].join(' '),
  ghost: [
    'text-foreground',
    'hover:bg-muted',
    'focus:ring-primary-500',
    'dark:focus:ring-primary-400',
  ].join(' '),
  danger: createVariantStyles(
    ['bg-danger-600', 'dark:bg-danger-500', 'text-white'],
    ['hover:bg-danger-700', 'dark:hover:bg-danger-600'],
    ['focus:ring-danger-500', 'dark:focus:ring-danger-400'],
    'color-danger-500'
  ),
  'arise-primary': [
    'bg-arise-button-primary',
    'text-white',
    'hover:bg-arise-button-primary-hover',
    'focus:ring-arise-button-primary',
    'dark:bg-arise-button-primary',
    'dark:hover:bg-arise-button-primary-hover',
    '[background-color:var(--color-arise-button-primary,#0F454D)]',
  ].join(' '),
};

// Default sizes (fallback if theme config not available)
const defaultSizes = {
  sm: 'px-4 py-2.5 text-sm min-h-[44px]', // Ensure minimum touch target (44x44px) - Increased py for better breathing room
  md: 'px-6 py-3 text-base min-h-[44px]', // Standard size - py-3 (12px) provides good balance
  lg: 'px-8 py-4 text-lg min-h-[44px]', // Large size - py-4 (16px) for prominence
};

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const { getSize, getVariant } = useComponentConfig('button');
  const sizeConfig = getSize(size);
  const variantConfig = getVariant(variant);
  
  // Build size classes - use theme config if available, otherwise use defaults
  let sizeClasses = defaultSizes[size] || defaultSizes.md;
  const sizeStyle: React.CSSProperties = {};
  
  // Apply theme size config if available
  if (sizeConfig) {
    // Use theme padding if provided
    if (sizeConfig.paddingX || sizeConfig.paddingY) {
      // Remove padding classes and use inline styles instead
      sizeClasses = sizeClasses.replace(/px-\d+|py-\d+/g, '').trim();
      if (sizeConfig.paddingX) {
        sizeStyle.paddingLeft = sizeConfig.paddingX;
        sizeStyle.paddingRight = sizeConfig.paddingX;
      }
      if (sizeConfig.paddingY) {
        sizeStyle.paddingTop = sizeConfig.paddingY;
        sizeStyle.paddingBottom = sizeConfig.paddingY;
      }
    }
    
    // Use theme fontSize if provided
    if (sizeConfig.fontSize) {
      sizeClasses = sizeClasses.replace(/text-(xs|sm|base|lg|xl|2xl)/g, '').trim();
      sizeStyle.fontSize = sizeConfig.fontSize;
    }
    
    // Use theme minHeight if provided
    if (sizeConfig.minHeight) {
      sizeClasses = sizeClasses.replace(/min-h-\[.*?\]/g, '').trim();
      sizeStyle.minHeight = sizeConfig.minHeight;
    }
    
    // Use theme borderRadius if provided
    if (sizeConfig.borderRadius) {
      sizeStyle.borderRadius = sizeConfig.borderRadius;
    }
  }
  
  // Merge theme variant with default variant
  const variantClasses = variantConfig
    ? mergeVariantConfig(variants[variant] || variants.primary, variantConfig)
    : variants[variant] || variants.primary;
  
  // Get variant styles for inline application
  const variantStyles = variantConfig
    ? applyVariantConfigAsStyles(variantConfig)
    : {};

  // Apply standard colors for variants with background (text must be white)
  const standardVariantStyles: React.CSSProperties = {};
  if (variant === 'primary' && !variantConfig) {
    standardVariantStyles.backgroundColor = '#0F4C56';
    standardVariantStyles.color = '#FFFFFF';
  } else if (variant === 'outline' && !variantConfig) {
    standardVariantStyles.borderColor = '#0F4C56';
    standardVariantStyles.color = '#0F4C56';
    standardVariantStyles.backgroundColor = 'transparent';
    
    // If outline variant has a background color in props.style, force text to white
    if (props.style && typeof props.style === 'object' && 'backgroundColor' in props.style) {
      const bgColor = (props.style as React.CSSProperties).backgroundColor;
      if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        standardVariantStyles.color = '#FFFFFF';
      }
    }
  } else if ((variant === 'secondary' || variant === 'danger' || variant === 'arise-primary') && !variantConfig) {
    // All variants with background must have white text (#FFF)
    standardVariantStyles.color = '#FFFFFF';
  }

  const buttonClasses = clsx(
    baseStyles,
    variantClasses,
    sizeClasses,
    fullWidth && 'w-full',
    variant === 'primary' && !variantConfig && 'hover:opacity-90',
    className
  );

  // If asChild is true, render children directly (for use with Link)
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button
      className={buttonClasses}
      style={{ ...sizeStyle, ...variantStyles, ...standardVariantStyles, ...props.style }}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !variantConfig) {
          e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)';
          e.currentTarget.style.color = '#FFFFFF';
        } else if (variant === 'outline' && !variantConfig) {
          e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.1)';
        } else if ((variant === 'secondary' || variant === 'danger' || variant === 'arise-primary') && !variantConfig) {
          // Ensure text stays white on hover for all background variants
          e.currentTarget.style.color = '#FFFFFF';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !variantConfig) {
          e.currentTarget.style.backgroundColor = '#0F4C56';
          e.currentTarget.style.color = '#FFFFFF';
        } else if (variant === 'outline' && !variantConfig) {
          e.currentTarget.style.backgroundColor = 'transparent';
        } else if ((variant === 'secondary' || variant === 'danger' || variant === 'arise-primary') && !variantConfig) {
          // Ensure text stays white on hover leave for all background variants
          e.currentTarget.style.color = '#FFFFFF';
        }
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-3" aria-hidden="true">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

const ButtonComponent = memo(Button);
export default ButtonComponent;
export { ButtonComponent as Button };
