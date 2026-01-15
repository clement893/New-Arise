'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PageContainer } from '@/components/layout';
import { getErrorMessage } from '@/lib/errors';
import { Button, Card, Badge, Alert, Input, Loading, Modal, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { Edit2, Trash2, Eye, Plus, FileText } from 'lucide-react';
import { postsAPI, type BlogPost } from '@/lib/api/posts';
import { logger } from '@/lib/logger';

export default function AdminArticlesContent() {
  const router = useRouter();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const articlesData = await postsAPI.list({ limit: 100 });
      logger.debug('[AdminArticles] Loaded articles', { count: articlesData.length });
      setArticles(articlesData);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error loading articles');
      logger.error('[AdminArticles] Error loading articles', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;

    try {
      setError(null);
      await postsAPI.delete(selectedArticle.id);
      logger.info('[AdminArticles] Article deleted', { id: selectedArticle.id, slug: selectedArticle.slug });
      setArticles(articles.filter((a) => a.id !== selectedArticle.id));
      setDeleteModalOpen(false);
      setSelectedArticle(null);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Error deleting article');
      logger.error('[AdminArticles] Error deleting article', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    }
  };

  const handleView = (article: BlogPost) => {
    router.push(`/blog/${article.slug}`);
  };

  const handleEdit = (article: BlogPost) => {
    router.push(`/content/posts/${article.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/content/posts');
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (_value, article) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{article.title}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (_value, article) => (
        <span className="text-sm text-muted-foreground font-mono">/{article.slug}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value, article) => (
        <Badge variant={getStatusBadgeVariant(article.status)}>
          {article.status === 'published' ? 'Published' : article.status === 'draft' ? 'Draft' : 'Archived'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (_value, article) => (
        <span className="text-sm text-muted-foreground">
          {new Date(article.created_at).toLocaleDateString('en-US')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, article) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(article)}
            aria-label="View article"
            title="View article"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(article)}
            aria-label="Edit article"
            title="Edit article"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedArticle(article);
              setDeleteModalOpen(true);
            }}
            aria-label="Delete article"
            title="Delete article"
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
        title="Article Management"
        description="Manage site blog articles"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Administration', href: '/admin' },
          { label: 'Articles' },
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
            placeholder="Search for an article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button onClick={handleCreate} variant="primary" className="flex flex-row items-center gap-2">
            <Plus className="w-4 h-4" />
            Create an article
          </Button>
          <Button onClick={loadArticles} variant="outline">
            Refresh
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
              data={filteredArticles as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              emptyMessage="No article found"
            />
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedArticle(null);
        }}
        title="Delete article"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete the article <strong>{selectedArticle?.title}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action is irreversible.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedArticle(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
