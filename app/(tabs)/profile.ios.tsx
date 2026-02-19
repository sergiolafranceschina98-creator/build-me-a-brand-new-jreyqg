
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const settingsItems = [
    {
      icon: 'info',
      title: 'About',
      subtitle: 'App version and information',
    },
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance and FAQs',
    },
    {
      icon: 'privacy-tip',
      title: 'Privacy Policy',
      subtitle: 'Your data and privacy',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerLargeTitle: true,
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
              size={48}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.appTitle}>
            AI Workout Builder
          </Text>
          <Text style={styles.appSubtitle}>
            For Personal Trainers
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            SETTINGS
          </Text>
          {settingsItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={index}
                style={[styles.settingsItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name={item.icon}
                    android_material_icon_name={item.icon}
                    size={24}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: themeColors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            Made with ❤️ for Personal Trainers
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
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    ...typography.bodySmall,
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
