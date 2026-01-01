'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, Button, Container, Alert, Tabs, TabList, Tab, TabPanels, TabPanel, Modal } from '@/components/ui';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/errors';
import { 
  Search, 
  Eye, 
  Loader2, 
  ClipboardList, 
  CheckCircle, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Settings,
  FileText,
  Calculator,
  Save,
  X
} from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';
import { wellnessQuestions } from '@/data/wellnessQuestionsReal';
import { tkiModes, tkiQuestions, type TKIQuestion } from '@/data/tkiQuestions';
import { feedback360Questions, feedback360Capabilities, type Feedback360Question } from '@/data/feedback360Questions';

type TabType = 'assessments' | 'questions' | 'rules';

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
  const [activeTab, setActiveTab] = useState<TabType>('assessments');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Questions management
  const [selectedTestType, setSelectedTestType] = useState<string>('WELLNESS');
  const [questionEditModalOpen, setQuestionEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  // Rules management
  const [selectedRuleType, setSelectedRuleType] = useState<string>('WELLNESS');
  const [ruleEditModalOpen, setRuleEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [activeTab]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Call admin endpoint when available
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

  const getQuestionsForType = (type: string) => {
    switch (type) {
      case 'WELLNESS':
        return wellnessQuestions;
      case 'TKI':
        return tkiQuestions;
      case 'THREE_SIXTY_SELF':
      case 'THREE_SIXTY_EVALUATOR':
        return feedback360Questions;
      default:
        return [];
    }
  };

  const getRulesForType = (type: string) => {
    // Rules are defined in backend/app/services/assessment_scoring.py
    // For now, return mock data structure
    switch (type) {
      case 'WELLNESS':
        return {
          pillars: [
            { name: 'avoidance_of_risky_substances', questions: ['wellness_q1', 'wellness_q2', 'wellness_q3', 'wellness_q4', 'wellness_q5'], maxScore: 25 },
            { name: 'movement', questions: ['wellness_q6', 'wellness_q7', 'wellness_q8', 'wellness_q9', 'wellness_q10'], maxScore: 25 },
            { name: 'nutrition', questions: ['wellness_q11', 'wellness_q12', 'wellness_q13', 'wellness_q14', 'wellness_q15'], maxScore: 25 },
            { name: 'sleep', questions: ['wellness_q16', 'wellness_q17', 'wellness_q18', 'wellness_q19', 'wellness_q20'], maxScore: 25 },
            { name: 'social_connection', questions: ['wellness_q21', 'wellness_q22', 'wellness_q23', 'wellness_q24', 'wellness_q25'], maxScore: 25 },
            { name: 'stress_management', questions: ['wellness_q26', 'wellness_q27', 'wellness_q28', 'wellness_q29', 'wellness_q30'], maxScore: 25 },
          ],
          maxTotalScore: 150,
          scale: { min: 1, max: 5 }
        };
      case 'TKI':
        return {
          modes: ['competing', 'collaborating', 'compromising', 'avoiding', 'accommodating'],
          questionsPerMode: 6,
          totalQuestions: 30
        };
      case 'THREE_SIXTY_SELF':
      case 'THREE_SIXTY_EVALUATOR':
        return {
          capabilities: [
            { name: 'communication', questions: ['360_q1', '360_q2', '360_q3', '360_q4', '360_q5'], maxScore: 25 },
            { name: 'team_culture', questions: ['360_q6', '360_q7', '360_q8', '360_q9', '360_q10'], maxScore: 25 },
            { name: 'leadership_style', questions: ['360_q11', '360_q12', '360_q13', '360_q14', '360_q15'], maxScore: 25 },
            { name: 'change_management', questions: ['360_q16', '360_q17', '360_q18', '360_q19', '360_q20'], maxScore: 25 },
            { name: 'problem_solving', questions: ['360_q21', '360_q22', '360_q23', '360_q24', '360_q25'], maxScore: 25 },
            { name: 'stress_management', questions: ['360_q26', '360_q27', '360_q28', '360_q29', '360_q30'], maxScore: 25 },
          ],
          maxTotalScore: 150,
          scale: { min: 1, max: 5 }
        };
      default:
        return null;
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setQuestionEditModalOpen(true);
  };

  const handleSaveQuestion = () => {
    // TODO: Implement save logic when backend API is available
    setQuestionEditModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setRuleEditModalOpen(true);
  };

  const handleSaveRule = () => {
    // TODO: Implement save logic when backend API is available
    setRuleEditModalOpen(false);
    setEditingRule(null);
  };

  const renderAssessmentsTab = () => (
    <>
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
                              // View assessment details
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
    </>
  );

  const renderQuestionsTab = () => {
    const questions = getQuestionsForType(selectedTestType);
    
    return (
      <>
        {/* Test Type Selector */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de test
              </label>
              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full max-w-md"
              >
                {Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingQuestion({ id: '', text: '', pillar: '' });
                setQuestionEditModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter une question
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        <Card>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                Aucune question trouvée
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                Les questions pour ce type de test ne sont pas encore configurées.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingQuestion({ id: '', text: '', pillar: '' });
                  setQuestionEditModalOpen(true);
                }}
              >
                <Plus size={20} className="mr-2" />
                Ajouter la première question
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {selectedTestType === 'WELLNESS' && wellnessQuestions.map((question, index) => (
                <div key={question.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          {question.id}
                        </span>
                        <Badge variant="default">{question.pillar}</Badge>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">
                        {question.question}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditQuestion(question)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedTestType === 'TKI' && tkiQuestions.map((question, index) => (
                <div key={question.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          Q{question.number}
                        </span>
                        <Badge variant="default" className="mr-2 capitalize">{question.modeA}</Badge>
                        <Badge variant="default" className="capitalize">{question.modeB}</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-900 dark:text-gray-100">
                          <strong>A:</strong> {question.optionA}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                          <strong>B:</strong> {question.optionB}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditQuestion(question)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {(selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR') && 
                feedback360Questions.map((question, index) => (
                  <div key={question.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Q{question.number}
                          </span>
                          <Badge variant="default">
                            {feedback360Capabilities.find(c => c.id === question.capability)?.title || question.capability}
                          </Badge>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100">
                          {question.text}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditQuestion(question)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </Card>

        {/* Question Edit Modal */}
        <Modal
          isOpen={questionEditModalOpen}
          onClose={() => {
            setQuestionEditModalOpen(false);
            setEditingQuestion(null);
          }}
          title={editingQuestion?.id ? 'Modifier la question' : 'Ajouter une question'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID de la question
              </label>
              <Input
                value={editingQuestion?.id || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, id: e.target.value })}
                placeholder="ex: wellness_q1"
                disabled={!!editingQuestion?.id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texte de la question
              </label>
              <textarea
                value={editingQuestion?.text || editingQuestion?.question || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                rows={4}
                placeholder="Entrez le texte de la question..."
              />
            </div>
            {selectedTestType === 'WELLNESS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilier
                </label>
                <Input
                  value={editingQuestion?.pillar || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, pillar: e.target.value })}
                  placeholder="ex: Movement"
                />
              </div>
            )}
            {selectedTestType === 'TKI' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Option A
                  </label>
                  <textarea
                    value={editingQuestion?.optionA || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                    rows={3}
                    placeholder="Texte de l'option A..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mode A
                  </label>
                  <select
                    value={editingQuestion?.modeA || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, modeA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                  >
                    <option value="">Sélectionner un mode</option>
                    {tkiModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Option B
                  </label>
                  <textarea
                    value={editingQuestion?.optionB || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionB: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                    rows={3}
                    placeholder="Texte de l'option B..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mode B
                  </label>
                  <select
                    value={editingQuestion?.modeB || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, modeB: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                  >
                    <option value="">Sélectionner un mode</option>
                    {tkiModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.title}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {(selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacité
                </label>
                <select
                  value={editingQuestion?.capability || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, capability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                >
                  <option value="">Sélectionner une capacité</option>
                  {feedback360Capabilities.map((cap) => (
                    <option key={cap.id} value={cap.id}>
                      {cap.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setQuestionEditModalOpen(false);
                  setEditingQuestion(null);
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveQuestion}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  const renderRulesTab = () => {
    const rules = getRulesForType(selectedRuleType);
    
    return (
      <>
        {/* Test Type Selector */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de test
              </label>
              <select
                value={selectedRuleType}
                onChange={(e) => setSelectedRuleType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full max-w-md"
              >
                {Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Rules Display */}
        <Card>
          {!rules ? (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                Règles non disponibles
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Les règles de calcul pour ce type de test ne sont pas encore configurées.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wellness Rules */}
              {selectedRuleType === 'WELLNESS' && rules.pillars && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Configuration générale
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Score maximum total:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{rules.maxTotalScore}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Échelle:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                          {rules.scale.min} - {rules.scale.max}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Règles par pilier
                    </h3>
                    <div className="space-y-4">
                      {rules.pillars.map((pillar: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                {pillar.name.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Score maximum: {pillar.maxScore}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRule(pillar)}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Questions associées:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {pillar.questions.map((qId: string) => (
                                <Badge key={qId} variant="default">{qId}</Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 360 Rules */}
              {(selectedRuleType === 'THREE_SIXTY_SELF' || selectedRuleType === 'THREE_SIXTY_EVALUATOR') && rules.capabilities && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Configuration générale
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Score maximum total:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{rules.maxTotalScore}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Échelle:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                          {rules.scale.min} - {rules.scale.max}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Règles par capacité
                    </h3>
                    <div className="space-y-4">
                      {rules.capabilities.map((capability: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                {capability.name.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Score maximum: {capability.maxScore}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRule(capability)}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Questions associées:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {capability.questions.map((qId: string) => (
                                <Badge key={qId} variant="default">{qId}</Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TKI Rules */}
              {selectedRuleType === 'TKI' && rules.modes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total de questions:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{rules.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Questions par mode:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{rules.questionsPerMode}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rules.modes.map((mode: string) => (
                        <Badge key={mode} variant="default" className="capitalize">{mode}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Rule Edit Modal */}
        <Modal
          isOpen={ruleEditModalOpen}
          onClose={() => {
            setRuleEditModalOpen(false);
            setEditingRule(null);
          }}
          title="Modifier la règle de calcul"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <Input
                value={editingRule?.name || ''}
                onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score maximum
              </label>
              <Input
                type="number"
                value={editingRule?.maxScore || ''}
                onChange={(e) => setEditingRule({ ...editingRule, maxScore: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Questions associées (IDs séparés par des virgules)
              </label>
              <Input
                value={editingRule?.questions?.join(', ') || ''}
                onChange={(e) => setEditingRule({ ...editingRule, questions: e.target.value.split(',').map(q => q.trim()) })}
                placeholder="ex: wellness_q1, wellness_q2, wellness_q3"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRuleEditModalOpen(false);
                  setEditingRule(null);
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveRule}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les tests, questions et règles de calcul des réponses
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs defaultTab={activeTab} onChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <TabList className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <Tab value="assessments" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Tests
          </Tab>
          <Tab value="questions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Questions
          </Tab>
          <Tab value="rules" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Règles de calcul
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="assessments">
            {renderAssessmentsTab()}
          </TabPanel>

          <TabPanel value="questions">
            {renderQuestionsTab()}
          </TabPanel>

          <TabPanel value="rules">
            {renderRulesTab()}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
