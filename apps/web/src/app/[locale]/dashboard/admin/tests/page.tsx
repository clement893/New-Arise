'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, Button, Container, Alert } from '@/components/ui';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/errors';
import { Search, Eye, Loader2, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';

interface Assessment {
  id: number;
  user_id: number;
  user_email?: string;
  user_name?: string;
  assessment_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  answer_count: number;
  total_questions: number;
  score_summary?: {
    total_score?: number;
    percentage?: number;
    dominant_mode?: string;
  };
  created_at: string;
}

const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  MBTI: 'MBTI',
  TKI: 'TKI',
  WELLNESS: 'Wellness',
  THREE_SIXTY_SELF: '360° Feedback (Self)',
  THREE_SIXTY_EVALUATOR: '360° Feedback (Evaluator)',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'default' | 'warning' }> = {
  COMPLETED: { label: 'Terminé', variant: 'success' },
  IN_PROGRESS: { label: 'En cours', variant: 'warning' },
  NOT_STARTED: { label: 'Non commencé', variant: 'default' },
};

export default function AdminTestsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll show a message that this feature needs an admin endpoint
      // In the future, this could call an admin endpoint like /v1/admin/assessments
      setAssessments([]);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des tests'));
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = 
      !searchTerm ||
      assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ASSESSMENT_TYPE_LABELS[assessment.assessment_type]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || assessment.assessment_type === filterType;
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getProgressPercentage = (assessment: Assessment) => {
    if (assessment.total_questions === 0) return 0;
    return Math.round((assessment.answer_count / assessment.total_questions) * 100);
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualisez et gérez tous les tests et assessments de la plateforme
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Info Card */}
      <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Page de gestion des tests
            </h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              Cette page permet aux administrateurs de visualiser et gérer tous les tests et assessments de la plateforme.
              Pour activer cette fonctionnalité, un endpoint admin backend doit être créé pour lister tous les assessments.
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher par email utilisateur, nom ou type de test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
            >
              <option value="all">Tous les types</option>
              {Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Assessments List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-arise-teal" />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
              {assessments.length === 0 
                ? 'Aucun test trouvé' 
                : 'Aucun test ne correspond aux filtres'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {assessments.length === 0
                ? 'Les tests apparaîtront ici une fois qu\'un endpoint admin sera configuré.'
                : 'Essayez de modifier vos critères de recherche ou de filtrage.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Utilisateur
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Type de test
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Progression
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Score
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
                {filteredAssessments.map((assessment, index) => (
                  <MotionDiv
                    key={assessment.id}
                    variant="fade"
                    duration="fast"
                    delay={index * 0.05}
                  >
                    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {assessment.user_email || `User #${assessment.user_id}`}
                        </div>
                        {assessment.user_name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {assessment.user_name}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="default">
                          {ASSESSMENT_TYPE_LABELS[assessment.assessment_type] || assessment.assessment_type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={STATUS_LABELS[assessment.status]?.variant || 'default'}>
                          {STATUS_LABELS[assessment.status]?.label || assessment.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-arise-teal h-2 rounded-full transition-all"
                              style={{ width: `${getProgressPercentage(assessment)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                            {getProgressPercentage(assessment)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {assessment.answer_count} / {assessment.total_questions} questions
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {assessment.score_summary ? (
                          <div className="text-sm">
                            {assessment.score_summary.percentage !== undefined && (
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {assessment.score_summary.percentage.toFixed(0)}%
                              </span>
                            )}
                            {assessment.score_summary.dominant_mode && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {assessment.score_summary.dominant_mode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {assessment.started_at && (
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                              Début: {new Date(assessment.started_at).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                          {assessment.completed_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Fin: {new Date(assessment.completed_at).toLocaleDateString('fr-FR')}
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
                              // View assessment details - can be implemented later
                            }}
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
    </Container>
  );
}