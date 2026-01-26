'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Container } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import {
  getEvaluatorAssessment,
  submitEvaluatorAssessment,
  type EvaluatorAssessmentInfo,
} from '@/lib/api/assessments';
import {
  feedback360Questions,
  feedback360QuestionsForContributors,
  feedback360Capabilities,
  feedback360Scale,
  type Feedback360ScaleOption,
} from '@/data/feedback360Questions';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Check } from 'lucide-react';

// Fonction pour traduire les textes de l'interface selon la locale
const t = (key: string, locale: string, params?: Record<string, any>): string => {
  const translations: Record<string, Record<string, string>> = {
    'title': { en: '360° Feedback Assessment', fr: 'Évaluation 360° Feedback' },
    'evaluationOf': { en: 'Evaluation of', fr: 'Évaluation de' },
    'completedBy': { en: 'Completed by:', fr: 'Rempli par:' },
    'question': { en: 'Question', fr: 'Question' },
    'of': { en: 'of', fr: 'sur' },
    'previous': { en: 'Previous', fr: 'Précédent' },
    'next': { en: 'Next', fr: 'Suivant' },
    'submit': { en: 'Submit', fr: 'Soumettre' },
    'submitting': { en: 'Submitting...', fr: 'Envoi en cours...' },
    'thankYou': { en: 'Thank you for your evaluation!', fr: 'Merci pour votre évaluation !' },
    'feedbackRecorded': { en: 'Your feedback has been successfully recorded. Your contribution is valuable in helping', fr: 'Votre feedback a été enregistré avec succès. Votre contribution est précieuse pour aider' },
    'inDevelopment': { en: 'in their development.', fr: 'dans son développement.' },
    'loading': { en: 'Loading...', fr: 'Chargement...' },
  };
  
  let text = translations[key]?.[locale] || translations[key]?.['en'] || key;
  
  // Replace params if provided
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, String(value));
    });
  }
  
  return text;
};

// Fonction pour traduire les rôles d'évaluateur selon la locale
const translateRole = (role: string, locale: string): string => {
  if (locale === 'fr') {
    const roleTranslations: Record<string, string> = {
      'peer': 'Collègue',
      'manager': 'Gestionnaire',
      'direct_report': 'Subordonné direct',
      'self': 'Auto-évaluation',
      'other': 'Autre',
    };
    return roleTranslations[role.toLowerCase()] || role;
  }
  // English translations (default)
  const roleTranslationsEN: Record<string, string> = {
    'peer': 'Peer',
    'manager': 'Manager',
    'direct_report': 'Direct Report',
    'self': 'Self',
    'other': 'Other',
  };
  return roleTranslationsEN[role.toLowerCase()] || role;
};

// Fonction pour traduire l'échelle selon la locale
const getLocalizedScale = (locale: string): Feedback360ScaleOption[] => {
  if (locale === 'fr') {
    return [
      { value: 1, label: 'Fortement en désaccord' },
      { value: 2, label: 'En désaccord' },
      { value: 3, label: 'Neutre' },
      { value: 4, label: 'D\'accord' },
      { value: 5, label: 'Fortement d\'accord' },
    ];
  }
  // Return English scale (default)
  return feedback360Scale;
};

// Fonction pour traduire les capacités selon la locale
const getLocalizedCapabilities = (locale: string) => {
  if (locale === 'fr') {
    return feedback360Capabilities.map(cap => {
      const translations: Record<string, { title: string; description: string }> = {
        'change_management': {
          title: 'Gestion du changement',
          description: 'Capacité à s\'adapter et à conduire efficacement les changements organisationnels.',
        },
        'communication': {
          title: 'Communication',
          description: 'Efficacité dans la transmission des idées et la compréhension des autres.',
        },
        'leadership_style': {
          title: 'Style de leadership',
          description: 'Approche pour inspirer, motiver et guider les autres.',
        },
        'problem_solving_and_decision_making': {
          title: 'Résolution de problèmes et prise de décision',
          description: 'Capacité à analyser les situations et à prendre des décisions efficaces.',
        },
        'stress_management': {
          title: 'Gestion du stress',
          description: 'Capacité à gérer la pression et à maintenir son calme.',
        },
        'team_culture': {
          title: 'Culture d\'équipe',
          description: 'Contribution à la création d\'environnements d\'équipe positifs et collaboratifs.',
        },
      };
      const translation = translations[cap.id];
      return translation ? { ...cap, ...translation } : cap;
    });
  }
  // Return English capabilities (default)
  return feedback360Capabilities;
};

