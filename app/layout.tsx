import type { Metadata } from 'next';
import { EB_Garamond } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PortfolioSettings } from '@/types/settings';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
});

// Generate metadata dynamically from settings
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settingsPath = join(process.cwd(), 'lib', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as PortfolioSettings;

    return {
      title: settings.siteTitle,
      description: `Minimalist photography portfolio by ${settings.photographerName}`,
      keywords: ['photography', 'portfolio', 'photographer', settings.photographerName, 'visual art'],
    };
  } catch (error) {
    console.error('Failed to load settings for metadata:', error);
    // Fallback metadata
    return {
      title: 'Photography Portfolio',
      description: 'Minimalist photography portfolio',
      keywords: ['photography', 'portfolio', 'photographer', 'visual art'],
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ebGaramond.variable}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
