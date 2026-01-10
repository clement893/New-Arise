import { Metadata } from 'next';

/**
 * Layout for Reports Page
 * 
 * Sets cache headers to prevent caching and ensure updates are visible immediately
 */
export const metadata: Metadata = {
  title: 'Results & Reports - ARISE',
  description: 'View your assessment results and comprehensive leadership profile',
};

// Force no caching for this page
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Export headers function to prevent caching at multiple levels
export async function generateStaticParams() {
  return [];
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
