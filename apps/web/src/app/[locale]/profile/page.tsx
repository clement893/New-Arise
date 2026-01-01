'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { User, Calendar, Briefcase, Target, Users, Check } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Manager',
    organizationName: 'Tech Solutions Inc.',
    mainGoal: 'improve_leadership',
    learnedFromCoach: 'yes',
    coachName: 'Jane Smith',
  });

  const [currentPlan, setCurrentPlan] = useState('revolution');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // TODO: Implement save functionality
  };

  return (
    <div className="min-h-screen bg-arise-deep-teal">
      {/* Vertical lines texture */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, white 3px, white 4px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto p-6 space-y-8">
        {/* Profile Section */}
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-arise-teal flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-gray-600">Update your information to keep your profile current</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Goal */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              What's your main goal with a leadership development plan?
            </h2>
            <textarea
              name="mainGoal"
              value={formData.mainGoal}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe your main goal..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
            />
          </div>

          {/* Coach Question */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Did you learn about us through a leadership coach?
            </h2>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="learnedFromCoach"
                  value="yes"
                  checked={formData.learnedFromCoach === 'yes'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-arise-teal focus:ring-arise-teal"
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="learnedFromCoach"
                  value="no"
                  checked={formData.learnedFromCoach === 'no'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-arise-teal focus:ring-arise-teal"
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
            {formData.learnedFromCoach === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach name
                </label>
                <input
                  type="text"
                  name="coachName"
                  value={formData.coachName}
                  onChange={handleInputChange}
                  placeholder="Enter coach name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-arise-gold hover:bg-arise-gold/90 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Save
            </Button>
          </div>
        </Card>

        {/* Subscription Section */}
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription</h1>
          
          {/* Current Plan */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current plan</h2>
            <div className="border border-arise-gold bg-arise-gold/5 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {currentPlan === 'revolution' ? 'REVOLUTION' : 'COACH'}
                  </h3>
                  <p className="text-gray-600">
                    {currentPlan === 'revolution' 
                      ? 'Unlock every assessment, resource and tool to build your leadership profile'
                      : 'Next-level support, resources and tools to build your leadership profile'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">$299</p>
                  <p className="text-gray-600">/ month</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-arise-gold font-semibold">
                <Check className="w-5 h-5" />
                <span>Current plan</span>
              </div>
            </div>
          </div>

          {/* Upgrade/Downgrade */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentPlan === 'revolution' ? 'Downgrade your plan' : 'Upgrade your plan'}
            </h2>
            <div className="border border-gray-300 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {currentPlan === 'revolution' ? 'COACH' : 'REVOLUTION'}
                  </h3>
                  <p className="text-gray-600">
                    {currentPlan === 'revolution'
                      ? 'Next-level support, resources and tools to build your leadership profile'
                      : 'Unlock every assessment, resource and tool to build your leadership profile'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {currentPlan === 'revolution' ? '$199' : '$299'}
                  </p>
                  <p className="text-gray-600">/ month</p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentPlan(currentPlan === 'revolution' ? 'coach' : 'revolution')}
                className="bg-arise-gold hover:bg-arise-gold/90 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {currentPlan === 'revolution' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </div>
          </div>

          {/* Coaching CTA */}
          <div className="bg-gray-900 rounded-lg p-8 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to accelerate your growth?
              </h3>
              <p className="text-gray-300 mb-6 max-w-xl">
                Connect with expert ARISE coaches who specialize in leadership development. 
                Schedule your FREE coaching session to debrief your results and build a personalized development plan.
              </p>
              <Button
                className="bg-arise-gold hover:bg-arise-gold/90 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Explore coaching options →
              </Button>
            </div>
            <div className="ml-8">
              <div className="w-48 h-48 rounded-lg bg-gray-700 flex items-center justify-center">
                <Users className="w-24 h-24 text-gray-500" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
