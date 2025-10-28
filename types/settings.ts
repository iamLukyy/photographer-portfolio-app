export type ThemePreset = 'minimalist' | 'sepia' | 'dark' | 'gradient' | 'custom';

export interface ThemeSettings {
  preset: ThemePreset;
  fontFamily: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export interface PortfolioSettings {
  photographerName: string;
  location: string;
  bio: string;
  email: string;
  instagram: string;
  profilePhoto: string;
  siteTitle: string;
  languages: string;
  equipment: string;
  bookingEnabled?: boolean;
  theme?: ThemeSettings;
}
