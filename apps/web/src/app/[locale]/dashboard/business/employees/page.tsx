'use client';

export const dynamic = 'force-dynamic';

import { Container } from '@/components/ui';

export default function EmployeesPage() {
  return (
    <Container className="py-4 sm:py-6 md:py-8" maxWidth="full" center={false}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Employees
        </h1>
        <p className="text-sm sm:text-base text-white">
          Manage your employees here.
        </p>
      </div>
    </Container>
  );
}
