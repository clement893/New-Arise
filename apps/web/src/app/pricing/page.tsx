/**
 * Redirect /pricing to locale-specific route
 * With next-intl, pricing routes should be under [locale]
 */
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function PricingRedirect() {
  redirect(`/${routing.defaultLocale}/pricing`);
}
