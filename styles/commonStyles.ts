
import { StyleSheet } from 'react-native';

// AI Workout Builder Theme - Professional fitness app colors
export const colors = {
  // Light theme
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    primary: '#3B82F6', // Blue - trust and professionalism
    secondary: '#10B981', // Green - health and growth
    accent: '#8B5CF6', // Purple - AI/tech
    highlight: '#F59E0B', // Amber - energy
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
  },
  // Dark theme
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#A78BFA',
    highlight: '#FBBF24',
    border: '#334155',
    error: '#F87171',
    success: '#34D399',
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
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
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
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
});
