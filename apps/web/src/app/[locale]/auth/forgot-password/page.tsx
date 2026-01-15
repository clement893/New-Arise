'use client';

import { useState, Suspense } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { AxiosError } from 'axios';
import { authAPI } from '@/lib/api';
import { Input, Button, Alert, Card, Container } from '@/components/ui';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      // Backend should return 200 even if user doesn't exist (security best practice)
      // But handle errors gracefully
      if (axiosError.response?.status && axiosError.response.status >= 400) {
        const message = axiosError.response?.data?.detail || 
                       axiosError.response?.data?.message || 
                       'Failed to send password reset email. Please try again.';
        setError(message);
      } else {
        // Even on error, show success message for security (don't reveal if email exists)
        setSuccess(true);
      }
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
              Forgot Password
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <Alert variant="error" title="Error" className="mb-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" title="Email Sent" className="mb-4">
                If an account with that email exists, we've sent you a password reset link. Please check your email inbox.
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}
