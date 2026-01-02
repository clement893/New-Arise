'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowRight, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: '',
    gender: 'male',
    age: '',
    highestDegree: '',
    mainGoal: '',
    workedWithCoach: false,
    organizationName: 'Company',
    position: 'Manager',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // TODO: Implement save functionality
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Your profile</h1>
        <p className="text-white/90 text-lg mb-6">Update my profile information & Subscription</p>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              'px-6 py-3 rounded-t-lg font-semibold transition-colors',
              activeTab === 'profile'
                ? 'bg-white text-arise-deep-teal-alt'
                : 'bg-[#2B8A9E] text-white/80 hover:text-white'
            )}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={clsx(
              'px-6 py-3 rounded-t-lg font-semibold transition-colors',
              activeTab === 'subscription'
                ? 'bg-white text-arise-deep-teal-alt'
                : 'bg-[#2B8A9E] text-white/80 hover:text-white'
            )}
          >
            Subscription
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <Card className="p-8">
          {/* User Header within card */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-gray-600">
                    {(user?.name?.[0] || 'J').toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name || 'John Doe'}</h3>
                <span className="inline-block px-3 py-1 bg-arise-deep-teal-alt/10 text-arise-deep-teal-alt rounded-full text-xs font-medium mt-1">
                  Revelation plan
                </span>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Follow me
            </Button>
          </div>

          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-arise-deep-teal-alt focus:ring-arise-deep-teal-alt"
                    />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-arise-deep-teal-alt focus:ring-arise-deep-teal-alt"
                    />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  className="w-full"
                />
              </div>

              {/* Highest degree */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest degree attained
                </label>
                <select
                  name="highestDegree"
                  value={formData.highestDegree}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal-alt focus:border-transparent"
                >
                  <option value="">Choice</option>
                  <option value="high_school">High School</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              {/* Main goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your main goal with a leadership development plan?
                </label>
                <select
                  name="mainGoal"
                  value={formData.mainGoal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal-alt focus:border-transparent"
                >
                  <option value="">Choice</option>
                  <option value="improve_leadership">Improve Leadership Skills</option>
                  <option value="career_advancement">Career Advancement</option>
                  <option value="team_management">Team Management</option>
                  <option value="personal_growth">Personal Growth</option>
                </select>
              </div>

              {/* Coach checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="workedWithCoach"
                    checked={formData.workedWithCoach}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-arise-deep-teal-alt focus:ring-arise-deep-teal-alt rounded"
                  />
                  <span className="text-gray-700">Have you ever worked with a leadership coach?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization name
                </label>
                <Input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <Input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-arise-gold-alt text-arise-deep-teal-alt hover:bg-arise-gold-alt/90 font-semibold px-8 py-3"
            >
              Save
            </Button>
          </div>
        </Card>
      )}

      {/* Subscription Tab Content */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Current plan Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Current plan</h3>
                <p className="text-gray-600 mb-4">
                  REVELATION: Complete profile assessment - Expires on 11/19/2024
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-arise-gold-alt/30 text-arise-deep-teal-alt rounded-full text-xs font-medium">
                    Professional
                  </span>
                  <span className="px-3 py-1 bg-arise-gold-alt/30 text-arise-deep-teal-alt rounded-full text-xs font-medium">
                    360 feedback
                  </span>
                  <span className="px-3 py-1 bg-arise-gold-alt/30 text-arise-deep-teal-alt rounded-full text-xs font-medium">
                    Wellness Pulse
                  </span>
                  <span className="px-3 py-1 bg-arise-gold-alt/30 text-arise-deep-teal-alt rounded-full text-xs font-medium">
                    Executive summary
                  </span>
                </div>
              </div>
              <div className="text-right ml-6">
                <p className="text-3xl font-bold text-gray-900">$299</p>
                <p className="text-gray-600">/ month</p>
              </div>
            </div>
          </Card>

          {/* Upgrade Your Plan Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
                <p className="text-gray-600">
                  COACHING: 4x60 coaching sessions with a certified coach
                </p>
              </div>
              <div className="text-right ml-6">
                <p className="text-3xl font-bold text-gray-900">$999</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              ADD
            </Button>
          </Card>

          {/* Ready to accelerate your growth? Card */}
          <Card 
            className="p-8 text-white border-0 relative overflow-hidden"
            className="bg-arise-dark-gray"
          >
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4">Ready to accelerate your growth?</h3>
                <p className="text-white/90 mb-6 max-w-2xl">
                  Connect with expert ARISE coaches who specialize in leadership development. 
                  Schedule your FREE coaching session to debrief your results and build a 
                  personalized development plan.
                </p>
                <Button 
                  className="bg-arise-gold-alt text-arise-deep-teal-alt hover:bg-arise-gold-alt/90 flex items-center gap-2 font-semibold"
                  onClick={() => router.push('/dashboard/coaching-options')}
                >
                  Explore coaching options
                  <ArrowRight size={20} />
                </Button>
              </div>
              {/* Image placeholder */}
              <div className="hidden lg:block flex-shrink-0 w-64 h-64 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-white/50 text-sm">Image placeholder</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
