import AdminSettingsContent from './AdminSettingsContent';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function AdminSettingsPage() {
  return (
    <ProtectedSuperAdminRoute>
      <AdminSettingsContent />
    </ProtectedSuperAdminRoute>
  );
}
