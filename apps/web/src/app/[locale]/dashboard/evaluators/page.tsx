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
          console.log('[EvaluatorsPage] ✅ Loaded evaluators from cache:', cachedData.length, 'evaluators for assessment', assessmentId);
          
          // Log completed evaluators in cache
          const completedInCache = cachedData.filter((e: EvaluatorStatus) => e.status?.toLowerCase() === 'completed');
          if (completedInCache.length > 0) {
            console.log('[EvaluatorsPage] ✅ Cache includes', completedInCache.length, 'completed evaluator(s):', completedInCache.map((e: EvaluatorStatus) => e.name));
          }
          
          return cachedData;
        } else {
          // Cache expired, clear it
          console.log('[EvaluatorsPage] Cache expired for assessment', assessmentId, '- clearing');
          localStorage.removeItem(cacheKey);
        }
      } else {
        console.log('[EvaluatorsPage] No cache found for assessment', assessmentId);
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
    
    // CRITICAL: Protect against overwriting cache with empty list
    // If we have existing cache with data, don't overwrite with empty list
    // This prevents losing evaluators when API returns empty (which shouldn't happen, but just in case)
    const existingCache = getCachedEvaluators(assessmentId);
    if (existingCache.length > 0 && evaluators.length === 0) {
      console.warn('[EvaluatorsPage] ⚠️ WARNING: Attempting to save empty list, but cache has', existingCache.length, 'evaluators. Keeping existing cache.');
      console.warn('[EvaluatorsPage] ⚠️ This should not happen - API should always return evaluators. Keeping cache to prevent data loss.');
      // Don't overwrite cache with empty list - keep existing cache
      return;
    }
    
    // If we're saving a non-empty list, always save (even if it's smaller than cache)
    // This ensures completed evaluators are saved
    if (evaluators.length > 0) {
      console.log('[EvaluatorsPage] 💾 Saving', evaluators.length, 'evaluators to cache (replacing', existingCache.length, 'existing)');
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
      
      // Log completed evaluators count
      const completedCount = evaluators.filter(e => e.status?.toLowerCase() === 'completed').length;
      if (completedCount > 0) {
        console.log('[EvaluatorsPage] ✅ Cache includes', completedCount, 'completed evaluator(s)');
      }
      
      // Verify it was saved
      const verify = localStorage.getItem(cacheKey);
      if (verify) {
        try {
          const parsed = JSON.parse(verify);
          const savedCount = parsed.count || parsed.data?.length || 0;
          console.log('[EvaluatorsPage] ✅ Cache verification - saved', savedCount, 'evaluators');
          
          // Verify completed evaluators are in cache
          const savedCompleted = parsed.data?.filter((e: any) => e.status?.toLowerCase() === 'completed') || [];
          if (savedCompleted.length > 0) {
            console.log('[EvaluatorsPage] ✅ Cache verification - includes', savedCompleted.length, 'completed evaluator(s)');
          }
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
        try {
          const allAssessments = await getMyAssessments();
          // Filter out evaluator assessments (360_evaluator) - these shouldn't appear in user's list
          const assessments = allAssessments.filter(
            (a) => {
              const type = String(a.assessment_type).toLowerCase();
              return type !== 'three_sixty_evaluator' && type !== '360_evaluator';
            }
          );
          console.log('[EvaluatorsPage] Assessments loaded:', assessments);
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
                  console.log('[EvaluatorsPage] Using assessment ID from cache:', cachedId);
                  id = cachedId;
                }
              }
            }
            if (!id) {
              if (!silent) {
                setError('Aucun assessment de feedback 360° trouvé. Veuillez d\'abord démarrer un assessment 360° depuis la page Assessments.');
                setIsLoading(false);
              }
              return;
            }
          } else {
            id = feedback360Assessment.id;
            console.log('[EvaluatorsPage] Found 360 assessment ID:', id);
          }
        } catch (assessmentErr) {
          // If getMyAssessments fails (e.g., 401), try to get ID from cache
          console.warn('[EvaluatorsPage] Failed to load assessments, trying cache:', assessmentErr);
          const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
          if (cacheKeys.length > 0) {
            const cacheKey = cacheKeys[0];
            if (cacheKey) {
              const cachedId = parseInt(cacheKey.replace('evaluators_cache_', ''));
              if (!isNaN(cachedId)) {
                console.log('[EvaluatorsPage] Using assessment ID from cache after API failure:', cachedId);
                id = cachedId;
              }
            }
          }
          if (!id) {
            if (!silent) {
              setError('Session expirée. Veuillez vous reconnecter.');
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
          console.log('[EvaluatorsPage] ✅ Loaded evaluators from cache FIRST:', cachedEvaluators.length, 'evaluators');
          setEvaluators(cachedEvaluators);
          if (!silent) {
            setIsLoading(false);
          }
          // Cache is now loaded, try API in background but don't fail if it errors
        }
      }
      
      // Try to load fresh data from API (but don't block if it fails)
      try {
        console.log('[EvaluatorsPage] Attempting to load evaluators from API for assessment ID:', id);
        const response = await get360Evaluators(id);
        console.log('[EvaluatorsPage] ✅ Evaluators response from API:', response);
        const evaluatorsList = response.evaluators || [];
        console.log('[EvaluatorsPage] Evaluators list from API:', evaluatorsList.length, 'evaluators');
        
        // Log evaluator statuses for debugging BEFORE saving
        console.log('[EvaluatorsPage] 📊 Evaluators from API:');
        evaluatorsList.forEach(e => {
          const isCompleted = e.status?.toLowerCase() === 'completed';
          console.log('[EvaluatorsPage]   -', e.name, '| Status:', e.status, isCompleted ? '✅ COMPLETED' : '');
        });
        
        // CRITICAL: Always save to cache after successful API load
        // This ensures cache is always up-to-date with the latest status, including completed evaluators
        // BUT: Only save if we have evaluators OR if cache is also empty (to avoid overwriting with empty)
        if (id) {
          const existingCache = getCachedEvaluators(id);
          
          // Only save if:
          // 1. We have evaluators from API (always save)
          // 2. OR cache is also empty (both are empty, so it's safe to save)
          if (evaluatorsList.length > 0 || existingCache.length === 0) {
            console.log('[EvaluatorsPage] 💾 Saving fresh data to cache:', evaluatorsList.length, 'evaluators for assessment', id);
            saveEvaluatorsToCache(id, evaluatorsList);
            
            // Verify cache was saved
            const verifyCache = getCachedEvaluators(id);
            console.log('[EvaluatorsPage] ✅ Cache verification - saved and verified:', verifyCache.length, 'evaluators');
            
            // Log what's in cache after saving
            if (verifyCache.length > 0) {
              console.log('[EvaluatorsPage] 📊 Evaluators in cache after save:');
              verifyCache.forEach(e => {
                const isCompleted = e.status?.toLowerCase() === 'completed';
                console.log('[EvaluatorsPage]   -', e.name, '| Status:', e.status, isCompleted ? '✅ COMPLETED' : '');
              });
            } else {
              console.warn('[EvaluatorsPage] ⚠️ Cache is empty after save!');
            }
          } else {
            // API returned empty but cache has data - keep cache, don't overwrite
            console.warn('[EvaluatorsPage] ⚠️ API returned empty list but cache has', existingCache.length, 'evaluators. Keeping cache.');
            console.warn('[EvaluatorsPage] ⚠️ This might indicate an API issue. Using cached data instead.');
            // Use cached data instead of empty API response
            setEvaluators(existingCache);
            if (!silent) {
              setIsLoading(false);
            }
            return; // Don't update state with empty list
          }
        }
        
        // Update state with fresh data from API
        // BUT: If API returns empty but we have cache, keep cache instead
        if (evaluatorsList.length === 0 && id) {
          const cachedEvaluators = getCachedEvaluators(id);
          if (cachedEvaluators.length > 0) {
            console.warn('[EvaluatorsPage] ⚠️ API returned empty list but cache has', cachedEvaluators.length, 'evaluators. Using cache instead.');
            // Don't update state with empty list - cache is already set above
            if (!silent) {
              setIsLoading(false);
            }
            return;
          }
        }
        
        console.log('[EvaluatorsPage] ✅ Setting evaluators state from API:', evaluatorsList.length, 'evaluators');
        
        // Log completed evaluators count
        const completedCount = evaluatorsList.filter(e => e.status?.toLowerCase() === 'completed').length;
        if (completedCount > 0) {
          console.log('[EvaluatorsPage] ✅ API returned', completedCount, 'completed evaluator(s)');
          evaluatorsList.filter(e => e.status?.toLowerCase() === 'completed').forEach(e => {
            console.log('[EvaluatorsPage]   ✅ Completed:', e.name);
          });
        }
        
        setEvaluators(evaluatorsList);
        
        // Double-check that state was set correctly after a brief delay
        setTimeout(() => {
          console.log('[EvaluatorsPage] 🔍 Post-set state check - should have', evaluatorsList.length, 'evaluators in state');
        }, 100);
      } catch (apiErr: any) {
        console.error('[EvaluatorsPage] ⚠️ API call failed:', apiErr);
        const is401 = apiErr?.response?.status === 401 || apiErr?.message?.includes('401') || apiErr?.message?.includes('Unauthorized');
        
        // If API fails but we have cache, keep using cache (already set above)
        if (id) {
          const cachedEvaluators = getCachedEvaluators(id);
          if (cachedEvaluators.length > 0) {
            console.log('[EvaluatorsPage] ✅ API failed but cache is available, keeping cached evaluators:', cachedEvaluators.length);
            // Cache is already set above, just show a message
            if (!silent && is401) {
              setError('Session expirée. Affichage des données en cache. Veuillez vous reconnecter pour actualiser.');
              setTimeout(() => setError(null), 5000);
            }
            // Don't throw error, just return - cache is already displayed
            return;
          }
        }
        
        // If no cache and API fails, only then throw the error
        console.error('[EvaluatorsPage] ❌ No cache available and API failed');
        throw apiErr;
      }
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
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          // For 401, try to use cache (should already be loaded, but double-check)
          const currentId = assessmentId || (searchParams?.get('id') ? parseInt(searchParams.get('id')!) : null);
          if (currentId) {
            const cachedEvaluators = getCachedEvaluators(currentId);
            if (cachedEvaluators.length > 0) {
              console.log('[EvaluatorsPage] ✅ 401 error but using cached evaluators:', cachedEvaluators.length);
              setEvaluators(cachedEvaluators);
              if (!silent) {
                setIsLoading(false);
                setError('Session expirée. Affichage des données en cache. Veuillez vous reconnecter pour actualiser.');
                setTimeout(() => setError(null), 5000);
              }
              return;
            }
          }
          // Try to find any cache
          const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
          if (cacheKeys.length > 0) {
            const cacheKey = cacheKeys[0];
            if (cacheKey) {
              const cachedId = parseInt(cacheKey.replace('evaluators_cache_', ''));
              if (!isNaN(cachedId)) {
                const cachedEvaluators = getCachedEvaluators(cachedId);
                if (cachedEvaluators.length > 0) {
                  console.log('[EvaluatorsPage] ✅ 401 error, found cache for assessment', cachedId, ':', cachedEvaluators.length, 'evaluators');
                  setEvaluators(cachedEvaluators);
                  setAssessmentId(cachedId);
                  if (!silent) {
                    setIsLoading(false);
                    setError('Session expirée. Affichage des données en cache. Veuillez vous reconnecter pour actualiser.');
                    setTimeout(() => setError(null), 5000);
                  }
                  return;
                }
              }
            }
          }
          if (!silent) {
            setError('Session expirée. Veuillez vous reconnecter.');
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

  // Load from cache on initial mount if available - CRITICAL: This runs FIRST, before any API calls
  useEffect(() => {
    // IMMEDIATE cache load - synchronous, no async needed
    // This ensures evaluators are visible instantly, even before API calls
    const currentParams = searchParams;
    let id: number | null = currentParams?.get('id') ? parseInt(currentParams.get('id')!) : null;
    
    // If no ID in URL, try to get from cache immediately
    if (!id) {
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('evaluators_cache_'));
      if (cacheKeys.length > 0) {
        // Get the most recent cache entry
        const cacheEntries = cacheKeys.map(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            return { key, id: data.assessmentId || parseInt(key.replace('evaluators_cache_', '')), timestamp: data.timestamp || 0 };
          } catch {
            return { key, id: parseInt(key.replace('evaluators_cache_', '')), timestamp: 0 };
          }
        }).filter(e => !isNaN(e.id));
        
        if (cacheEntries.length > 0) {
          // Sort by timestamp (most recent first) and get the first one
          cacheEntries.sort((a, b) => b.timestamp - a.timestamp);
          const firstEntry = cacheEntries[0];
          if (firstEntry) {
            id = firstEntry.id;
            console.log('[EvaluatorsPage] ✅ Found assessment ID from cache immediately:', id);
          }
        }
      }
    }
    
    // Load from cache IMMEDIATELY if we have an ID
    if (id) {
      const cachedEvaluators = getCachedEvaluators(id);
      console.log('[EvaluatorsPage] ✅ IMMEDIATE cache load - found', cachedEvaluators.length, 'cached evaluators for assessment', id);
      if (cachedEvaluators.length > 0) {
        console.log('[EvaluatorsPage] ✅ Loading from cache IMMEDIATELY on mount:', cachedEvaluators.length, 'evaluators');
        
        // Log completed evaluators
        const completed = cachedEvaluators.filter(e => e.status?.toLowerCase() === 'completed');
        if (completed.length > 0) {
          console.log('[EvaluatorsPage] ✅ Cache includes', completed.length, 'completed evaluator(s):', completed.map(e => e.name));
        }
        
        setEvaluators(cachedEvaluators);
        setAssessmentId(id);
        setIsLoading(false); // Don't show loading since we have cached data
        console.log('[EvaluatorsPage] ✅ Cache loaded and state set, evaluators should be visible now');
      } else {
        console.log('[EvaluatorsPage] ⚠️ No cached evaluators found for assessment', id, '- will try API');
      }
    } else {
      console.log('[EvaluatorsPage] ⚠️ No assessment ID found - cannot load from cache');
    }
    
    // Now try to load from API in background (async)
    const loadFromAPI = async () => {
      // If we don't have an ID yet, try to get it from API
      if (!id) {
        try {
          const allAssessments = await getMyAssessments();
          // Filter out evaluator assessments (360_evaluator) - these shouldn't appear in user's list
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
            id = feedback360Assessment.id;
            console.log('[EvaluatorsPage] Found assessment ID from API:', id);
            setAssessmentId(id);
          }
        } catch (apiErr) {
          console.warn('[EvaluatorsPage] API failed to get assessment ID, will use cache only:', apiErr);
          // Continue with cache-only approach - cache is already loaded above
          return;
        }
      }
      
      // If we have an ID (from URL, cache, or API), try to refresh from API
      if (id) {
        // Small delay to let UI render with cache first
        setTimeout(() => {
          console.log('[EvaluatorsPage] Starting background API refresh');
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

    // Always poll to refresh status, even if all are completed (to show completed evaluators)
    const refreshEvaluators = async () => {
      try {
        console.log('[EvaluatorsPage] 🔄 Background refresh triggered for assessment', assessmentId);
        await loadEvaluators(true); // Silent refresh - don't show loading state
        // Cache is automatically saved in loadEvaluators
        console.log('[EvaluatorsPage] ✅ Background refresh completed');
      } catch (err) {
        console.error('[EvaluatorsPage] ⚠️ Error in background refresh:', err);
        // Even if refresh fails, cache should still be available
        const cachedEvaluators = getCachedEvaluators(assessmentId);
        if (cachedEvaluators.length > 0) {
          console.log('[EvaluatorsPage] ✅ Using cache after refresh error:', cachedEvaluators.length, 'evaluators');
          setEvaluators(cachedEvaluators);
        }
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
                              className="text-xs flex flex-row items-center gap-2"
                            >
                              <Copy size={14} />
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
