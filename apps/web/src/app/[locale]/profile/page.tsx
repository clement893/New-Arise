'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SubscriptionManagement from '@/components/profile/SubscriptionManagement';
import { clsx } from 'clsx';
import { usersAPI, apiClient } from '@/lib/api';
import { extractApiData } from '@/lib/api/utils';
import { useToast } from '@/lib/toast';
import { transformApiUserToStoreUser } from '@/lib/auth/userTransform';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const { showToast } = useToast();
  
  // Initialize activeTab from URL parameter or default to 'profile'
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>(() => {
    const tab = searchParams?.get('tab');
    return (tab === 'subscription' ? 'subscription' : 'profile') as 'profile' | 'subscription';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'male',
    age: '',
    highestDegree: '',
    mainGoal: '',
    workedWithCoach: false,
    organizationName: '',
    position: '',
  });

  // Load user data and preferences on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Load user data
        const response = await usersAPI.getMe();
        const userData = extractApiData(response);
        
        if (userData && typeof userData === 'object') {
          // Initialize form with user data
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || prev.firstName || '',
            lastName: userData.last_name || prev.lastName || '',
            email: userData.email || prev.email || '',
          }));
        }
        
        // Load user preferences for additional fields
        try {
          const preferencesResponse = await apiClient.get('/v1/users/preferences');
          const preferences = extractApiData(preferencesResponse) || {};
          
          if (preferences && typeof preferences === 'object') {
            setFormData(prev => ({
              ...prev,
              gender: preferences.gender || prev.gender || 'male',
              age: preferences.age || prev.age || '',
              highestDegree: preferences.highestDegree || prev.highestDegree || '',
              mainGoal: preferences.mainGoal || prev.mainGoal || '',
              workedWithCoach: preferences.workedWithCoach ?? prev.workedWithCoach ?? false,
              organizationName: preferences.organizationName || prev.organizationName || '',
              position: preferences.position || prev.position || '',
            }));
          }
        } catch (prefError) {
          // Preferences might not exist yet, that's okay
          console.log('No preferences found or error loading preferences:', prefError);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        showToast({
          message: 'Failed to load profile data',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update activeTab when URL parameter changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'subscription') {
      setActiveTab('subscription');
    } else if (tab === 'profile' || !tab) {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'profile' | 'subscription') => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'profile') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const queryString = params.toString();
    const newUrl = queryString 
      ? `${window.location.pathname}?${queryString}` 
      : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare update data (only fields that can be updated via API)
      const updateData: {
        first_name?: string;
        last_name?: string;
        email?: string;
      } = {};

      if (formData.firstName.trim()) {
        updateData.first_name = formData.firstName.trim();
      }
      if (formData.lastName.trim()) {
        updateData.last_name = formData.lastName.trim();
      }
      if (formData.email.trim()) {
        updateData.email = formData.email.trim();
      }

      // Call API to update user
      const response = await usersAPI.updateMe(updateData);
      const userData = extractApiData(response);
      
      if (userData && typeof userData === 'object') {
        // Update auth store with new user data
        const updatedUser = transformApiUserToStoreUser(userData);
        setUser(updatedUser);

        // Update form data with the response from server
        setFormData(prev => ({
          ...prev,
          firstName: userData.first_name || prev.firstName || '',
          lastName: userData.last_name || prev.lastName || '',
          email: userData.email || prev.email || '',
        }));

        // Save additional fields to user preferences
        try {
          const preferencesToSave: Record<string, any> = {
            gender: formData.gender,
            age: formData.age,
            highestDegree: formData.highestDegree,
            mainGoal: formData.mainGoal,
            workedWithCoach: formData.workedWithCoach,
            organizationName: formData.organizationName,
            position: formData.position,
          };
          
          // Remove empty values
          Object.keys(preferencesToSave).forEach(key => {
            if (preferencesToSave[key] === '' || preferencesToSave[key] === null || preferencesToSave[key] === undefined) {
              delete preferencesToSave[key];
            }
          });
          
          if (Object.keys(preferencesToSave).length > 0) {
            await apiClient.put('/v1/users/preferences', preferencesToSave);
          }
        } catch (prefError) {
          console.error('Failed to save preferences:', prefError);
          // Don't fail the whole save if preferences fail
          showToast({
            message: 'Profile updated, but some additional information could not be saved',
            type: 'warning',
          });
          return; // Return early to avoid showing success message
        }

        showToast({
          message: 'Profile updated successfully',
          type: 'success',
        });
      } else {
        throw new Error('No data returned from server');
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to update profile. Please try again.';
      showToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Your profile</h1>
        <p className="text-white/90 text-lg mb-6">Update my profile information & Subscription</p>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('profile')}
            className={clsx(
              'px-6 py-3 rounded-t-lg font-semibold transition-colors',
              activeTab === 'profile'
                ? 'bg-white text-arise-deep-teal-alt'
                : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white'
            )}
          >
            Profile
          </button>
          <button
            onClick={() => handleTabChange('subscription')}
            className={clsx(
              'px-6 py-3 rounded-t-lg font-semibold transition-colors',
              activeTab === 'subscription'
                ? 'bg-white text-arise-deep-teal-alt'
                : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white'
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
            <Button variant="arise-primary">
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
              disabled={isSaving || isLoading}
              className="!bg-arise-gold-alt !text-arise-deep-teal-alt hover:!bg-arise-gold-alt/90 font-semibold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-arise-gold-alt, #F4B860)', color: 'var(--color-arise-deep-teal-alt, #1B5E6B)' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
      )}

      {/* Subscription Tab Content */}
      {activeTab === 'subscription' && (
        <SubscriptionManagement />
      )}
    </div>
  );
}
