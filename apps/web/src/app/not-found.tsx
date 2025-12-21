/**
 * 404 Not Found Page
 * Custom 404 page for Next.js
 */

import Link from 'next/link';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { NotFoundError } from '@/lib/errors';

export default function NotFound() {
  const error = new NotFoundError('The page you are looking for does not exist.');

  return (
    <ErrorDisplay
      error={error}
      onReset={() => window.location.href = '/'}
    >
      <div className="mt-6">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to homepage
        </Link>
      </div>
    </ErrorDisplay>
  );
}

