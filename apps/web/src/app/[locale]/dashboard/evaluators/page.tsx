'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, LoadingSkeleton } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { ArrowLeft, CheckCircle, Clock, Mail, User, Plus, Trash2, Copy, RefreshCw, Filter } from 'lucide-react';
import { get360Evaluators, EvaluatorStatus, getMyAssessments, remove360Evaluator } from '@/lib/api/assessments';

const ROLE_LABELS: Record<string, string> = {
  PEER: 'Pair / Collègue',
  MANAGER: 'Manager / Supérieur',
  DIRECT_REPORT: 'Rapport direct / Collaborateur',
  STAKEHOLDER: 'Partie prenante / Client',
};

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'invited' | 'pending';

function EvaluatorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const getCachedEvaluators = (assessmentId: number): EvaluatorStatus[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cacheKey = `evaluators_cache_${assessmentId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is recent (less than 24 hours old) - longer persistence
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          const cachedData = parsed.data || [];
          console.log('[EvaluatorsPage] Loaded evaluators from cache:', cachedData.length, 'evaluators');
          return cachedData;
        } else {
          // Cache expired, clear it
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.error('[EvaluatorsPage] Error loading cache:', e);
      // Clear corrupted cache
      try {
        const cacheKey = `evaluators_cache_${assessmentId}`;
        localStorage.removeItem(cacheKey);
      } catch (clearError) {
        // Ignore clear errors
      }
    }
    return [];
  };

  // Save evaluators to cache (localStorage for persistence across page refreshes)
  const saveEvaluatorsToCache = (assessmentId: number, evaluators: EvaluatorStatus[]) => {
    if (typeof window === 'undefined' || !assessmentId) {
      console.warn('[EvaluatorsPage] Cannot save cache - window undefined or no assessmentId');
      return;
    }
    
    // Declare variables outside try-catch so they're accessible in catch block
    const cacheKey = `evaluators_cache_${assessmentId}`;
    const cacheData = {
      data: evaluators,
      timestamp: Date.now(),
      assessmentId: assessmentId,
      count: evaluators.length
    };
    
    try {
      const serialized = JSON.stringify(cacheData);
      localStorage.setItem(cacheKey, serialized);
      console.log('[EvaluatorsPage] ✅ Saved evaluators to cache:', evaluators.length, 'evaluators for assessment', assessmentId);
      
      // Verify it was saved
      const verify = localStorage.getItem(cacheKey);
      if (verify) {
        try {
          const parsed = JSON.parse(verify);
          console.log('[EvaluatorsPage] ✅ Cache verification - saved', parsed.count || parsed.data?.length || 0, 'evaluators');
        } catch (parseErr) {
          console.error('[EvaluatorsPage] ❌ Cache verification failed - cannot parse:', parseErr);
        }
      } else {
        console.error('[EvaluatorsPage] ❌ Cache verification failed - data not found after save!');
      }
    } catch (e) {
      console.error('[EvaluatorsPage] Error saving cache:', e);
      // If localStorage is full, try to clear old caches
      try {
        const keys = Object.keys(localStorage);
        const evaluatorCacheKeys = keys.filter(k => k.startsWith('evaluators_cache_'));
        console.log('[EvaluatorsPage] Found', evaluatorCacheKeys.length, 'existing cache entries');
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
          
          // Remove oldest entries
          const toRemove = cacheEntries.slice(0, cacheEntries.length - 5);
          toRemove.forEach(entry => localStorage.removeItem(entry.key));
          console.log('[EvaluatorsPage] Cleaned up', toRemove.length, 'old cache entries');
        }
        // Retry saving
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('[EvaluatorsPage] ✅ Retry save successful');
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

      // Get assessment ID from URL params or find it from assessments
      // Read searchParams directly (not in dependencies to avoid infinite loops)
      const currentParams = searchParams;
      let id: number | null = currentParams?.get('id') ? parseInt(currentParams.get('id')!) : null;
      
      if (!id) {
        const allAssessments = await getMyAssessments();
        // Filter out evaluator assessments (360_evaluator) - these shouldn't appear in user's list
        const assessments = allAssessments.filter(
          (a) => a.assessment_type !== 'THREE_SIXTY_EVALUATOR' && a.assessment_type !== '360_evaluator'
        );
        console.log('[EvaluatorsPage] Assessments loaded:', assessments);
        const feedback360Assessment = assessments.find(
          (a) => a.assessment_type === 'THREE_SIXTY_SELF'
        );
        if (!feedback360Assessment) {
          if (!silent) {
            setError('Aucun assessment de feedback 360° trouvé. Veuillez d\'abord démarrer un assessment 360° depuis la page Assessments.');
            setIsLoading(false);
          }
          return;
        }
        id = feedback360Assessment.id;
        console.log('[EvaluatorsPage] Found 360 assessment ID:', id);
      }

      // Always update assessmentId (needed for polling)
      setAssessmentId(id);
      
      // Try to load from cache first for instant display (only on initial load, not silent refresh)
      if (!silent && id) {
        const cachedEvaluators = getCachedEvaluators(id);
        if (cachedEvaluators.length > 0) {
          console.log('[EvaluatorsPage] Using cached evaluators for instant display:', cachedEvaluators.length);
          setEvaluators(cachedEvaluators);
          setIsLoading(false);
          // Still load fresh data in background
        }
      }
      
      console.log('[EvaluatorsPage] Loading evaluators for assessment ID:', id);
      const response = await get360Evaluators(id);
      console.log('[EvaluatorsPage] Evaluators response:', response);
      const evaluatorsList = response.evaluators || [];
      console.log('[EvaluatorsPage] Evaluators list:', evaluatorsList.length, 'evaluators');
      console.log('[EvaluatorsPage] Evaluators statuses:', evaluatorsList.map(e => ({ id: e.id, name: e.name, status: e.status })));
      
      // CRITICAL: Always save to cache after loading
      // Only save if we got data, otherwise keep existing cache to prevent overwriting with empty list
      if (id) {
        if (evaluatorsList.length > 0) {
          console.log('[EvaluatorsPage] Saving to cache:', evaluatorsList.length, 'evaluators for assessment', id);
          saveEvaluatorsToCache(id, evaluatorsList);
          // Verify cache was saved
          const verifyCache = getCachedEvaluators(id);
          console.log('[EvaluatorsPage] Cache verification - loaded from cache:', verifyCache.length, 'evaluators');
        } else {
          // If API returned empty list, check if we have cached data
          const cachedEvaluators = getCachedEvaluators(id);
          if (cachedEvaluators.length > 0) {
            console.warn('[EvaluatorsPage] API returned empty list but cache has', cachedEvaluators.length, 'evaluators. Keeping cache.');
            // Don't overwrite cache with empty list, but still update state with empty (user will see empty)
            // Actually, let's use cached data if API returns empty
            setEvaluators(cachedEvaluators);
            return; // Don't continue, use cached data
          } else {
            console.log('[EvaluatorsPage] API returned empty list and no cache. Saving empty list to cache.');
            saveEvaluatorsToCache(id, evaluatorsList);
          }
        }
      }
      
      // Update state with fresh data
      console.log('[EvaluatorsPage] Setting evaluators state:', evaluatorsList.length);
      setEvaluators(evaluatorsList);
    } catch (err) {
      console.error('[EvaluatorsPage] Failed to load evaluators:', err);
      if (err instanceof Error) {
        console.error('[EvaluatorsPage] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        // Check for 404 error (assessment not found)
        if (err.message.includes('404') || err.message.includes('not found')) {
          if (!silent) {
            setError('Assessment 360° non trouvé. Veuillez d\'abord démarrer un assessment 360° depuis la page Assessments.');
          }
        } else {
          if (!silent) {
            setError(`Échec du chargement des évaluateurs: ${err.message}`);
          }
        }
      } else {
        if (!silent) {
          setError('Échec du chargement des évaluateurs. Veuillez réessayer.');
        }
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - searchParams is read directly in the function

  // Load from cache on initial mount if available
  useEffect(() => {
    const loadFromCache = async () => {
      try {
        // Get assessment ID from URL params or find it from assessments
        const currentParams = searchParams;
        let id: number | null = currentParams?.get('id') ? parseInt(currentParams.get('id')!) : null;
        
        if (!id) {
          const allAssessments = await getMyAssessments();
          // Filter out evaluator assessments (360_evaluator) - these shouldn't appear in user's list
          const assessments = allAssessments.filter(
            (a) => a.assessment_type !== 'THREE_SIXTY_EVALUATOR' && a.assessment_type !== '360_evaluator'
          );
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (feedback360Assessment) {
            id = feedback360Assessment.id;
          }
        }
        
        if (id) {
          const cachedEvaluators = getCachedEvaluators(id);
          console.log('[EvaluatorsPage] Cache check on mount - found', cachedEvaluators.length, 'cached evaluators for assessment', id);
          if (cachedEvaluators.length > 0) {
            console.log('[EvaluatorsPage] Loading from cache on mount:', cachedEvaluators.length, 'evaluators');
            setEvaluators(cachedEvaluators);
            setAssessmentId(id);
            setIsLoading(false); // Don't show loading since we have cached data
            // Still load fresh data in background but silently
            setTimeout(() => {
              console.log('[EvaluatorsPage] Starting background refresh after cache load');
              loadEvaluators(true);
            }, 100); // Small delay to let UI render first
            return;
          } else {
            console.log('[EvaluatorsPage] No cached evaluators found for assessment', id, '- will load from API');
          }
        } else {
          console.log('[EvaluatorsPage] No assessment ID found - cannot load from cache');
        }
      } catch (err) {
        console.error('[EvaluatorsPage] Error loading from cache:', err);
      }
      // If no cache, load normally
      loadEvaluators();
    };
    
    loadFromCache();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('id')]); // Only reload when id param changes

  useEffect(() => {
    filterEvaluators();
  }, [evaluators, statusFilter]);

  // Auto-refresh evaluators status every 10 seconds
  // Always poll to ensure completed evaluators are visible
  useEffect(() => {
    if (!assessmentId || isLoading) {
      return;
    }

    // Always poll to refresh status, even if all are completed (to show completed evaluators)
    const refreshEvaluators = async () => {
      try {
        await loadEvaluators(true); // Silent refresh - don't show loading state
        // Cache is automatically saved in loadEvaluators
      } catch (err) {
        console.error('[EvaluatorsPage] Error in background refresh:', err);
      }
    };

    // Initial refresh after a short delay to ensure data is loaded
    const initialTimeout = setTimeout(() => {
      refreshEvaluators();
    }, 2000); // 2 seconds after assessmentId is set

    // Poll every 10 seconds to check for status updates (silent refresh)
    const interval = setInterval(() => {
      refreshEvaluators();
    }, 10000); // 10 seconds

    // Cleanup interval and timeout on unmount or when dependencies change
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, isLoading]); // Only depend on assessmentId and isLoading to avoid infinite loop

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
      `Êtes-vous sûr de vouloir supprimer l'évaluateur "${evaluatorName}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(evaluatorId);
      await remove360Evaluator(assessmentId, evaluatorId);
      setSuccessMessage(`L'évaluateur "${evaluatorName}" a été supprimé avec succès`);
      await loadEvaluators();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to delete evaluator:', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec de la suppression de l\'évaluateur';
      setError(errorMessage);
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
      setSuccessMessage('Lien d\'invitation copié dans le presse-papiers');
      setTimeout(() => {
        setCopiedToken(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError('Échec de la copie du lien');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'completed') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          Test réalisé
        </div>
      );
    } else if (statusLower === 'in_progress' || statusLower === 'started') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          En cours
        </div>
      );
    } else if (statusLower === 'invited' || statusLower === 'not_started') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Mail size={16} />
          Invitation en attente
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          En attente
        </div>
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
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
          return diffMinutes <= 1 ? 'Il y a moins d\'une minute' : `Il y a ${diffMinutes} minutes`;
        }
        return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
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
              Réessayer
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
              className="flex items-center gap-2 text-white border-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
              Retour
            </Button>
            <Button
              variant="outline"
              onClick={() => loadEvaluators()}
              className="flex items-center gap-2 text-white border-white hover:bg-white/10 hover:text-white disabled:text-white/50 disabled:border-white/50"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Mes </span>
                <span style={{ color: '#D5B667' }}>Évaluateurs</span>
              </h1>
              <p className="text-white text-lg">
                Visualisez et gérez vos évaluateurs de feedback 360°
              </p>
            </div>
            {assessmentId && (
              <Button
                variant="arise-primary"
                className="font-semibold flex flex-row items-center gap-2"
                onClick={() => setShowEvaluatorModal(true)}
              >
                <Plus size={20} />
                Ajouter des évaluateurs
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
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {inProgressCount}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {invitedCount + pendingCount}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
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
                <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
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
                    {filter === 'all' && 'Tous'}
                    {filter === 'completed' && 'Terminés'}
                    {filter === 'in_progress' && 'En cours'}
                    {filter === 'invited' && 'Invités'}
                    {filter === 'pending' && 'Invitation en attente'}
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
                    ? 'Aucun évaluateur ajouté pour le moment.' 
                    : 'Aucun évaluateur ne correspond au filtre sélectionné.'}
                </p>
                {evaluators.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-sm mb-4">
                      Pour recevoir des retours sur votre leadership, ajoutez des évaluateurs qui vous connaissent professionnellement (collègues, managers, collaborateurs directs, etc.).
                    </p>
                    {assessmentId && (
                      <Button
                        variant="primary"
                        onClick={() => setShowEvaluatorModal(true)}
                        className="font-semibold flex flex-row items-center gap-2"
                      >
                        <Plus size={20} />
                        Ajouter des évaluateurs
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
                            Relation: {ROLE_LABELS[evaluator.role] || evaluator.role}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                          {evaluator.invitation_sent_at && (
                            <div>
                              <span className="font-medium">Invité:</span>{' '}
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
                              <span className="font-medium">Ouvert:</span>{' '}
                              {formatDate(evaluator.invitation_opened_at)}
                            </div>
                          )}
                          {evaluator.started_at && (
                            <div>
                              <span className="font-medium">Commencé:</span>{' '}
                              {formatDate(evaluator.started_at)}
                            </div>
                          )}
                          {evaluator.completed_at && (
                            <div>
                              <span className="font-medium">Terminé:</span>{' '}
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
                              className="text-xs"
                            >
                              <Copy size={14} className="mr-1" />
                              {copiedToken === evaluator.invitation_token ? 'Copié!' : 'Copier le lien'}
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
            // Immediately reload evaluators to show the newly added ones
            await loadEvaluators(false); // false = silent reload to avoid showing loading state
            // Set filter to all to show all evaluators including newly added
            setStatusFilter('all');
            setSuccessMessage('Les évaluateurs ont été ajoutés avec succès et apparaissent dans la liste');
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
