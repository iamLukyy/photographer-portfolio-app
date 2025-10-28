import type { Metadata } from 'next';
import Header from '@/components/Header';
import './globals.css';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PortfolioSettings } from '@/types/settings';
import { generateFontUrl, generateThemeCSS } from '@/lib/theme';

// Force dynamic rendering - settings can change at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Load settings server-side
function loadSettings(): PortfolioSettings | null {
  try {
    const settingsPath = join(process.cwd(), 'lib', 'settings.json');
    return JSON.parse(readFileSync(settingsPath, 'utf-8')) as PortfolioSettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}

// Generate metadata dynamically from settings
export async function generateMetadata(): Promise<Metadata> {
  const settings = loadSettings();

  if (settings) {
    return {
      title: settings.siteTitle,
      description: `Minimalist photography portfolio by ${settings.photographerName}`,
      keywords: ['photography', 'portfolio', 'photographer', settings.photographerName, 'visual art'],
    };
  }

  // Fallback metadata
  return {
    title: 'Photography Portfolio',
    description: 'Minimalist photography portfolio',
    keywords: ['photography', 'portfolio', 'photographer', 'visual art'],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = loadSettings();
  const fontUrl = generateFontUrl(settings?.theme?.fontFamily || 'EB Garamond');
  const themeCSS = generateThemeCSS(settings || undefined);

  return (
    <html lang="en">
      <head>
        {/* Preconnect FIRST for faster DNS resolution */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Theme CSS Variables - inline for instant render */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

        {/* Google Font with high priority - display=swap for progressive enhancement */}
        <link rel="preload" as="style" href={fontUrl} />
        <link rel="stylesheet" href={fontUrl} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
