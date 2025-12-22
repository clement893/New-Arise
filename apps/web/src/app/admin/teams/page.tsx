'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getErrorMessage, getErrorDetail } from '@/lib/error-utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Team {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  organization_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  joined_at: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!user?.is_admin) {
      router.push('/dashboard');
      return;
    }

    loadTeams();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with actual API call when backend is ready
      // const response = await teamsAPI.list();
      // setTeams(response.data);
      
      // Mock data for now
      setTeams([
        { id: '1', name: 'Équipe Marketing', description: 'Gestion des campagnes marketing', member_count: 5, organization_id: '1', created_at: '2024-01-15' },
        { id: '2', name: 'Équipe Donateurs', description: 'Gestion de la relation donateurs', member_count: 3, organization_id: '1', created_at: '2024-01-20' },
        { id: '3', name: 'Équipe Technique', description: 'Développement et maintenance', member_count: 4, organization_id: '1', created_at: '2024-02-01' },
      ]);
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors du chargement'));
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await teamsAPI.getMembers(teamId);
      // setTeamMembers(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void teamId; // Will be used when API is implemented
      
      // Mock data
      setTeamMembers([
        { id: '1', user_id: '1', user_name: 'Jean Dupont', user_email: 'jean@example.com', role: 'Manager', joined_at: '2024-01-15' },
        { id: '2', user_id: '2', user_name: 'Marie Martin', user_email: 'marie@example.com', role: 'Member', joined_at: '2024-01-16' },
        { id: '3', user_id: '3', user_name: 'Pierre Durand', user_email: 'pierre@example.com', role: 'Member', joined_at: '2024-01-17' },
      ]);
    } catch (err: unknown) {
      console.error('Error loading team members:', err);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Le nom de l\'équipe est requis');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await teamsAPI.create({ name: newTeamName, description: newTeamDescription });
      await loadTeams();
      setShowCreateModal(false);
      setNewTeamName('');
      setNewTeamDescription('');
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Erreur lors de la création'));
    }
  };

  if (!isAuthenticated() || !user?.is_admin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Équipes</h1>
          <p className="text-gray-600">Administration des équipes</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Créer une équipe
        </Button>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Équipes</h2>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-gray-600 mt-1">{team.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {team.member_count} membre{team.member_count > 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
                      {selectedTeam.description && (
                        <p className="text-gray-600 mt-2">{selectedTeam.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50">
                        Supprimer
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Membres</h3>
                      <Button size="sm">Ajouter un membre</Button>
                    </div>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{member.user_name}</div>
                            <div className="text-sm text-gray-600">{member.user_email}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={member.role === 'Manager' ? 'success' : 'default'}>
                              {member.role}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              Retirer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="py-12 text-center">
                  <p className="text-gray-600">Sélectionnez une équipe pour voir ses détails</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer une nouvelle équipe</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ex: Équipe Marketing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="Description de l'équipe..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowCreateModal(false);
                    setNewTeamName('');
                    setNewTeamDescription('');
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTeam}>
                    Créer
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
