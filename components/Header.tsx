'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioSettings } from '@/types/settings';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const navItems = [
    { name: 'Portfolio', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Booking', href: '/booking' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, transparent)'
      }}
    >
      <nav className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Name */}
          <Link
            href="/"
            className="text-base sm:text-xl font-normal tracking-wide hover:opacity-60 transition-opacity duration-300 uppercase whitespace-nowrap"
            style={{ color: 'var(--color-primary)' }}
          >
            {settings?.siteTitle || 'Photography Portfolio'}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-normal tracking-wide uppercase transition-opacity duration-300 ${
                  pathname === item.href
                    ? 'opacity-100'
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{ color: 'var(--color-primary)' }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block text-sm uppercase tracking-wide transition-opacity ${
                      pathname === item.href
                        ? 'opacity-100'
                        : 'opacity-50'
                    }`}
                    style={{ color: 'var(--color-primary)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
