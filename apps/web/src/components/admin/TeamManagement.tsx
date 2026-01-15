/**
 * Team Management Component
 * Manages teams and team members
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Input, Select, Modal, Alert, Loading, Badge } from '@/components/ui';
import { teamsAPI, type Team, type TeamMember, type TeamCreate, type TeamUpdate, type TeamMemberAdd, type TeamMemberUpdate } from '@/lib/api/teams';
import { usersAPI } from '@/lib/api';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { Plus, Edit, Trash2, Users, Save } from 'lucide-react';

export interface TeamManagementProps {
  className?: string;
}

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

export default function TeamManagement({ className }: TeamManagementProps) {
  const t = useTranslations('admin.teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Team form state
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState<TeamCreate>({
    name: '',
    slug: '',
    description: '',
  });
  
  // Member management state
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  // Add member form state
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberForm, setMemberForm] = useState<TeamMemberAdd>({
    user_id: 0,
    role_id: 0,
  });
  
  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'team' | 'member'; id: number; teamId?: number } | null>(null);

  useEffect(() => {
    loadTeams();
    loadUsers();
    loadRoles();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamsAPI.list();
      // Handle ApiResponse wrapper: { data: T, success: boolean }
      const responseData = response.data || response;
      if (responseData && typeof responseData === 'object') {
        if ('teams' in responseData) {
          setTeams((responseData as { teams: Team[] }).teams);
        } else if (Array.isArray(responseData)) {
          setTeams(responseData);
        } else if ('items' in responseData && Array.isArray((responseData as { items?: unknown }).items)) {
          setTeams((responseData as { items: Team[] }).items);
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Handle 422 validation errors (settings field issue)
      if (errorMessage?.includes('422') || errorMessage?.includes('settings') || errorMessage?.includes('dictionary') || errorMessage?.includes('validation')) {
        setError(t('errors.validationError'));
      } else {
        setError(errorMessage || t('errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      // Handle paginated response
      if (response.data && typeof response.data === 'object') {
        if ('items' in response.data) {
          const items = (response.data as { items?: unknown }).items;
          if (Array.isArray(items)) {
            setUsers(items as User[]);
          }
        } else if (Array.isArray(response.data)) {
          setUsers(response.data as User[]);
        }
      }
    } catch (err) {
      logger.error('Error loading users', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiClient.get('/v1/rbac/roles?skip=0&limit=100');
      const responseData = response.data || response;
      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        if ('roles' in responseData) {
          setRoles((responseData as { roles: Role[] }).roles);
        }
      } else if (Array.isArray(responseData)) {
        setRoles(responseData as Role[]);
      }
    } catch (err) {
      logger.error('Error loading roles', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      setMembersLoading(true);
      const response = await teamsAPI.getTeamMembers(teamId);
      // Handle ApiResponse wrapper: { data: T, success: boolean }
      const responseData = response.data || response;
      if (responseData) {
        if (Array.isArray(responseData)) {
          setTeamMembers(responseData);
        } else if (typeof responseData === 'object' && 'items' in responseData && Array.isArray((responseData as { items?: unknown }).items)) {
          setTeamMembers((responseData as { items: TeamMember[] }).items);
        } else if (typeof responseData === 'object' && 'members' in responseData && Array.isArray((responseData as { members?: unknown }).members)) {
          setTeamMembers((responseData as { members: TeamMember[] }).members);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, t('errors.loadMembersFailed')));
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setTeamForm({ name: '', slug: '', description: '' });
    setTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      slug: team.slug,
      description: team.description || '',
    });
    setTeamModalOpen(true);
  };

  const handleSaveTeam = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Generate slug from name if not provided
      const slug = teamForm.slug || teamForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (editingTeam) {
        const updateData: TeamUpdate = {
          name: teamForm.name,
          description: teamForm.description || undefined,
        };
        await teamsAPI.updateTeam(editingTeam.id, updateData);
        setSuccess(t('success.teamUpdated'));
      } else {
        await teamsAPI.create({ ...teamForm, slug });
        setSuccess(t('success.teamCreated'));
      }
      
      setTeamModalOpen(false);
      await loadTeams();
    } catch (err) {
      setError(getErrorMessage(err, t('errors.saveFailed')));
    }
  };

  const handleDeleteTeam = async () => {
    if (!itemToDelete || itemToDelete.type !== 'team') return;
    
    try {
      setError(null);
      await teamsAPI.deleteTeam(itemToDelete.id);
      setSuccess(t('success.teamDeleted'));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      await loadTeams();
    } catch (err) {
      setError(getErrorMessage(err, t('errors.deleteFailed')));
    }
  };

  const handleViewMembers = async (team: Team) => {
    setSelectedTeam(team);
    await loadTeamMembers(team.id);
    setMembersModalOpen(true);
  };

  const handleAddMember = () => {
    if (!selectedTeam) return;
    setMemberForm({ user_id: 0, role_id: 0 });
    setAddMemberModalOpen(true);
  };

  const handleSaveMember = async () => {
    if (!selectedTeam || !memberForm.user_id || !memberForm.role_id) {
      setError(t('errors.selectUserAndRole'));
      return;
    }
    
    try {
      setError(null);
      await teamsAPI.addTeamMember(selectedTeam.id, memberForm);
      setSuccess(t('success.memberAdded'));
      setAddMemberModalOpen(false);
      await loadTeamMembers(selectedTeam.id);
    } catch (err) {
      setError(getErrorMessage(err, t('errors.addMemberFailed')));
    }
  };

  const handleUpdateMemberRole = async (member: TeamMember, roleId: number) => {
    if (!selectedTeam) return;
    
    try {
      setError(null);
      const updateData: TeamMemberUpdate = { role_id: roleId };
      await teamsAPI.updateTeamMember(selectedTeam.id, member.id, updateData);
      setSuccess(t('success.memberRoleUpdated'));
      await loadTeamMembers(selectedTeam.id);
    } catch (err) {
      setError(getErrorMessage(err, t('errors.updateRoleFailed')));
    }
  };

  const handleDeleteMember = async () => {
    if (!itemToDelete || itemToDelete.type !== 'member' || !itemToDelete.teamId) return;
    
    try {
      setError(null);
      await teamsAPI.removeTeamMember(itemToDelete.teamId, itemToDelete.id);
      setSuccess(t('success.memberRemoved'));
      setDeleteMemberModalOpen(false);
      setItemToDelete(null);
      if (selectedTeam) {
        await loadTeamMembers(selectedTeam.id);
      }
    } catch (err) {
      setError(getErrorMessage(err, t('errors.removeMemberFailed')));
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return `User #${userId}`;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email;
  };


  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('description')}
              </p>
            </div>
            <Button onClick={handleCreateTeam} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              {t('actions.createTeam')}
            </Button>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('empty.noTeams')}
              </p>
              <Button onClick={handleCreateTeam} variant="primary">
                {t('empty.createFirstTeam')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{team.name}</h3>
                        {team.is_active ? (
                          <Badge variant="success">{t('status.active')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('status.inactive')}</Badge>
                        )}
                      </div>
                      {team.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {team.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{t('info.slug')}: {team.slug}</span>
                        <span>{t('info.members')}: {team.members?.length || 0}</span>
                        {team.owner && (
                          <span>{t('info.owner')}: {getUserName(team.owner_id)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewMembers(team)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {t('actions.members')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {t('actions.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setItemToDelete({ type: 'team', id: team.id });
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Team Form Modal */}
      <Modal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        title={editingTeam ? t('modals.team.editTitle') : t('modals.team.createTitle')}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTeamModalOpen(false)}>
              {t('modals.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveTeam}>
              <Save className="w-4 h-4 mr-2" />
              {editingTeam ? t('modals.team.save') : t('modals.team.create')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('modals.team.nameLabel')}
            value={teamForm.name}
            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
            required
            placeholder={t('modals.team.namePlaceholder')}
          />
          <Input
            label={t('modals.team.slugLabel')}
            value={teamForm.slug}
            onChange={(e) => setTeamForm({ ...teamForm, slug: e.target.value })}
            placeholder={t('modals.team.slugPlaceholder')}
            helperText={t('modals.team.slugHelper')}
          />
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('modals.team.descriptionLabel')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={3}
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
              placeholder={t('modals.team.descriptionPlaceholder')}
            />
          </div>
        </div>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={t('modals.members.title', { teamName: selectedTeam?.name || '' })}
        size="lg"
        footer={
          <Button variant="primary" onClick={handleAddMember}>
            <Plus className="w-4 h-4 mr-2" />
            {t('modals.members.addButton')}
          </Button>
        }
      >
        {membersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loading />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('modals.members.empty')}
            </p>
            <Button onClick={handleAddMember} variant="primary">
              {t('modals.members.addFirst')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {member.user ? getUserName(member.user_id) : `User #${member.user_id}`}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {member.user?.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={member.role_id.toString()}
                    onChange={(e) => handleUpdateMemberRole(member, parseInt(e.target.value))}
                    className="w-48"
                    options={roles.map((role) => ({
                      label: role.name,
                      value: role.id.toString(),
                    }))}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setItemToDelete({ type: 'member', id: member.id, teamId: selectedTeam?.id });
                      setDeleteMemberModalOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title={t('modals.addMember.title')}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddMemberModalOpen(false)}>
              {t('modals.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveMember}>
              <Save className="w-4 h-4 mr-2" />
              {t('modals.addMember.add')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label={t('modals.addMember.userLabel')}
            value={memberForm.user_id.toString()}
            onChange={(e) => setMemberForm({ ...memberForm, user_id: parseInt(e.target.value) })}
            required
            placeholder={t('modals.addMember.userPlaceholder')}
            options={[
              { label: t('modals.addMember.userPlaceholder'), value: '0' },
              ...users.map((user) => ({
                label: `${getUserName(user.id)} (${user.email})`,
                value: user.id.toString(),
              })),
            ]}
          />
          <Select
            label={t('modals.addMember.roleLabel')}
            value={memberForm.role_id.toString()}
            onChange={(e) => setMemberForm({ ...memberForm, role_id: parseInt(e.target.value) })}
            required
            placeholder={t('modals.addMember.rolePlaceholder')}
            options={[
              { label: t('modals.addMember.rolePlaceholder'), value: '0' },
              ...roles.map((role) => ({
                label: role.name,
                value: role.id.toString(),
              })),
            ]}
          />
        </div>
      </Modal>

      {/* Delete Team Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={t('modals.deleteTeam.title')}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
              }}
            >
              {t('modals.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteTeam}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('modals.deleteTeam.delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          {t('modals.deleteTeam.message')}
        </p>
      </Modal>

      {/* Delete Member Confirmation */}
      <Modal
        isOpen={deleteMemberModalOpen}
        onClose={() => {
          setDeleteMemberModalOpen(false);
          setItemToDelete(null);
        }}
        title={t('modals.removeMember.title')}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteMemberModalOpen(false);
                setItemToDelete(null);
              }}
            >
              {t('modals.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteMember}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('modals.removeMember.remove')}
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          {t('modals.removeMember.message')}
        </p>
      </Modal>
    </div>
  );
}
