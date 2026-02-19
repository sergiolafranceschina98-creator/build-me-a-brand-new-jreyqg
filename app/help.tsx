
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';

export default function HelpScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: 'How do I create a new client profile?',
      answer: 'Tap the "+" button on the home screen to create a new client. Fill in their details including age, gender, training experience, goals, and equipment availability. The more information you provide, the better the AI can personalize their program.',
    },
    {
      question: 'How does the AI program generator work?',
      answer: 'Our AI analyzes your client\'s profile including their goals, experience level, available equipment, and any injuries or limitations. It then creates a periodized program with progressive overload, appropriate exercise selection, and optimal training splits.',
    },
    {
      question: 'Can I customize the generated programs?',
      answer: 'Yes! While the AI generates a complete program, you can review and modify exercises, sets, reps, and rest periods to better suit your client\'s specific needs and preferences.',
    },
    {
      question: 'What if my client has injuries?',
      answer: 'When creating a client profile, you can specify any injuries or limitations. The AI will automatically avoid exercises that could aggravate those conditions and suggest safer alternatives.',
    },
    {
      question: 'How long does it take to generate a program?',
      answer: 'The AI typically generates a complete 4-12 week program in under 60 seconds. The exact time depends on the complexity of the client\'s profile and program requirements.',
    },
    {
      question: 'Can I track my client\'s progress?',
      answer: 'Yes! Each program includes progress tracking features where you can log weights, reps, and RPE. The AI uses this data to adjust future workouts and ensure optimal progression.',
    },
  ];

  const handleToggle = (index: number) => {
    console.log('User tapped FAQ item:', faqItems[index].question);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Help & Support',
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
        <View style={[styles.headerCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <IconSymbol
            ios_icon_name="questionmark.circle.fill"
            android_material_icon_name="help"
            size={48}
            color={themeColors.primary}
          />
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            How can we help you?
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Find answers to common questions below
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            FREQUENTLY ASKED QUESTIONS
          </Text>
          {faqItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.faqItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => handleToggle(index)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.question, { color: themeColors.text }]}>
                    {item.question}
                  </Text>
                  <IconSymbol
                    ios_icon_name={expandedIndex === index ? 'chevron.up' : 'chevron.down'}
                    android_material_icon_name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={themeColors.textSecondary}
                  />
                </View>
                {expandedIndex === index && (
                  <Text style={[styles.answer, { color: themeColors.textSecondary }]}>
                    {item.answer}
                  </Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.body,
    textAlign: 'center',
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
  faqItem: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  answer: {
    ...typography.body,
    lineHeight: 24,
    marginTop: spacing.md,
  },
});
