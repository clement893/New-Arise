'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Container, Alert, Modal, Checkbox } from '@/components/ui';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { usersAPI, type User } from '@/lib/api/users';
import { getErrorMessage } from '@/lib/errors';
import { Search, Trash2, Edit, Eye, Loader2, Shield } from 'lucide-react';
import { makeSuperAdmin, checkSuperAdminStatus } from '@/lib/api/admin';
import MotionDiv from '@/components/motion/MotionDiv';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false);
  const [makingSuperAdmin, setMakingSuperAdmin] = useState(false);
  const [userSuperAdminStatus, setUserSuperAdminStatus] = useState<Record<number, boolean>>({});
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.list(currentPage, pageSize, searchTerm || undefined, true);
      // Filter out inactive users on client side as well (double check)
      const activeUsers = response.items.filter(user => user.is_active !== false);
      setUsers(activeUsers);
      // Use backend total but adjust if we filtered out inactive users
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des utilisateurs'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      setError(null);
      setSuccessMessage(null);
      
      await usersAPI.delete(selectedUser.id);
      
      // Remove user immediately from the list
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      
      // Update total count
      setTotal((prev) => Math.max(0, prev - 1));
      
      // Show success message
      setSuccessMessage(`L'utilisateur ${selectedUser.email} a été supprimé avec succès.`);
      
      // Close modal
      setDeleteModalOpen(false);
      setSelectedUser(null);
      
      // Refresh the list to ensure consistency
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la suppression de l\'utilisateur'));
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email;
  };

  const getUserTypeLabel = (userType?: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      COACH: 'Coach',
      BUSINESS: 'Entreprise',
      INDIVIDUAL: 'Individuel',
    };
    return labels[userType || ''] || userType || 'N/A';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUserIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) return;

    try {
      setBulkDeleting(true);
      setError(null);
      setSuccessMessage(null);
      
      const userIdsArray = Array.from(selectedUserIds);
      const deletePromises = userIdsArray.map(userId => usersAPI.delete(userId));
      await Promise.all(deletePromises);
      
      // Remove users from the list
      setUsers(users.filter((u) => !selectedUserIds.has(u.id)));
      
      // Update total count
      setTotal((prev) => Math.max(0, prev - selectedUserIds.size));
      
      const count = selectedUserIds.size;
      setSuccessMessage(`${count} utilisateur${count > 1 ? 's' : ''} ${count > 1 ? 'ont été supprimés' : 'a été supprimé'} avec succès.`);
      
      // Clear selection
      setSelectedUserIds(new Set());
      setBulkDeleteModalOpen(false);
      
      // Refresh the list
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la suppression des utilisateurs'));
      setBulkDeleteModalOpen(false);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleMakeSuperAdmin = async () => {
    if (!selectedUser) return;

    try {
      setMakingSuperAdmin(true);
      setError(null);
      setSuccessMessage(null);
      
      await makeSuperAdmin(selectedUser.email);
      
      // Update user superadmin status
      setUserSuperAdminStatus(prev => ({
        ...prev,
        [selectedUser.id]: true
      }));
      
      setSuccessMessage(`L'utilisateur ${selectedUser.email} a été promu superadmin avec succès.`);
      
      // Close modal
      setSuperAdminModalOpen(false);
      setSelectedUser(null);
      
      // Refresh the list
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la promotion en superadmin'));
      setSuperAdminModalOpen(false);
    } finally {
      setMakingSuperAdmin(false);
    }
  };

  const checkUserSuperAdminStatus = useCallback(async (user: User) => {
    // Skip if already checked
    if (userSuperAdminStatus[user.id] !== undefined) {
      return;
    }
    
    try {
      const status = await checkSuperAdminStatus(user.email);
      setUserSuperAdminStatus(prev => ({
        ...prev,
        [user.id]: status.is_superadmin
      }));
    } catch (err) {
      console.error('Error checking superadmin status:', err);
    }
  }, [userSuperAdminStatus]);

  const allSelected = users.length > 0 && selectedUserIds.size === users.length;
  const someSelected = selectedUserIds.size > 0 && selectedUserIds.size < users.length;
  const selectedCount = selectedUserIds.size;

  return (
    <Container className="py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des Utilisateurs
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Gérez tous les utilisateurs de la plateforme
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {typeof error === 'string' ? error : String(error || 'An error occurred')}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedCount} utilisateur{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserIds(new Set())}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Tout désélectionner
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteModalOpen(true)}
                disabled={bulkDeleting}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ({selectedCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-arise-teal" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 w-12">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Nom
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Superadmin
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Créé le
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <MotionDiv
                      key={user.id}
                      variant="fade"
                      duration="fast"
                      delay={index * 0.05}
                    >
                      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedUserIds.has(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">
                            {getUserDisplayName(user)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={user.user_type === 'ADMIN' ? 'error' : 'default'}>
                            {getUserTypeLabel(user.user_type)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={user.is_active ? 'success' : 'default'}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            const isSuperAdmin = userSuperAdminStatus[user.id];
                            if (isSuperAdmin === undefined) {
                              // Check status on mount
                              checkUserSuperAdminStatus(user);
                              return (
                                <Badge variant="default" className="opacity-50">
                                  Vérification...
                                </Badge>
                              );
                            }
                            return (
                              <Badge variant={isSuperAdmin ? 'error' : 'default'}>
                                {isSuperAdmin ? 'Oui' : 'Non'}
                              </Badge>
                            );
                          })()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // View user details - can be implemented later
                              }}
                              title="Voir les détails"
                              className="min-w-[44px] min-h-[44px] p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Edit user - can be implemented later
                              }}
                              title="Modifier"
                              className="min-w-[44px] min-h-[44px] p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setSuperAdminModalOpen(true);
                              }}
                              title="Rendre superadmin"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 min-w-[44px] min-h-[44px] p-2"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteModalOpen(true);
                              }}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[44px] min-h-[44px] p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </MotionDiv>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, total)} sur {total} utilisateurs
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs sm:text-sm"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Confirmer la suppression"
        size="sm"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={deleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong className="text-gray-900 dark:text-gray-100">{selectedUser?.email}</strong> ?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ Cette action est irréversible. L'utilisateur sera immédiatement retiré de la liste.
          </p>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
        }}
        title="Confirmer la suppression en masse"
        size="sm"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setBulkDeleteModalOpen(false);
              }}
              disabled={bulkDeleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                `Supprimer ${selectedCount} utilisateur${selectedCount > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer <strong className="text-gray-900 dark:text-gray-100">{selectedCount} utilisateur{selectedCount > 1 ? 's' : ''}</strong> ?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ Cette action est irréversible. Les utilisateurs seront immédiatement retirés de la liste.
          </p>
        </div>
      </Modal>

      {/* Make SuperAdmin Confirmation Modal */}
      <Modal
        isOpen={superAdminModalOpen}
        onClose={() => {
          setSuperAdminModalOpen(false);
          setSelectedUser(null);
        }}
        title="Rendre superadmin"
        size="sm"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSuperAdminModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={makingSuperAdmin}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleMakeSuperAdmin}
              disabled={makingSuperAdmin}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {makingSuperAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Promotion...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Rendre superadmin
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir rendre <strong className="text-gray-900 dark:text-gray-100">{selectedUser?.email}</strong> superadmin ?
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              ⚡ Privilèges superadmin :
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Accès à toutes les fonctionnalités administratives</li>
              <li>Gestion des thèmes et configurations système</li>
              <li>Gestion des rôles et permissions</li>
              <li>Accès aux logs et statistiques avancées</li>
            </ul>
          </div>
        </div>
      </Modal>
    </Container>
  );
}