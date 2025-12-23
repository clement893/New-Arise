'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-danger-600 dark:bg-danger-500 text-white rounded-lg hover:bg-danger-700 dark:hover:bg-danger-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Profile
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                  {user?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-lg font-semibold">
                  {user?.is_verified ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Resources</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">0</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Files</span>
                <span className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">0</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-info-50 dark:bg-info-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Activities</span>
                <span className="text-2xl font-bold text-info-600 dark:text-info-400">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
              <p className="text-secondary-700 dark:text-secondary-300 font-semibold">✓ Backend Connected</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">API is running</p>
            </div>
            <div className="p-4 border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
              <p className="text-secondary-700 dark:text-secondary-300 font-semibold">✓ Database Connected</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PostgreSQL is running</p>
            </div>
            <div className="p-4 border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
              <p className="text-secondary-700 dark:text-secondary-300 font-semibold">✓ Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">JWT is working</p>
            </div>
          </div>
        </div>

        {/* Test Pages */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Service Tests
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test and verify the configuration of integrated services
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Test */}
            <a
              href="/ai/test"
              className="group p-6 border-2 border-info-200 dark:border-info-800 bg-gradient-to-br from-info-50 to-info-100 dark:from-info-900/20 dark:to-info-800/20 rounded-lg hover:border-info-400 dark:hover:border-info-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-info-600 dark:bg-info-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-info-600 dark:text-info-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test OpenAI integration with chat completions and text generation
              </p>
            </a>

            {/* Email Test */}
            <a
              href="/email/test"
              className="group p-6 border-2 border-secondary-200 dark:border-secondary-800 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg hover:border-secondary-400 dark:hover:border-secondary-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary-600 dark:bg-secondary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test SendGrid email service with test, welcome, and custom emails
              </p>
            </a>

            {/* S3 Test */}
            <a
              href="/upload"
              className="group p-6 border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">S3 Upload</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test AWS S3 file upload and management functionality
              </p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
