// Main color palette
const colors = {
  // Primary colors
  primary: {
    50: '#E6FFFC',
    100: '#B3FFF5',
    200: '#80FFEE',
    300: '#4DFFE7',
    400: '#2DD4BF', // Main primary color
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  
  // Secondary colors
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA', // Main secondary color
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  
  // Accent colors
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C', // Main accent color
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#0F0F11',
  },
  
  // Semantic colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export default colors;

// Theme configuration
export const lightTheme = {
  background: colors.white,
  card: colors.white,
  text: colors.neutral[900],
  textSecondary: colors.neutral[600],
  border: colors.neutral[200],
  primary: colors.primary[400],
  secondary: colors.secondary[400],
  accent: colors.accent[400],
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
};

export const darkTheme = {
  background: colors.neutral[900],
  card: colors.neutral[800],
  text: colors.white,
  textSecondary: colors.neutral[300],
  border: colors.neutral[700],
  primary: colors.primary[300],
  secondary: colors.secondary[300],
  accent: colors.accent[300],
  success: colors.success[400],
  warning: colors.warning[400],
  error: colors.error[400],
};