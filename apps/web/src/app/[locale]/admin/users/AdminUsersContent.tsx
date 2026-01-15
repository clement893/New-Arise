'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';
import UserRolesEditor from '@/components/admin/UserRolesEditor';
import UserPermissionsEditor from '@/components/admin/UserPermissionsEditor';
import RoleDefaultPermissionsEditor from '@/components/admin/RoleDefaultPermissionsEditor';
import { useUserRoles } from '@/hooks/useRBAC';

interface User extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
}

export default function AdminUsersContent() {
  const t = useTranslations('admin.users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { apiClient } = await import('@/lib/api');
      const response = await apiClient.get('/v1/users?page=1&page_size=100');
      
      // Backend returns paginated response: { items: [...], total: ..., page: ..., page_size: ... }
      interface PaginatedResponse<T> {
        data?: T | { items?: T[] };
      }
      const responseData = (response as PaginatedResponse<User[]>).data;
      let usersData: User[] = [];
      
      if (responseData && typeof responseData === 'object') {
        if ('items' in responseData) {
          const items = (responseData as { items?: unknown }).items;
          if (Array.isArray(items) && items.length > 0 && !Array.isArray(items[0])) {
            usersData = items as User[];
          }
        } else if (Array.isArray(responseData)) {
          usersData = responseData as User[];
        }
      }
      
      setUsers(usersData);
    } catch (err) {
      setError(getErrorMessage(err, t('errors.loadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.delete(`/v1/users/${selectedUser.id}`);

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setDeleteModalOpen(false);
      setSelectedUser(null);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err, t('errors.deleteFailed'));
      setError(errorMessage);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: 'email',
      label: t('columns.email'),
      sortable: true,
    },
    {
      key: 'name',
      label: t('columns.name'),
      sortable: true,
    },
    {
      key: 'is_active',
      label: t('columns.status'),
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'roles',
      label: t('columns.roles'),
      render: (_value, row) => {
        // This will be populated by UserRolesDisplay component
        return <UserRolesDisplay userId={parseInt(row.id)} />;
      },
    },
    {
      key: 'actions',
      label: t('columns.actions'),
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setRolesModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            {t('actions.roles')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setPermissionsModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            {t('actions.permissions')}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedUser(row);
              setDeleteModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            {t('actions.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Container className="py-8">
        <Loading />
      </Container>
    );
  }

  return (
    <Container className="py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 sm:p-6">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 w-full text-sm sm:text-base"
          />
        </div>

        <DataTable
          data={filteredUsers}
          columns={columns}
          pageSize={10}
        />
      </Card>

      {/* Role Default Permissions Section */}
      <div className="mb-6">
        <RoleDefaultPermissionsEditor
          onUpdate={() => {
            fetchUsers();
          }}
        />
      </div>

      {/* Roles Modal */}
      <Modal
        isOpen={rolesModalOpen}
        onClose={() => {
          setRolesModalOpen(false);
          setSelectedUser(null);
        }}
        title={t('rolesModal.title', { email: selectedUser?.email ?? '' })}
        size="lg"
      >
        {selectedUser && (
          <UserRolesEditor
            userId={parseInt(selectedUser.id)}
            onUpdate={() => {
              fetchUsers();
            }}
          />
        )}
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        title={t('permissionsModal.title', { email: selectedUser?.email ?? '' })}
        size="lg"
      >
        {selectedUser && (
          <UserPermissionsEditor
            userId={parseInt(selectedUser.id)}
            onUpdate={() => {
              fetchUsers();
            }}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title={t('deleteModal.title')}
      >
        <p className="mb-4">
          {t('deleteModal.message', { email: selectedUser?.email ?? '' })}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            {t('deleteModal.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto text-sm sm:text-base">
            {t('deleteModal.delete')}
          </Button>
        </div>
      </Modal>
    </Container>
  );
}

// Component to display user roles in table
function UserRolesDisplay({ userId }: { userId: number }) {
  const t = useTranslations('admin.users');
  const { roles, loading } = useUserRoles(userId);

  if (loading) {
    return <span className="text-muted-foreground">{t('roles.loading')}</span>;
  }

  if (roles.length === 0) {
    return <span className="text-muted-foreground">{t('roles.noRoles')}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.slice(0, 2).map((role) => (
        <Badge key={role.id} variant="default" className="text-xs">
          {role.name}
        </Badge>
      ))}
      {roles.length > 2 && (
        <Badge variant="default" className="text-xs">
          +{roles.length - 2}
        </Badge>
      )}
    </div>
  );
}
