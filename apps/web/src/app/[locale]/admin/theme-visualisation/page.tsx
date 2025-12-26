'use client';

import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import Container from '@/components/ui/Container';
import { ThemeVisualisationContent } from './ThemeVisualisationContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ThemeVisualisationPage() {
  return (
    <ProtectedSuperAdminRoute>
      <Container className="py-8">
        <ThemeVisualisationContent />
      </Container>
    </ProtectedSuperAdminRoute>
  );
}

