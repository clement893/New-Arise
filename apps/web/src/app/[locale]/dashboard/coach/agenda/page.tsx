'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/layout';
import { Card, Container, Button, Grid } from '@/components/ui';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Video,
  MapPin,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Session {
  id: number;
  coacheeId: number;
  coacheeName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  meetingLink?: string;
}

// Mock data - to be replaced with API calls
const mockSessions: Session[] = [
  {
    id: 1,
    coacheeId: 1,
    coacheeName: 'John Doe',
    title: 'Session de coaching - Leadership',
    date: '2025-01-10',
    startTime: '10:00',
    endTime: '11:30',
    type: 'video',
    status: 'scheduled',
    meetingLink: 'https://meet.example.com/session-1',
  },
  {
    id: 2,
    coacheeId: 2,
    coacheeName: 'Jane Smith',
    title: 'Suivi développement personnel',
    date: '2025-01-10',
    startTime: '14:00',
    endTime: '15:00',
    type: 'in-person',
    status: 'scheduled',
    location: 'Bureau principal',
  },
  {
    id: 3,
    coacheeId: 1,
    coacheeName: 'John Doe',
    title: 'Session de coaching - Communication',
    date: '2025-01-12',
    startTime: '09:00',
    endTime: '10:00',
    type: 'phone',
    status: 'scheduled',
  },
  {
    id: 4,
    coacheeId: 3,
    coacheeName: 'Bob Johnson',
    title: 'Première session',
    date: '2025-01-08',
    startTime: '16:00',
    endTime: '17:00',
    type: 'video',
    status: 'completed',
    notes: 'Bonne première session, objectifs définis.',
  },
];

export default function AgendaPage() {
  const t = useTranslations('dashboard.coach.agenda');
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedCoachee, setSelectedCoachee] = useState<number | 'all'>('all');
  const [sessions] = useState<Session[]>(mockSessions);

  const handleNewSession = () => {
    // Redirect to coaching booking page
    router.push('/dashboard/coaching-options/book');
  };

  // Get sessions for current date range
  const getSessionsForDate = (date: Date): Session[] => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => {
      if (selectedCoachee !== 'all' && session.coacheeId !== selectedCoachee) {
        return false;
      }
      return session.date === dateStr;
    });
  };

  // Get sessions for current month
  const getSessionsForMonth = (): Session[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return sessions.filter(session => {
      if (selectedCoachee !== 'all' && session.coacheeId !== selectedCoachee) {
        return false;
      }
      const sessionDate = new Date(session.date);
      return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
    });
  };

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = sessions
    .filter(session => {
      if (selectedCoachee !== 'all' && session.coacheeId !== selectedCoachee) {
        return false;
      }
      const sessionDate = new Date(session.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return sessionDate >= today && sessionDate <= weekFromNow && session.status === 'scheduled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // Statistics
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today && s.status === 'scheduled');
  
  // Get sessions for this week (next 7 days)
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekSessions = sessions.filter(s => {
    if (selectedCoachee !== 'all' && s.coacheeId !== selectedCoachee) {
      return false;
    }
    const sessionDate = new Date(s.date);
    return sessionDate >= weekStart && sessionDate < weekEnd && s.status === 'scheduled';
  });
  
  const completedThisMonth = getSessionsForMonth().filter(s => s.status === 'completed').length;

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getTypeIcon = (type: Session['type']) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-primary-600" />;
      case 'phone':
        return <Phone size={16} className="text-success-600" />;
      case 'in-person':
        return <MapPin size={16} className="text-purple-600" />;
    }
  };

  const getStatusBadge = (status: Session['status']) => {
    const styles = {
      scheduled: 'bg-primary-100 text-primary-700 border-primary-200',
      completed: 'bg-success-100 text-success-700 border-success-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
      scheduled: <Clock size={12} />,
      completed: <CheckCircle size={12} />,
      cancelled: <XCircle size={12} />,
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${styles[status]}`}>
        {icons[status]}
        {t(`status.${status}`)}
      </span>
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    t('months.0'), t('months.1'), t('months.2'), t('months.3'), t('months.4'), t('months.5'),
    t('months.6'), t('months.7'), t('months.8'), t('months.9'), t('months.10'), t('months.11')
  ];
  const dayNames = [
    t('days.0'), t('days.1'), t('days.2'), t('days.3'), t('days.4'), t('days.5'), t('days.6')
  ];

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        titleClassName="!text-white"
        descriptionClassName="!text-white"
        maxWidth="full"
      />

      <Container className="py-8" maxWidth="full" center={false}>
        {/* Stats Cards */}
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal" className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('stats.today')}</p>
                <p className="text-3xl font-bold text-gray-900">{todaySessions.length}</p>
                <p className="text-xs text-gray-500 mt-1">{t('stats.sessions')}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('stats.thisWeek')}</p>
                <p className="text-3xl font-bold text-gray-900">{weekSessions.length}</p>
                <p className="text-xs text-gray-500 mt-1">{t('stats.sessions')}</p>
              </div>
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-full flex items-center justify-center">
                <Clock className="text-arise-deep-teal" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('stats.thisMonth')}</p>
                <p className="text-3xl font-bold text-gray-900">{getSessionsForMonth().length}</p>
                <p className="text-xs text-gray-500 mt-1">{t('stats.sessions')}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('stats.completed')}</p>
                <p className="text-3xl font-bold text-success-600">{completedThisMonth}</p>
                <p className="text-xs text-gray-500 mt-1">{t('stats.thisMonthLabel')}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-success-600" size={24} />
              </div>
            </div>
          </Card>
        </Grid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <h2 className="text-xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={view === 'month' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('month')}
                  >
                    {t('calendar.month')}
                  </Button>
                  <Button
                    variant={view === 'week' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('week')}
                  >
                    {t('calendar.week')}
                  </Button>
                  <Button
                    variant={view === 'day' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('day')}
                  >
                    {t('calendar.day')}
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              {view === 'month' && (
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-24" />;
                    }
                    
                    const daySessions = getSessionsForDate(date);
                    const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`h-24 border border-gray-200 rounded-lg p-2 ${
                          isToday ? 'bg-arise-deep-teal/5 border-arise-deep-teal' : ''
                        } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-arise-deep-teal font-bold' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-16">
                          {daySessions.slice(0, 2).map(session => (
                            <div
                              key={session.id}
                              className="text-xs bg-primary-100 text-primary-700 rounded px-1 py-0.5 truncate"
                              title={`${session.startTime} - ${session.coacheeName}`}
                            >
                              {session.startTime} {session.coacheeName.split(' ')[0]}
                            </div>
                          ))}
                          {daySessions.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{daySessions.length - 2} {t('calendar.more')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Upcoming Sessions */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">{t('filters.title')}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.coachee')}
                  </label>
                  <select
                    value={selectedCoachee}
                    onChange={(e) => setSelectedCoachee(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                  >
                    <option value="all">{t('filters.allCoachees')}</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Bob Johnson</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleNewSession}
                >
                  <Plus size={20} />
                  {t('actions.newSession')}
                </Button>
              </div>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('upcoming.title')}</h3>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">{t('upcoming.none')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {session.coacheeName}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {session.title}
                          </p>
                        </div>
                        {getTypeIcon(session.type)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <CalendarIcon size={14} />
                        <span>
                          {new Date(session.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <Clock size={14} className="ml-2" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
