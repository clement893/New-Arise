'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader, PageContainer } from '@/components/layout';
import { getErrorMessage } from '@/lib/errors';
import { Button, Card, Badge, Alert, Input, Loading, Modal, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import { Trash2, Upload, Image, File, Video, Music, FileText } from 'lucide-react';
import { mediaAPI, type Media } from '@/lib/api/media';
import { logger } from '@/lib/logger';

export default function AdminMediaContent() {
  const t = useTranslations('admin.media');
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const mediaData = await mediaAPI.list(0, 100);
      logger.debug('[AdminMedia] Loaded media files', { count: mediaData.length });
      setMediaFiles(mediaData);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('errors.loadFailed'));
      logger.error('[AdminMedia] Error loading media', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;

    try {
      setError(null);
      await mediaAPI.delete(selectedMedia.id);
      logger.info('[AdminMedia] Media file deleted', { id: selectedMedia.id, filename: selectedMedia.filename });
      setMediaFiles(mediaFiles.filter((m) => m.id !== selectedMedia.id));
      setDeleteModalOpen(false);
      setSelectedMedia(null);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('errors.deleteFailed'));
      logger.error('[AdminMedia] Error deleting media', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const uploadedMedia = await mediaAPI.upload(file, { is_public: false });
      logger.info('[AdminMedia] Media file uploaded', { id: uploadedMedia.id, filename: uploadedMedia.filename });
      setMediaFiles([uploadedMedia, ...mediaFiles]);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('errors.uploadFailed'));
      logger.error('[AdminMedia] Error uploading media', err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMediaIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-4 h-4" />;
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const filteredMedia = mediaFiles.filter((media) =>
    media.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.mime_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Media>[] = [
    {
      key: 'filename',
      label: t('columns.file'),
      render: (_value, media) => (
        <div className="flex items-center gap-2">
          {getMediaIcon(media.mime_type)}
          <span className="font-medium text-foreground">{media.filename}</span>
        </div>
      ),
    },
    {
      key: 'file_path',
      label: t('columns.path'),
      render: (_value, media) => (
        <span className="text-sm text-muted-foreground font-mono">{media.file_path}</span>
      ),
    },
    {
      key: 'file_size',
      label: t('columns.size'),
      render: (_value, media) => (
        <span className="text-sm text-muted-foreground">{formatFileSize(media.file_size)}</span>
      ),
    },
    {
      key: 'mime_type',
      label: t('columns.type'),
      render: (_value, media) => (
        <span className="text-sm text-muted-foreground">{media.mime_type || 'N/A'}</span>
      ),
    },
    {
      key: 'is_public',
      label: t('columns.visibility'),
      render: (_value, media) => (
        <Badge variant={media.is_public ? 'success' : 'default'}>
          {media.is_public ? t('visibility.public') : t('visibility.private')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: t('columns.created'),
      render: (_value, media) => (
        <span className="text-sm text-muted-foreground">
          {new Date(media.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('columns.actions'),
      render: (_value, media) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedMedia(media);
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
          { label: t('breadcrumbs.media') },
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
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            disabled={uploading}
            className="flex flex-row items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? t('uploading') : t('uploadButton')}
          </Button>
          <Button onClick={loadMedia} variant="outline">
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
              data={filteredMedia as unknown as Record<string, unknown>[]}
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
          setSelectedMedia(null);
        }}
        title={t('deleteModal.title')}
      >
        <div className="space-y-4">
          <p className="text-foreground">
            {t('deleteModal.message', { filename: selectedMedia?.filename ?? '' })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('deleteModal.warning')}
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedMedia(null);
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
