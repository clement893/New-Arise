'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useRouter, useParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Video, FileText, Users, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import Image from 'next/image';

// Resources data - This could be moved to a separate file or fetched from an API
const resourcesData: Record<string, {
  id: number;
  type: 'article' | 'video' | 'course' | 'workshop';
  title: string;
  description: string;
  fullDescription: string;
  duration: string;
  content: string;
  keyPoints?: string[];
  author?: string;
  icon: typeof FileText;
}> = {
  '1': {
    id: 1,
    type: 'article',
    title: 'The Five Conflict Management Styles',
    description: 'Understanding different approaches to conflict resolution',
    fullDescription: 'Conflict is inevitable in any workplace, but how you handle it makes all the difference. This comprehensive guide explores the five primary conflict management styles: competing, collaborating, compromising, avoiding, and accommodating. Learn when to use each style and how to adapt your approach based on the situation and people involved.',
    duration: '10 min read',
    content: `
      <h2>Introduction</h2>
      <p>Effective conflict management is a crucial leadership skill. Understanding different conflict management styles helps leaders navigate difficult situations more effectively and create better outcomes for their teams.</p>
      
      <h2>The Five Conflict Management Styles</h2>
      
      <h3>1. Competing (Assertive, Uncooperative)</h3>
      <p>The competing style involves taking a firm stand and pursuing your own concerns at the expense of others. This style is appropriate when:</p>
      <ul>
        <li>Quick, decisive action is needed</li>
        <li>Unpopular decisions must be made</li>
        <li>Protecting vital interests is required</li>
      </ul>
      
      <h3>2. Collaborating (Assertive, Cooperative)</h3>
      <p>Collaboration involves working together to find a solution that fully satisfies both parties. This style is ideal when:</p>
      <ul>
        <li>Both sets of concerns are too important to be compromised</li>
        <li>You need to merge insights from different perspectives</li>
        <li>You want to gain commitment through consensus</li>
      </ul>
      
      <h3>3. Compromising (Moderate Assertiveness, Moderate Cooperativeness)</h3>
      <p>Compromising involves finding a mutually acceptable solution that partially satisfies both parties. Use this style when:</p>
      <ul>
        <li>Goals are moderately important</li>
        <li>Parties of equal power are committed to mutually exclusive goals</li>
        <li>You need temporary solutions to complex issues</li>
      </ul>
      
      <h3>4. Avoiding (Unassertive, Uncooperative)</h3>
      <p>Avoiding involves withdrawing from or sidestepping the conflict. This style is appropriate when:</p>
      <ul>
        <li>The issue is trivial or unimportant</li>
        <li>There's no chance of satisfying your concerns</li>
        <li>You need to reduce tension or buy time</li>
      </ul>
      
      <h3>5. Accommodating (Unassertive, Cooperative)</h3>
      <p>Accommodating involves neglecting your own concerns to satisfy the concerns of others. This style works well when:</p>
      <ul>
        <li>The issue is more important to the other party</li>
        <li>You want to build social credits</li>
        <li>You're outmatched and losing</li>
      </ul>
      
      <h2>Choosing the Right Style</h2>
      <p>The most effective leaders are flexible and can adapt their conflict management style based on the situation. Consider factors such as:</p>
      <ul>
        <li>The importance of the issue</li>
        <li>The relationship with the other party</li>
        <li>The time available</li>
        <li>The power dynamics involved</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Mastering conflict management requires self-awareness and practice. By understanding these five styles and when to apply them, you can become a more effective leader and create better outcomes for your team.</p>
    `,
    keyPoints: [
      'Five distinct conflict management styles exist',
      'Each style has appropriate situations for use',
      'Effective leaders adapt their style to the context',
      'Collaboration often yields the best long-term results',
      'Self-awareness is key to effective conflict management'
    ],
    author: 'ARISE Leadership Team',
    icon: FileText,
  },
  '2': {
    id: 2,
    type: 'video',
    title: 'Emotional Intelligence in Leadership',
    description: 'Learn how to develop and apply EQ in your leadership role',
    fullDescription: 'Emotional Intelligence (EQ) is one of the most critical skills for effective leadership. This comprehensive video course explores the four components of EQ: self-awareness, self-management, social awareness, and relationship management. Learn practical strategies to develop your emotional intelligence and apply it in your daily leadership interactions.',
    duration: '25 min',
    content: `
      <h2>Course Overview</h2>
      <p>Emotional Intelligence in Leadership is a transformative course designed to help leaders understand and develop their emotional intelligence skills. This course combines theory with practical exercises and real-world examples.</p>
      
      <h2>What You'll Learn</h2>
      
      <h3>Module 1: Understanding Emotional Intelligence</h3>
      <ul>
        <li>The science behind emotional intelligence</li>
        <li>Why EQ matters more than IQ in leadership</li>
        <li>The four components of EQ</li>
      </ul>
      
      <h3>Module 2: Self-Awareness</h3>
      <ul>
        <li>Recognizing your emotions in real-time</li>
        <li>Understanding your emotional triggers</li>
        <li>Assessing your emotional patterns</li>
      </ul>
      
      <h3>Module 3: Self-Management</h3>
      <ul>
        <li>Regulating your emotions effectively</li>
        <li>Staying calm under pressure</li>
        <li>Managing stress and avoiding burnout</li>
      </ul>
      
      <h3>Module 4: Social Awareness</h3>
      <ul>
        <li>Reading the emotional climate of your team</li>
        <li>Empathy and perspective-taking</li>
        <li>Recognizing unspoken concerns</li>
      </ul>
      
      <h3>Module 5: Relationship Management</h3>
      <ul>
        <li>Influencing others positively</li>
        <li>Handling difficult conversations</li>
        <li>Building trust and psychological safety</li>
      </ul>
      
      <h2>Key Takeaways</h2>
      <ul>
        <li>EQ can be developed with practice and commitment</li>
        <li>Emotionally intelligent leaders create better team outcomes</li>
        <li>Self-awareness is the foundation of all other EQ skills</li>
        <li>Regular reflection and feedback accelerate EQ development</li>
      </ul>
    `,
    keyPoints: [
      'EQ consists of four core components',
      'Self-awareness is the foundation of EQ',
      'EQ can be developed through practice',
      'Emotionally intelligent leaders drive better results',
      'Regular reflection accelerates EQ growth'
    ],
    author: 'Dr. Sarah Johnson, Leadership Expert',
    icon: Video,
  },
  '3': {
    id: 3,
    type: 'course',
    title: 'Effective Communication for Leaders',
    description: 'Master the art of clear and inspiring communication',
    fullDescription: 'Communication is the foundation of effective leadership. This comprehensive course teaches you how to communicate with clarity, empathy, and impact. Learn to adapt your communication style to different audiences, handle difficult conversations, and inspire action through powerful storytelling.',
    duration: '2 hours',
    content: `
      <h2>Course Introduction</h2>
      <p>Effective communication is not just about what you say, but how you say it, when you say it, and to whom you say it. This course provides a comprehensive framework for mastering leadership communication.</p>
      
      <h2>Core Modules</h2>
      
      <h3>Module 1: The Fundamentals of Leadership Communication</h3>
      <ul>
        <li>Understanding your communication style</li>
        <li>The importance of active listening</li>
        <li>Verbal vs. non-verbal communication</li>
      </ul>
      
      <h3>Module 2: Clarity and Conciseness</h3>
      <ul>
        <li>Structuring your message for impact</li>
        <li>Eliminating jargon and ambiguity</li>
        <li>Using the right level of detail</li>
      </ul>
      
      <h3>Module 3: Adapting to Your Audience</h3>
      <ul>
        <li>Understanding different communication preferences</li>
        <li>Tailoring your message to the audience</li>
        <li>Cross-cultural communication considerations</li>
      </ul>
      
      <h3>Module 4: Difficult Conversations</h3>
      <ul>
        <li>Preparing for challenging discussions</li>
        <li>Managing emotions in conversations</li>
        <li>Finding common ground</li>
      </ul>
      
      <h3>Module 5: Inspiring Through Storytelling</h3>
      <ul>
        <li>The power of narrative in leadership</li>
        <li>Crafting compelling stories</li>
        <li>Using stories to drive change</li>
      </ul>
      
      <h3>Module 6: Feedback and Performance Conversations</h3>
      <ul>
        <li>Giving constructive feedback</li>
        <li>Receiving feedback gracefully</li>
        <li>Creating a feedback culture</li>
      </ul>
      
      <h2>Practical Exercises</h2>
      <ul>
        <li>Communication style assessment</li>
        <li>Practice scenarios with feedback</li>
        <li>Video recording and self-reflection</li>
        <li>Peer coaching exercises</li>
      </ul>
      
      <h2>Resources Included</h2>
      <ul>
        <li>Communication templates and frameworks</li>
        <li>Self-assessment tools</li>
        <li>Video examples of effective communication</li>
        <li>Certificate of completion</li>
      </ul>
    `,
    keyPoints: [
      'Communication is a learnable skill',
      'Adapting to your audience is crucial',
      'Non-verbal communication matters as much as verbal',
      'Storytelling is a powerful leadership tool',
      'Practice and feedback accelerate improvement'
    ],
    author: 'Michael Chen, Communication Expert',
    icon: BookOpen,
  },
  '4': {
    id: 4,
    type: 'workshop',
    title: 'Team Building Workshop',
    description: 'Interactive session on building high-performing teams',
    fullDescription: 'This interactive workshop is designed to help leaders build and maintain high-performing teams. Through hands-on activities, team assessments, and practical exercises, you\'ll learn how to foster collaboration, build trust, and create an environment where teams can thrive.',
    duration: '3 hours',
    content: `
      <h2>Workshop Overview</h2>
      <p>This intensive, interactive workshop brings together leadership principles and practical team-building activities. You'll leave with actionable strategies and a deeper understanding of what makes teams successful.</p>
      
      <h2>Workshop Agenda</h2>
      
      <h3>Session 1: Understanding Team Dynamics (45 minutes)</h3>
      <ul>
        <li>Stages of team development (Forming, Storming, Norming, Performing)</li>
        <li>Identifying your team's current stage</li>
        <li>Common team challenges and how to address them</li>
        <li>Interactive activity: Team dynamics assessment</li>
      </ul>
      
      <h3>Session 2: Building Trust (45 minutes)</h3>
      <ul>
        <li>The foundation of trust in teams</li>
        <li>Trust-building exercises</li>
        <li>Repairing broken trust</li>
        <li>Interactive activity: Trust walk and debrief</li>
      </ul>
      
      <h3>Session 3: Communication and Collaboration (45 minutes)</h3>
      <ul>
        <li>Effective team communication patterns</li>
        <li>Collaborative problem-solving techniques</li>
        <li>Managing conflicts within teams</li>
        <li>Interactive activity: Team challenge exercise</li>
      </ul>
      
      <h3>Session 4: Action Planning (45 minutes)</h3>
      <ul>
        <li>Creating a team development plan</li>
        <li>Setting team goals and metrics</li>
        <li>Establishing team norms and agreements</li>
        <li>Interactive activity: Team charter creation</li>
      </ul>
      
      <h2>Learning Objectives</h2>
      <ul>
        <li>Understand the stages of team development</li>
        <li>Learn practical team-building activities</li>
        <li>Develop skills to build and maintain trust</li>
        <li>Create an actionable team development plan</li>
      </ul>
      
      <h2>Who Should Attend</h2>
      <ul>
        <li>Team leaders and managers</li>
        <li>Project managers</li>
        <li>HR professionals</li>
        <li>Anyone responsible for team performance</li>
      </ul>
      
      <h2>What's Included</h2>
      <ul>
        <li>Interactive workshop session</li>
        <li>Team assessment tools</li>
        <li>Resource materials and templates</li>
        <li>Certificate of participation</li>
        <li>Follow-up support session</li>
      </ul>
    `,
    keyPoints: [
      'Teams go through predictable development stages',
      'Trust is the foundation of high-performing teams',
      'Practical exercises accelerate team development',
      'Regular team-building maintains team cohesion',
      'Action planning ensures continued growth'
    ],
    author: 'ARISE Workshop Facilitators',
    icon: Users,
  },
};

