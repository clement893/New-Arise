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
import { formsAPI } from '@/lib/api';
import { handleApiError } from '@/lib/errors';

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
      
      const formIdNum = parseInt(formId, 10);
      if (isNaN(formIdNum)) {
        throw new Error('Invalid form ID');
      }
      
      const response = await formsAPI.getSubmissions(formIdNum, { skip: 0, limit: 100 });
      const data = (response as any).data || response;
      
      // Handle both array and paginated response formats
      const submissionsList = Array.isArray(data) 
        ? data 
        : (data?.items || data?.submissions || []);
      
      setSubmissions(submissionsList);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load submissions', error instanceof Error ? error : new Error(String(error)));
      const errorMessage = handleApiError(error);
      setError(errorMessage || t('errors.loadFailed') || 'Failed to load submissions. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await formsAPI.deleteSubmission(id);
      logger.info('Submission deleted successfully', { submissionId: id });
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      logger.error('Failed to delete submission', error instanceof Error ? error : new Error(String(error)));
      const errorMessage = handleApiError(error);
      setError(errorMessage || 'Failed to delete submission. Please try again.');
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


