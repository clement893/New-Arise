'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui';
import { 
  Calendar, 
  User, 
  CreditCard,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { 
  getCoaches, 
  getCoachingPackages, 
  createCoachingSession, 
  createCoachingCheckoutSession,
  getCoachAvailability,
  type Coach,
  type CoachingPackage,
  type TimeSlot
} from '@/lib/api/coaching';
import { logger } from '@/lib/logger';

export default function BookCoachingSessionPage() {
  const t = useTranslations('dashboard.coachingOptions.book');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const coachIdParam = searchParams.get('coach');
  const packageIdParam = searchParams.get('package');
  
  const [step, setStep] = useState<'coach' | 'package' | 'datetime' | 'review' | 'payment'>('coach');
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [packages, setPackages] = useState<CoachingPackage[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CoachingPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Load coaches and packages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coachesData, packagesData] = await Promise.all([
          getCoaches(),
          getCoachingPackages()
        ]);
        setCoaches(coachesData);
        setPackages(packagesData);
        
        // Pre-select if params provided
        if (coachIdParam) {
          const coach = coachesData.find(c => c.id === parseInt(coachIdParam));
          if (coach) {
            setSelectedCoach(coach);
            setStep('package');
          }
        }
        if (packageIdParam) {
          const pkg = packagesData.find(p => p.id === parseInt(packageIdParam));
          if (pkg) {
            setSelectedPackage(pkg);
            if (selectedCoach) setStep('datetime');
          }
        }
      } catch (err) {
        setError(t('errors.loadFailed'));
        logger.error('Failed to load coaches/packages', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [coachIdParam, packageIdParam]);

  // Load availability when coach and date are selected
  useEffect(() => {
    if (selectedCoach && selectedDate) {
      const loadAvailability = async () => {
        try {
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);
          
          const availability = await getCoachAvailability(
            selectedCoach.id,
            startDate.toISOString(),
            endDate.toISOString()
          );
          setAvailableSlots(availability.slots);
        } catch (err) {
          logger.error('Failed to load availability', err);
        }
      };
      
      loadAvailability();
    }
  }, [selectedCoach, selectedDate]);

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setStep('package');
  };

  const handlePackageSelect = (pkg: CoachingPackage) => {
    setSelectedPackage(pkg);
    setStep('datetime');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleReview = () => {
    if (!selectedCoach || !selectedPackage || !selectedDate || !selectedTime) {
      setError(t('errors.fillAllFields'));
      return;
    }
    setStep('review');
  };

  const handleCreateSession = async () => {
    if (!selectedCoach || !selectedPackage || !selectedDate || !selectedTime) {
      setError(t('errors.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine date and time
      const timeParts = selectedTime.split(':');
      const hours = Number(timeParts[0]) || 0;
      const minutes = Number(timeParts[1]) || 0;
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Create session
      const session = await createCoachingSession({
        coach_id: selectedCoach.id,
        package_id: selectedPackage.id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 60,
        notes: notes || null,
      });

      setSessionId(session.id);
      setStep('payment');
    } catch (err: any) {
      // Ensure error is always a string to prevent React error #130
      const errorMessage = typeof err?.message === 'string' ? err.message : String(err?.message || t('errors.createSessionFailed'));
      setError(errorMessage);
      logger.error('Failed to create session', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!sessionId) {
      setError('Session ID manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const successUrl = `${window.location.origin}/dashboard/coaching-options/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/dashboard/coaching-options/book?coach=${selectedCoach?.id}&package=${selectedPackage?.id}`;

      const checkout = await createCoachingCheckoutSession(sessionId, {
        session_id: sessionId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Redirect to Stripe Checkout
      if (checkout.url) {
        window.location.href = checkout.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      // Ensure error is always a string to prevent React error #130
      const errorMessage = typeof err?.message === 'string' ? err.message : String(err?.message || t('errors.createPaymentFailed'));
      setError(errorMessage);
      logger.error('Failed to create checkout session', err);
      setLoading(false);
    }
  };

  // Generate date options (next 30 days)
  const getDateOptions = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  if (loading && coaches.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-arise-teal" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {typeof error === 'string' ? error : String(error || 'An error occurred')}
          </Alert>
        )}

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between">
          {['coach', 'package', 'datetime', 'review', 'payment'].map((s, idx) => {
            const stepIndex = ['coach', 'package', 'datetime', 'review', 'payment'].indexOf(step);
            const isActive = s === step;
            const isCompleted = ['coach', 'package', 'datetime', 'review', 'payment'].indexOf(s) < stepIndex;
            
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isActive ? 'bg-arise-teal text-white' : 
                  isCompleted ? 'bg-success-500 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    isCompleted ? 'bg-success-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select Coach */}
        {step === 'coach' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="h-6 w-6" />
              {t('steps.coach.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => handleCoachSelect(coach)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedCoach?.id === coach.id
                      ? 'border-arise-teal bg-arise-teal/10'
                      : 'border-gray-200 hover:border-arise-teal/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arise-teal to-arise-deep-teal flex items-center justify-center text-white font-bold">
                      {coach.first_name?.[0]}{coach.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{coach.name}</h3>
                      <p className="text-sm text-gray-600">{coach.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 2: Select Package */}
        {step === 'package' && selectedCoach && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              {t('steps.package.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-arise-gold bg-arise-gold/10'
                      : 'border-gray-200 hover:border-arise-gold/50'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  <div className="text-2xl font-bold text-arise-teal">
                    {pkg.price}€
                  </div>
                  {pkg.sessions_count > 1 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {t('steps.package.sessions', { count: pkg.sessions_count, plural: pkg.sessions_count > 1 ? 's' : '' })}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={() => setStep('coach')}>
                {t('back')}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 'datetime' && selectedCoach && selectedPackage && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              {t('steps.datetime.title')}
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t('steps.datetime.dateLabel')}</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {getDateOptions().map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr;
                  
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(date)}
                      className={`p-3 border-2 rounded-lg text-sm ${
                        isSelected
                          ? 'border-arise-teal bg-arise-teal text-white'
                          : 'border-gray-200 hover:border-arise-teal/50'
                      }`}
                    >
                      {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('steps.datetime.timeLabel')}</label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot, idx) => {
                      const slotTime = new Date(slot.start).toLocaleTimeString(undefined, { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      const isSelected = selectedTime === slotTime;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleTimeSelect(slotTime)}
                          disabled={!slot.available}
                          className={`p-3 border-2 rounded-lg text-sm ${
                            !slot.available
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isSelected
                              ? 'border-arise-teal bg-arise-teal text-white'
                              : 'border-gray-200 hover:border-arise-teal/50'
                          }`}
                        >
                          {slotTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Chargement des créneaux disponibles...</p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t('steps.datetime.notesLabel')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder={t('steps.datetime.notesPlaceholder')}
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('package')}>
                {t('back')}
              </Button>
              <Button 
                variant="primary"
                onClick={handleReview}
                disabled={!selectedDate || !selectedTime}
              >
                {t('continue')}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 'review' && selectedCoach && selectedPackage && selectedDate && selectedTime && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">{t('steps.review.title')}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.review.coach')}:</span>
                <span className="font-semibold">{selectedCoach.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.review.package')}:</span>
                <span className="font-semibold">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.review.date')}:</span>
                <span className="font-semibold">
                  {selectedDate.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.review.time')}:</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t">
                <span>{t('steps.review.total')}:</span>
                <span className="text-arise-teal">{selectedPackage.price}€</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('datetime')}>
                {t('back')}
              </Button>
              <Button 
                variant="primary"
                onClick={handleCreateSession}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('steps.review.creating')}
                  </>
                ) : (
                  t('steps.review.confirmAndPay')
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Payment */}
        {step === 'payment' && sessionId && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              {t('steps.payment.title')}
            </h2>
            
            <p className="mb-6 text-gray-600">
              {t('steps.payment.description')}
            </p>

            <Button 
              variant="primary"
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('steps.payment.redirecting')}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('steps.payment.proceed')}
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
