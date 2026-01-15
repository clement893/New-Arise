'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, Button, Container, Alert, Badge } from '@/components/ui';
import Input from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';
import { 
  Search, 
  Eye, 
  Loader2, 
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  Users
} from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';

interface OnboardingUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  onboarding_status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  onboarding_step?: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'default' | 'warning' | 'error' }> = {
  not_started: { label: 'Non commencé', variant: 'default' },
  in_progress: { label: 'En cours', variant: 'warning' },
  completed: { label: 'Terminé', variant: 'success' },
  skipped: { label: 'Ignoré', variant: 'error' },
};

// Management Onboarding Page - Manage user onboarding process
export default function ManagementOnboardingPage() {
  const [users, setUsers] = useState<OnboardingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOnboardingUsers();
  }, []);

  const fetchOnboardingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Call admin endpoint when available
      // const response = await onboardingAPI.list();
      // setUsers(response);
      setUsers([]);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des utilisateurs en onboarding'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      !searchTerm ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.onboarding_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getUserDisplayName = (user: OnboardingUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email;
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion de l'Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez le processus d'onboarding des utilisateurs
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {typeof error === 'string' ? error : String(error || 'An error occurred')}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-arise-teal" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
              {users.length === 0 
                ? 'No users in onboarding' 
                : 'No users match the filters'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {users.length === 0
                ? 'Users in onboarding will appear here once an admin endpoint is configured.'
                : 'Try modifying your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Step
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Dates
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <MotionDiv
                    key={user.id}
                    variant="fade"
                    duration="fast"
                    delay={index * 0.05}
                  >
                    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={STATUS_LABELS[user.onboarding_status]?.variant || 'default'}>
                          {STATUS_LABELS[user.onboarding_status]?.label || user.onboarding_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.onboarding_step || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {user.started_at && (
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                              Start: {new Date(user.started_at).toLocaleDateString('en-US')}
                            </div>
                          )}
                          {user.completed_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              End: {new Date(user.completed_at).toLocaleDateString('en-US')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // View user onboarding details
                            }}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.onboarding_status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Reset onboarding
                              }}
                              title="Réinitialiser l'onboarding"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </MotionDiv>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {users.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Non commencé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {users.filter(u => u.onboarding_status === 'not_started').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En cours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {users.filter(u => u.onboarding_status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Terminé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {users.filter(u => u.onboarding_status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-400" />
          </div>
        </Card>
      </div>
    </Container>
  );
}
