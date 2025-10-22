import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Lukas Karel Photography',
  description: 'Admin dashboard for photo management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
