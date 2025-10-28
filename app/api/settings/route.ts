import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { PortfolioSettings } from '@/types/settings';
import { isValidThemePreset, isValidFontName, isValidHexColor } from '@/lib/theme';

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

    // Validate theme settings if provided
    if (updates.theme) {
      const { preset, fontFamily, customColors } = updates.theme;

      // Validate preset
      if (preset && !isValidThemePreset(preset)) {
        return NextResponse.json(
          { error: 'Invalid theme preset' },
          { status: 400 }
        );
      }

      // Validate font family
      if (fontFamily && !isValidFontName(fontFamily)) {
        return NextResponse.json(
          { error: 'Invalid font family' },
          { status: 400 }
        );
      }

      // Validate custom colors if preset is custom
      if (preset === 'custom' && customColors) {
        const colors = [
          customColors.primary,
          customColors.secondary,
          customColors.accent,
          customColors.background,
        ];

        if (!colors.every((color) => isValidHexColor(color))) {
          return NextResponse.json(
            { error: 'Invalid hex color format. Use #RRGGBB format.' },
            { status: 400 }
          );
        }
      }
    }

    // Merge updates with current settings
    const newSettings: PortfolioSettings = {
      ...currentSettings,
      ...updates,
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
