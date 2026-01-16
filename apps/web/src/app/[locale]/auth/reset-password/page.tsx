'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { AxiosError } from 'axios';
import { authAPI } from '@/lib/api';
import { Input, Button, Alert, Card, Container } from '@/components/ui';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query params
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Reset token is missing. Please use the link from your email.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.detail || 
                     axiosError.response?.data?.message || 
                     'Failed to reset password. The token may be invalid or expired.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-muted dark:to-muted flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24 pb-8 px-4">
        <Container className="w-full max-w-md">
          <Card>
            <h1 className="text-3xl font-bold text-center text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Enter your new password below.
            </p>

            {error && (
              <Alert variant="error" title="Error" className="mb-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" title="Success" className="mb-4">
                Your password has been reset successfully. Redirecting to login...
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min. 8 characters)"
                  fullWidth
                  minLength={8}
                />

                <Input
                  type="password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  fullWidth
                  minLength={8}
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !token}
                  loading={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-muted dark:to-muted">
        <Container className="w-full max-w-md">
          <Card>
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </Card>
        </Container>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
