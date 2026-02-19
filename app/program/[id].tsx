
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgramDetails {
  id: string;
  program_name: string;
  duration_weeks: number;
  split_type: string;
  program_data: any;
}

export default function ProgramDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProgramDetailScreen mounted for program:', id);
    loadProgramData();
  }, [id]);

  const loadProgramData = async () => {
    try {
      console.log('Fetching program details');
      setLoading(true);
      // TODO: Backend Integration - GET /api/programs/:id → full program with all workout sessions
      
      setProgram(null);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Program Details',
            headerStyle: {
              backgroundColor: themeColors.background,
            },
            headerTintColor: themeColors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Program Details',
            headerStyle: {
              backgroundColor: themeColors.background,
            },
            headerTintColor: themeColors.text,
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            Program not found
          </Text>
        </View>
      </View>
    );
  }

  const programName = program.program_name;
  const durationText = `${program.duration_weeks} weeks`;
  const splitType = program.split_type;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: programName,
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
          colors={[themeColors.card, themeColors.card]}
          style={[styles.card, { borderColor: themeColors.border }]}
        >
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Program Overview
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Duration:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {durationText}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Split:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {splitType}
            </Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[themeColors.primary + '15', themeColors.secondary + '10']}
          style={styles.comingSoonCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '30' }]}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={32}
              color={themeColors.primary}
            />
          </View>
          <Text style={[styles.comingSoonText, { color: themeColors.text }]}>
            Workout Sessions
          </Text>
          <Text style={[styles.comingSoonSubtext, { color: themeColors.textSecondary }]}>
            Detailed workout sessions will be displayed here
          </Text>
        </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '700',
  },
  comingSoonCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  comingSoonText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  comingSoonSubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
