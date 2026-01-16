'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Card, Button, LoadingSkeleton } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { ArrowLeft, CheckCircle, Clock, Mail, User, Plus, Trash2, Copy, RefreshCw, Filter } from 'lucide-react';
import { get360Evaluators, EvaluatorStatus, getMyAssessments, remove360Evaluator } from '@/lib/api/assessments';

// ROLE_LABELS will be translated in the component using useTranslations

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'invited' | 'pending';

function EvaluatorsContent() {
  const t = useTranslations('dashboard.assessments.evaluators.page');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const ROLE_LABELS: Record<string, string> = {
    PEER: t('roles.PEER'),
    MANAGER: t('roles.MANAGER'),
    DIRECT_REPORT: t('roles.DIRECT_REPORT'),
    STAKEHOLDER: t('roles.STAKEHOLDER'),
  };
  
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);
  const [filteredEvaluators, setFilteredEvaluators] = useState<EvaluatorStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load cached evaluators from localStorage (persists across sessions)
  // CRITICAL: Never expire cache automatically - keep it forever until explicitly overwritten
  // This ensures evaluators persist across sessions even if API fails
  const getCachedEvaluators = (assessmentId: number): EvaluatorStatus[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const cacheKey = `evaluators_cache_${assessmentId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cachedData = parsed.data || [];
        if (cachedData.length > 0) {
          console.log('[EvaluatorsPage] ✅ Loaded', cachedData.length, 'evaluators from cache for assessment', assessmentId);
        }
        return cachedData;
      }
          } catch (e: unknown) {
            console.error('[EvaluatorsPage] ❌ Error loading cache:', e);
          }
    return [];
  };

  // Save evaluators to cache (localStorage for persistence across page refreshes)
  const saveEvaluatorsToCache = (assessmentId: number, evaluators: EvaluatorStatus[]) => {
    if (typeof window === 'undefined' || !assessmentId) {
      return;
    }
    
    // CRITICAL: Protect against overwriting cache with empty list
    // If we have existing cache with data, don't overwrite with empty list
    const existingCache = getCachedEvaluators(assessmentId);
    if (existingCache.length > 0 && evaluators.length === 0) {
      console.warn('[EvaluatorsPage] ⚠️ Attempting to save empty list, but cache has', existingCache.length, 'evaluators. Keeping existing cache.');
      return;
    }
    
    const cacheKey = `evaluators_cache_${assessmentId}`;
    const cacheData = {
      data: evaluators,
      timestamp: Date.now(),
      assessmentId: assessmentId,
      count: evaluators.length
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      if (evaluators.length > 0) {
        console.log('[EvaluatorsPage] 💾 Saved', evaluators.length, 'evaluators to cache for assessment', assessmentId);
      }
    } catch (e) {
      console.error('[EvaluatorsPage] Error saving cache:', e);
      // If localStorage is full, try to clear old caches
      try {
        const keys = Object.keys(localStorage);
        const evaluatorCacheKeys = keys.filter(k => k.startsWith('evaluators_cache_'));
        // Remove oldest caches if we have more than 5
        if (evaluatorCacheKeys.length > 5) {
          const cacheEntries = evaluatorCacheKeys.map(key => {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              return { key, timestamp: data.timestamp || 0 };
            } catch {
              return { key, timestamp: 0 };
            }
          }).sort((a, b) => a.timestamp - b.timestamp);
          
          const toRemove = cacheEntries.slice(0, cacheEntries.length - 5);
          toRemove.forEach(entry => localStorage.removeItem(entry.key));
        }
        // Retry saving
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (retryError) {
        console.error('[EvaluatorsPage] ❌ Failed to save cache after cleanup:', retryError);
      }
    }
  };

  const loadEvaluators = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
      }

      // Get assessment ID from URL params or state
      let id: number | null = assessmentId || (searchParams?.get('id') ? parseInt(searchParams.get('id')!) : null);
      
      if (!id) {
        try {
          const allAssessments = await getMyAssessments();
          const assessments = allAssessments.filter(
            (a) => {
              const type = String(a.assessment_type).toLowerCase();
              return type !== 'three_sixty_evaluator' && type !== '360_evaluator';
            }
          );
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (!feedback360Assessment) {
            // Try to get assessment ID from cache if API fails
            const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
            if (cacheKeys.length > 0) {
              const cacheKey = cacheKeys[0];
              if (cacheKey) {
                const cachedId = parseInt(cacheKey.replace('evaluators_cache_', ''));
                if (!isNaN(cachedId)) {
                  id = cachedId;
                }
              }
            }
            if (!id) {
              if (!silent) {
                setError(t('errors.noAssessment'));
                setIsLoading(false);
              }
              return;
            }
          } else {
            id = feedback360Assessment.id;
          }
        } catch (assessmentErr) {
          // If getMyAssessments fails (e.g., 401), try to get ID from cache
          const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
          if (cacheKeys.length > 0) {
            const cacheKey = cacheKeys[0];
            if (cacheKey) {
              const cachedId = parseInt(cacheKey.replace('evaluators_cache_', ''));
              if (!isNaN(cachedId)) {
                id = cachedId;
              }
            }
          }
          if (!id) {
            if (!silent) {
              setError(t('errors.sessionExpired'));
              setIsLoading(false);
            }
            return;
          }
        }
      }

      // Always update assessmentId (needed for polling)
      setAssessmentId(id);
      
      // CRITICAL: Always load from cache FIRST, before any API call
      // This ensures evaluators are visible even if API fails (401, network error, etc.)
      if (id) {
        const cachedEvaluators = getCachedEvaluators(id);
        if (cachedEvaluators.length > 0) {
          setEvaluators(cachedEvaluators);
          if (!silent) {
            setIsLoading(false);
          }
        }
      }
      
      // Try to load fresh data from API (but don't block if it fails)
      try {
        const response = await get360Evaluators(id);
        const evaluatorsList = response.evaluators || [];
        
        // CRITICAL: Only proceed if we got data from API
        if (evaluatorsList.length === 0) {
          // API returned empty - use cache if available
          const cachedEvaluators = getCachedEvaluators(id);
          if (cachedEvaluators.length > 0) {
            setEvaluators(cachedEvaluators);
            if (!silent) {
              setIsLoading(false);
            }
            return; // Use cache, don't save empty list
          } else {
            setEvaluators([]);
            if (!silent) {
              setIsLoading(false);
            }
            return;
          }
        }
        
        // CRITICAL: Always save to cache after successful API load with data
        if (id && evaluatorsList.length > 0) {
          saveEvaluatorsToCache(id, evaluatorsList);
        }
        
        // Update state with fresh data from API
        setEvaluators(evaluatorsList);
      } catch (apiErr: any) {
        // CRITICAL: If API fails, ALWAYS use cache as fallback
        if (id) {
          const cachedEvaluators = getCachedEvaluators(id);
          if (cachedEvaluators.length > 0) {
            setEvaluators(cachedEvaluators);
            if (!silent) {
              setIsLoading(false);
              const is401 = apiErr?.response?.status === 401 || apiErr?.message?.includes('401') || apiErr?.message?.includes('Unauthorized');
              if (is401) {
                setError(t('errors.sessionExpiredCached'));
                setTimeout(() => setError(null), 5000);
              }
            }
            return; // Use cache, don't throw error
          }
        }
        
        // If no cache and API fails, show error but don't block
        if (!silent) {
          setIsLoading(false);
          setError(t('errors.unableToLoad'));
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('[EvaluatorsPage] Failed to load evaluators:', err);
      if (!silent) {
        setIsLoading(false);
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError(t('errors.noAssessment'));
          } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            // For 401, try to use cache
            const currentId = assessmentId || (searchParams?.get('id') ? parseInt(searchParams.get('id')!) : null);
            if (currentId) {
              const cachedEvaluators = getCachedEvaluators(currentId);
              if (cachedEvaluators.length > 0) {
                setEvaluators(cachedEvaluators);
                setError(t('errors.sessionExpiredCached'));
                setTimeout(() => setError(null), 5000);
                return;
              }
            }
            setError(t('errors.sessionExpired'));
          } else {
            setError(t('errors.failedToLoad', { message: err.message || 'Unknown error' }));
          }
        } else {
          setError(t('errors.failedToLoadGeneric'));
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [assessmentId, searchParams]);

  // Load from cache on initial mount - CRITICAL: This runs FIRST, before any API calls
  // This ensures evaluators are visible instantly, even before API calls
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    console.log('[EvaluatorsPage] 🚀 INITIAL MOUNT - Loading cache');
    
    // Get ID from URL params (searchParams is now available in useEffect)
    const idParam = searchParams?.get('id');
    let id: number | null = idParam ? parseInt(idParam) : null;
    
    // If no ID in URL, try to get from cache (search ALL cache entries)
    if (!id) {
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
      if (cacheKeys.length > 0) {
        // Get the most recent cache entry with data
        const cacheEntries = cacheKeys.map(key => {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              const entryId = parsed.assessmentId || parseInt(key.replace('evaluators_cache_', ''));
              const entryData = parsed.data || [];
              return { 
                key, 
                id: entryId, 
                timestamp: parsed.timestamp || 0,
                data: entryData,
                dataLength: entryData.length
              };
            }
          } catch (e: unknown) {
            console.error('[EvaluatorsPage] Error parsing cache key', key, e);
          }
          return null;
            }).filter((e): e is { key: string; id: number; timestamp: number; data: EvaluatorStatus[]; dataLength: number } => e !== null && !isNaN(e!.id));
        
        if (cacheEntries.length > 0) {
          // Sort by timestamp (most recent first) and get the first one with data
          cacheEntries.sort((a, b) => b.timestamp - a.timestamp);
          const firstEntry = cacheEntries.find(e => e.dataLength > 0) || cacheEntries[0];
          if (firstEntry) {
            id = firstEntry.id;
            console.log('[EvaluatorsPage] ✅ Found assessment ID from cache:', id, 'with', firstEntry.dataLength, 'evaluators');
          }
        }
      }
    }
    
    // Load from cache if we have an ID
    if (id) {
      const cachedEvaluators = getCachedEvaluators(id);
      if (cachedEvaluators.length > 0) {
        console.log('[EvaluatorsPage] ✅ Loading from cache:', cachedEvaluators.length, 'evaluators for assessment', id);
        setEvaluators(cachedEvaluators);
        setAssessmentId(id);
        setIsLoading(false);
        
        // Update URL if needed
        if (idParam !== String(id)) {
          router.replace(`/dashboard/evaluators?id=${id}`, { scroll: false });
        }
      } else {
        console.log('[EvaluatorsPage] ⚠️ No cached evaluators found for assessment', id);
        setAssessmentId(id);
        setIsLoading(false);
      }
    } else {
      console.log('[EvaluatorsPage] ⚠️ No assessment ID found - will try API');
      setIsLoading(false);
    }
    
    // Now try to load from API in background (async)
    const loadFromAPI = async () => {
      // If we don't have an ID yet, try to get it from API
      let currentId = id;
      if (!currentId) {
        try {
          const allAssessments = await getMyAssessments();
          const assessments = allAssessments.filter(
            (a) => {
              const type = String(a.assessment_type).toLowerCase();
              return type !== 'three_sixty_evaluator' && type !== '360_evaluator';
            }
          );
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (feedback360Assessment) {
            currentId = feedback360Assessment.id;
            console.log('[EvaluatorsPage] Found assessment ID from API:', currentId);
            setAssessmentId(currentId);
          }
        } catch (apiErr) {
          console.warn('[EvaluatorsPage] API failed to get assessment ID:', apiErr);
          return;
        }
      }
      
      // If we have an ID, try to refresh from API
      if (currentId) {
        // Small delay to let UI render with cache first
        setTimeout(() => {
          loadEvaluators(true); // Silent refresh
        }, 500);
      } else {
        // No ID found anywhere, try full load
        loadEvaluators();
      }
    };
    
    loadFromAPI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('id')]); // Only reload when id param changes

  // CRITICAL: Auto-save cache whenever evaluators change
  // This ensures cache is always up-to-date, even if API fails
  useEffect(() => {
    if (assessmentId && evaluators.length > 0) {
      saveEvaluatorsToCache(assessmentId, evaluators);
    }
  }, [evaluators, assessmentId]);

  useEffect(() => {
    console.log('[EvaluatorsPage] 🔄 filterEvaluators triggered. evaluators:', evaluators.length, 'statusFilter:', statusFilter);
    filterEvaluators();
  }, [evaluators, statusFilter]);

  // Auto-refresh evaluators status every 10 seconds
  // Always poll to ensure completed evaluators are visible
  useEffect(() => {
    if (!assessmentId || isLoading) {
      return;
    }

    const refreshEvaluators = async () => {
      try {
        await loadEvaluators(true); // Silent refresh - don't show loading state
      } catch (err) {
        // Even if refresh fails, cache should still be available
        const cachedEvaluators = getCachedEvaluators(assessmentId);
        if (cachedEvaluators.length > 0) {
          setEvaluators(cachedEvaluators);
        }
      }
    };

    // Initial refresh after a short delay
    const initialTimeout = setTimeout(() => {
      refreshEvaluators();
    }, 2000);

    // Poll every 10 seconds
    const interval = setInterval(() => {
      refreshEvaluators();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [assessmentId, isLoading, loadEvaluators]);

  const filterEvaluators = () => {
    console.log('[EvaluatorsPage] Filtering evaluators. Total:', evaluators.length, 'Filter:', statusFilter);
    if (statusFilter === 'all') {
      console.log('[EvaluatorsPage] Showing all evaluators:', evaluators.length);
      setFilteredEvaluators(evaluators);
      return;
    }

    const filtered = evaluators.filter((e) => {
      const statusLower = e.status?.toLowerCase() || '';
      const matches = (() => {
        switch (statusFilter) {
          case 'completed':
            return statusLower === 'completed';
          case 'in_progress':
            return statusLower === 'in_progress' || statusLower === 'started';
          case 'invited':
            return statusLower === 'invited' || statusLower === 'not_started';
          case 'pending':
            return statusLower === 'pending' || statusLower === 'not_started' || statusLower === 'invited';
          default:
            return true;
        }
      })();
      if (matches) {
        console.log('[EvaluatorsPage] Evaluator matches filter:', e.name, 'status:', e.status);
      }
      return matches;
    });
    console.log('[EvaluatorsPage] Filtered evaluators:', filtered.length);
    setFilteredEvaluators(filtered);
  };

  const handleDelete = async (evaluatorId: number, evaluatorName: string) => {
    if (!assessmentId) return;
    
    const confirmed = window.confirm(
      t('messages.deleteConfirm', { name: evaluatorName })
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(evaluatorId);
      await remove360Evaluator(assessmentId, evaluatorId);
      setSuccessMessage(t('messages.deleteSuccess', { name: evaluatorName }));
      await loadEvaluators();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to delete evaluator:', err);
      setError(t('errors.failedToDelete'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const copyInvitationLink = async (token: string) => {
    try {
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/360-evaluator/${token}`;
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedToken(token);
      setSuccessMessage(t('messages.linkCopied'));
      setTimeout(() => {
        setCopiedToken(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError(t('errors.failedToCopy'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'completed') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          {t('status.completed')}
        </div>
      );
    } else if (statusLower === 'in_progress' || statusLower === 'started') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          {t('status.inProgress')}
        </div>
      );
    } else if (statusLower === 'invited' || statusLower === 'not_started') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Mail size={16} />
          {t('status.invitationPending')}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          {t('status.pending')}
        </div>
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      // Convert to Montreal timezone (America/Montreal)
      return new Date(dateString).toLocaleString(locale, {
        timeZone: 'America/Montreal',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeElapsed = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes <= 1 ? t('time.lessThanMinute') : t('time.minutesAgo', { minutes: diffMinutes });
        }
        return t('time.hoursAgo', { hours: diffHours, plural: diffHours > 1 ? 's' : '' });
      }
      return t('time.daysAgo', { days: diffDays, plural: diffDays > 1 ? 's' : '' });
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="custom" className="h-10 w-64 mb-8" />
        <LoadingSkeleton variant="card" className="h-48 mb-4" />
        <LoadingSkeleton variant="card" className="h-48 mb-4" />
      </div>
    );
  }

  if (error && !evaluators.length) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => loadEvaluators()}>
              {t('errors.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const completedCount = evaluators.filter(
    (e) => e.status?.toLowerCase() === 'completed'
  ).length;
  const inProgressCount = evaluators.filter(
    (e) => {
      const status = e.status?.toLowerCase() || '';
      return status === 'in_progress' || status === 'started';
    }
  ).length;
  const invitedCount = evaluators.filter(
    (e) => {
      const status = e.status?.toLowerCase() || '';
      return status === 'invited' || status === 'not_started';
    }
  ).length;
  const pendingCount = evaluators.length - completedCount - inProgressCount - invitedCount;

  return (
    <>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white text-xs"
              style={{ border: 'none', color: '#FFFFFF', padding: '4px 8px' }}
            >
              <ArrowLeft size={14} />
              {t('back')}
            </Button>
            <Button
              variant="outline"
              onClick={() => loadEvaluators()}
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white disabled:text-white/50 text-xs"
              style={{ border: 'none', color: '#FFFFFF', padding: '4px 8px' }}
              disabled={isLoading}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              {t('refresh')}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">{t('title')} </span>
                <span style={{ color: '#D5B667' }}>{t('titleHighlight')}</span>
              </h1>
              <p className="text-white text-lg">
                {t('description')}
              </p>
            </div>
            {assessmentId && (
              <Button
                variant="arise-primary"
                className="font-semibold flex flex-row items-center gap-2"
                onClick={() => setShowEvaluatorModal(true)}
                style={{ width: 'fit-content' }}
              >
                <Plus size={16} style={{ marginRight: '4px' }} />
                {t('addEvaluators')}
              </Button>
            )}
          </div>
        </div>
      </MotionDiv>

      {/* Success/Error Messages */}
      {successMessage && (
        <MotionDiv variant="fade" duration="fast">
          <Card className="mb-4 p-4 bg-success-50 border-success-200">
            <p className="text-success-800 text-sm">{successMessage}</p>
          </Card>
        </MotionDiv>
      )}
      {error && (
        <MotionDiv variant="fade" duration="fast">
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        </MotionDiv>
      )}

      {/* Summary Card */}
      <MotionDiv variant="slideUp" delay={100}>
        <Card className="mb-8" style={{ backgroundColor: '#D5DEE0' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {evaluators.length}
              </div>
              <div className="text-sm text-gray-600">{t('summary.total')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-gray-600">{t('summary.completed')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {inProgressCount}
              </div>
              <div className="text-sm text-gray-600">{t('summary.inProgress')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {invitedCount + pendingCount}
              </div>
              <div className="text-sm text-gray-600">{t('summary.pending')}</div>
            </div>
          </div>
        </Card>
      </MotionDiv>

      {/* Filters */}
      {evaluators.length > 0 && (
        <MotionDiv variant="slideUp" delay={150}>
          <Card className="mb-6 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t('filters.title')}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'completed', 'in_progress', 'invited', 'pending'] as StatusFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(filter)}
                    className="text-xs"
                  >
                    {filter === 'all' && t('filters.all')}
                    {filter === 'completed' && t('filters.completed')}
                    {filter === 'in_progress' && t('filters.inProgress')}
                    {filter === 'invited' && t('filters.invited')}
                    {filter === 'pending' && t('filters.pending')}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </MotionDiv>
      )}

      {/* Evaluators List */}
      <MotionDiv variant="slideUp" delay={200}>
        <div className="space-y-4">
          {filteredEvaluators.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-4 text-lg">
                  {evaluators.length === 0 
                    ? t('empty.noEvaluators')
                    : t('empty.noMatch')}
                </p>
                {evaluators.length === 0 && (
                  <div className="space-y-3 flex-col flex align-center justify-center">
                    <p className="text-gray-500 text-sm mb-4">
                      {t('empty.description')}
                    </p>
                    {assessmentId && (
                      <Button
                        variant="primary"
                        onClick={() => setShowEvaluatorModal(true)}
                        className="font-semibold flex flex-row items-center gap-2"
                      >
                        <Plus size={20} />
                        {t('addEvaluators')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            filteredEvaluators.map((evaluator) => {
              const isCompleted = evaluator.status?.toLowerCase() === 'completed';
              const canDelete = !isCompleted;
              
              return (
                <Card key={evaluator.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e7eeef' }}
                      >
                        <User className="text-arise-deep-teal" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {evaluator.name}
                        </h3>
                        <p className="text-sm text-gray-900 mb-2">
                          {evaluator.email}
                        </p>
                        {evaluator.role && (
                          <p className="text-xs text-gray-500 mb-3">
                            {t('evaluator.relationship')} {ROLE_LABELS[evaluator.role] || evaluator.role}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                          {evaluator.invitation_sent_at && (
                            <div>
                              <span className="font-medium">{t('evaluator.invited')}</span>{' '}
                              {formatDate(evaluator.invitation_sent_at)}
                              {getTimeElapsed(evaluator.invitation_sent_at) && (
                                <span className="text-gray-400 ml-1">
                                  ({getTimeElapsed(evaluator.invitation_sent_at)})
                                </span>
                              )}
                            </div>
                          )}
                          {evaluator.invitation_opened_at && (
                            <div>
                              <span className="font-medium">{t('evaluator.opened')}</span>{' '}
                              {formatDate(evaluator.invitation_opened_at)}
                            </div>
                          )}
                          {evaluator.started_at && (
                            <div>
                              <span className="font-medium">{t('evaluator.started')}</span>{' '}
                              {formatDate(evaluator.started_at)}
                            </div>
                          )}
                          {evaluator.completed_at && (
                            <div>
                              <span className="font-medium">{t('evaluator.completed')}</span>{' '}
                              {formatDate(evaluator.completed_at)}
                            </div>
                          )}
                        </div>
                        {evaluator.invitation_token && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyInvitationLink(evaluator.invitation_token)}
                              className="text-xs flex flex-row items-center gap-2"
                            >
                              <Copy size={14} />
                              {copiedToken === evaluator.invitation_token ? t('evaluator.copied') : t('evaluator.copyLink')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(evaluator.status)}
                      {canDelete && assessmentId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(evaluator.id, evaluator.name)}
                          disabled={deletingId === evaluator.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === evaluator.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </MotionDiv>

      {/* Invite Evaluators Modal */}
      {showEvaluatorModal && assessmentId && (
        <InviteAdditionalEvaluatorsModal
          isOpen={showEvaluatorModal}
          onClose={() => setShowEvaluatorModal(false)}
          assessmentId={assessmentId}
          onSuccess={async () => {
            // Close modal first
            setShowEvaluatorModal(false);
            
            // Reload evaluators to show the newly added ones
            try {
              // Force reload from API to get the new evaluators
              if (assessmentId) {
                const response = await get360Evaluators(assessmentId);
                const evaluatorsList = response.evaluators || [];
                
                // Save to cache
                if (evaluatorsList.length > 0) {
                  saveEvaluatorsToCache(assessmentId, evaluatorsList);
                }
                
                // Update state
                setEvaluators(evaluatorsList);
              }
            } catch (err) {
              console.error('[EvaluatorsPage] Error reloading evaluators after add:', err);
              // Even if API fails, try to reload from cache
              if (assessmentId) {
                const cachedEvaluators = getCachedEvaluators(assessmentId);
                if (cachedEvaluators.length > 0) {
                  setEvaluators(cachedEvaluators);
                }
              }
            }
            
            // Set filter to all to show all evaluators including newly added
            setStatusFilter('all');
            setSuccessMessage(t('messages.addSuccess'));
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}
    </>
  );
}

export default function EvaluatorsPage() {
  return (
    <ErrorBoundary>
      <EvaluatorsContent />
    </ErrorBoundary>
  );
}
