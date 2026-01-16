// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import TeamsPageClient from './TeamsPageClient';

export default function TeamsPage() {
  return <TeamsPageClient />;
}
