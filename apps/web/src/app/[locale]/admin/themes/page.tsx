'use client';

import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import Container from '@/components/ui/Container';
import { ThemeManagementContent } from './ThemeManagementContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ThemesManagementPage() {
  return (
    <ProtectedSuperAdminRoute>
      <Container className="py-8">
        <ThemeManagementContent />
      </Container>
    </ProtectedSuperAdminRoute>
  );
}