function ResourceDetailContent() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params?.id as string;
  
  const resource = resourceId ? resourcesData[resourceId] : null;

  if (!resource) {
    return (
      <div className="space-y-8">
        <div className="mb-8 pb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/development-plan')}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour au Development Plan
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Ressource non trouvée
          </h1>
          <p className="text-white">
            La ressource demandée n'existe pas ou a été supprimée.
          </p>
        </div>
      </div>
    );
  }

  const Icon = resource.icon;
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: 'Article',
      video: 'Vidéo',
      course: 'Cours',
      workshop: 'Atelier',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      article: '#0d9488',
      video: '#dc2626',
      course: '#2563eb',
      workshop: '#7c3aed',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="space-y-8">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/development-plan')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour au Development Plan
        </Button>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/20">
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${getTypeColor(resource.type)}20` }}
            >
              <Icon size={32} style={{ color: getTypeColor(resource.type) }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: getTypeColor(resource.type) }}
                >
                  {getTypeLabel(resource.type)}
                </span>
                <div className="flex items-center text-white/70 text-sm">
                  <Clock size={16} className="mr-1" />
                  {resource.duration}
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                {resource.title}
              </h1>
              <p className="text-lg text-white/90 mb-4">
                {resource.fullDescription}
              </p>
              {resource.author && (
                <p className="text-sm text-white/70">
                  Par {resource.author}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white">
              <div 
                className="text-lg text-gray-700 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:mb-2 [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-arise-deep-teal [&_a]:no-underline hover:[&_a]:underline"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Points */}
            {resource.keyPoints && resource.keyPoints.length > 0 && (
              <Card className="p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Points Clés
                </h3>
                <ul className="space-y-3">
                  {resource.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 
                        className="text-arise-deep-teal flex-shrink-0 mt-0.5" 
                        size={20} 
                      />
                      <span className="text-gray-700 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Resource Info */}
            <Card className="p-6 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Informations
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-semibold text-gray-900">
                    {getTypeLabel(resource.type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Durée</p>
                  <p className="font-semibold text-gray-900">
                    {resource.duration}
                  </p>
                </div>
                {resource.author && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Auteur</p>
                    <p className="font-semibold text-gray-900">
                      {resource.author}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Button */}
            {resource.type === 'video' && (
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                style={{ backgroundColor: '#D5B667', color: '#000000' }}
              >
                <PlayCircle size={20} />
                Commencer la vidéo
              </Button>
            )}
            
            {resource.type === 'course' && (
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                style={{ backgroundColor: '#D5B667', color: '#000000' }}
              >
                <BookOpen size={20} />
                Commencer le cours
              </Button>
            )}

            {resource.type === 'workshop' && (
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                style={{ backgroundColor: '#D5B667', color: '#000000' }}
              >
                <Users size={20} />
                Réserver l'atelier
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourceDetailPage() {
  return (
    <ErrorBoundary>
      <ResourceDetailContent />
    </ErrorBoundary>
  );
}
