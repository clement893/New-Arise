'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, Container, Button, Grid } from '@/components/ui';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Input from '@/components/ui/Input';

interface Coachee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  assessmentsCompleted: number;
  lastSession?: string;
  nextSession?: string;
}

// Mock data - to be replaced with API calls
const mockCoachees: Coachee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    status: 'active',
    joinedDate: '2024-01-15',
    assessmentsCompleted: 3,
    lastSession: '2024-12-20',
    nextSession: '2025-01-10',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    joinedDate: '2024-02-20',
    assessmentsCompleted: 2,
    lastSession: '2024-12-18',
    nextSession: '2025-01-08',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 234 567 8901',
    status: 'pending',
    joinedDate: '2024-12-01',
    assessmentsCompleted: 0,
  },
];

export default function CoacheePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [coachees] = useState<Coachee[]>(mockCoachees);

  // Filter coachees based on search and status
  const filteredCoachees = coachees.filter(coachee => {
    const matchesSearch = 
      coachee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coachee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || coachee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coachees.length,
    active: coachees.filter(c => c.status === 'active').length,
    pending: coachees.filter(c => c.status === 'pending').length,
    totalAssessments: coachees.reduce((sum, c) => sum + c.assessmentsCompleted, 0),
  };

  const getStatusBadge = (status: Coachee['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewDetails = (coacheeId: number) => {
    router.push(`/dashboard/coach/coachee/${coacheeId}`);
  };

  const handleAddCoachee = () => {
    // TODO: Implement add coachee modal or page
    console.log('Add new coachee');
  };

  return (
    <>
      <PageHeader
        title="Mes Coachees"
        description="Gérez vos coachees, suivez leurs progrès et planifiez vos sessions de coaching."
      />

      <Container className="py-8">
        {/* Stats Cards */}
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal" className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Coachees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-full flex items-center justify-center">
                <Users className="text-arise-deep-teal" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actifs</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assessments</p>
                <p className="text-3xl font-bold text-arise-teal">{stats.totalAssessments}</p>
              </div>
              <div className="w-12 h-12 bg-arise-teal/10 rounded-full flex items-center justify-center">
                <FileText className="text-arise-teal" size={24} />
              </div>
            </div>
          </Card>
        </Grid>

        {/* Actions Bar */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Rechercher un coachee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="pending">En attente</option>
              </select>

              <Button
                variant="primary"
                onClick={handleAddCoachee}
                className="flex items-center gap-2"
              >
                <UserPlus size={20} />
                Ajouter un coachee
              </Button>
            </div>
          </div>
        </Card>

        {/* Coachees List */}
        {filteredCoachees.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun coachee trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedStatus !== 'all'
                ? 'Aucun coachee ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier coachee.'}
            </p>
            {!searchQuery && selectedStatus === 'all' && (
              <Button variant="primary" onClick={handleAddCoachee}>
                <UserPlus className="mr-2" size={20} />
                Ajouter un coachee
              </Button>
            )}
          </Card>
        ) : (
          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
            {filteredCoachees.map((coachee) => (
              <Card key={coachee.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {coachee.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Mail size={16} />
                      <span>{coachee.email}</span>
                    </div>
                    {coachee.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} />
                        <span>{coachee.phone}</span>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(coachee.status)}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assessments complétés:</span>
                    <span className="font-semibold text-gray-900">
                      {coachee.assessmentsCompleted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membre depuis:</span>
                    <span className="text-gray-900">
                      {new Date(coachee.joinedDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {coachee.lastSession && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière session:</span>
                      <span className="text-gray-900">
                        {new Date(coachee.lastSession).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {coachee.nextSession && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prochaine session:</span>
                      <span className="font-semibold text-arise-deep-teal">
                        {new Date(coachee.nextSession).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(coachee.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Voir détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center text-red-600 hover:text-red-700 hover:border-red-300"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
