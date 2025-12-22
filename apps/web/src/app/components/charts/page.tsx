import ChartsContent from './ChartsContent';

// Force dynamic rendering to avoid CSS file issues during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ChartsPage() {
  return <ChartsContent />;
}

