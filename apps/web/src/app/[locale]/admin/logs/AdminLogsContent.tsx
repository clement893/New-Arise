'use client';

import { useEffect, useState } from 'react';
import { PageHeader, PageContainer } from '@/components/layout';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/error-utils';
import { Button, Card, Badge, Alert, Input, Loading, DataTable, Select } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';

interface AuditLog {
  id: number;
  user_id: number | null;
  event_type: string;
  severity: string;
  message: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export default function AdminLogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [eventTypeFilter, severityFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (eventTypeFilter) params.append('event_type', eventTypeFilter);
      if (severityFilter) params.append('severity', severityFilter);
      params.append('limit', '100');

      const response = await apiClient.get(`/v1/audit-trail/audit-trail?${params.toString()}`);
      const data = (response as any).data?.data || (response as any).data || response.data;
      
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (data?.results) {
        setLogs(data.results);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des logs'));
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user_id && String(log.user_id).includes(searchTerm))
  );

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Date/Heure',
      render: (_value, log) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(log.timestamp).toLocaleString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Sévérité',
      render: (_value, log) => (
        <Badge variant={getSeverityBadgeVariant(log.severity)}>
          {log.severity}
        </Badge>
      ),
    },
    {
      key: 'event_type',
      label: 'Type',
      render: (_value, log) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {log.event_type}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (_value, log) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {log.message}
        </span>
      ),
    },
    {
      key: 'user_id',
      label: 'Utilisateur',
      render: (_value, log) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {log.user_id ? `ID: ${log.user_id}` : 'Système'}
        </span>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (_value, log) => (
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {log.ip_address || '-'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Logs système" 
        description="Consulter les logs système et les activités"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Administration', href: '/admin' },
          { label: 'Logs' }
        ]} 
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les types' },
              { value: 'login', label: 'Login' },
              { value: 'logout', label: 'Logout' },
              { value: 'create', label: 'Création' },
              { value: 'update', label: 'Modification' },
              { value: 'delete', label: 'Suppression' },
            ]}
            placeholder="Type d'événement"
          />
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: '', label: 'Toutes les sévérités' },
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
              { value: 'critical', label: 'Critical' },
            ]}
            placeholder="Sévérité"
          />
          <Button onClick={loadLogs} variant="outline">
            Actualiser
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
              data={filteredLogs as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              emptyMessage="Aucun log trouvé"
            />
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

