'use client';

export const dynamic = 'force-dynamic';

// CRITICAL: Global error handlers to catch React error #130 before it crashes
if (typeof window !== 'undefined') {
  // Override console.error to catch React errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.map(arg => String(arg)).join(' ');
    if (errorString.includes('130') || errorString.includes('Objects are not valid')) {
      console.error('[CRITICAL] ========== REACT ERROR #130 DETECTED ==========');
      console.error('[CRITICAL] Full error:', ...args);
      console.error('[CRITICAL] Stack trace:', new Error().stack);
      console.error('[CRITICAL] ===============================================');
    }
    originalConsoleError.apply(console, args);
  };
  
  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('130') || event.message.includes('Objects are not valid'))) {
      console.error('[CRITICAL] ========== WINDOW ERROR EVENT ==========');
      console.error('[CRITICAL] React error #130 detected:', event.error);
      console.error('[CRITICAL] Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
      console.error('[CRITICAL] ===============================================');
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (String(event.reason).includes('130') || String(event.reason).includes('Objects are not valid'))) {
      console.error('[CRITICAL] ========== UNHANDLED REJECTION ==========');
      console.error('[CRITICAL] Unhandled promise rejection with React error #130:', event.reason);
      console.error('[CRITICAL] ===============================================');
    }
  });
}

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, Button, Stack } from '@/components/ui';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { Brain, Target, Users, Heart, Upload, CheckCircle, Lock, type LucideIcon, Loader2, RefreshCw, Eye, Clock, Mail } from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType, get360Evaluators, EvaluatorStatus, submitAssessment } from '@/lib/api/assessments';
import { startAssessment } from '@/lib/api/assessments';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { formatError } from '@/lib/utils/formatError';
import { useAuthStore } from '@/lib/store';
import { useMySubscription } from '@/lib/query/queries';

interface AssessmentDisplay {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  icon: LucideIcon;
  externalLink?: string;
  requiresEvaluators?: boolean;
  assessmentId?: number; // ID from database
  assessmentType: AssessmentType;
  answerCount?: number;
  totalQuestions?: number;
}

// Note: ASSESSMENT_CONFIG and ROLE_LABELS are now defined inside the component to use translations

