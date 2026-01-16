'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Container, Alert, Modal, Checkbox } from '@/components/ui';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { usersAPI, type User } from '@/lib/api/users';
import { getErrorMessage } from '@/lib/errors';
import { Search, Trash2, Edit, Eye, Loader2, Shield } from 'lucide-react';
import { makeSuperAdmin, checkSuperAdminStatus } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const t = useTranslations('dashboard.admin.users');
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    is_active: boolean;
  }>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
  });
  const pageSize = 20;
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll between top and bottom scrollbars
  useEffect(() => {
    const topScroll = topScrollRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (!topScroll || !bottomScroll) return;

    const handleTopScroll = () => {
      if (bottomScroll.scrollLeft !== topScroll.scrollLeft) {
        bottomScroll.scrollLeft = topScroll.scrollLeft;
      }
    };

    const handleBottomScroll = () => {
      if (topScroll.scrollLeft !== bottomScroll.scrollLeft) {
        topScroll.scrollLeft = bottomScroll.scrollLeft;
      }
    };

    topScroll.addEventListener('scroll', handleTopScroll);
    bottomScroll.addEventListener('scroll', handleBottomScroll);

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll);
      bottomScroll.removeEventListener('scroll', handleBottomScroll);
    };
  }, []);

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
      setError(getErrorMessage(err, t('errors.loadFailed')));
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
      setSuccessMessage(t('deleteSuccess', { email: selectedUser.email }));
      
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
      setError(getErrorMessage(err, t('errors.deleteFailed')));
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
    return '-';
  };

  const getUserTypeLabel = (userType?: string) => {
    const labels: Record<string, string> = {
      ADMIN: t('types.admin'),
      COACH: t('types.coach'),
      BUSINESS: t('types.business'),
      INDIVIDUAL: t('types.individual'),
    };
    return labels[userType || ''] || userType || t('types.na');
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
      setSuccessMessage(t('bulkDeleteSuccess', { count }));
      
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
      setError(getErrorMessage(err, t('errors.bulkDeleteFailed')));
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
      
      setSuccessMessage(t('superAdminSuccess', { email: selectedUser.email }));
      
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
      setError(getErrorMessage(err, t('errors.superAdminFailed')));
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

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      is_active: user.is_active ?? true,
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setEditingUser(true);
      setError(null);
      setSuccessMessage(null);
      
      await usersAPI.update(selectedUser.id, {
        email: editFormData.email,
        first_name: editFormData.first_name || undefined,
        last_name: editFormData.last_name || undefined,
        password: editFormData.password || undefined,
        is_active: editFormData.is_active,
      });
      
      setSuccessMessage(t('updateSuccess', { email: editFormData.email }));
      
      // Close modal
      setEditModalOpen(false);
      setSelectedUser(null);
      
      // Refresh the list
      await fetchUsers();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(getErrorMessage(err, t('errors.updateFailed')));
    } finally {
      setEditingUser(false);
    }
  };

  const allSelected = users.length > 0 && selectedUserIds.size === users.length;
  const someSelected = selectedUserIds.size > 0 && selectedUserIds.size < users.length;
  const selectedCount = selectedUserIds.size;

  return (
    <Container className="py-4 sm:py-6 md:py-8" maxWidth="full" center={false}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-white">
          {t('description')}
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
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder={t('searchPlaceholder')}
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
                {t('selectedCount', { count: selectedCount })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserIds(new Set())}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                {t('deselectAll')}
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
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('deleteSelected', { count: selectedCount })}
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
              {searchTerm ? t('noUserFound') : t('noUsers')}
            </p>
          </div>
        ) : (
          <>
            {/* Top scrollbar */}
            <div 
              ref={topScrollRef}
              className="overflow-x-auto overflow-y-hidden h-4 mb-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="min-w-[1200px] h-1"></div>
            </div>
            
            {/* Table container */}
            <div ref={bottomScrollRef} className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1200px]">
                <colgroup>
                  <col className="w-10" />
                  <col className="min-w-[200px]" />
                  <col className="min-w-[150px]" />
                  <col className="min-w-[120px]" />
                  <col className="min-w-[120px]" />
                  <col className="min-w-[130px]" />
                  <col className="min-w-[120px]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-4 px-2 xl:px-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(node) => {
                          if (node) {
                            node.indeterminate = someSelected;
                          }
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer w-4 h-4 text-primary-600 dark:text-primary-400 border-border bg-background focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-0 rounded"
                        aria-label="Select all users"
                      />
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden xl:inline">{t('columns.email')}</span>
                      <span className="xl:hidden">Email</span>
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden xl:inline">{t('columns.name')}</span>
                      <span className="xl:hidden">Name</span>
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden lg:inline">{t('columns.type')}</span>
                      <span className="lg:hidden">Type</span>
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden lg:inline">{t('columns.status')}</span>
                      <span className="lg:hidden">Status</span>
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden 2xl:inline">{t('columns.superadmin')}</span>
                      <span className="2xl:hidden">Super</span>
                    </th>
                    <th className="text-left py-4 px-2 xl:px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="hidden lg:inline">{t('columns.created')}</span>
                      <span className="lg:hidden">Created</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <>
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 px-2 xl:px-4 align-top">
                            <Checkbox
                              checked={selectedUserIds.has(user.id)}
                              onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                              {user.email}
                            </div>
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                              {getUserDisplayName(user)}
                            </div>
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            <Badge variant={user.user_type === 'ADMIN' ? 'error' : 'default'}>
                              {getUserTypeLabel(user.user_type)}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            <Badge variant={user.is_active ? 'success' : 'default'}>
                              {user.is_active ? t('status.active') : t('status.inactive')}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            {(() => {
                              const isSuperAdmin = userSuperAdminStatus[user.id];
                              if (isSuperAdmin === undefined) {
                                // Check status on mount
                                checkUserSuperAdminStatus(user);
                                return (
                                  <Badge variant="default" className="opacity-50">
                                    {t('checking')}
                                  </Badge>
                                );
                              }
                              return (
                                <Badge variant={isSuperAdmin ? 'error' : 'default'}>
                                  {isSuperAdmin ? t('yes') : t('no')}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-2 xl:px-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-2 px-2 xl:px-4"></td>
                        <td colSpan={6} className="py-2 px-2 xl:px-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // View user details - can be implemented later
                              }}
                              title={t('actions.view')}
                              className="min-w-[44px] min-h-[44px] p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditModal(user)}
                              title={t('actions.edit')}
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
                              title={t('actions.makeSuperAdmin')}
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
                              title={t('actions.delete')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[44px] min-h-[44px] p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  {t('pagination.showing', {
                    from: (currentPage - 1) * pageSize + 1,
                    to: Math.min(currentPage * pageSize, total),
                    total
                  })}
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    {t('pagination.previous')}
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
                    {t('pagination.next')}
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
        title={t('deleteModal.title')}
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
              {t('deleteModal.cancel')}
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
                  {t('deleteModal.deleting')}
                </>
              ) : (
                t('deleteModal.delete')
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('deleteModal.message', { email: selectedUser?.email || '' })}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ {t('deleteModal.warning')}
          </p>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
        }}
        title={t('bulkDeleteModal.title')}
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
              {t('bulkDeleteModal.cancel')}
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
                  {t('bulkDeleteModal.deleting')}
                </>
              ) : (
                t('bulkDeleteModal.delete', { count: selectedCount })
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('bulkDeleteModal.message', { count: selectedCount })}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ {t('bulkDeleteModal.warning')}
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
        title={t('superAdminModal.title')}
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
              {t('superAdminModal.cancel')}
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
                  {t('superAdminModal.promoting')}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {t('superAdminModal.confirm')}
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('superAdminModal.message', { email: selectedUser?.email || '' })}
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              ⚡ {t('superAdminModal.privileges.title')}
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>{t('superAdminModal.privileges.feature1')}</li>
              <li>{t('superAdminModal.privileges.feature2')}</li>
              <li>{t('superAdminModal.privileges.feature3')}</li>
              <li>{t('superAdminModal.privileges.feature4')}</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        title={t('editModal.title')}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={editingUser}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {t('editModal.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateUser}
              disabled={editingUser}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {editingUser ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('editModal.saving')}
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('editModal.save')}
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('editModal.email')}
            </label>
            <Input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              placeholder={t('editModal.emailPlaceholder')}
              disabled={editingUser}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('editModal.firstName')}
            </label>
            <Input
              type="text"
              value={editFormData.first_name}
              onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
              placeholder={t('editModal.firstNamePlaceholder')}
              disabled={editingUser}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('editModal.lastName')}
            </label>
            <Input
              type="text"
              value={editFormData.last_name}
              onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
              placeholder={t('editModal.lastNamePlaceholder')}
              disabled={editingUser}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('editModal.password')}
            </label>
            <Input
              type="password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              placeholder={t('editModal.passwordPlaceholder')}
              disabled={editingUser}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('editModal.passwordHint')}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                disabled={editingUser}
                className="cursor-pointer"
              />
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                {t('editModal.isActive')}
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </Container>
  );
}