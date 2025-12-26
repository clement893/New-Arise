/**
 * Form Submissions Page
 * 
 * Page for viewing form submissions.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormSubmissions } from '@/components/cms';
import type { FormSubmission } from '@/components/cms';
import { PageHeader, PageContainer } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';

export default function FormSubmissionsPage() {
  const params = useParams();
  const t = useTranslations('forms.submissions');
  const formId = params.id as string;

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [formId]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual form submissions API endpoint when available
      // const response = await apiClient.get(`/v1/forms/${formId}/submissions`);
      // setSubmissions(response.data);
      
      setSubmissions([]);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load submissions', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load submissions. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Replace with actual API endpoint when available
      // await apiClient.delete(`/v1/forms/submissions/${id}`);
      logger.info('Deleting submission', { submissionId: id });
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      logger.error('Failed to delete submission', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    logger.info('Exporting submissions', { formId });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader
          title={t('title') || 'Form Submissions'}
          description={t('description') || `Submissions for form ${formId}`}
          breadcrumbs={[
            { label: t('breadcrumbs.home') || 'Home', href: '/' },
            { label: t('breadcrumbs.forms') || 'Forms', href: '/forms' },
            { label: formId, href: `/forms/${formId}` },
            { label: t('breadcrumbs.submissions') || 'Submissions' },
          ]}
        />

        {error && (
          <div className="mt-6">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        <div className="mt-8">
          <FormSubmissions
            submissions={submissions}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