function AssessmentsContent() {
  const t = useTranslations('dashboard.assessments');
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useMySubscription();
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluators, setEvaluators] = useState<Record<number, EvaluatorStatus[]>>({});
  const isInitialMount = useRef(true);
  const previousPathnameRef = useRef<string | null>(null);

  // Mapping of assessment types to display info (using translations)
  // Order: MBTI, TKI (ARISE Conflict Style), 360 Feedback, Wellness
  const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: LucideIcon; externalLink?: string; requiresEvaluators?: boolean }> = {
    mbti: {
      title: t('config.mbti.title'),
      description: t('config.mbti.description'),
      icon: Brain,
      externalLink: 'https://www.16personalities.com/free-personality-test',
    },
    tki: {
      title: t('config.tki.title'),
      description: t('config.tki.description'),
      icon: Target,
    },
    '360_self': {
      title: t('config.360_self.title'),
      description: t('config.360_self.description'),
      icon: Users,
      requiresEvaluators: true,
    },
    wellness: {
      title: t('config.wellness.title'),
      description: t('config.wellness.description'),
      icon: Heart,
    },
    '360_evaluator': {
      title: t('config.360_evaluator.title'),
      description: t('config.360_evaluator.description'),
      icon: Users,
    },
  };

  const ROLE_LABELS: Record<string, string> = {
    PEER: t('roles.peer'),
    MANAGER: t('roles.manager'),
    DIRECT_REPORT: t('roles.directReport'),
    STAKEHOLDER: t('roles.stakeholder'),
  };

  // Helper function to check if an assessment is available based on plan features
  // This is defined outside loadAssessments so it can access subscriptionData from the component scope
  const isAssessmentAvailable = (assessmentType: string): boolean => {
    try {
      // Get subscription data from React Query response
      // React Query wraps axios response in { data: AxiosResponse }
      // So subscriptionData.data is the AxiosResponse, and subscriptionData.data.data is the actual data
      // But sometimes it's just subscriptionData.data directly
      const actualSubscriptionData = subscriptionData?.data?.data || subscriptionData?.data;
      
      // Helper function to get plan from cache
      const getPlanFromCache = (): { planName: string; planFeatures: string | null } | null => {
        if (typeof window === 'undefined') return null;
        try {
          const cachedSubscription = localStorage.getItem('subscription_cache');
          if (cachedSubscription) {
            const parsed = JSON.parse(cachedSubscription);
            if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) { // 5 minutes cache
              const cachedData = parsed.data;
              if (cachedData?.plan) {
                return {
                  planName: (cachedData.plan.name?.toUpperCase() || '').replace(/\s*\$\d+.*$/i, '').trim(),
                  planFeatures: cachedData.plan.features || null
                };
              }
            }
          }
        } catch (e) {
          console.error('[Assessments] Error reading cache:', e);
        }
        return null;
      };
      
      // If subscription is still loading, try cache first, otherwise show all temporarily
      if (subscriptionLoading) {
        const cachedPlan = getPlanFromCache();
        if (cachedPlan) {
          return checkPlanFeatures(cachedPlan.planName, cachedPlan.planFeatures, assessmentType);
        }
        return true;
      }
      
      // If we have valid subscription data, use it and cache it
      if (actualSubscriptionData?.plan) {
        // Cache the subscription data for future use
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('subscription_cache', JSON.stringify({
              data: actualSubscriptionData,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('[Assessments] Error caching subscription:', e);
          }
        }
        
        // Normalize plan name to handle cases like "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS"
        const planName = actualSubscriptionData.plan.name?.toUpperCase() || '';
        const planFeatures = actualSubscriptionData.plan.features;
        return checkPlanFeatures(planName, planFeatures, assessmentType);
      }
      
      // If no subscription data, try cache
      const cachedPlan = getPlanFromCache();
      if (cachedPlan) {
        return checkPlanFeatures(cachedPlan.planName, cachedPlan.planFeatures, assessmentType);
      }
      
      // If no cache either, show all assessments to avoid blocking the user
      return true;
    } catch (error) {
      // If any error occurs, try cache first, then show all assessments
      console.error('[Assessments] Error checking assessment availability:', error);
      if (typeof window !== 'undefined') {
        try {
          const cachedSubscription = localStorage.getItem('subscription_cache');
          if (cachedSubscription) {
            const parsed = JSON.parse(cachedSubscription);
            if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              const cachedData = parsed.data;
              if (cachedData?.plan) {
                // Normalize plan name to handle cases like "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS"
                const rawPlanName = cachedData.plan.name?.toUpperCase() || '';
                const planName = rawPlanName.replace(/\s*\$\d+.*$/i, '').trim();
                const planFeatures = cachedData.plan.features;
                return checkPlanFeatures(planName, planFeatures, assessmentType);
              }
            }
          }
        } catch (e) {
          // Ignore cache errors in error handler
        }
      }
      return true;
    }
  };
  
  // Helper function to create default assessments based on plan when API fails
  const createDefaultAssessmentsFromPlan = (): AssessmentDisplay[] => {
    const defaultAssessments: AssessmentDisplay[] = [];
    
    // Get plan from cache or subscription data
    let planName = '';
    let planFeatures: Record<string, boolean> = {};
    
    try {
      // Try to get from subscription data
      const actualSubscriptionData = subscriptionData?.data?.data || subscriptionData?.data;
      if (actualSubscriptionData?.plan) {
        // Normalize plan name to handle cases like "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS"
        const rawPlanName = actualSubscriptionData.plan.name?.toUpperCase() || '';
        planName = rawPlanName.replace(/\s*\$\d+.*$/i, '').trim();
        if (actualSubscriptionData.plan.features) {
          try {
            planFeatures = JSON.parse(actualSubscriptionData.plan.features);
          } catch (e) {
            // Ignore
          }
        }
      } else {
        // Try to get from cache
        if (typeof window !== 'undefined') {
          try {
            const cachedSubscription = localStorage.getItem('subscription_cache');
            if (cachedSubscription) {
              const parsed = JSON.parse(cachedSubscription);
              if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                const cachedData = parsed.data;
                if (cachedData?.plan) {
                  // Normalize plan name to handle cases like "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS"
                  const rawPlanName = cachedData.plan.name?.toUpperCase() || '';
                  planName = rawPlanName.replace(/\s*\$\d+.*$/i, '').trim();
                  if (cachedData.plan.features) {
                    try {
                      planFeatures = JSON.parse(cachedData.plan.features);
                    } catch (e) {
                      // Ignore
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    } catch (error) {
      console.error('[Assessments] Error getting plan for default assessments:', error);
    }
    
    // If no plan found, show all assessments to avoid blocking the user
    if (!planName) {
      return Object.entries(ASSESSMENT_CONFIG)
        .filter(([type]) => type !== '360_evaluator')
        .map(([type, config]) => {
          let apiType: AssessmentType;
          if (type === '360_self') {
            apiType = 'THREE_SIXTY_SELF';
          } else {
            apiType = type.toUpperCase() as AssessmentType;
          }
          return {
            id: type,
            title: config.title,
            description: config.description,
            status: 'available' as const,
            icon: config.icon,
            externalLink: config.externalLink,
            requiresEvaluators: config.requiresEvaluators,
            assessmentType: apiType,
          };
        });
    }
    
    // Create assessments based on plan
    Object.entries(ASSESSMENT_CONFIG)
      .filter(([type]) => type !== '360_evaluator')
      .forEach(([type, config]) => {
        let apiType: AssessmentType;
        if (type === '360_self') {
          apiType = 'THREE_SIXTY_SELF';
        } else if (type === '360_evaluator') {
          apiType = 'THREE_SIXTY_EVALUATOR';
        } else {
          apiType = type.toUpperCase() as AssessmentType;
        }
        
        // Check if assessment is available for this plan using checkPlanFeatures directly
        let isAvailable = false;
        try {
          // Pass null if planFeatures is empty (no features available), otherwise stringify
          const planFeaturesString = Object.keys(planFeatures).length > 0 ? JSON.stringify(planFeatures) : null;
          isAvailable = checkPlanFeatures(planName, planFeaturesString, apiType);
        } catch (e) {
          console.error('[Assessments] Error checking plan features:', e);
          // If error, show assessment to avoid blocking
          isAvailable = true;
        }
        
        if (isAvailable) {
          defaultAssessments.push({
            id: type,
            title: config.title,
            description: config.description,
            status: 'available',
            icon: config.icon,
            externalLink: config.externalLink,
            requiresEvaluators: config.requiresEvaluators,
            assessmentType: apiType,
          });
        }
      });
    
    return defaultAssessments;
  };

  // Helper function to normalize plan name (remove price and extra spaces)
  const normalizePlanName = (planName: string): string => {
    if (!planName) return '';
    // Remove price information (e.g., "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS")
    // Remove anything after $ or any price pattern
    let normalized = planName.toUpperCase().trim();
    // Remove price patterns like "$99", "$249", "$299", etc.
    normalized = normalized.replace(/\s*\$\d+.*$/i, '').trim();
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  };

  // Helper function to check plan features
  const checkPlanFeatures = (planName: string, planFeatures: string | null | undefined, assessmentType: string): boolean => {
    try {
      // Normalize plan name to handle cases like "LIFESTYLE & WELLNESS $99" -> "LIFESTYLE & WELLNESS"
      const normalizedPlanName = normalizePlanName(planName);

      // Parse plan features
      let features: Record<string, boolean> = {};
      const hasFeatures = !!planFeatures;
      if (planFeatures) {
        try {
          features = JSON.parse(planFeatures);
        } catch (e) {
          console.error('[Assessments] Failed to parse plan features:', e);
          // If parsing fails, fall back to plan-name-based rules
        }
      }

      // REVELATION plan: all assessments available
      if (normalizedPlanName === 'REVELATION') {
        return true;
      }

      // SELF EXPLORATION plan: Professional Assessment (TKI) + Wellness Pulse + Executive Summary
      if (normalizedPlanName === 'SELF EXPLORATION') {
        // TKI = Professional Assessment (ARISE Conflict Style)
        if (assessmentType === 'TKI' || assessmentType === 'tki') {
          // If features are available, check the feature flag; otherwise, allow by default for SELF EXPLORATION
          if (hasFeatures && features.professional_assessment !== undefined) {
            return features.professional_assessment === true;
          } else {
            // Fallback: SELF EXPLORATION includes TKI by default
            return true;
          }
        }
        // WELLNESS = Wellness Pulse
        if (assessmentType === 'WELLNESS' || assessmentType === 'wellness') {
          // If features are available, check the feature flag; otherwise, allow by default for SELF EXPLORATION
          if (hasFeatures && features.wellness_pulse !== undefined) {
            return features.wellness_pulse === true;
          } else {
            // Fallback: SELF EXPLORATION includes WELLNESS by default
            return true;
          }
        }
        // MBTI and 360 are not available in SELF EXPLORATION
        if (assessmentType === 'MBTI' || assessmentType === 'mbti') {
          return false;
        }
        if (assessmentType === 'THREE_SIXTY_SELF' || assessmentType === '360_self' || assessmentType === 'THREE_SIXTY_EVALUATOR' || assessmentType === '360_evaluator') {
          return false;
        }
        // Default for SELF EXPLORATION: deny if not explicitly allowed
        return false;
      }

      // LIFESTYLE & WELLNESS plan: only Wellness Pulse + Basic Assessment Summary
      // Support both new name "LIFESTYLE & WELLNESS" and old name "WELLNESS" for backward compatibility
      if (normalizedPlanName === 'LIFESTYLE & WELLNESS' || normalizedPlanName === 'LIFESTYLE AND WELLNESS' || normalizedPlanName === 'WELLNESS') {
        // Only WELLNESS is available
        if (assessmentType === 'WELLNESS' || assessmentType === 'wellness') {
          // If features are available, check the feature flag; otherwise, allow by default for LIFESTYLE & WELLNESS plan
          if (hasFeatures && features.wellness_pulse !== undefined) {
            return features.wellness_pulse === true;
          } else {
            // Fallback: LIFESTYLE & WELLNESS plan includes WELLNESS assessment by default
            return true;
          }
        }
        // All other assessments are not available in LIFESTYLE & WELLNESS plan
        return false;
      }

      // Default: if plan has the feature, allow the assessment
      // Map assessment types to feature keys (handle both uppercase and lowercase)
      const featureMap: Record<string, string> = {
        'TKI': 'professional_assessment',
        'tki': 'professional_assessment',
        'THREE_SIXTY_SELF': '360_feedback',
        '360_self': '360_feedback',
        'THREE_SIXTY_EVALUATOR': '360_feedback',
        '360_evaluator': '360_feedback',
        'WELLNESS': 'wellness_pulse',
        'wellness': 'wellness_pulse',
      };

      const featureKey = featureMap[assessmentType];
      if (featureKey) {
        return features[featureKey] === true;
      }

      // MBTI: only available in REVELATION (handled above)
      if (assessmentType === 'MBTI' || assessmentType === 'mbti') {
        return false;
      }

      // Default: allow if not explicitly restricted
      return true;
    } catch (error) {
      // If any error occurs, show all assessments to avoid blocking the user
      console.error('[Assessments] Error checking plan features:', error);
      return true;
    }
  };
  
  // Try to load cached assessments from sessionStorage for instant display
  const getCachedAssessments = (): AssessmentDisplay[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = sessionStorage.getItem('assessments_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is recent (less than 5 minutes old)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          const cachedData = parsed.data || [];
          
          // CRITICAL: If cache contains assessments without icons (corrupted), clear it
          const hasCorruptedIcons = cachedData.some((assessment: any) => {
            // Icons cannot be serialized in JSON, so if cache has icon data, it's corrupted
            return assessment.icon && typeof assessment.icon !== 'function' && typeof assessment.icon === 'object';
          });
          
          if (hasCorruptedIcons) {
            console.error('[CRITICAL] Cache contains corrupted icon data! Clearing cache...');
            sessionStorage.removeItem('assessments_cache');
            return [];
          }
          
          // CRITICAL: Validate and clean cached data to prevent React error #130
          // Ensure all primitive values are actually primitives, not objects
          const cleanedData: AssessmentDisplay[] = cachedData.map((assessment: any) => {
            // Ensure answerCount is a number or string, never an object
            let answerCount: number | undefined = undefined;
            if (assessment.answerCount !== undefined && assessment.answerCount !== null) {
              if (typeof assessment.answerCount === 'number') {
                answerCount = assessment.answerCount;
              } else if (typeof assessment.answerCount === 'string') {
                const parsed = parseInt(assessment.answerCount, 10);
                answerCount = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ answerCount IS AN OBJECT in cache!', assessment.answerCount);
                // Try to extract a number from the object
                if (typeof assessment.answerCount === 'object' && 'value' in assessment.answerCount) {
                  answerCount = typeof assessment.answerCount.value === 'number' ? assessment.answerCount.value : undefined;
                }
              }
            }
            
            // Ensure totalQuestions is a number or string, never an object
            let totalQuestions: number | undefined = undefined;
            if (assessment.totalQuestions !== undefined && assessment.totalQuestions !== null) {
              if (typeof assessment.totalQuestions === 'number') {
                totalQuestions = assessment.totalQuestions;
              } else if (typeof assessment.totalQuestions === 'string') {
                const parsed = parseInt(assessment.totalQuestions, 10);
                totalQuestions = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ totalQuestions IS AN OBJECT in cache!', assessment.totalQuestions);
                // Try to extract a number from the object
                if (typeof assessment.totalQuestions === 'object' && 'value' in assessment.totalQuestions) {
                  totalQuestions = typeof assessment.totalQuestions.value === 'number' ? assessment.totalQuestions.value : undefined;
                }
              }
            }
            
            // Ensure assessmentId is a number, never an object
            let assessmentId: number | undefined = undefined;
            if (assessment.assessmentId !== undefined && assessment.assessmentId !== null) {
              if (typeof assessment.assessmentId === 'number') {
                assessmentId = assessment.assessmentId;
              } else if (typeof assessment.assessmentId === 'string') {
                const parsed = parseInt(assessment.assessmentId, 10);
                assessmentId = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ assessmentId IS AN OBJECT in cache!', assessment.assessmentId);
                // Try to extract a number from the object
                if (typeof assessment.assessmentId === 'object' && 'id' in assessment.assessmentId) {
                  const idValue = (assessment.assessmentId as { id: unknown }).id;
                  if (typeof idValue === 'number') {
                    assessmentId = idValue;
                  } else if (typeof idValue === 'string') {
                    const parsed = parseInt(idValue, 10);
                    assessmentId = !isNaN(parsed) ? parsed : undefined;
                  }
                } else if (typeof assessment.assessmentId === 'object' && 'value' in assessment.assessmentId) {
                  const value = (assessment.assessmentId as { value: unknown }).value;
                  if (typeof value === 'number') {
                    assessmentId = value;
                  } else if (typeof value === 'string') {
                    const parsed = parseInt(value, 10);
                    assessmentId = !isNaN(parsed) ? parsed : undefined;
                  }
                }
              }
            }
            
            // Ensure status is a string, never an object
            let status: string = 'not-started';
            const rawStatus = assessment.status || 'not-started';
            if (typeof rawStatus === 'string') {
              status = rawStatus;
            } else {
              console.error('[DEBUG] ⚠️ status IS AN OBJECT in cache!', rawStatus);
              if (typeof rawStatus === 'object' && rawStatus !== null && 'value' in rawStatus) {
                status = String((rawStatus as { value: unknown }).value);
              }
            }
            
            // CRITICAL: Ensure icon is preserved from original assessment (it's a React component)
            // If icon is missing or corrupted, we'll need to restore it from ASSESSMENT_CONFIG
            let icon = assessment.icon;
            if (!icon || typeof icon !== 'function') {
              // Try to restore icon from ASSESSMENT_CONFIG based on assessment type
              const assessmentTypeKey = assessment.assessmentType?.toLowerCase() || '';
              const config = ASSESSMENT_CONFIG[assessmentTypeKey];
              if (config && config.icon) {
                icon = config.icon;
              } else {
                // Fallback to Brain icon
                icon = Brain;
              }
            }
            
            // Return cleaned assessment
            return {
              ...assessment,
              icon, // Preserve or restore icon
              answerCount,
              totalQuestions,
              assessmentId,
              status,
            };
          });
          
          // DEBUG: Log cleaned data
          console.log('[DEBUG] Loaded and cleaned cached assessments:', cleanedData.length, 'items');
          cleanedData.forEach((assessment: any, index: number) => {
            console.log(`[DEBUG] Cleaned assessment ${index}:`, {
              id: assessment.id,
              answerCount: assessment.answerCount,
              answerCountType: typeof assessment.answerCount,
              totalQuestions: assessment.totalQuestions,
              totalQuestionsType: typeof assessment.totalQuestions,
              assessmentId: assessment.assessmentId,
              assessmentIdType: typeof assessment.assessmentId,
              status: assessment.status,
              statusType: typeof assessment.status,
            });
          });
          
          return cleanedData;
        }
      }
    } catch (e) {
      console.error('[DEBUG] Error loading cache:', e);
      // Clear corrupted cache
      try {
        sessionStorage.removeItem('assessments_cache');
      } catch (clearError) {
        // Ignore clear errors
      }
    }
    return [];
  };

  // CRITICAL: Start with empty array to prevent rendering corrupted cached data
  // This prevents React error #130 from corrupted cache being rendered on first mount
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading state
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Smart cache strategy: Use cache for instant display on initial load,
    // but invalidate when navigating back from results/assessment pages
    const shouldInvalidateCache = (() => {
      // Check if we're navigating back from an assessment-related page
      const referrer = document.referrer;
      const isNavigatingFromAssessment = referrer && (
        referrer.includes('/assessments/') && 
        !referrer.endsWith('/assessments') &&
        !referrer.endsWith('/assessments/')
      );
      
      // Check previous pathname from sessionStorage
      const previousPath = sessionStorage.getItem('assessments_previous_path');
      const isFromAssessmentPage = previousPath && previousPath.includes('/assessments/') && 
                                    !previousPath.endsWith('/assessments');
      
      // Invalidate if coming from assessment/results pages (not initial load)
      return (isNavigatingFromAssessment || isFromAssessmentPage) && !isInitialMount.current;
    })();
    
    if (shouldInvalidateCache) {
      // Clear cache when navigating back from assessment/results pages
      try {
        sessionStorage.removeItem('assessments_cache');
        console.log('[Assessments] Cache invalidated - navigating back from assessment page');
      } catch (e) {
        // Ignore errors
      }
    } else {
      // On initial load, try to use cache for instant display
      try {
        const cached = sessionStorage.getItem('assessments_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedData = parsed.data || [];
          if (cachedData.length > 0) {
            // Check if cache is recent (less than 2 minutes old for instant display)
            if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 1000) {
              const cleanedCachedData = getCachedAssessments();
              if (cleanedCachedData.length > 0) {
                setAssessments(cleanedCachedData);
                setIsLoading(false);
                // Still load fresh data in background
              }
            }
          }
        }
      } catch (e) {
        // If cache is corrupted, clear it
        try {
          sessionStorage.removeItem('assessments_cache');
        } catch (clearError) {
          // Ignore
        }
      }
    }
    
    // Store current pathname for next navigation
    if (pathname) {
      previousPathnameRef.current = pathname;
      try {
        sessionStorage.setItem('assessments_previous_path', pathname);
      } catch (e) {
        // Ignore
      }
    }
    
    isInitialMount.current = false;
    // Only load assessments if user is authenticated
    if (user) {
      loadAssessments();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user]); // pathname and user dependency - we want to react to navigation and auth changes

  // Refresh assessments when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadAssessments();
      }
    };

    const handleFocus = () => {
      if (user) {
        loadAssessments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Auto-refresh evaluators status every 10 seconds for 360 assessments
  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Find 360 assessment
    const threeSixtyAssessment = assessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF' && a.assessmentId);
    if (!threeSixtyAssessment?.assessmentId) {
      return;
    }

    // Always poll to refresh status, even if all are completed (to show completed status)
    const refreshEvaluators = async () => {
      try {
        const evaluatorsResponse = await get360Evaluators(threeSixtyAssessment.assessmentId!);
        const evaluatorsList = evaluatorsResponse.evaluators || [];
        
        // Save to cache (localStorage for persistence)
        // CRITICAL: Always save, but protect against overwriting with empty list
        if (typeof window !== 'undefined') {
          try {
            const cacheKey = `evaluators_cache_${threeSixtyAssessment.assessmentId}`;
            // Check existing cache before overwriting
            const existingCache = localStorage.getItem(cacheKey);
            if (existingCache) {
              try {
                const existing = JSON.parse(existingCache);
                const existingCount = existing.data?.length || 0;
                // Don't overwrite cache with empty list if we have existing data
                if (existingCount > 0 && evaluatorsList.length === 0) {
                  console.warn('[AssessmentsPage] ⚠️ API returned empty list but cache has', existingCount, 'evaluators. Keeping cache.');
                  return; // Don't update cache or state
                }
              } catch (e) {
                // If can't parse existing cache, continue with save
              }
            }
            
            localStorage.setItem(cacheKey, JSON.stringify({
              data: evaluatorsList,
              timestamp: Date.now(),
              assessmentId: threeSixtyAssessment.assessmentId,
              count: evaluatorsList.length
            }));
            console.log('[AssessmentsPage] ✅ Saved evaluators to cache:', evaluatorsList.length, 'evaluators');
          } catch (cacheErr) {
            console.error('[AssessmentsPage] Error saving cache in refresh:', cacheErr);
          }
        }
        
        setEvaluators(prev => ({
          ...prev,
          [threeSixtyAssessment.assessmentId!]: evaluatorsList
        }));
      } catch (err) {
        // Silent fail - don't show error for background refresh
        console.error('Failed to refresh evaluators:', err);
      }
    };

    // Initial load
    refreshEvaluators();

    // Poll every 10 seconds to check for status updates
    const interval = setInterval(() => {
      refreshEvaluators();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessments, isLoading]); // Only depend on assessments and isLoading to avoid infinite loop

  const loadAssessments = async () => {
    // Don't load if user is not authenticated
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get assessments from API
      let allApiAssessments: ApiAssessment[] = [];
      try {
        allApiAssessments = await getMyAssessments();
      } catch (apiError: any) {
        // If we get a 401, try to use cached assessments
        if (apiError?.response?.status === 401) {
          console.warn('[Assessments] 401 Unauthorized - trying to use cached assessments');
          // Try to load from cache
          if (typeof window !== 'undefined') {
            try {
              const cached = sessionStorage.getItem('assessments_cache');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                  const cachedAssessments = parsed.data || [];
                  if (cachedAssessments.length > 0) {
                    console.log('[Assessments] Using cached assessments due to 401 error');
                    // Restore icons from ASSESSMENT_CONFIG
                    const restoredAssessments = cachedAssessments.map((assessment: any) => {
                      const config = ASSESSMENT_CONFIG[assessment.id];
                      return {
                        ...assessment,
                        icon: config?.icon || Heart,
                      };
                    });
                    setAssessments(restoredAssessments);
                    setIsLoading(false);
                    return;
                  }
                }
              }
            } catch (cacheError) {
              console.error('[Assessments] Error loading from cache:', cacheError);
            }
          }
          // If no cache, create default assessments based on plan
          console.warn('[Assessments] No cache available, creating default assessments based on plan');
          const defaultAssessments = createDefaultAssessmentsFromPlan();
          if (defaultAssessments.length > 0) {
            setAssessments(defaultAssessments);
            setError('Your session has expired. Please refresh the page or log in again.');
          } else {
            setError('Your session has expired. Please refresh the page or log in again.');
            setAssessments([]);
          }
          setIsLoading(false);
          return;
        }
        // Re-throw other errors
        throw apiError;
      }
      // Filter out evaluator assessments (360_evaluator) - these are created for each evaluator and shouldn't appear in user's list
      const apiAssessments = allApiAssessments.filter(
        (a) => {
          const type = String(a.assessment_type).toLowerCase();
          return type !== 'three_sixty_evaluator' && type !== '360_evaluator';
        }
      );
      
      // CRITICAL: Clean API data to ensure answer_count and total_questions are numbers, not objects
      // This prevents React error #130 when data is corrupted
      const cleanedApiAssessments = apiAssessments.map((assessment: any) => {
        const cleaned: ApiAssessment = { ...assessment };
        
        // Ensure answer_count is a number or undefined
        if (cleaned.answer_count !== undefined && cleaned.answer_count !== null) {
          const rawAnswerCount = cleaned.answer_count;
          if (typeof rawAnswerCount === 'object' && rawAnswerCount !== null) {
            console.error('[Assessments] ⚠️ answer_count IS AN OBJECT from API!', {
              assessmentId: cleaned.id,
              answer_count: rawAnswerCount,
              type: typeof rawAnswerCount
            });
            // Try to extract a number from the object
            if ('value' in rawAnswerCount && typeof (rawAnswerCount as { value: unknown }).value === 'number') {
              cleaned.answer_count = (rawAnswerCount as { value: number }).value;
            } else {
              cleaned.answer_count = undefined;
            }
          } else if (typeof rawAnswerCount !== 'number') {
            const parsed = parseInt(String(rawAnswerCount), 10);
            cleaned.answer_count = !isNaN(parsed) ? parsed : undefined;
          }
        }
        
        // Ensure total_questions is a number or undefined
        if (cleaned.total_questions !== undefined && cleaned.total_questions !== null) {
          const rawTotalQuestions = cleaned.total_questions;
          if (typeof rawTotalQuestions === 'object' && rawTotalQuestions !== null) {
            console.error('[Assessments] ⚠️ total_questions IS AN OBJECT from API!', {
              assessmentId: cleaned.id,
              total_questions: rawTotalQuestions,
              type: typeof rawTotalQuestions
            });
            // Try to extract a number from the object
            if ('value' in rawTotalQuestions && typeof (rawTotalQuestions as { value: unknown }).value === 'number') {
              cleaned.total_questions = (rawTotalQuestions as { value: number }).value;
            } else {
              cleaned.total_questions = undefined;
            }
          } else if (typeof rawTotalQuestions !== 'number') {
            const parsed = parseInt(String(rawTotalQuestions), 10);
            cleaned.total_questions = !isNaN(parsed) ? parsed : undefined;
          }
        }
        
        return cleaned;
      });
      
      // Always log assessment statuses for troubleshooting (even in production)
      // Convert to string to prevent React error #130 (objects not valid as React child)
      console.log('[Assessments] Loaded assessments from API:', JSON.stringify(cleanedApiAssessments.map(a => ({
        type: a.assessment_type,
        status: a.status,
        id: a.id,
        answer_count: a.answer_count,
        total_questions: a.total_questions,
        created_at: a.created_at
      }))));
      
      // Create a map of existing assessments by type
      const existingAssessmentsMap = new Map<AssessmentType, ApiAssessment>();
      cleanedApiAssessments.forEach(assessment => {
        // Ensure assessment_type is valid and properly converted
        if (!assessment.assessment_type) {
          console.warn('[Assessments] Assessment missing assessment_type:', assessment);
          return;
        }
        
        // Normalize the type to ensure it matches the expected format
        // Backend returns lowercase: 'mbti', 'tki', 'wellness', '360_self', '360_evaluator'
        // Frontend expects uppercase: 'MBTI', 'TKI', 'WELLNESS', 'THREE_SIXTY_SELF', 'THREE_SIXTY_EVALUATOR'
        let normalizedType: AssessmentType;
        const backendType = String(assessment.assessment_type).toLowerCase();
        
        // Map backend types to frontend types
        const typeMapping: Record<string, AssessmentType> = {
          'mbti': 'MBTI',
          'tki': 'TKI',
          'wellness': 'WELLNESS',
          '360_self': 'THREE_SIXTY_SELF',
          'three_sixty_self': 'THREE_SIXTY_SELF',
          '360_evaluator': 'THREE_SIXTY_EVALUATOR',
          'three_sixty_evaluator': 'THREE_SIXTY_EVALUATOR',
        };
        
        normalizedType = typeMapping[backendType] || String(assessment.assessment_type).toUpperCase() as AssessmentType;
        
        const existing = existingAssessmentsMap.get(normalizedType);
        // Keep the most recent assessment of each type
        if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
          existingAssessmentsMap.set(normalizedType, { ...assessment, assessment_type: normalizedType });
        }
      });
      
      // Debug: Log the map for Wellness
      // Convert to string to prevent React error #130
      const wellnessAssessment = existingAssessmentsMap.get('WELLNESS');
      console.log('[Assessments] Assessment map after processing:', JSON.stringify({
        wellnessAssessment: wellnessAssessment ? {
          id: wellnessAssessment.id,
          status: wellnessAssessment.status,
          answer_count: wellnessAssessment.answer_count,
          total_questions: wellnessAssessment.total_questions
        } : null,
        allTypes: Array.from(existingAssessmentsMap.keys())
      }));
      
      // Build display assessments list
      console.log('[Assessments] Building display assessments list...');
      console.log('[Assessments] ASSESSMENT_CONFIG keys:', Object.keys(ASSESSMENT_CONFIG));
      console.log('[Assessments] Subscription data:', {
        subscriptionData,
        subscriptionLoading,
        subscriptionError,
        hasData: !!subscriptionData,
        hasNestedData: !!subscriptionData?.data,
        actualData: subscriptionData?.data?.data || subscriptionData?.data
      });
      
      const displayAssessments: AssessmentDisplay[] = Object.entries(ASSESSMENT_CONFIG)
        .filter(([type]) => type !== '360_evaluator') // Skip 360_evaluator as it's handled separately
        .filter(([type]) => {
          // Filter assessments based on plan
          // Map config keys to AssessmentType
          let apiType: AssessmentType;
          if (type === '360_self') {
            apiType = 'THREE_SIXTY_SELF';
          } else if (type === '360_evaluator') {
            apiType = 'THREE_SIXTY_EVALUATOR';
          } else {
            apiType = type.toUpperCase() as AssessmentType;
          }
          const isAvailable = isAssessmentAvailable(apiType);
          console.log(`[Assessments] Assessment ${type} (${apiType}) available:`, isAvailable);
          return isAvailable;
        })
        .map(([type, config]) => {
        // Map lowercase type to uppercase for API
        // Special handling for 360_self -> THREE_SIXTY_SELF and 360_evaluator -> THREE_SIXTY_EVALUATOR
        let apiType: AssessmentType;
        if (type === '360_self') {
          apiType = 'THREE_SIXTY_SELF';
        } else if (type === '360_evaluator') {
          apiType = 'THREE_SIXTY_EVALUATOR';
        } else {
          apiType = type.toUpperCase() as AssessmentType;
        }
        const apiAssessment = existingAssessmentsMap.get(apiType);
        
        // Debug: Log if Wellness assessment is not found
        if (apiType === 'WELLNESS' && !apiAssessment) {
          // Convert to string to prevent React error #130
          console.warn('[Assessments] Wellness assessment not found in map!', JSON.stringify({
            apiType,
            mapKeys: Array.from(existingAssessmentsMap.keys()),
            allAssessments: cleanedApiAssessments.filter(a => a.assessment_type === 'WELLNESS').map(a => ({
              id: a.id,
              type: a.assessment_type,
              status: a.status
            }))
          }));
        }
        
        // SIMPLIFIED STATUS DETERMINATION: Use ONLY answerCount and totalQuestions from backend
        // This ensures buttons and progress bars always reflect actual data, not backend status
        let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
        if (apiAssessment) {
          // For MBTI (external assessment, no internal questions), use backend status
          if (apiType === 'MBTI') {
            const rawStatus = String(apiAssessment.status).toLowerCase().trim();
            if (rawStatus === 'completed' || rawStatus === 'complete') {
              status = 'completed';
            } else {
              status = 'available';
            }
          } else {
            // For all other assessments (TKI, WELLNESS, THREE_SIXTY_SELF):
            // Status is determined SOLELY by answerCount vs totalQuestions
            const answerCount = apiAssessment.answer_count ?? 0;
            const totalQuestions = apiAssessment.total_questions ?? 0;
            
            if (totalQuestions > 0 && answerCount === totalQuestions) {
              // All questions answered = completed
              status = 'completed';
            } else if (answerCount > 0) {
              // Some questions answered = in-progress
              status = 'in-progress';
            } else {
              // No questions answered = available (not started)
              status = 'available';
            }
          }
        }
        
        return {
          id: type,
          title: config.title,
          description: config.description,
          status,
          icon: config.icon,
          externalLink: config.externalLink,
          requiresEvaluators: config.requiresEvaluators,
          assessmentId: apiAssessment?.id ? (typeof apiAssessment.id === 'number' ? apiAssessment.id : parseInt(String(apiAssessment.id), 10)) : undefined,
          assessmentType: apiType,
          // CRITICAL: Ensure answerCount and totalQuestions are numbers or undefined, never objects
          answerCount: apiAssessment?.answer_count !== undefined && apiAssessment?.answer_count !== null
            ? (typeof apiAssessment.answer_count === 'number' ? apiAssessment.answer_count : parseInt(String(apiAssessment.answer_count), 10))
            : undefined,
          totalQuestions: apiAssessment?.total_questions !== undefined && apiAssessment?.total_questions !== null
            ? (typeof apiAssessment.total_questions === 'number' ? apiAssessment.total_questions : parseInt(String(apiAssessment.total_questions), 10))
            : undefined,
        };
      });
      
      // DEBUG: Log each assessment object to check for nested objects
      displayAssessments.forEach((assessment, index) => {
        console.log(`[DEBUG] Assessment ${index} (${assessment.id}):`, {
          id: assessment.id,
          title: assessment.title,
          status: assessment.status,
          answerCount: assessment.answerCount,
          answerCountType: typeof assessment.answerCount,
          answerCountIsObject: typeof assessment.answerCount === 'object',
          totalQuestions: assessment.totalQuestions,
          totalQuestionsType: typeof assessment.totalQuestions,
          totalQuestionsIsObject: typeof assessment.totalQuestions === 'object',
          assessmentId: assessment.assessmentId,
          assessmentIdType: typeof assessment.assessmentId,
          assessmentIdIsObject: typeof assessment.assessmentId === 'object',
          assessmentType: assessment.assessmentType,
          fullObject: JSON.parse(JSON.stringify(assessment)) // Deep clone to see structure
        });
      });
      
      console.log('[Assessments] Display assessments after filtering:', displayAssessments.length);
      console.log('[Assessments] Display assessments:', displayAssessments.map(a => ({ id: a.id, title: a.title, type: a.assessmentType })));
      
      // CRITICAL: Final validation before setting state - ensure no objects are present
      // This is a last line of defense against React error #130
      const finalValidatedAssessments = displayAssessments.map(assessment => {
        // Double-check all values are primitives
        return {
          ...assessment,
          answerCount: typeof assessment.answerCount === 'number' ? assessment.answerCount : undefined,
          totalQuestions: typeof assessment.totalQuestions === 'number' ? assessment.totalQuestions : undefined,
          assessmentId: typeof assessment.assessmentId === 'number' ? assessment.assessmentId : undefined,
          status: typeof assessment.status === 'string' ? assessment.status : 'available',
        };
      });
      
      setAssessments(finalValidatedAssessments);
      
      // Load contributors for 360 assessments
      const threeSixtyAssessment = finalValidatedAssessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF' && a.assessmentId);
      if (threeSixtyAssessment?.assessmentId) {
        try {
          // Try to load from cache first for instant display (localStorage for persistence)
          const cacheKey = `contributors_cache_${threeSixtyAssessment.assessmentId}`;
          if (typeof window !== 'undefined') {
            try {
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                const parsed = JSON.parse(cached);
                // Check if cache is recent (less than 24 hours old)
                if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                  const cachedContributors = parsed.data || [];
                  if (cachedContributors.length > 0) {
                    console.log('[AssessmentsPage] Loaded contributors from cache:', cachedContributors.length);
                    setEvaluators(prev => ({
                      ...prev,
                      [threeSixtyAssessment.assessmentId!]: cachedContributors
                    }));
                  }
                }
              }
            } catch (cacheErr) {
              // Ignore cache errors
            }
          }
          
          // Load fresh data
          const evaluatorsResponse = await get360Evaluators(threeSixtyAssessment.assessmentId);
          const evaluatorsList = evaluatorsResponse.evaluators || [];
          
          // Save to cache (localStorage for persistence across refreshes)
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                data: evaluatorsList,
                timestamp: Date.now(),
                assessmentId: threeSixtyAssessment.assessmentId
              }));
              console.log('[AssessmentsPage] Saved contributors to cache:', evaluatorsList.length);
            } catch (cacheErr) {
              console.error('[AssessmentsPage] Error saving cache:', cacheErr);
            }
          }
          
          setEvaluators(prev => ({
            ...prev,
            [threeSixtyAssessment.assessmentId!]: evaluatorsList
          }));
        } catch (evaluatorsErr) {
          console.error('Failed to load contributors:', formatError(evaluatorsErr));
          // Don't fail the whole page if contributors fail to load
        }
      }
      
      // Cache assessments in sessionStorage for instant display on next visit
      // Only cache validated data to prevent corruption
      // CRITICAL: Remove icon from cached data (React components cannot be serialized)
      // Icons will be restored from ASSESSMENT_CONFIG when loading from cache
      if (typeof window !== 'undefined') {
        try {
          const cacheSafeAssessments = finalValidatedAssessments.map(assessment => {
            const { icon, ...assessmentWithoutIcon } = assessment;
            return assessmentWithoutIcon;
          });
          
          sessionStorage.setItem('assessments_cache', JSON.stringify({
            data: cacheSafeAssessments,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
      }
    } catch (err) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('Failed to load assessments:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = async (assessmentType: AssessmentType, assessmentId?: number) => {
    try {
      setStartingAssessment(assessmentType);
      
      // Always redirect 360 feedback to start page - never use /start endpoint
      if (assessmentType === 'THREE_SIXTY_SELF') {
        if (assessmentId) {
          // Resume existing assessment with ID in URL
          router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentId}`);
        } else {
          // New assessment - redirect to start page to invite evaluators
          router.push('/dashboard/assessments/360-feedback/start');
        }
        return; // Early return to prevent calling startAssessment
      }
      
      // For other assessment types
      if (assessmentId) {
        // Resume existing assessment
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}?assessmentId=${assessmentId}`);
      } else {
        // Start new assessment for other types
        const response = await startAssessment(assessmentType);
        // Pass the new assessment ID in the URL so the page can load it
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}?assessmentId=${response.assessment_id}`);
      }
    } catch (err) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('Failed to start assessment:', errorMessage);
      setError(errorMessage);
    } finally {
      setStartingAssessment(null);
    }
  };

  const getAssessmentRoute = (type: AssessmentType): string => {
    switch (type) {
      case 'TKI':
        return 'tki';
      case 'WELLNESS':
        return 'wellness';
      case 'THREE_SIXTY_SELF':
        return '360-feedback';
      case 'MBTI':
        return 'mbti';
      default:
        // TypeScript exhaustiveness check - this should never happen
        return String(type).toLowerCase();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            {t('status.completed')}
          </div>
        );
      case 'in-progress':
        return (
          <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {t('status.inProgress')}
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <Lock size={16} />
            {t('status.locked')}
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
            {t('status.available')}
          </div>
        );
    }
  };

  const getActionButton = (assessment: AssessmentDisplay) => {
    // CRITICAL: Ensure assessmentId is always a number before using it
    const safeAssessmentId = typeof assessment.assessmentId === 'number' 
      ? assessment.assessmentId 
      : typeof assessment.assessmentId === 'string'
      ? parseInt(assessment.assessmentId, 10)
      : undefined;
    
    // If assessmentId is an object, log error and return null
    if (assessment.assessmentId !== undefined && assessment.assessmentId !== null && typeof assessment.assessmentId === 'object') {
      console.error('[Assessments] ⚠️ assessmentId IS AN OBJECT in getActionButton!', {
        assessmentId: assessment.assessmentId,
        assessmentType: assessment.assessmentType,
        status: assessment.status
      });
      return null;
    }
    
    const isStarting = startingAssessment === assessment.assessmentType;
    
    // SIMPLIFIED BUTTON LOGIC: Use answerCount and totalQuestions directly from backend
    // Get safe numeric values
    const answerCount = typeof assessment.answerCount === 'number' ? assessment.answerCount : (typeof assessment.answerCount === 'string' ? parseInt(assessment.answerCount, 10) : 0);
    const totalQuestions = typeof assessment.totalQuestions === 'number' ? assessment.totalQuestions : (typeof assessment.totalQuestions === 'string' ? parseInt(assessment.totalQuestions, 10) : 0);
    const hasAllAnswers = totalQuestions > 0 && answerCount > 0 && answerCount === totalQuestions;
    const hasSomeAnswers = answerCount > 0;
    
    // MBTI: Show "View Results" if completed, otherwise show two buttons
    if (assessment.assessmentType === 'MBTI') {
      // If completed, show "View Results" button that redirects to Results & Reports section
      if (assessment.status === 'completed' && safeAssessmentId) {
        return (
          <Button 
            variant="outline" 
            className="w-full rounded-full text-white flex flex-row items-center gap-2"
            style={{ backgroundColor: '#0F454D', borderColor: '#0F454D' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)'}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0F454D'}
            onClick={() => {
              router.push('/dashboard/reports');
            }}
          >
            <Eye size={16} />
            {t('actions.viewResults')}
          </Button>
        );
      }
      
      // Otherwise, show the two buttons
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-xs"
            onClick={() => {
              if (assessment.externalLink) {
                window.open(assessment.externalLink, '_blank');
              } else {
                // If no external link, redirect to internal MBTI page
                router.push('/dashboard/assessments/mbti');
              }
            }}
          size="sm"
          >
            <Brain size={12} />
            {t('actions.takeTest')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs"
            onClick={() => {
              router.push('/dashboard/assessments/mbti/upload');
            }}
          >
            <Upload size={12} />
            {t('actions.uploadTest')}
          </Button>
        </div>
      );
    }
    
    if (hasAllAnswers && safeAssessmentId && !isNaN(safeAssessmentId)) {
      // All questions answered: Show "View Results" button that redirects to Results & Reports section
      // If status is already completed, redirect directly. Otherwise, submit first.
      const isAlreadyCompleted = assessment.status === 'completed';
      
      return (
        <Button 
          variant="outline" 
          className="text-white flex flex-row items-center gap-2"
          style={{ backgroundColor: '#0F454D', borderColor: '#0F454D', color: '#fff' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0F454D';
            e.currentTarget.style.color = '#fff';
          }}
          disabled={isStarting && !isAlreadyCompleted}
          onClick={async () => {
            if (isAlreadyCompleted) {
              // Already completed, redirect to Results & Reports section
              router.push('/dashboard/reports');
              return;
            }
            
            // Not yet completed, submit first then redirect to Results & Reports
            try {
              setStartingAssessment(assessment.assessmentType);
              await submitAssessment(safeAssessmentId);
              // Refresh assessments list to update status
              loadAssessments().catch(err => {
                console.error('Failed to refresh assessments after submission:', err);
                // Continue anyway
              });
              // Then redirect to Results & Reports section
              router.push('/dashboard/reports');
            } catch (err) {
              console.error('Failed to submit assessment:', err);
              // If submission fails, try to go to results anyway (might already be submitted)
              router.push('/dashboard/reports');
            } finally {
              setStartingAssessment(null);
            }
          }}
        >
          {isStarting && !isAlreadyCompleted ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('actions.submitting')}
            </>
          ) : (
            t('actions.viewResults')
          )}
        </Button>
      );
    }
    
    if (hasSomeAnswers && safeAssessmentId && !isNaN(safeAssessmentId)) {
      // Some questions answered: Show "Continue" button
      return (
        <Button 
          variant="outline"
          style={{ color: '#0F454D', borderColor: '#0F454D' }}
          disabled={isStarting}
          onClick={() => {
            // For 360 assessments, always redirect to the assessment page
            if (assessment.assessmentType === 'THREE_SIXTY_SELF' && safeAssessmentId) {
              router.push(`/dashboard/assessments/360-feedback?assessmentId=${safeAssessmentId}`);
            } else if (assessment.requiresEvaluators && safeAssessmentId) {
              // Other assessments that require evaluators and have an assessmentId - open modal
              setStartingAssessment(null); // Reset loading state when opening modal
              setShowEvaluatorModal(true);
            } else {
              // For other assessment types
              if (assessment.assessmentType === 'WELLNESS') {
                router.push(safeAssessmentId ? `/dashboard/assessments/wellness?assessmentId=${safeAssessmentId}` : '/dashboard/assessments/wellness');
              } else if (assessment.assessmentType === 'TKI') {
                router.push(safeAssessmentId ? `/dashboard/assessments/tki?assessmentId=${safeAssessmentId}` : '/dashboard/assessments/tki');
              } else {
                const route = getAssessmentRoute(assessment.assessmentType);
                router.push(safeAssessmentId ? `/dashboard/assessments/${route}?assessmentId=${safeAssessmentId}` : `/dashboard/assessments/${route}`);
              }
            }
          }}
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('actions.loading')}
            </>
          ) : (
            t('actions.continue')
          )}
        </Button>
      );
    }
    
    // No answers yet: Show "Start" button
    return (
      <Button 
        variant="outline"
        size="sm"
        className="border-arise-button-primary text-white hover:bg-arise-button-primary hover:text-white text-xs"
        disabled={isStarting}
        onClick={async () => {
          try {
            setStartingAssessment(assessment.assessmentType);
            // For 360 assessments, always redirect to start page if no assessmentId exists
            if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
              if (safeAssessmentId) {
                // Existing assessment - resume it
                router.push(`/dashboard/assessments/360-feedback?assessmentId=${safeAssessmentId}`);
              } else {
                // New assessment - redirect to start page to invite evaluators
                router.push('/dashboard/assessments/360-feedback/start');
              }
            } else if (assessment.requiresEvaluators && safeAssessmentId) {
              // Other assessments that require evaluators and have an assessmentId
              setStartingAssessment(null); // Reset loading state when opening modal
              setShowEvaluatorModal(true);
            } else {
              // For other assessment types
              await handleStartAssessment(assessment.assessmentType, safeAssessmentId);
            }
          } catch (err) {
            const errorMessage = formatError(err);
            console.error('Failed to start assessment:', errorMessage);
            setError(errorMessage);
          } finally {
            if (assessment.assessmentType !== 'THREE_SIXTY_SELF' && !(assessment.requiresEvaluators && safeAssessmentId)) {
              setStartingAssessment(null);
            }
          }
        }}
      >
        {isStarting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('actions.loading')}
          </>
        ) : (
          t('actions.start')
        )}
      </Button>
    );
  };

  // CRITICAL: Ensure assessments is always an array before using it
  // This prevents React error #130 if assessments is somehow corrupted
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  
  // Show loading skeleton on initial load (better UX than spinner)
  if (isLoading && safeAssessments.length === 0) {
    return (
      <>
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">{t('titlePrefix')} </span>
              <span style={{ color: '#D5B667' }}>{t('titleSuffix')}</span>
            </h1>
            <p className="text-white">
              {t('description')}
            </p>
          </div>
        </MotionDiv>
        
        <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
          <div 
            className="absolute"
            style={{ 
              backgroundColor: '#D5DEE0',
              top: '-20px',
              bottom: 0,
              left: '-15%',
              right: '-15%',
              zIndex: 0,
              borderRadius: '24px',
              width: 'calc(100% + 4%)',
              margin: 'auto',
            }}
          />
          <div className="relative z-10">
            <Stack gap="normal">
              <LoadingSkeleton variant="card" count={4} />
            </Stack>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    // Ensure error is always a string before rendering
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.loadFailed'));
    const isUnauthorized = errorString.includes('401') || errorString.includes('expired') || errorString.includes('Unauthorized');
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{errorString}</p>
            {isUnauthorized ? (
              <Button variant="primary" onClick={() => window.location.reload()}>
                {t('refreshPage')}
              </Button>
            ) : (
              <Button variant="primary" onClick={loadAssessments}>
                {t('retry')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6 text-left">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">{t('titlePrefix')} </span>
            <span style={{ color: '#D5B667' }}>{t('titleSuffix')}</span>
          </h1>
          <p className="text-white">
            {t('description')}
          </p>
        </div>
      </MotionDiv>

      {/* Wrapper for assessments with background color block */}
      <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
        {/* Background color block behind all assessments */}
        <div 
          className="absolute"
          style={{ 
            backgroundColor: '#D5DEE0',
            top: '-20px',
            bottom: 0,
            left: '-7.5%',
            right: '-7.5%',
            zIndex: 0,
            borderRadius: '24px',
            width: 'calc(100% + 4%)',
            margin: 'auto',
          }}
        />
        
        {/* Content sections with relative positioning */}
        <div className="relative z-10">
          {/* Show refresh button and loading indicator */}
          <div className="mb-4 flex items-center justify-end gap-3">
            {isLoading && safeAssessments.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('refreshing')}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear cache and reload
                if (typeof window !== 'undefined') {
                  try {
                    sessionStorage.removeItem('assessments_cache');
                  } catch (e) {
                    // Ignore
                  }
                }
                loadAssessments();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
              style={{ border: 'none', padding: '2px 4px' }}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('refresh')}</span>
            </Button>
          </div>
          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              {safeAssessments.length === 0 && !isLoading ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    {t('noAssessmentsAvailable')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Please contact support or upgrade your plan to access more assessments.
                  </p>
                </Card>
              ) : (
                safeAssessments.map((assessment, index) => {
                // CRITICAL: Wrap entire card rendering in try-catch to prevent React error #130
                // This is the last line of defense - if ANY object gets rendered, catch it here
                try {
                  // DEBUG: Log each assessment before rendering to catch objects
                  console.log(`[DEBUG] ========== RENDERING ASSESSMENT ${index} ==========`);
                  console.log('[DEBUG] Assessment object:', assessment);
                  console.log('[DEBUG] Assessment keys:', Object.keys(assessment));
                  
                  // CRITICAL: Check EVERY property for objects (except icon which is a React component)
                  Object.keys(assessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (assessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ PROPERTY "${key}" IS AN OBJECT!`, value);
                    }
                  });
                  
                  console.log('[DEBUG] Assessment details:', {
                    id: assessment.id,
                    idType: typeof assessment.id,
                    title: assessment.title,
                    titleType: typeof assessment.title,
                    status: assessment.status,
                    statusType: typeof assessment.status,
                    answerCount: assessment.answerCount,
                    answerCountType: typeof assessment.answerCount,
                    answerCountValue: assessment.answerCount,
                    totalQuestions: assessment.totalQuestions,
                    totalQuestionsType: typeof assessment.totalQuestions,
                    totalQuestionsValue: assessment.totalQuestions,
                    assessmentId: assessment.assessmentId,
                    assessmentIdType: typeof assessment.assessmentId,
                    assessmentIdValue: assessment.assessmentId,
                    description: assessment.description,
                    descriptionType: typeof assessment.description,
                  });
                  
                  // DEBUG: Check if any value is an object that might be rendered (except icon which is a React component)
                  if (typeof assessment.answerCount === 'object' && assessment.answerCount !== null) {
                    console.error('[DEBUG] ⚠️ answerCount IS AN OBJECT!', assessment.answerCount);
                  }
                  if (typeof assessment.totalQuestions === 'object' && assessment.totalQuestions !== null) {
                    console.error('[DEBUG] ⚠️ totalQuestions IS AN OBJECT!', assessment.totalQuestions);
                  }
                  if (typeof assessment.assessmentId === 'object' && assessment.assessmentId !== null) {
                    console.error('[DEBUG] ⚠️ assessmentId IS AN OBJECT!', assessment.assessmentId);
                  }
                  if (typeof assessment.status === 'object' && assessment.status !== null) {
                    console.error('[DEBUG] ⚠️ status IS AN OBJECT!', assessment.status);
                  }
                  // Note: icon is a React component, so it's normal for it to be an object/function
                  
                  // CRITICAL: Force all values to be primitives before rendering
                  // Convert EVERY property to ensure no objects slip through
                  const safeAssessment: AssessmentDisplay = {
                    id: typeof assessment.id === 'string' ? assessment.id : String(assessment.id || ''),
                    title: typeof assessment.title === 'string' ? assessment.title : String(assessment.title || ''),
                    description: typeof assessment.description === 'string' ? assessment.description : String(assessment.description || ''),
                    status: typeof assessment.status === 'string' ? assessment.status : 'available',
                    icon: assessment.icon,
                    assessmentType: assessment.assessmentType,
                    answerCount: typeof assessment.answerCount === 'number' ? assessment.answerCount : (typeof assessment.answerCount === 'string' ? parseInt(assessment.answerCount, 10) : undefined),
                    totalQuestions: typeof assessment.totalQuestions === 'number' ? assessment.totalQuestions : (typeof assessment.totalQuestions === 'string' ? parseInt(assessment.totalQuestions, 10) : undefined),
                    assessmentId: typeof assessment.assessmentId === 'number' ? assessment.assessmentId : (typeof assessment.assessmentId === 'string' ? parseInt(assessment.assessmentId, 10) : undefined),
                    externalLink: typeof assessment.externalLink === 'string' ? assessment.externalLink : undefined,
                    requiresEvaluators: typeof assessment.requiresEvaluators === 'boolean' ? assessment.requiresEvaluators : undefined,
                  };
                  
                  // CRITICAL: Final validation - ensure NO objects in safeAssessment (except icon which is a React component)
                  Object.keys(safeAssessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (safeAssessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ safeAssessment.${key} IS STILL AN OBJECT AFTER CLEANING!`, value);
                      throw new Error(`safeAssessment.${key} is an object: ${JSON.stringify(value)}`);
                    }
                  });
                  
                  console.log(`[DEBUG] Safe assessment ${index} created:`, safeAssessment);
                  
                  // CRITICAL: Ensure key is a string, not an object (must be declared before use)
                  const cardKey = typeof assessment.id === 'string' ? assessment.id : String(assessment.id || `assessment-${index}`);
                  
                  // CRITICAL: Ensure icon is a valid React component before using it
                  // Lucide icons are React.forwardRef components, so they have $$typeof: Symbol(react.forward_ref)
                  // They are valid React components even though they're not simple functions
                  const Icon = safeAssessment.icon as React.ComponentType<any> | undefined;
                  if (!Icon || (typeof Icon !== 'function' && !(Icon as any).$$typeof && !(Icon as any).render)) {
                    console.error('[CRITICAL] Icon is not a valid React component!', Icon);
                    // Fallback to a default icon
                    return (
                      <Card key={cardKey} className="border-red-300 bg-red-50">
                        <div className="p-4">
                          <p className="text-red-700">{t('errors.invalidIcon', { title: safeAssessment.title })}</p>
                        </div>
                      </Card>
                    );
                  }
                  const is360Feedback = safeAssessment.assessmentType === 'THREE_SIXTY_SELF';
                  
                  console.log(`[DEBUG] Rendering Card for assessment ${index} with key:`, cardKey);
                  
                  return (
                  <Card 
                    key={cardKey} 
                    className="hover:shadow-lg transition-shadow"
                    style={is360Feedback ? { backgroundColor: 'rgb(255, 255, 255)' } : undefined}
                  >
                    <div className="flex items-center sm:flex-row flex-col sm:gap-0 gap-4 justify-between mb-4">
                      <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#e7eeef' }}
                        >
                          <Icon className="text-arise-deep-teal" size={32} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {safeAssessment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {safeAssessment.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {(() => {
                          // CRITICAL: Wrap status badge in try-catch to prevent React error #130
                          try {
                            return getStatusBadge(safeAssessment.status);
                          } catch (err) {
                            console.error('[Assessments] Error rendering status badge:', err);
                            return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">-</span>;
                          }
                        })()}
                        {(() => {
                          // MBTI should not display progress badge, only status
                          if (safeAssessment.assessmentType === 'MBTI') {
                            return null;
                          }
                          
                          // SIMPLIFIED PROGRESS DISPLAY: Show answerCount/totalQuestions if available
                          try {
                            const answerCount = typeof safeAssessment.answerCount === 'number' ? safeAssessment.answerCount : (typeof safeAssessment.answerCount === 'string' ? parseInt(safeAssessment.answerCount, 10) : 0);
                            const totalQuestions = typeof safeAssessment.totalQuestions === 'number' ? safeAssessment.totalQuestions : (typeof safeAssessment.totalQuestions === 'string' ? parseInt(safeAssessment.totalQuestions, 10) : 0);
                            
                            // Only show progress badge if assessment is in progress and we have data
                            if (answerCount > 0 && totalQuestions > 0) {
                              return (
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                  {answerCount}/{totalQuestions}
                                </span>
                              );
                            }
                            return null;
                          } catch (err) {
                            console.error('[Assessments] Error rendering progress:', err);
                            return null;
                          }
                        })()}
                        {getActionButton(safeAssessment)}
                      </div>
                    </div>
                    {/* Progress bar - always visible */}
                    <div className="mt-4">
                      {(() => {
                        // SIMPLIFIED PROGRESS BAR: Use answerCount and totalQuestions directly from backend
                        // For MBTI: show 0% or 100% based on completion status
                        try {
                          // Get safe numeric values
                          const answerCount = typeof safeAssessment.answerCount === 'number' ? safeAssessment.answerCount : (typeof safeAssessment.answerCount === 'string' ? parseInt(safeAssessment.answerCount, 10) : 0);
                          const totalQuestions = typeof safeAssessment.totalQuestions === 'number' ? safeAssessment.totalQuestions : (typeof safeAssessment.totalQuestions === 'string' ? parseInt(safeAssessment.totalQuestions, 10) : 0);
                            
                            let progressValue = answerCount;
                            let progressMax = totalQuestions > 0 ? totalQuestions : 100;
                            let progressPercentage = 0;
                            let progressLabel = t('status.notStarted');
                            let barColor = '#9ca3af';
                            
                            // Special handling for MBTI (external assessment)
                            if (safeAssessment.assessmentType === 'MBTI') {
                              if (safeAssessment.status === 'completed') {
                                progressPercentage = 100;
                                progressLabel = t('status.completed');
                                barColor = '#d8b868';
                              } else {
                                progressPercentage = 0;
                                progressLabel = t('status.notStarted');
                                barColor = '#9ca3af';
                              }
                            } else if (totalQuestions > 0) {
                              // Calculate percentage based on actual data
                              progressPercentage = Math.round((answerCount / totalQuestions) * 100);
                              progressLabel = answerCount === totalQuestions 
                                ? t('status.completed')
                                : t('progress.label', { count: answerCount, total: totalQuestions });
                            } else if (answerCount > 0) {
                              // Fallback: show answer count if total is unknown
                              progressPercentage = Math.min(answerCount * 3, 99); // Estimate ~3% per answer
                              progressLabel = t('progress.responses', { count: answerCount });
                            }
                            
                            // Set bar color: gold when there's progress, gray when 0
                            if (safeAssessment.assessmentType !== 'MBTI') {
                              barColor = answerCount > 0 ? '#d8b868' : '#9ca3af';
                            }
                          
                          return (
                            <div className="w-full">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {typeof progressLabel === 'string' ? progressLabel : String(progressLabel || t('progress.label', { count: 0, total: 0 }))}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {typeof progressPercentage === 'number' ? `${progressPercentage}%` : '0%'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${progressPercentage}%`,
                                    backgroundColor: barColor
                                  }}
                                  role="progressbar"
                                  aria-valuenow={progressValue}
                                  aria-valuemin={0}
                                  aria-valuemax={progressMax}
                                />
                              </div>
                            </div>
                          );
                        } catch (progressError: any) {
                          console.error('[Assessments] Error rendering progress bar:', progressError);
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500">{t('progress.notAvailable')}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    
                    {/* 360 Feedback Contributors Section - integrated in the same Card */}
                    {safeAssessment.assessmentType === 'THREE_SIXTY_SELF' && safeAssessment.assessmentId && (
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <div className="flex flex-col sm:flex-row items-center sm:gap-0 gap-4 justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#e7eeef' }}
                            >
                              <Users className="text-arise-gold" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {t('evaluators.title')}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {t('evaluators.description')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Contributors List */}
                        {(() => {
                          const assessmentContributors = safeAssessment.assessmentId ? evaluators[safeAssessment.assessmentId] || [] : [];
                          if (assessmentContributors.length === 0) {
                            return (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-3">{t('evaluators.noContributors')}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    router.push(`/dashboard/assessments/360-feedback/start?assessmentId=${safeAssessment.assessmentId}`);
                                  }}
                                  className="text-xs"
                                >
                                  Add Contributors
                                </Button>
                              </div>
                            );
                          }
                          
                          const getEvaluatorStatusBadge = (status: string) => {
                            const statusLower = status.toLowerCase();
                            if (statusLower === 'completed') {
                              return (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <CheckCircle size={12} />
                                  {t('evaluators.status.completed')}
                                </div>
                              );
                            } else if (statusLower === 'in_progress' || statusLower === 'started') {
                              return (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  <Clock size={12} />
                                  {t('evaluators.status.inProgress')}
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                  <Mail size={12} />
                                  {t('evaluators.status.invited')}
                                </div>
                              );
                            }
                          };
                          
                          return (
                            <div className="mb-3 space-y-2">
                              {assessmentContributors.map((contributor) => (
                                <div key={contributor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
                                      {getEvaluatorStatusBadge(contributor.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <span>{contributor.email}</span>
                                      {contributor.role && (
                                        <>
                                          <span>•</span>
                                          <span>{ROLE_LABELS[contributor.role] || contributor.role}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        
                        <div className="flex items-center gap-3">
                          {safeAssessment.assessmentId && (
                            <Link href={`/dashboard/evaluators?id=${safeAssessment.assessmentId}`}>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-xs flex flex-row items-center gap-1"
                                style={{ padding: '4px 8px' }}
                              >
                                <Eye size={12} />
                                {t('evaluators.viewAll')}
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="primary"
                            size="sm"
                            className="!bg-arise-gold !text-white hover:!bg-arise-gold/90 text-xs"
                            style={{ backgroundColor: '#d8b868', color: '#000000', padding: '4px 8px' }}
                            onClick={() => setShowEvaluatorModal(true)}
                          >
                            {t('evaluators.add')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                  );
                } catch (renderError: any) {
                  // CRITICAL: Catch ANY rendering error to prevent React error #130
                  console.error('[CRITICAL] ========== ERROR RENDERING ASSESSMENT CARD! ==========');
                  console.error('[CRITICAL] Assessment index:', index);
                  console.error('[CRITICAL] Error:', renderError);
                  console.error('[CRITICAL] Error message:', renderError?.message || String(renderError));
                  console.error('[CRITICAL] Error stack:', renderError?.stack);
                  console.error('[CRITICAL] Original assessment:', assessment);
                  console.error('[CRITICAL] Assessment keys:', Object.keys(assessment));
                  
                  // Check every property for objects (except icon which is a React component)
                  Object.keys(assessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (assessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ PROPERTY "${key}" IN ORIGINAL ASSESSMENT IS AN OBJECT!`, value);
                    }
                  });
                  
                  console.error('[CRITICAL] Assessment details:', {
                    id: assessment.id,
                    idType: typeof assessment.id,
                    title: assessment.title,
                    titleType: typeof assessment.title,
                    answerCount: assessment.answerCount,
                    answerCountType: typeof assessment.answerCount,
                    totalQuestions: assessment.totalQuestions,
                    totalQuestionsType: typeof assessment.totalQuestions,
                    assessmentId: assessment.assessmentId,
                    assessmentIdType: typeof assessment.assessmentId,
                    status: assessment.status,
                    statusType: typeof assessment.status,
                  });
                  console.error('[CRITICAL] =====================================================');
                  
                  // Render a safe fallback card instead of crashing
                  return (
                    <Card key={`error-${index}`} className="border-red-300 bg-red-50">
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          {typeof assessment.title === 'string' ? assessment.title : t('errors.assessmentFallback')}
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                          {t('errors.displayError')}
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            // Clear cache and reload
                            if (typeof window !== 'undefined') {
                              sessionStorage.removeItem('assessments_cache');
                              window.location.reload();
                            }
                          }}
                        >
                          {t('errors.refresh')}
                        </Button>
                      </div>
                    </Card>
                  );
                }
              }))}
            </Stack>
          </MotionDiv>
        </div>
      </div>

      {/* Evaluator Modal */}
      {showEvaluatorModal && (() => {
        const feedback360Assessment = safeAssessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF');
        // CRITICAL: Ensure assessmentId is a number, not an object
        const safeModalAssessmentId = feedback360Assessment?.assessmentId !== undefined && feedback360Assessment?.assessmentId !== null
          ? (typeof feedback360Assessment.assessmentId === 'number' 
              ? feedback360Assessment.assessmentId 
              : typeof feedback360Assessment.assessmentId === 'string'
              ? parseInt(feedback360Assessment.assessmentId, 10)
              : undefined)
          : undefined;
        
        if (!safeModalAssessmentId || isNaN(safeModalAssessmentId)) {
          console.error('[Assessments] Cannot show evaluator modal: invalid assessmentId', {
            assessmentId: feedback360Assessment?.assessmentId,
            type: typeof feedback360Assessment?.assessmentId
          });
          return null;
        }
        return (
          <InviteAdditionalEvaluatorsModal
            key={`evaluator-modal-${safeModalAssessmentId}`}
            isOpen={showEvaluatorModal}
            onClose={() => setShowEvaluatorModal(false)}
            assessmentId={safeModalAssessmentId}
            onSuccess={async () => {
              setShowEvaluatorModal(false);
              // Reload assessments and evaluators
              await loadAssessments();
              // Reload contributors for the 360 assessment
              const feedback360Assessment = safeAssessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF');
              if (feedback360Assessment?.assessmentId) {
                try {
                  const evaluatorsResponse = await get360Evaluators(feedback360Assessment.assessmentId);
                  const evaluatorsList = evaluatorsResponse.evaluators || [];
                  
                  // Save to cache (localStorage for persistence)
                  if (typeof window !== 'undefined') {
                    try {
                      const cacheKey = `contributors_cache_${feedback360Assessment.assessmentId}`;
                      localStorage.setItem(cacheKey, JSON.stringify({
                        data: evaluatorsList,
                        timestamp: Date.now(),
                        assessmentId: feedback360Assessment.assessmentId
                      }));
                    } catch (cacheErr) {
                      console.error('[AssessmentsPage] Error saving cache after invite:', cacheErr);
                    }
                  }
                  
                  setEvaluators(prev => ({
                    ...prev,
                    [feedback360Assessment.assessmentId!]: evaluatorsList
                  }));
                } catch (evaluatorsErr) {
                  console.error('Failed to reload evaluators:', formatError(evaluatorsErr));
                }
              }
            }}
          />
        );
      })()}
    </>
  );
}

export default function AssessmentsPage() {
  return (
    <ErrorBoundary showDetails={false}>
      <AssessmentsContent />
    </ErrorBoundary>
  );
}
