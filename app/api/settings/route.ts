import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { PortfolioSettings } from '@/types/settings';

// GET - Read settings (public for About page, no auth needed)
export async function GET() {
  try {
    const settingsPath = join(process.cwd(), 'lib', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as PortfolioSettings;
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to read settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (requires authentication)
export async function PUT(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json() as Partial<PortfolioSettings>;
    const settingsPath = join(process.cwd(), 'lib', 'settings.json');
    const currentSettings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as PortfolioSettings;

    // Merge updates with current settings
    const newSettings: PortfolioSettings = {
      ...currentSettings,
      ...updates,
      // Mark as configured once user updates settings
      isConfigured: true,
    };

    writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
