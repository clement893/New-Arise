import InternalLayout from '@/components/layout/InternalLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InternalLayout>{children}</InternalLayout>;
}