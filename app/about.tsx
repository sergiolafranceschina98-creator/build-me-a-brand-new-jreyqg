
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';

export default function AboutScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'About',
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[themeColors.primary, themeColors.secondary]}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.appIconContainer}>
            <IconSymbol
              ios_icon_name="dumbbell.fill"
              android_material_icon_name="fitness-center"
              size={64}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.appTitle}>
            AI Workout Builder
          </Text>
          <Text style={styles.appSubtitle}>
            For Personal Trainers
          </Text>
          <Text style={styles.version}>
            Version 1.0.0
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            About This App
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            AI Workout Builder is a powerful tool designed specifically for personal trainers to create fully personalized, periodized workout programs for their clients in under 60 seconds.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Key Features
          </Text>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              AI-powered program generation
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Personalized client profiles
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              4-12 week periodized plans
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Progressive overload tracking
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Comprehensive exercise database
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            Made with ❤️ for Personal Trainers
          </Text>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            © 2024 AI Workout Builder
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  bodyText: {
    ...typography.body,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.caption,
  },
});
