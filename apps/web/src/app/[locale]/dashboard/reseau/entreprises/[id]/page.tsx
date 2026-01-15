'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { companiesAPI, Company } from '@/lib/api/companies';
import { handleApiError } from '@/lib/errors/api';
import { useToast } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import CompanyDetail from '@/components/reseau/CompanyDetail';
import { Loading, Alert } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_deleting, setDeleting] = useState(false);

  const companyId = params?.id ? parseInt(String(params.id)) : null;

  useEffect(() => {
    if (!companyId) {
      setError('Invalid company ID');
      setLoading(false);
      return;
    }

    loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await companiesAPI.get(companyId);
      setCompany(data);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message || 'Error loading company');
      showToast({
        message: appError.message || 'Error loading company',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (company) {
      const locale = params?.locale as string || 'en';
      router.push(`/${locale}/dashboard/reseau/entreprises/${company.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!company || !confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      setDeleting(true);
      await companiesAPI.delete(company.id);
      showToast({
        message: 'Company deleted successfully',
        type: 'success',
      });
      const locale = params?.locale as string || 'en';
      router.push(`/${locale}/dashboard/reseau/entreprises`);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message || 'Error deleting');
      showToast({
        message: appError.message || 'Error deleting',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    const locale = params?.locale as string || 'fr';
    router.push(`/${locale}/dashboard/reseau/entreprises`);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-12 text-center">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  if (error && !company) {
    return (
      <PageContainer>
        <PageHeader
          title="Erreur"
          description={typeof error === 'string' ? error : String(error || 'An error occurred')}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Network Module', href: '/dashboard/reseau' },
            { label: 'Companies', href: '/dashboard/reseau/entreprises' },
            { label: 'Détail' },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Retour à la liste
            </Button>
          }
        />
        <Alert variant="error">{typeof error === 'string' ? error : String(error || 'An error occurred')}</Alert>
      </PageContainer>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title={company.name}
        description={company.description || 'Company details'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Module Réseau', href: '/dashboard/reseau' },
          { label: 'Entreprises', href: '/dashboard/reseau/entreprises' },
          { label: company.name },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour à la liste
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {typeof error === 'string' ? error : String(error || 'An error occurred')}
        </Alert>
      )}

      <CompanyDetail
        company={company}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
