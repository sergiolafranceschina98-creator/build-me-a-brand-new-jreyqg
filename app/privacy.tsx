
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import React from 'react';

export default function PrivacyScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const lastUpdatedText = 'Last updated: January 2024';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
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
        <Text style={[styles.lastUpdated, { color: themeColors.textSecondary }]}>
          {lastUpdatedText}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Introduction
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            AI Workout Builder ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Information We Collect
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We collect information that you provide directly to us, including:
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Client profile information (name, age, gender, fitness goals)
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Training data and workout programs
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Progress tracking and performance metrics
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Account information and preferences
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            How We Use Your Information
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Generate personalized workout programs using AI
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Track and analyze client progress
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Improve our AI algorithms and services
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Provide customer support
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Send important updates about the app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Data Storage and Security
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and encrypted both in transit and at rest.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Data Sharing
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • With your explicit consent
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • To comply with legal obligations
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • To protect our rights and safety
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Your Rights
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Access your personal information
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Correct inaccurate data
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Request deletion of your data
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Opt-out of marketing communications
          </Text>
          <Text style={[styles.bulletText, { color: themeColors.textSecondary }]}>
            • Export your data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Children's Privacy
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            Our app is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Changes to This Policy
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Contact Us
          </Text>
          <Text style={[styles.bodyText, { color: themeColors.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={[styles.contactText, { color: themeColors.primary }]}>
            privacy@aiworkoutbuilder.com
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
  lastUpdated: {
    ...typography.caption,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  bodyText: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bulletText: {
    ...typography.body,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  contactText: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
