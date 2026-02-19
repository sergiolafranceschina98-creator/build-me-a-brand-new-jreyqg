
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

// Premium Dark Theme with Vibrant Orange Accent
export const colors = {
  // Core colors (used directly)
  background: '#0A0A0F',
  card: '#1A1A24',
  cardBackground: '#1A1A24',
  cardBackgroundAlt: '#252535',
  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  primary: '#FF7F00',
  primaryDark: '#E67300',
  secondary: '#FFA500',
  accent: '#FF7F00',
  highlight: '#FFA500',
  border: '#2A2A3A',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  
  // Light theme
  light: {
    background: '#F5F5F7',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B7B',
    primary: '#FF7F00',
    secondary: '#FFA500',
    accent: '#FF7F00',
    highlight: '#FFA500',
    border: '#E0E0E8',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  // Dark theme (Premium)
  dark: {
    background: '#0A0A0F',
    card: '#1A1A24',
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    primary: '#FF7F00',
    secondary: '#FFA500',
    accent: '#FF7F00',
    highlight: '#FFA500',
    border: '#2A2A3A',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Font sizes
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  // Preset text styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
});
