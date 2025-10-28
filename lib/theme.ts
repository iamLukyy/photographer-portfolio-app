import type { PortfolioSettings, ThemePreset } from '@/types/settings';

// ===================================
// GOOGLE FONTS DEFINITIONS (15 Total)
// ===================================

export interface FontOption {
  name: string;
  type: 'serif' | 'sans';
  weights: number[];
  googleFontName: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  // SERIF FONTS (6)
  {
    name: 'EB Garamond',
    type: 'serif',
    weights: [400, 500, 600, 700],
    googleFontName: 'EB+Garamond',
  },
  {
    name: 'Playfair Display',
    type: 'serif',
    weights: [400, 500, 600, 700, 800],
    googleFontName: 'Playfair+Display',
  },
  {
    name: 'Cormorant Garamond',
    type: 'serif',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Cormorant+Garamond',
  },
  {
    name: 'Merriweather',
    type: 'serif',
    weights: [300, 400, 700, 900],
    googleFontName: 'Merriweather',
  },
  {
    name: 'Lora',
    type: 'serif',
    weights: [400, 500, 600, 700],
    googleFontName: 'Lora',
  },
  {
    name: 'Crimson Text',
    type: 'serif',
    weights: [400, 600, 700],
    googleFontName: 'Crimson+Text',
  },

  // SANS-SERIF FONTS (9)
  {
    name: 'Inter',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Inter',
  },
  {
    name: 'DM Sans',
    type: 'sans',
    weights: [400, 500, 700],
    googleFontName: 'DM+Sans',
  },
  {
    name: 'Work Sans',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Work+Sans',
  },
  {
    name: 'Poppins',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Poppins',
  },
  {
    name: 'Montserrat',
    type: 'sans',
    weights: [300, 400, 500, 600, 700, 800],
    googleFontName: 'Montserrat',
  },
  {
    name: 'Raleway',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Raleway',
  },
  {
    name: 'Outfit',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Outfit',
  },
  {
    name: 'Space Grotesk',
    type: 'sans',
    weights: [300, 400, 500, 600, 700],
    googleFontName: 'Space+Grotesk',
  },
  {
    name: 'Unbounded',
    type: 'sans',
    weights: [400, 500, 600, 700],
    googleFontName: 'Unbounded',
  },
];

// ===================================
// THEME PRESETS (4 Professional Styles)
// ===================================

export interface ThemeColors {
  primary: string;      // Main text color
  secondary: string;    // Background color
  accent: string;       // Accent elements (buttons, links)
  background: string;   // Page background
  gradient?: string;    // Optional gradient for backgrounds
}

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  // 1. Pure Minimalist - Classic black & white
  minimalist: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#111827',
    background: '#ffffff',
  },

  // 2. Warm Sepia - Vintage analog feel
  sepia: {
    primary: '#3d2817',
    secondary: '#f5e6d3',
    accent: '#8b6f47',
    background: '#faf8f3',
  },

  // 3. Dark Elegant - Modern dark mode
  dark: {
    primary: '#ffffff',
    secondary: '#0a0a0a',
    accent: '#d4d4d4',
    background: '#0a0a0a',
  },

  // 4. Subtle Gradient - Sophisticated with gradients
  gradient: {
    primary: '#1a1a1a',
    secondary: '#ffffff',
    accent: '#4a5568',
    background: '#f8fafc',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },

  // 5. Custom - User-defined colors
  custom: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#111827',
    background: '#ffffff',
  },
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Generate Google Fonts import URL
 */
export function generateFontUrl(fontName: string): string {
  const font = AVAILABLE_FONTS.find((f) => f.name === fontName);
  if (!font) {
    // Fallback to EB Garamond
    return 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=block';
  }

  const weights = font.weights.join(';');
  return `https://fonts.googleapis.com/css2?family=${font.googleFontName}:wght@${weights}&display=block`;
}

/**
 * Get theme colors based on settings
 */
export function getThemeColors(settings?: PortfolioSettings): ThemeColors {
  if (!settings?.theme) {
    return THEME_PRESETS.minimalist;
  }

  const { preset, customColors } = settings.theme;

  // If custom preset, use custom colors
  if (preset === 'custom' && customColors) {
    return {
      primary: customColors.primary,
      secondary: customColors.secondary,
      accent: customColors.accent,
      background: customColors.background,
    };
  }

  // Otherwise use preset
  return THEME_PRESETS[preset] || THEME_PRESETS.minimalist;
}

/**
 * Generate CSS variables string for injection
 */
export function generateThemeCSS(settings?: PortfolioSettings): string {
  const colors = getThemeColors(settings);
  const fontFamily = settings?.theme?.fontFamily || 'EB Garamond';

  // Determine font type for fallback stack
  const font = AVAILABLE_FONTS.find((f) => f.name === fontFamily);
  const fallback = font?.type === 'serif'
    ? '-apple-system, BlinkMacSystemFont, Georgia, serif'
    : '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

  return `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --font-family: '${fontFamily}', ${fallback};
      ${colors.gradient ? `--background-gradient: ${colors.gradient};` : ''}
    }
  `;
}

/**
 * Validate theme settings
 */
export function isValidThemePreset(preset: string): preset is ThemePreset {
  return ['minimalist', 'sepia', 'dark', 'gradient', 'custom'].includes(preset);
}

export function isValidFontName(fontName: string): boolean {
  return AVAILABLE_FONTS.some((f) => f.name === fontName);
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
