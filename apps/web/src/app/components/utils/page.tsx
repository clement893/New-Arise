import UtilsContent from './UtilsContent';

// Force dynamic rendering to avoid CSS file issues during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function UtilsPage() {
  return <UtilsContent />;
}
