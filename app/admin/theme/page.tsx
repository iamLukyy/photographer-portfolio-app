'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeader from '@/components/AdminHeader';
import type { PortfolioSettings, ThemePreset, ThemeSettings } from '@/types/settings';
import { AVAILABLE_FONTS, THEME_PRESETS, generateFontUrl } from '@/lib/theme';

export default function AdminThemePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>('minimalist');
  const [selectedFont, setSelectedFont] = useState<string>('EB Garamond');
  const [customColors, setCustomColors] = useState({
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#111827',
    background: '#ffffff',
  });
  const [showCustom, setShowCustom] = useState(false);
  const [fontFilter, setFontFilter] = useState<'all' | 'serif' | 'sans'>('all');
  const [saving, setSaving] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to verify admin authentication:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);

      // Load current theme settings
      if (data.theme) {
        setSelectedPreset(data.theme.preset);
        setSelectedFont(data.theme.fontFamily);
        if (data.theme.preset === 'custom' && data.theme.customColors) {
          setCustomColors(data.theme.customColors);
          setShowCustom(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  // Load all fonts for preview
  useEffect(() => {
    // Inject link tags for all fonts
    AVAILABLE_FONTS.forEach((font) => {
      const fontUrl = generateFontUrl(font.name);
      const linkId = `font-preview-${font.name.replace(/\s+/g, '-')}`;

      // Check if already loaded
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    });
  }, []);

  const handlePresetChange = (preset: ThemePreset) => {
    setSelectedPreset(preset);
    if (preset === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const themeSettings: ThemeSettings = {
      preset: selectedPreset,
      fontFamily: selectedFont,
      ...(selectedPreset === 'custom' ? { customColors } : {}),
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeSettings }),
      });

      if (res.ok) {
        toast.success('Theme saved! Refreshing page...', {
          duration: 2000,
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'var(--font-family)',
          },
        });
        // Reload page to apply new theme
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Error saving theme');
    } finally {
      setSaving(false);
    }
  };


  const filteredFonts = AVAILABLE_FONTS.filter((font) => {
    if (fontFilter === 'all') return true;
    return font.type === fontFilter;
  });

  const presetInfo = {
    minimalist: {
      name: 'Pure Minimalist',
      description: 'Classic black & white - timeless elegance',
    },
    sepia: {
      name: 'Warm Sepia',
      description: 'Vintage analog feel with warm tones',
    },
    dark: {
      name: 'Dark Elegant',
      description: 'Modern dark mode with high contrast',
    },
    gradient: {
      name: 'Subtle Gradient',
      description: 'Sophisticated with soft gradients',
    },
    custom: {
      name: 'Custom',
      description: 'Your own color palette',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <AdminHeader siteTitle={settings?.siteTitle} breadcrumb="Admin / Theme" />

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1920px] mx-auto">
          <h1 className="text-2xl sm:text-3xl font-light mb-6">Theme Customization</h1>

          {/* Theme Presets Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Choose a Theme Preset</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(presetInfo) as ThemePreset[]).map((preset) => {
                const colors = THEME_PRESETS[preset];
                const info = presetInfo[preset];

                return (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      selectedPreset === preset
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: colors.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: colors.accent }}
                      />
                    </div>
                    <h3 className="font-medium text-base mb-1">{info.name}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Colors Section (only visible when Custom is selected) */}
          {showCustom && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Custom Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color (Text)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, primary: e.target.value })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, primary: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, secondary: e.target.value })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, secondary: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color (Buttons, Links)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, accent: e.target.value })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, accent: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="#111827"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, background: e.target.value })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.background}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, background: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Font Selection Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Choose a Font</h2>

            {/* Font Filter */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFontFilter('all')}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  fontFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Fonts
              </button>
              <button
                onClick={() => setFontFilter('serif')}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  fontFilter === 'serif'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFilter('sans')}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  fontFilter === 'sans'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sans-Serif
              </button>
            </div>

            {/* Font Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFonts.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font.name)}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    selectedFont === font.name
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{
                    fontFamily: `'${font.name}', ${
                      font.type === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif'
                    }`,
                  }}
                >
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {font.type}
                  </p>
                  <p className="text-lg font-medium mb-2">
                    {font.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={fetchSettings}
              className="px-6 py-3 bg-gray-200 text-black rounded hover:bg-gray-300 transition-colors"
            >
              Reset to Saved
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
