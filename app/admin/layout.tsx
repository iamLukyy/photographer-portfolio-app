import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Photography Portfolio',
  description: 'Admin dashboard for photo management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
