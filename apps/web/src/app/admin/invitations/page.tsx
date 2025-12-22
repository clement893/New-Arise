'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getErrorMessage, getErrorDetail } from '@/lib/error-utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Invitation {
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
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvitationEmail, setNewInvitationEmail] = useState('');
  const [newInvitationRole, setNewInvitationRole] = useState('user');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'expired' | 'cancelled'>('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!user?.is_admin) {
      router.push('/dashboard');
      return;
    }

    loadInvitations();
  }, [isAuthenticated, user, router]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with actual API call when backend is ready
      // const response = await invitationsAPI.list();
      // setInvitations(response.data);
      
      // Mock data for now
      setInvitations([
        {
          id: '1',
          email: 'nouveau@example.com',
          role: 'user',
          organization_id: '1',
          organization_name: 'Organisation Test',
          status: 'pending',
          invited_by: 'Admin User',
          invited_at: '2024-01-15T10:00:00Z',
          expires_at: '2024-01-22T10:00:00Z',
        },
        {
          id: '2',
          email: 'manager@example.com',
          role: 'manager',
          organization_id: '1',
          organization_name: 'Organisation Test',
          status: 'accepted',
          invited_by: 'Admin User',
          invited_at: '2024-01-10T10:00:00Z',
          expires_at: '2024-01-17T10:00:00Z',
        },
        {
          id: '3',
          email: 'expired@example.com',
          role: 'user',
          organization_id: '1',
          organization_name: 'Organisation Test',
          status: 'expired',
          invited_by: 'Admin User',
          invited_at: '2024-01-01T10:00:00Z',
          expires_at: '2024-01-08T10:00:00Z',
        },
      ]);
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors du chargement'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!newInvitationEmail.trim()) {
      setError('L\'email est requis');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await invitationsAPI.create({ email: newInvitationEmail, role: newInvitationRole });
      await loadInvitations();
      setShowCreateModal(false);
      setNewInvitationEmail('');
      setNewInvitationRole('user');
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors de la création'));
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await invitationsAPI.cancel(invitationId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void invitationId; // Will be used when API is implemented
      await loadInvitations();
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors de l\'annulation'));
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // TODO: Replace with actual API call
      // await invitationsAPI.resend(invitationId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void invitationId; // Will be used when API is implemented
      await loadInvitations();
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors de la réenvoi'));
    }
  };

  if (!isAuthenticated() || !user?.is_admin) {
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
      pending: 'En attente',
      accepted: 'Acceptée',
      expired: 'Expirée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Invitations</h1>
          <p className="text-gray-600">Gérer les invitations envoyées aux utilisateurs</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Inviter un utilisateur
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status === 'all' ? 'Total' : getStatusLabel(status)}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'pending', 'accepted', 'expired', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Tous' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {loading ? (
        <Card>
          <div className="py-12 text-center">
            <div className="text-gray-500">Chargement...</div>
          </div>
        </Card>
      ) : filteredInvitations.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {filterStatus === 'all' ? 'Aucune invitation' : `Aucune invitation ${getStatusLabel(filterStatus).toLowerCase()}`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invitée le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expire le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{invitation.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge>{invitation.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{invitation.organization_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadge(invitation.status)}>
                      {getStatusLabel(invitation.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(invitation.invited_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleResendInvitation(invitation.id)}>
                            Réenvoyer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invitation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Inviter un utilisateur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newInvitationEmail}
                    onChange={(e) => setNewInvitationEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={newInvitationRole}
                    onChange={(e) => setNewInvitationRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowCreateModal(false);
                    setNewInvitationEmail('');
                    setNewInvitationRole('user');
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateInvitation}>
                    Envoyer l'invitation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
