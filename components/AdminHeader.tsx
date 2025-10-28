'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminHeaderProps {
  siteTitle?: string;
  breadcrumb?: string;
  extraActions?: ReactNode;
}

export default function AdminHeader({ siteTitle, breadcrumb, extraActions }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = [
    { name: 'Photos', href: '/admin' },
    { name: 'Bookings', href: '/admin/bookings' },
    { name: 'Coupons', href: '/admin/coupons' },
    { name: 'Theme', href: '/admin/theme' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-24 xl:px-32">
        <div className="flex justify-between items-center h-20">
          {/* Logo + Breadcrumb */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-lg font-normal tracking-wide uppercase hover:opacity-60 transition-opacity"
            >
              {siteTitle || 'Photography Portfolio'}
            </Link>
            {breadcrumb && (
              <span className="text-sm text-gray-500 hidden sm:inline">{breadcrumb}</span>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative text-sm uppercase tracking-wide
                    transition-all duration-300 ease-out
                    after:content-[''] after:absolute after:bottom-[-6px] after:left-0
                    after:h-[1px] after:bg-current after:transition-all after:duration-300
                    ${
                      isActive
                        ? 'text-gray-900 font-medium after:w-full'
                        : 'text-gray-600 after:w-0 hover:after:w-full hover:text-gray-800'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
            {extraActions}
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-black px-4 py-2 text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap ml-2"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
