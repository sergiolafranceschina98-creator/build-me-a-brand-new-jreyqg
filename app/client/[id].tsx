
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';

interface ClientDetails {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  experience: string;
  goals: string;
  training_frequency: number;
  equipment: string;
  injuries?: string;
  preferred_exercises?: string;
  session_duration: number;
  body_fat_percentage?: number;
  squat_1rm?: number;
  bench_1rm?: number;
  deadlift_1rm?: number;
}

interface Program {
  id: string;
  program_name: string;
  duration_weeks: number;
  split_type: string;
  created_at: string;
}

export default function ClientDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    console.log('ClientDetailScreen mounted for client:', id);
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      console.log('Fetching client details and programs');
      setLoading(true);
      // TODO: Backend Integration - GET /api/clients/:id → full client profile
      // TODO: Backend Integration - GET /api/programs/client/:client_id → [{ id, program_name, duration_weeks, split_type, created_at }]
      
      // Temporary: Show empty state
      setClient(null);
      setPrograms([]);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProgram = async () => {
    console.log('User tapped Generate Program button');
    
    try {
      setGenerating(true);
      // TODO: Backend Integration - POST /api/programs/generate with { client_id } → { program_id, program_name, duration_weeks, split_type, program_data }
      console.log('Generating AI workout program for client:', id);
      
      // Temporary: Simulate generation
      setTimeout(() => {
        console.log('Program generated successfully (mock)');
        loadClientData();
      }, 2000);
    } catch (error) {
      console.error('Error generating program:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleProgramPress = (programId: string) => {
    console.log('User tapped program:', programId);
    router.push(`/program/${programId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Client Details',
            headerStyle: {
              backgroundColor: themeColors.card,
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

  if (!client) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Client Details',
            headerStyle: {
              backgroundColor: themeColors.card,
            },
            headerTintColor: themeColors.text,
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            Client not found
          </Text>
        </View>
      </View>
    );
  }

  const clientName = client.name;
  const clientAge = client.age.toString();
  const clientGender = client.gender;
  const clientGoals = client.goals;
  const clientExperience = client.experience;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: clientName,
          headerStyle: {
            backgroundColor: themeColors.card,
          },
          headerTintColor: themeColors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Client Profile
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Age:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {clientAge}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Gender:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {clientGender}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Goals:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {clientGoals}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Experience:
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {clientExperience}
            </Text>
          </View>
        </View>

        <View style={styles.programsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Workout Programs
          </Text>
          
          {programs.length === 0 ? (
            <View style={[styles.emptyProgramsCard, { backgroundColor: themeColors.card }]}>
              <IconSymbol
                ios_icon_name="dumbbell"
                android_material_icon_name="fitness-center"
                size={48}
                color={themeColors.textSecondary}
              />
              <Text style={[styles.emptyProgramsText, { color: themeColors.textSecondary }]}>
                No programs yet
              </Text>
              <Text style={[styles.emptyProgramsSubtext, { color: themeColors.textSecondary }]}>
                Generate a personalized workout program with AI
              </Text>
            </View>
          ) : (
            <View style={styles.programsList}>
              {programs.map((program, index) => {
                const programName = program.program_name;
                const durationText = `${program.duration_weeks} weeks`;
                const splitType = program.split_type;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.programCard, { backgroundColor: themeColors.card }]}
                    onPress={() => handleProgramPress(program.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.programHeader}>
                      <Text style={[styles.programName, { color: themeColors.text }]}>
                        {programName}
                      </Text>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron-right"
                        size={20}
                        color={themeColors.textSecondary}
                      />
                    </View>
                    <View style={styles.programMeta}>
                      <Text style={[styles.programMetaText, { color: themeColors.textSecondary }]}>
                        {durationText}
                      </Text>
                      <Text style={[styles.programMetaText, { color: themeColors.textSecondary }]}>
                        •
                      </Text>
                      <Text style={[styles.programMetaText, { color: themeColors.textSecondary }]}>
                        {splitType}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            { backgroundColor: themeColors.primary },
            generating && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateProgram}
          disabled={generating}
          activeOpacity={0.8}
        >
          {generating ? (
            <React.Fragment>
              <ActivityIndicator color="#FFFFFF" style={styles.buttonLoader} />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="sparkles"
                android_material_icon_name="auto-awesome"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.generateButtonText}>Generate AI Program</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
      </View>
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
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
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
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  programsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  emptyProgramsCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyProgramsText: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptyProgramsSubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  programsList: {
    gap: spacing.md,
  },
  programCard: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  programName: {
    ...typography.h3,
    flex: 1,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  programMetaText: {
    ...typography.bodySmall,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
  },
  generateButton: {
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonLoader: {
    marginRight: spacing.xs,
  },
});
