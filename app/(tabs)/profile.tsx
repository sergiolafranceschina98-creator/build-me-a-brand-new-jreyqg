
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: themeColors.card,
          },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <IconSymbol
            ios_icon_name="dumbbell"
            android_material_icon_name="fitness-center"
            size={64}
            color={themeColors.primary}
          />
          <Text style={[styles.appName, { color: themeColors.text }]}>
            AI Workout Builder
          </Text>
          <Text style={[styles.tagline, { color: themeColors.textSecondary }]}>
            For Personal Trainers
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>
            About
          </Text>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Create fully personalized, periodized workout programs for your clients in under 60 seconds.
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>
            Features
          </Text>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.success}
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
              color={themeColors.success}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Periodized training plans
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={themeColors.success}
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
              color={themeColors.success}
            />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Injury-aware exercise selection
            </Text>
          </View>
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
  },
  card: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.h2,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  featureText: {
    ...typography.body,
    flex: 1,
  },
});
