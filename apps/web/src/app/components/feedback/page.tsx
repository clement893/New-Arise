import nextDynamic from 'next/dynamic';

const FeedbackComponentsContent = nextDynamic(
  () => import('./FeedbackComponentsContent'),
  { ssr: true }
);

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function FeedbackPage() {
  return <FeedbackComponentsContent />;
}
