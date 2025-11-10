export const COLORS = {
  // Primary colors
  background: '#000000',
  backgroundLight: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  
  // Accent colors
  primary: '#FF6B9D',
  primaryLight: '#FF8FB8',
  secondary: '#A855F7',
  accent: '#3B82F6',
  
  // UI colors
  border: '#333333',
  borderLight: '#444444',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Glassmorphism
  glassBackground: 'rgba(26, 26, 26, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
