'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Container, Alert, Tabs, TabList, Tab, TabPanels, TabPanel, Modal } from '@/components/ui';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/errors';
import { 
  getMyAssessments, 
  Assessment as ApiAssessment,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  AssessmentQuestion,
  AssessmentQuestionCreate,
  AssessmentQuestionUpdate
} from '@/lib/api/assessments';
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
  FileText,
  Calculator,
  Save,
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';
import { feedback360Capabilities } from '@/data/feedback360Questions';

type TabType = 'assessments' | 'questions' | 'rules';

interface Assessment {
  id: number;
  user_id?: number;
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

interface Question extends AssessmentQuestion {
  text?: string;
  optionA?: string;
  optionB?: string;
  modeA?: string;
  modeB?: string;
}

interface ScoringRule {
  name: string;
  maxScore?: number;
  questions?: string[];
  [key: string]: unknown; // Allow additional properties
}

// Admin Assessment Management Page - Manage assessments, questions, and scoring rules
export default function AdminAssessmentManagementPage() {
  const t = useTranslations('admin.assessmentManagement');
  const [activeTab, setActiveTab] = useState<TabType>('assessments');

  // Helper functions for translated labels
  const getAssessmentTypeLabel = (type: string) => {
    return t(`assessments.types.${type}` as any) || type;
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    // Map uppercase status to lowercase translation keys
    const statusMap: Record<string, string> = {
      'COMPLETED': 'completed',
      'IN_PROGRESS': 'inProgress',
      'NOT_STARTED': 'notStarted',
    };
    const translationKey = statusMap[statusUpper] || statusUpper.toLowerCase();
    return t(`assessments.status.${translationKey}` as any) || status;
  };

  const getStatusVariant = (status: string): 'success' | 'default' | 'warning' => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'COMPLETED') return 'success';
    if (statusUpper === 'IN_PROGRESS') return 'warning';
    return 'default';
  };
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Questions management
  const [selectedTestType, setSelectedTestType] = useState<string>('WELLNESS');
  const [questionEditModalOpen, setQuestionEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // Rules management
  const [selectedRuleType, setSelectedRuleType] = useState<string>('WELLNESS');
  const [ruleEditModalOpen, setRuleEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);

  useEffect(() => {
    if (activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [activeTab]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use my-assessments endpoint (admin will see all assessments when admin endpoint is available)
      // In the future, we can create an admin endpoint: GET /v1/assessments/admin/all
      try {
        const apiAssessments = await getMyAssessments();
        
        // Map API assessments to local format
        const mappedAssessments: Assessment[] = apiAssessments.map((apiAssessment: ApiAssessment) => {
          // Convert status from backend format (lowercase) to frontend format (uppercase)
          let statusUpper = apiAssessment.status.toUpperCase();
          if (statusUpper === 'NOT_STARTED') statusUpper = 'NOT_STARTED';
          if (statusUpper === 'IN_PROGRESS') statusUpper = 'IN_PROGRESS';
          if (statusUpper === 'COMPLETED') statusUpper = 'COMPLETED';
          
          // Get score summary from assessment result if available
          let scoreSummary = undefined;
          if (apiAssessment.score_summary) {
            scoreSummary = apiAssessment.score_summary;
          }
          
          return {
            id: apiAssessment.id,
            user_id: apiAssessment.user_id || undefined,
            user_email: apiAssessment.user_email || undefined,
            user_name: apiAssessment.user_name || undefined,
            assessment_type: apiAssessment.assessment_type,
            status: statusUpper,
            started_at: apiAssessment.started_at || null,
            completed_at: apiAssessment.completed_at || null,
            answer_count: apiAssessment.answer_count || 0,
            total_questions: apiAssessment.total_questions || 0,
            score_summary: scoreSummary,
            created_at: apiAssessment.created_at,
          };
        });
        
        setAssessments(mappedAssessments);
      } catch (apiErr) {
        // If API call fails, try admin endpoint (if available in future)
        console.error('Failed to fetch assessments from my-assessments endpoint:', apiErr);
        // For now, just set empty array if API fails
        setAssessments([]);
      }
    } catch (err) {
      setError(getErrorMessage(err, t('assessments.errors.loadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
      const matchesSearch = 
      !searchTerm ||
      assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(`assessments.types.${assessment.assessment_type}` as any)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || assessment.assessment_type === filterType;
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getProgressPercentage = (assessment: Assessment) => {
    if (assessment.total_questions === 0) return 0;
    return Math.round((assessment.answer_count / assessment.total_questions) * 100);
  };

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      
      // Convert frontend type to backend format
      const backendType = selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR'
        ? '360_self'
        : selectedTestType.toLowerCase();
      
      const fetchedQuestions = await getQuestions(backendType);
      setQuestions(fetchedQuestions);
    } catch (err) {
      const errorMessage = getErrorMessage(err, t('questions.errors.loadFailed'));
      setQuestionsError(errorMessage);
      console.error('Error fetching questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const getQuestionsForType = (type: string): AssessmentQuestion[] => {
    // Return questions from state (loaded from API)
    if (type === selectedTestType) {
      return questions;
    }
    return [];
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

  const handleEditQuestion = (question: AssessmentQuestion) => {
    // Convert to Question format for editing
    const editQuestion: Question = {
      ...question,
      text: question.question,
      optionA: question.option_a,
      optionB: question.option_b,
      modeA: question.mode_a,
      modeB: question.mode_b,
    };
    setEditingQuestion(editQuestion);
    setQuestionEditModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      
      // Convert frontend type to backend format
      const backendType = selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR'
        ? '360_self'
        : selectedTestType.toLowerCase();
      
      if (editingQuestion.question_id && questions.find(q => q.question_id === editingQuestion.question_id)) {
        // Update existing question
        const updateData: AssessmentQuestionUpdate = {
          question: editingQuestion.text || editingQuestion.question,
          pillar: editingQuestion.pillar,
          number: editingQuestion.number,
          option_a: editingQuestion.optionA || editingQuestion.option_a,
          option_b: editingQuestion.optionB || editingQuestion.option_b,
          mode_a: editingQuestion.modeA || editingQuestion.mode_a,
          mode_b: editingQuestion.modeB || editingQuestion.mode_b,
          capability: editingQuestion.capability,
        };
        
        await updateQuestion(editingQuestion.question_id, updateData);
      } else {
        // Create new question
        if (!editingQuestion.question_id) {
          throw new Error('Question ID is required');
        }
        
        const createData: AssessmentQuestionCreate = {
          question_id: editingQuestion.question_id,
          assessment_type: backendType,
          question: editingQuestion.text || editingQuestion.question,
          pillar: editingQuestion.pillar,
          number: editingQuestion.number,
          option_a: editingQuestion.optionA || editingQuestion.option_a,
          option_b: editingQuestion.optionB || editingQuestion.option_b,
          mode_a: editingQuestion.modeA || editingQuestion.mode_a,
          mode_b: editingQuestion.modeB || editingQuestion.mode_b,
          capability: editingQuestion.capability,
        };
        
        await createQuestion(createData);
      }
      
      // Refresh questions list
      await fetchQuestions();
      
      setQuestionEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err, t('questions.errors.saveFailed'));
      setQuestionsError(errorMessage);
      console.error('Error saving question:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm(t('questions.deleteConfirm', { questionId }))) {
      return;
    }
    
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      
      await deleteQuestion(questionId);
      
      // Refresh questions list
      await fetchQuestions();
    } catch (err) {
      const errorMessage = getErrorMessage(err, t('questions.errors.deleteFailed'));
      setQuestionsError(errorMessage);
      console.error('Error deleting question:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleEditRule = (rule: ScoringRule) => {
    setEditingRule(rule);
    setRuleEditModalOpen(true);
  };

  const handleSaveRule = () => {
    // TODO: Implement save logic when backend API is available
    setRuleEditModalOpen(false);
    setEditingRule(null);
  };

  // Calculate statistics from backend data
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(a => 
    a.status === 'COMPLETED' || a.status === 'completed'
  ).length;
  const inProgressAssessments = assessments.filter(a => 
    a.status === 'IN_PROGRESS' || a.status === 'in_progress'
  ).length;
  
  // Calculate average score from completed assessments with scores
  // Need to fetch results from backend for each completed assessment to get percentage
  // For now, calculate from score_summary if available
  const completedWithScores = assessments.filter(a => {
    const isCompleted = a.status === 'COMPLETED' || a.status === 'completed';
    if (!isCompleted) return false;
    
    // Check if score_summary exists and has percentage
    if (a.score_summary?.percentage !== undefined) return true;
    return false;
  });
  
  const averageScore = completedWithScores.length > 0
    ? completedWithScores.reduce((sum, a) => {
        const percentage = a.score_summary?.percentage as number | string | { value: number } | undefined;
        // Handle different formats: number, string, or object with value
        let scoreValue = 0;
        if (typeof percentage === 'number') {
          scoreValue = percentage;
        } else if (typeof percentage === 'string') {
          scoreValue = parseFloat(percentage) || 0;
        } else if (percentage && typeof percentage === 'object' && 'value' in percentage) {
          scoreValue = typeof (percentage as { value: number }).value === 'number' ? (percentage as { value: number }).value : 0;
        }
        return sum + scoreValue;
      }, 0) / completedWithScores.length
    : 0;

  const renderAssessmentsTab = () => (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MotionDiv variant="slideUp" duration="normal" delay={0}>
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">{t('assessments.stats.total')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-900 dark:text-primary-100">{totalAssessments}</p>
              </div>
              <div className="p-2 sm:p-3 bg-primary-200 dark:bg-primary-800 rounded-full">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700 dark:text-primary-300" />
              </div>
            </div>
          </Card>
        </MotionDiv>

        <MotionDiv variant="slideUp" duration="normal" delay={100}>
          <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-success-600 dark:text-success-400 mb-1">{t('assessments.stats.completed')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-success-900 dark:text-success-100">{completedAssessments}</p>
                {totalAssessments > 0 && (
                  <p className="text-xs text-success-700 dark:text-success-300 mt-1">
                    {Math.round((completedAssessments / totalAssessments) * 100)}%
                  </p>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-success-200 dark:bg-success-800 rounded-full">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-700 dark:text-success-300" />
              </div>
            </div>
          </Card>
        </MotionDiv>

        <MotionDiv variant="slideUp" duration="normal" delay={200}>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">{t('assessments.stats.inProgress')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{inProgressAssessments}</p>
                {totalAssessments > 0 && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {Math.round((inProgressAssessments / totalAssessments) * 100)}%
                  </p>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-300" />
              </div>
            </div>
          </Card>
        </MotionDiv>

        <MotionDiv variant="slideUp" duration="normal" delay={300}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">{t('assessments.stats.averageScore')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {averageScore > 0 ? averageScore.toFixed(0) : '-'}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder={t('assessments.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full md:w-auto text-sm sm:text-base"
              >
                <option value="all">{t('assessments.search.allTypes')}</option>
                {['MBTI', 'TKI', 'WELLNESS', 'THREE_SIXTY_SELF', 'THREE_SIXTY_EVALUATOR'].map((value) => (
                  <option key={value} value={value}>
                    {getAssessmentTypeLabel(value)}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full md:w-auto text-sm sm:text-base"
            >
              <option value="all">{t('assessments.search.allStatuses')}</option>
              {['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'].map((value) => (
                <option key={value} value={value}>
                  {getStatusLabel(value)}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssessments}
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('assessments.search.refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              {t('assessments.search.export')}
            </Button>
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
            <ClipboardList className="w-16 h-16 text-black mx-auto mb-4" />
            <p className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-2">
              {assessments.length === 0 
                ? t('assessments.empty.noTests')
                : t('assessments.empty.noMatch')}
            </p>
            <p className="text-gray-900 dark:text-gray-100 text-sm">
              {assessments.length === 0
                ? t('assessments.empty.description')
                : t('assessments.empty.tryModifying')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAssessments.map((assessment, index) => (
              <MotionDiv
                key={assessment.id}
                variant="slideUp"
                duration="normal"
                delay={index * 0.05}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-arise-teal">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-arise-teal/10 rounded-lg">
                          <Users className="w-5 h-5 text-arise-teal" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {assessment.user_email || (assessment.user_id ? `User #${assessment.user_id}` : 'Unknown User')}
                          </h3>
                          {assessment.user_name && (
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {assessment.user_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={getStatusVariant(assessment.status)}
                        className="text-xs"
                      >
                        {getStatusLabel(assessment.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Type and Progress */}
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        {getAssessmentTypeLabel(assessment.assessment_type)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getProgressPercentage(assessment)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-900 dark:text-gray-100">{t('assessments.card.progress')}</span>
                        <span className="text-xs text-gray-900 dark:text-gray-100">
                          {assessment.answer_count} / {assessment.total_questions} {t('assessments.card.questions')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            getProgressPercentage(assessment) === 100
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : getProgressPercentage(assessment) >= 50
                              ? 'bg-gradient-to-r from-arise-teal to-teal-600'
                              : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          }`}
                          style={{ width: `${getProgressPercentage(assessment)}%` }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    {assessment.score_summary && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-arise-teal" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{t('assessments.card.score')}</span>
                        </div>
                        {assessment.score_summary.percentage !== undefined ? (
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {assessment.score_summary.percentage.toFixed(0)}%
                            </span>
                            {assessment.score_summary.dominant_mode && (
                              <p className="text-xs text-gray-900 dark:text-gray-100">
                                {assessment.score_summary.dominant_mode}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100 text-sm">-</span>
                        )}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-1">
                        {assessment.started_at && (
                          <div className="flex items-center gap-2 text-xs text-gray-900 dark:text-gray-100">
                            <Clock className="w-3 h-3" />
                            <span>{t('assessments.card.start')}: {new Date(assessment.started_at).toLocaleDateString('en-US', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        )}
                        {assessment.completed_at && (
                          <div className="flex items-center gap-2 text-xs text-gray-900 dark:text-gray-100">
                            <CheckCircle className="w-3 h-3 text-success-600" />
                            <span>{t('assessments.card.completed')}: {new Date(assessment.completed_at).toLocaleDateString('en-US', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // View assessment details
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {t('assessments.card.details')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        )}
      </Card>
    </>
  );

  const renderQuestionsTab = () => {
    const displayQuestions = getQuestionsForType(selectedTestType);
    
    return (
      <>
        {/* Test Type Selector */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('questions.testType')}
              </label>
              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full max-w-md"
              >
                {['MBTI', 'TKI', 'WELLNESS', 'THREE_SIXTY_SELF', 'THREE_SIXTY_EVALUATOR'].map((value) => (
                  <option key={value} value={value}>
                    {getAssessmentTypeLabel(value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchQuestions}
                disabled={questionsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${questionsLoading ? 'animate-spin' : ''}`} />
                {t('questions.refresh')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingQuestion({ 
                    question_id: '', 
                    assessment_type: selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR' ? '360_self' : selectedTestType.toLowerCase(),
                    text: '', 
                    question: '',
                    pillar: '' 
                  } as Question);
                  setQuestionEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                {t('questions.addQuestion')}
              </Button>
            </div>
          </div>
        </Card>

        {questionsError && (
          <Alert variant="error" className="mb-6" onClose={() => setQuestionsError(null)}>
            {questionsError}
          </Alert>
        )}

        {/* Questions List */}
        <Card>
          {questionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-arise-teal" />
            </div>
          ) : displayQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <FileText className="w-12 h-12 text-black" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-2">
                {t('questions.empty.noQuestions')}
              </p>
              <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">
                {t('questions.empty.description')}
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingQuestion({ 
                    question_id: '', 
                    assessment_type: selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR' ? '360_self' : selectedTestType.toLowerCase(),
                    text: '', 
                    question: '',
                    pillar: '' 
                  } as Question);
                  setQuestionEditModalOpen(true);
                }}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                {t('questions.empty.addFirst')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayQuestions.map((question, index) => {
                // Render based on assessment type
                if (question.assessment_type === 'wellness' || selectedTestType === 'WELLNESS') {
                  return (
                    <MotionDiv
                      key={question.question_id}
                      variant="slideUp"
                      duration="fast"
                      delay={index * 0.03}
                    >
                      <Card className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {question.question_id}
                              </span>
                              {question.pillar && (
                                <Badge variant="default" className="capitalize">{question.pillar}</Badge>
                              )}
                            </div>
                            <p className="text-gray-900 text-base leading-relaxed font-medium">
                              {question.question}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(question)}
                              title="Edit"
                              className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </MotionDiv>
                  );
                } else if (question.assessment_type === 'tki' || selectedTestType === 'TKI') {
                  return (
                    <MotionDiv
                      key={question.question_id}
                      variant="slideUp"
                      duration="fast"
                      delay={index * 0.03}
                    >
                      <Card className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm">
                                {question.number || index + 1}
                              </div>
                              <span className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {question.question_id}
                              </span>
                              {question.mode_a && (
                                <Badge variant="default" className="capitalize">{question.mode_a}</Badge>
                              )}
                              {question.mode_b && (
                                <Badge variant="default" className="capitalize">{question.mode_b}</Badge>
                              )}
                            </div>
                            <div className="space-y-3">
                              {question.option_a && (
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                                  <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">Option A</p>
                                  <p className="text-gray-900 font-medium">{question.option_a}</p>
                                </div>
                              )}
                              {question.option_b && (
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Option B</p>
                                  <p className="text-gray-900 font-medium">{question.option_b}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(question)}
                              title="Edit"
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </MotionDiv>
                  );
                } else if ((question.assessment_type === '360_self' || question.assessment_type === '360_evaluator') || 
                          (selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR')) {
                  return (
                    <MotionDiv
                      key={question.question_id}
                      variant="slideUp"
                      duration="fast"
                      delay={index * 0.03}
                    >
                      <Card className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm">
                                {question.number || index + 1}
                              </div>
                              <span className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {question.question_id}
                              </span>
                              {question.capability && (
                                <Badge variant="default">
                                  {feedback360Capabilities.find(c => c.id === question.capability)?.icon} {feedback360Capabilities.find(c => c.id === question.capability)?.title || question.capability}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-900 text-base leading-relaxed font-medium">
                              {question.question}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(question)}
                              title="Edit"
                              className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </MotionDiv>
                  );
                }
                return null;
              })}
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
          title={editingQuestion?.question_id ? t('questions.modal.edit') : t('questions.modal.add')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('questions.modal.questionId')}
              </label>
              <Input
                value={editingQuestion?.question_id || editingQuestion?.id || ''}
                onChange={(e) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, question_id: e.target.value });
                  }
                }}
                placeholder={t('questions.modal.questionIdPlaceholder')}
                disabled={!!editingQuestion?.question_id || !!editingQuestion?.id}
              />
            </div>
            {(selectedTestType === 'WELLNESS' || selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR') && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('questions.modal.questionText')}
                </label>
                <textarea
                  value={editingQuestion?.text || editingQuestion?.question || ''}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, text: e.target.value, question: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                  rows={4}
                  placeholder={t('questions.modal.questionTextPlaceholder')}
                />
              </div>
            )}
            {selectedTestType === 'WELLNESS' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('questions.modal.pillar')}
                </label>
                <Input
                  value={editingQuestion?.pillar || ''}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, pillar: e.target.value });
                    }
                  }}
                  placeholder={t('questions.modal.pillarPlaceholder')}
                />
              </div>
            )}
            {selectedTestType === 'TKI' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Numéro
                  </label>
                  <Input
                    type="number"
                    value={editingQuestion?.number || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, number: parseInt(e.target.value) || undefined });
                      }
                    }}
                    placeholder="ex: 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.optionA')}
                  </label>
                  <textarea
                    value={editingQuestion?.optionA || editingQuestion?.option_a || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, optionA: e.target.value, option_a: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                    rows={2}
                    placeholder={t('questions.modal.optionAPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.optionB')}
                  </label>
                  <textarea
                    value={editingQuestion?.optionB || editingQuestion?.option_b || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, optionB: e.target.value, option_b: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal"
                    rows={2}
                    placeholder={t('questions.modal.optionBPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.modeA')}
                  </label>
                  <Input
                    value={editingQuestion?.modeA || editingQuestion?.mode_a || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, modeA: e.target.value, mode_a: e.target.value });
                      }
                    }}
                    placeholder={t('questions.modal.modeAPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.modeB')}
                  </label>
                  <Input
                    value={editingQuestion?.modeB || editingQuestion?.mode_b || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, modeB: e.target.value, mode_b: e.target.value });
                      }
                    }}
                    placeholder={t('questions.modal.modeBPlaceholder')}
                  />
                </div>
              </>
            )}
            {(selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.number')}
                  </label>
                  <Input
                    type="number"
                    value={editingQuestion?.number || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, number: parseInt(e.target.value) || undefined });
                      }
                    }}
                    placeholder={t('questions.modal.numberPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('questions.modal.capability')}
                  </label>
                  <Input
                    value={editingQuestion?.capability || ''}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, capability: e.target.value });
                      }
                    }}
                    placeholder={t('questions.modal.capabilityPlaceholder')}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setQuestionEditModalOpen(false);
                  setEditingQuestion(null);
                }}
              >
                {t('questions.modal.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveQuestion} disabled={questionsLoading}>
                <Save className="w-4 h-4 mr-2" />
                {questionsLoading ? t('questions.modal.saving') : t('questions.modal.save')}
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
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('rules.testType')}
              </label>
              <select
                value={selectedRuleType}
                onChange={(e) => setSelectedRuleType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-arise-teal w-full max-w-md"
              >
                {['MBTI', 'TKI', 'WELLNESS', 'THREE_SIXTY_SELF', 'THREE_SIXTY_EVALUATOR'].map((value) => (
                  <option key={value} value={value}>
                    {getAssessmentTypeLabel(value)}
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
              <Calculator className="w-16 h-16 text-black mx-auto mb-4" />
              <p className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-2">
                {t('rules.notAvailable')}
              </p>
              <p className="text-gray-900 dark:text-gray-100 text-sm">
                {t('rules.notAvailableDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wellness Rules */}
              {selectedRuleType === 'WELLNESS' && rules.pillars && (
                <>
                  <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      {t('rules.wellness.generalConfig')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-primary-200 dark:border-primary-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">{t('rules.wellness.maxTotalScore')}</p>
                        <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{rules.maxTotalScore}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-primary-200 dark:border-primary-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">{t('rules.wellness.responseScale')}</p>
                        <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                          {rules.scale.min} - {rules.scale.max}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {t('rules.wellness.pillarRules')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rules.pillars.map((pillar: ScoringRule, index: number) => (
                        <MotionDiv
                          key={index}
                          variant="slideUp"
                          duration="fast"
                          delay={index * 0.05}
                        >
                          <Card className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                                    <Calculator className="w-5 h-5 text-success-700 dark:text-success-300" />
                                  </div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize text-lg">
                                    {pillar.name.replace(/_/g, ' ')}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <div className="px-3 py-1.5 bg-success-50 dark:bg-success-900/20 rounded-lg">
                                    <p className="text-xs text-success-600 dark:text-success-400 mb-0.5">{t('rules.wellness.maxScore')}</p>
                                    <p className="text-lg font-bold text-success-700 dark:text-success-300">
                                      {pillar.maxScore}
                                    </p>
                                  </div>
                                  <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <p className="text-xs text-primary-600 dark:text-primary-400 mb-0.5">{t('rules.wellness.questions')}</p>
                                    <p className="text-lg font-bold text-primary-700 dark:text-primary-300">
                                      {pillar.questions?.length || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditRule(pillar)}
                                title="Edit"
                                className="hover:bg-success-50 dark:hover:bg-success-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {t('rules.wellness.associatedQuestions')}
                              </p>
                              {pillar.questions?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {pillar.questions.map((qId: string) => (
                                    <Badge key={qId} variant="default" className="text-xs font-mono">
                                      {qId}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-900 dark:text-gray-100 italic">
                                  {t('rules.wellness.noQuestions')}
                                </span>
                              )}
                            </div>
                          </Card>
                        </MotionDiv>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TKI Rules */}
              {selectedRuleType === 'TKI' && rules.modes && (
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Configuration TKI
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">Total de questions</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{rules.totalQuestions}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">Questions par mode</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{rules.questionsPerMode}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                      Modes de conflit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rules.modes.map((mode: string, index: number) => (
                        <MotionDiv
                          key={mode}
                          variant="fade"
                          duration="fast"
                          delay={index * 0.05}
                        >
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                            <Badge variant="default" className="capitalize text-sm font-semibold w-full justify-center py-2">
                              {mode}
                            </Badge>
                          </div>
                        </MotionDiv>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* 360 Rules */}
              {(selectedRuleType === 'THREE_SIXTY_SELF' || selectedRuleType === 'THREE_SIXTY_EVALUATOR') && rules.capabilities && (
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      Configuration générale
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">Score maximum total</p>
                        <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{rules.maxTotalScore}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">Échelle de réponse</p>
                        <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                          {rules.scale.min} - {rules.scale.max}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                      Règles par capacité
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rules.capabilities.map((capability: ScoringRule, index: number) => {
                        const capInfo = feedback360Capabilities.find(c => c.id === capability.name);
                        return (
                          <MotionDiv
                            key={index}
                            variant="slideUp"
                            duration="fast"
                            delay={index * 0.05}
                          >
                            <Card className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                      <span className="text-primary-700 dark:text-primary-300 text-lg">
                                        {capInfo?.icon || '📊'}
                                      </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize text-lg">
                                      {capInfo?.title || capability.name.replace(/_/g, ' ')}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-4 mt-3">
                                    <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                      <p className="text-xs text-primary-600 dark:text-primary-400 mb-0.5">Score max</p>
                                      <p className="text-lg font-bold text-primary-700 dark:text-primary-300">
                                        {capability.maxScore}
                                      </p>
                                    </div>
                                    <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                      <p className="text-xs text-primary-600 dark:text-primary-400 mb-0.5">Questions</p>
                                      <p className="text-lg font-bold text-primary-700 dark:text-primary-300">
                                        {capability.questions?.length || 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRule(capability)}
                                  title="Edit"
                                  className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Questions associées:
                                </p>
                                {capability.questions?.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {capability.questions.map((qId: string) => (
                                      <Badge key={qId} variant="default" className="text-xs font-mono">
                                        {qId}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-900 dark:text-gray-100 italic">
                                    Aucune question associée
                                  </span>
                                )}
                              </div>
                            </Card>
                          </MotionDiv>
                        );
                      })}
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
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nom
              </label>
              <Input
                value={editingRule?.name || ''}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, name: e.target.value });
                  }
                }}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Score maximum
              </label>
              <Input
                type="number"
                value={editingRule?.maxScore || ''}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, maxScore: parseInt(e.target.value) });
                  }
                }}
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
    <Container className="py-4 sm:py-6 md:py-8" maxWidth="full" center={false}>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-arise-teal/10 rounded-lg">
                <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-white ml-0 sm:ml-14">
              {t('description')}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {typeof error === 'string' ? error : String(error || 'An error occurred')}
        </Alert>
      )}

      <Tabs defaultTab={activeTab} onChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <TabList className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <Tab value="assessments" className="flex items-center gap-2 !text-white [&_svg]:!text-white">
            <ClipboardList className="w-4 h-4 !text-white" style={{ color: '#FFF' }} />
            {t('tabs.assessments')}
          </Tab>
          <Tab value="questions" className="flex items-center gap-2 !text-white [&_svg]:!text-white">
            <FileText className="w-4 h-4 !text-white" style={{ color: '#FFF' }} />
            {t('tabs.questions')}
          </Tab>
          <Tab value="rules" className="flex items-center gap-2 !text-white [&_svg]:!text-white">
            <Calculator className="w-4 h-4 !text-white" style={{ color: '#FFF' }} />
            {t('tabs.rules')}
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