export default function Evaluator360Page() {
  const params = useParams();
  // Extract token and locale from params
  const tokenParam = params?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : (tokenParam as string);
  const localeParam = params?.locale;
  const locale: string = (Array.isArray(localeParam) ? localeParam[0] : localeParam) || 'en';

  const [evaluatorInfo, setEvaluatorInfo] = useState<EvaluatorAssessmentInfo | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get localized data
  const localizedScale = getLocalizedScale(locale);
  const localizedCapabilities = getLocalizedCapabilities(locale);

  // Use contributor questions for evaluators
  const question = feedback360QuestionsForContributors[currentQuestion];
  const progress = question
    ? Math.round(
        ((Object.keys(answers).length + (selectedValue !== null && !answers[question.id] ? 1 : 0)) /
          30) *
          100
      )
    : 0;

  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant. Veuillez vérifier le lien dans votre email.');
      setIsLoading(false);
      return;
    }
    
    loadEvaluatorInfo();
  }, [token]);

  useEffect(() => {
    if (question && answers[question.id]) {
      const answerValue = answers[question.id];
      if (answerValue) {
        setSelectedValue(parseInt(answerValue));
      } else {
        setSelectedValue(null);
      }
    } else {
      setSelectedValue(null);
    }
  }, [currentQuestion, question, answers]);

  const loadEvaluatorInfo = async () => {
    if (!token) {
      setError('Token d\'invitation manquant.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Decode token in case it's URL encoded
      const decodedToken = decodeURIComponent(token);
      const info = await getEvaluatorAssessment(decodedToken);
      setEvaluatorInfo(info);

      // If already completed, show success
      if (info.status === 'COMPLETED') {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Failed to load evaluator info:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      setError(
        errorMessage ||
          'Lien invalide ou expiré. Veuillez vérifier le lien dans votre email ou contacter la personne qui vous a invité.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectValue = (value: number) => {
    if (!question) return;
    setSelectedValue(value);
    setAnswers({ ...answers, [question.id]: value.toString() });
  };

  const handleNext = () => {
    if (currentQuestion < 29) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      setError('Token d\'invitation manquant.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare answers in the format expected by the API
      const answersArray = Object.entries(answers).map(([question_id, answer_value]) => ({
        question_id,
        answer_value,
      }));

      // Decode token in case it's URL encoded
      const decodedToken = decodeURIComponent(token);
      await submitEvaluatorAssessment(decodedToken, answersArray);
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      const errorMessage = err.response?.data?.detail || err.message;
      setError(
        errorMessage ||
          'Une erreur est survenue lors de la soumission. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal to-arise-deep-teal">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <Card className="p-8 text-center max-w-md">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-arise-teal" />
            <p className="text-gray-600">{t('loading', locale)}</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !evaluatorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal to-arise-deep-teal">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <Card className="p-8 text-center max-w-md">
            <Alert variant="error">{error}</Alert>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (success || evaluatorInfo?.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal to-arise-deep-teal">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <Card className="p-8 text-center max-w-md">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {t('thankYou', locale)}
            </h1>
            <p className="mb-8 text-gray-600">
              {t('feedbackRecorded', locale)} {evaluatorInfo?.user_being_evaluated?.name || (locale === 'fr' ? 'cette personne' : 'this person')} {t('inDevelopment', locale)}
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!evaluatorInfo || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal to-arise-deep-teal">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <Card className="p-8 text-center max-w-md">
            <Alert variant="error">Informations non disponibles</Alert>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const allQuestionsAnswered = Object.keys(answers).length === 30;

  return (
    <div className="min-h-screen bg-gradient-to-br from-arise-teal to-arise-deep-teal">
      <Header />
      <div className="pt-16 pb-8">
        <Container className="max-w-4xl mx-auto px-4">
          {/* Assessment Header Card */}
          <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('title', locale)}
              </h1>
              <p className="text-gray-600">
                {t('evaluationOf', locale)} <strong>{evaluatorInfo.user_being_evaluated?.name}</strong>
                {evaluatorInfo.user_being_evaluated?.email && (
                  <span className="text-gray-500">
                    {' '}
                    ({evaluatorInfo.user_being_evaluated.email})
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('completedBy', locale)} {evaluatorInfo.evaluator_name} ({translateRole(evaluatorInfo.evaluator_role, locale)})
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {t('question', locale)} {currentQuestion + 1} {t('of', locale)} 30
              </div>
              <div className="text-2xl font-bold text-arise-teal">{progress}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-arise-teal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>

        {error && (
          <Alert variant="error" onClose={() => setError(null)} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Question Card */}
        <Card className="p-8">
          {/* Capability Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-arise-teal/10 px-4 py-2 text-sm font-medium text-arise-teal">
              {localizedCapabilities.find((c) => c.id === question.capability)?.icon}
              {localizedCapabilities.find((c) => c.id === question.capability)?.title}
            </span>
          </div>

          {/* Question */}
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">{question.question}</h2>

          {/* Scale */}
          <div className="mb-8 space-y-3">
            {localizedScale.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectValue(option.value)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedValue === option.value
                    ? 'border-arise-teal bg-arise-teal/20 shadow-md ring-2 ring-arise-teal ring-offset-2'
                    : 'border-gray-200 hover:border-arise-teal/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${
                      selectedValue === option.value ? 'text-arise-teal' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </span>
                    {selectedValue === option.value && (
                      <Check className="h-5 w-5 text-arise-teal" />
                    )}
                  </div>
                  <span className={`text-2xl font-bold ${
                    selectedValue === option.value ? 'text-arise-teal' : 'text-gray-400'
                  }`}>
                    {option.value}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              <span className="flex items-center gap-4">
                <ArrowLeft className="h-4 w-4" />
                {t('previous', locale)}
              </span>
            </Button>

            {currentQuestion === 29 ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedValue === null || isSubmitting || !allQuestionsAnswered}
                className="bg-arise-gold hover:bg-arise-gold/90"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('submitting', locale)}
                  </span>
                ) : (
                  <span className="flex items-center gap-4">
                    {t('submit', locale)}
                    <CheckCircle className="h-4 w-4" />
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedValue === null}
                className="bg-arise-gold hover:bg-arise-gold/90"
              >
                <span className="flex items-center gap-4">
                  {t('next', locale)}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            )}
          </div>
        </Card>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
