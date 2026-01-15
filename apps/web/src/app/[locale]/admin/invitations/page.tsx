'use client';

// Force dynamic rendering to avoid static generation
// Note: generateStaticParams() cannot be used with 'use client'
// The dynamic exports are sufficient for Client Components
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { getErrorMessage, getErrorDetail } from '@/lib/errors';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import DataTable, { type Column } from '@/components/ui/DataTable';

interface Invitation extends Record<string, unknown> {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  organization_name: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  invited_at: string;
  expires_at: string;
}

export default function InvitationsPage() {
  const t = useTranslations('admin.invitations');
  const { isAuthenticated, user } = useAuthStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvitationEmail, setNewInvitationEmail] = useState('');
  const [newInvitationRole, setNewInvitationRole] = useState('user');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'expired' | 'cancelled'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // ProtectedSuperAdminRoute handles authentication and superadmin check
    // Just load invitations if authenticated
    if (mounted && isAuthenticated() && user) {
      loadInvitations();
    }
  }, [mounted, isAuthenticated, user]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError('');
      const { invitationsAPI } = await import('@/lib/api');
      const response = await invitationsAPI.list();
      
      if (response.data && response.data.invitations) {
        setInvitations(response.data.invitations.map((invitation: {
          id: string | number;
          email: string;
          role?: string;
          role_id?: number;
          team_id?: number;
          status: string;
          invited_by_id?: number;
          invited_by?: { id?: number; email?: string; name?: string } | null;
          expires_at: string;
          created_at: string;
          team?: { id?: number; name?: string } | null;
        }) => ({
          id: String(invitation.id),
          email: invitation.email,
          role: invitation.role || (invitation.role_id ? String(invitation.role_id) : 'user'),
          organization_id: invitation.team_id ? String(invitation.team_id) : '',
          organization_name: invitation.team?.name || 'Unknown Organization',
          status: invitation.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
          invited_by: invitation.invited_by?.email || invitation.invited_by_id ? String(invitation.invited_by_id) : 'Unknown',
          invited_at: invitation.created_at,
          expires_at: invitation.expires_at,
        })));
      } else {
        setInvitations([]);
      }
    } catch (err: unknown) {
      // If API returns 404 or endpoint doesn't exist yet, use empty array
      if (getErrorDetail(err)?.includes('404') || getErrorDetail(err)?.includes('not found')) {
        setInvitations([]);
      } else {
        setError(getErrorDetail(err) || getErrorMessage(err, 'Error loading invitations'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!newInvitationEmail.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const { invitationsAPI } = await import('@/lib/api');
      await invitationsAPI.create({
        email: newInvitationEmail,
        role: newInvitationRole,
      });
      await loadInvitations();
      setShowCreateModal(false);
      setNewInvitationEmail('');
      setNewInvitationRole('user');
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Error creating invitation'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm(t('deleteModal.message', { email: '' }))) {
      return;
    }

    try {
      setLoading(true);
      const { invitationsAPI } = await import('@/lib/api');
      await invitationsAPI.cancel(invitationId);
      await loadInvitations();
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Error canceling invitation'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setLoading(true);
      const { invitationsAPI } = await import('@/lib/api');
      await invitationsAPI.resend(invitationId);
      await loadInvitations();
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Error resending invitation'));
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  const filteredInvitations = filterStatus === 'all'
    ? invitations
    : invitations.filter(inv => inv.status === filterStatus);

  const statusCounts = {
    all: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    expired: invitations.filter(inv => inv.status === 'expired').length,
    cancelled: invitations.filter(inv => inv.status === 'cancelled').length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'default'> = {
      accepted: 'success',
      expired: 'error',
      cancelled: 'error',
      pending: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('status.pending'),
      accepted: t('status.accepted'),
      expired: t('status.expired'),
      cancelled: t('status.cancelled'),
    };
    return labels[status] || status;
  };

  const columns: Column<Invitation>[] = [
    {
      key: 'email',
      label: t('columns.email'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <div className="font-medium text-foreground">{invitation.email}</div>
      ),
    },
    {
      key: 'role',
      label: t('columns.role'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <Badge>{invitation.role}</Badge>
      ),
    },
    {
      key: 'organization_name',
      label: t('columns.organization'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <div className="text-sm text-muted-foreground">{invitation.organization_name}</div>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <Badge variant={getStatusBadge(invitation.status)}>
          {getStatusLabel(invitation.status)}
        </Badge>
      ),
    },
    {
      key: 'invited_at',
      label: t('columns.invitedAt'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <span className="text-sm text-muted-foreground">
          {new Date(invitation.invited_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'expires_at',
      label: t('columns.expiresAt'),
      sortable: true,
      render: (_value: unknown, invitation: Invitation) => (
        <span className="text-sm text-muted-foreground">
          {new Date(invitation.expires_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('columns.actions'),
      render: (_value: unknown, invitation: Invitation) => (
        <div className="flex flex-wrap gap-2">
          {invitation.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleResendInvitation(invitation.id)} className="text-xs sm:text-sm">
                {t('actions.resend')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelInvitation(invitation.id)}
                className="border-danger-500 text-danger-600 hover:bg-danger-50 text-xs sm:text-sm"
              >
                {t('actions.cancel')}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedSuperAdminRoute>
      <div className="py-4 sm:py-6 md:py-8 lg:py-12">
        <Container>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          {t('createButton')}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <div className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs sm:text-sm text-muted-foreground capitalize">{status === 'all' ? t('total') : getStatusLabel(status)}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {(['all', 'pending', 'accepted', 'expired', 'cancelled'] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status)}
            variant={filterStatus === status ? 'primary' : 'ghost'}
            size="sm"
          >
            {status === 'all' ? t('all') : getStatusLabel(status)}
          </Button>
        ))}
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card>
          <div className="py-12 text-center">
            <Loading />
          </div>
        </Card>
      ) : filteredInvitations.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {filterStatus === 'all' ? t('empty.noInvitations') : t('empty.noMatch', { status: getStatusLabel(filterStatus).toLowerCase() })}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            data={filteredInvitations}
            columns={columns}
            searchable={true}
            searchPlaceholder={t('searchPlaceholder')}
            filterable={false}
            sortable={true}
            pageSize={10}
            emptyMessage={t('emptyMessage')}
            loading={loading}
          />
        </Card>
      )}

      {/* Create Invitation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewInvitationEmail('');
          setNewInvitationRole('user');
        }}
        title={t('createModal.title')}
        size="md"
        footer={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewInvitationEmail('');
                setNewInvitationRole('user');
              }}
              className="flex-1 sm:flex-initial"
            >
              {t('createModal.cancel')}
            </Button>
            <Button 
              onClick={handleCreateInvitation}
              className="flex-1 sm:flex-initial"
            >
              {t('createModal.send')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Input
              label={t('createModal.emailLabel')}
              type="email"
              value={newInvitationEmail}
              onChange={(e) => setNewInvitationEmail(e.target.value)}
              placeholder={t('createModal.emailPlaceholder')}
              fullWidth
            />
          </div>
          <div>
            <Select
              label={t('createModal.roleLabel')}
              value={newInvitationRole}
              onChange={(e) => setNewInvitationRole(e.target.value)}
              fullWidth
              options={[
                { value: 'user', label: t('createModal.roles.user') },
                { value: 'manager', label: t('createModal.roles.manager') },
                { value: 'admin', label: t('createModal.roles.admin') },
              ]}
            />
          </div>
        </div>
      </Modal>
        </Container>
      </div>
    </ProtectedSuperAdminRoute>
  );
}
