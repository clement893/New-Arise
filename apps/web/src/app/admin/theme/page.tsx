import AdminThemeContent from './AdminThemeContent';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function AdminThemePage() {
  return (
    <ProtectedSuperAdminRoute>
      <AdminThemeContent />
    </ProtectedSuperAdminRoute>
  );
}
