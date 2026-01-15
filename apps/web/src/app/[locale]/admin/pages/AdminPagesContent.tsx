'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader, PageContainer } from '@/components/layout';
import { getErrorMessage } from '@/lib/errors';
import { Button, Card, Badge, Alert, Input, Loading, Modal, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { Edit2, Trash2, Eye, Plus, FileText } from 'lucide-react';
import { pagesAPI, type Page } from '@/lib/api/pages';
import { logger } from '@/lib/logger';

export default function AdminPagesContent() {
  const t = useTranslations('admin.pages');
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const pagesData = await pagesAPI.list(0, 100);
      logger.debug('[AdminPages] Loaded pages', { count: pagesData.length });
      setPages(pagesData);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('errors.loadFailed'));
      logger.error('[AdminPages] Error loading pages', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;

    try {
      setError(null);
      await pagesAPI.delete(selectedPage.id);
      logger.info('[AdminPages] Page deleted', { id: selectedPage.id, slug: selectedPage.slug });
      setPages(pages.filter((p) => p.id !== selectedPage.id));
      setDeleteModalOpen(false);
      setSelectedPage(null);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('errors.deleteFailed'));
      logger.error('[AdminPages] Error deleting page', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    }
  };

  const handleView = (page: Page) => {
    router.push(`/pages/${page.slug}`);
  };

  const handleEdit = (page: Page) => {
    router.push(`/pages/${page.slug}/edit`);
  };

  const handleCreate = () => {
    router.push('/content/pages');
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: Column<Page>[] = [
    {
      key: 'title',
      label: t('columns.title'),
      render: (_value, page) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{page.title}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      label: t('columns.slug'),
      render: (_value, page) => (
        <span className="text-sm text-muted-foreground font-mono">/{page.slug}</span>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      render: (_value, page) => (
        <Badge variant={getStatusBadgeVariant(page.status)}>
          {page.status === 'published' ? t('status.published') : page.status === 'draft' ? t('status.draft') : t('status.archived')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: t('columns.created'),
      render: (_value, page) => (
        <span className="text-sm text-muted-foreground">
          {new Date(page.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('columns.actions'),
      render: (_value, page) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(page)}
            aria-label={t('actions.view')}
            title={t('actions.view')}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(page)}
            aria-label={t('actions.edit')}
            title={t('actions.edit')}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPage(page);
              setDeleteModalOpen(true);
            }}
            aria-label={t('actions.delete')}
            title={t('actions.delete')}
            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[
          { label: t('breadcrumbs.home'), href: '/' },
          { label: t('breadcrumbs.admin'), href: '/admin' },
          { label: t('breadcrumbs.pages') },
        ]}
      />

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button onClick={handleCreate} variant="primary" className="flex flex-row items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('createButton')}
          </Button>
          <Button onClick={loadPages} variant="outline">
            {t('refreshButton')}
          </Button>
        </div>

        {loading ? (
          <Card>
            <div className="py-12 text-center">
              <Loading />
            </div>
          </Card>
        ) : (
          <Card>
            <DataTable
              data={filteredPages as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              emptyMessage={t('emptyMessage')}
            />
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPage(null);
        }}
        title={t('deleteModal.title')}
      >
        <div className="space-y-4">
          <p className="text-foreground">
            {t('deleteModal.message', { title: selectedPage?.title ?? '' })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('deleteModal.warning')}
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedPage(null);
              }}
            >
              {t('deleteModal.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('deleteModal.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
