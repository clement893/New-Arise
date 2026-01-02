/**
 * Coaching API
 * API client for coaching sessions and packages
 */

import { apiClient } from './client';

export interface CoachingPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_months: number | null;
  sessions_count: number;
  features: string | null;
  is_active: boolean;
  is_popular: boolean;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: number;
  name: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
}

export interface CoachingSession {
  id: number;
  user_id: number;
  coach_id: number;
  package_id: number | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  amount: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_status: string | null;
  notes: string | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  coach_id: number;
  package_id?: number | null;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string | null;
}

export interface CheckoutSessionData {
  session_id: number;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface CoachAvailabilityRequest {
  coach_id: number;
  start_date: string;
  end_date: string;
}

export interface CoachAvailabilityResponse {
  coach_id: number;
  slots: TimeSlot[];
}

/**
 * Get all coaching packages
 */
export async function getCoachingPackages(activeOnly: boolean = true): Promise<CoachingPackage[]> {
  const response = await apiClient.get<{ packages: CoachingPackage[]; total: number }>(
    `/v1/coaching/packages?active_only=${activeOnly}`
  );
  return response.data?.packages || [];
}

/**
 * Get coaching package by ID
 */
export async function getCoachingPackage(packageId: number): Promise<CoachingPackage> {
  const response = await apiClient.get<CoachingPackage>(`/v1/coaching/packages/${packageId}`);
  return response.data!;
}

/**
 * Get all coaches
 */
export async function getCoaches(): Promise<Coach[]> {
  const response = await apiClient.get<Coach[]>(`/v1/coaching/coaches`);
  return response.data || [];
}

/**
 * Get coach by ID
 */
export async function getCoach(coachId: number): Promise<Coach> {
  const response = await apiClient.get<Coach>(`/v1/coaching/coaches/${coachId}`);
  return response.data!;
}

/**
 * Create a coaching session
 */
export async function createCoachingSession(data: CreateSessionData): Promise<CoachingSession> {
  const response = await apiClient.post<CoachingSession>(`/v1/coaching/sessions`, data);
  return response.data!;
}

/**
 * Get user's coaching sessions
 */
export async function getMyCoachingSessions(
  asCoach: boolean = false,
  statusFilter?: string
): Promise<CoachingSession[]> {
  const params = new URLSearchParams();
  if (asCoach) params.append('as_coach', 'true');
  if (statusFilter) params.append('status_filter', statusFilter);
  
  const response = await apiClient.get<{ sessions: CoachingSession[]; total: number }>(
    `/v1/coaching/sessions/me?${params.toString()}`
  );
  return response.data?.sessions || [];
}

/**
 * Get coaching session by ID
 */
export async function getCoachingSession(sessionId: number): Promise<CoachingSession> {
  const response = await apiClient.get<CoachingSession>(`/v1/coaching/sessions/${sessionId}`);
  return response.data!;
}

/**
 * Create Stripe checkout session for a coaching session
 */
export async function createCoachingCheckoutSession(
  sessionId: number,
  data: CheckoutSessionData
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<CheckoutSessionResponse>(
    `/v1/coaching/sessions/${sessionId}/checkout`,
    data
  );
  return response.data!;
}

/**
 * Get coach availability
 */
export async function getCoachAvailability(
  coachId: number,
  startDate: string,
  endDate: string
): Promise<CoachAvailabilityResponse> {
  const response = await apiClient.post<CoachAvailabilityResponse>(
    `/v1/coaching/coaches/${coachId}/availability`,
    {
      coach_id: coachId,
      start_date: startDate,
      end_date: endDate,
    }
  );
  return response.data!;
}
