
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const BACKEND_URL =
  Constants.expoConfig?.extra?.backendUrl ||
  'https://3v7m36dq7b8b7nhzwcy3b6cud7ap7qwr.app.specular.dev';

interface ClientDetails {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  experience: string;
  goals: string;
  trainingFrequency: number;
  equipment: string;
  injuries?: string | null;
  preferredExercises?: string | null;
  sessionDuration: number;
  bodyFatPercentage?: number | null;
  squat1rm?: number | null;
  bench1rm?: number | null;
  deadlift1rm?: number | null;
  createdAt: string;
  updatedAt: string;
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
  const { width } = useWindowDimensions();

  console.log('👤 ClientDetailScreen: Screen loaded for client ID:', id);

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [deleteModal, setDeleteModal] = useState(false);

  const isTablet = width >= 768;
  const isSplitView = width >= 1024;

  const showError = (message: string) => {
    console.error('❌ ClientDetailScreen: Error -', message);
    setErrorModal({ visible: true, message });
  };

  const loadClientData = useCallback(async () => {
    console.log('📥 ClientDetailScreen: Loading client data for ID:', id);
    try {
      setLoading(true);

      console.log('📤 ClientDetailScreen: GET request to:', `${BACKEND_URL}/api/clients/${id}`);
      const clientResponse = await fetch(`${BACKEND_URL}/api/clients/${id}`);
      console.log('📥 ClientDetailScreen: Client response status:', clientResponse.status);

      if (!clientResponse.ok) {
        let errMsg = `Failed to load client (${clientResponse.status})`;
        try {
          const errBody = await clientResponse.json();
          errMsg = errBody.error || errMsg;
          console.error('❌ ClientDetailScreen: Error response:', errBody);
        } catch (parseError) {
          console.error('❌ ClientDetailScreen: Could not parse error response');
        }
        throw new Error(errMsg);
      }

      const clientData: ClientDetails = await clientResponse.json();
      console.log('✅ ClientDetailScreen: Client loaded:', clientData.name);
      setClient(clientData);

      console.log('📤 ClientDetailScreen: GET request to:', `${BACKEND_URL}/api/programs/client/${id}`);
      const programsResponse = await fetch(`${BACKEND_URL}/api/programs/client/${id}`);
      console.log('📥 ClientDetailScreen: Programs response status:', programsResponse.status);

      if (!programsResponse.ok) {
        console.warn('⚠️ ClientDetailScreen: Failed to load programs:', programsResponse.status);
        setPrograms([]);
      } else {
        const programsData: Program[] = await programsResponse.json();
        console.log('✅ ClientDetailScreen: Programs loaded:', programsData.length);
        setPrograms(programsData);
      }
    } catch (error: any) {
      console.error('❌ ClientDetailScreen: Error loading client data:', error?.message || 'Unknown error');
      console.error('❌ ClientDetailScreen: Full error:', error);
      showError(error?.message || 'Failed to load client data.');
    } finally {
      setLoading(false);
      console.log('🏁 ClientDetailScreen: Load process completed');
    }
  }, [id]);

  useEffect(() => {
    console.log('👤 ClientDetailScreen: useEffect triggered, loading data...');
    loadClientData();
  }, [loadClientData]);

  const handleGenerateProgram = async () => {
    console.log('🚀 ClientDetailScreen: Generate Program button pressed');
    console.log('📋 ClientDetailScreen: Generating program for client:', id);

    try {
      setGenerating(true);
      console.log('📤 ClientDetailScreen: POST request to:', `${BACKEND_URL}/api/programs/generate`);
      console.log('📦 ClientDetailScreen: Payload:', { client_id: id });

      const response = await fetch(`${BACKEND_URL}/api/programs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: id }),
      });

      console.log('📥 ClientDetailScreen: Generate response status:', response.status);

      if (!response.ok) {
        let errMsg = `Failed to generate program (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errMsg;
          console.error('❌ ClientDetailScreen: Error response:', errBody);
        } catch (parseError) {
          console.error('❌ ClientDetailScreen: Could not parse error response');
        }
        throw new Error(errMsg);
      }

      const result = await response.json();
      console.log('✅ ClientDetailScreen: Program generated successfully:', result.program_name);
      console.log('🔄 ClientDetailScreen: Reloading client data to show new program...');

      await loadClientData();
    } catch (error: any) {
      console.error('❌ ClientDetailScreen: Error generating program:', error?.message || 'Unknown error');
      console.error('❌ ClientDetailScreen: Full error:', error);
      showError(error?.message || 'Failed to generate program. Please try again.');
    } finally {
      setGenerating(false);
      console.log('🏁 ClientDetailScreen: Generate process completed');
    }
  };

  const handleDeleteClient = async () => {
    console.log('🗑️ ClientDetailScreen: Delete confirmed for client:', id);
    setDeleteModal(false);

    try {
      console.log('📤 ClientDetailScreen: DELETE request to:', `${BACKEND_URL}/api/clients/${id}`);
      const response = await fetch(`${BACKEND_URL}/api/clients/${id}`, {
        method: 'DELETE',
      });

      console.log('📥 ClientDetailScreen: Delete response status:', response.status);

      if (!response.ok) {
        let errMsg = `Failed to delete client (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errMsg;
          console.error('❌ ClientDetailScreen: Error response:', errBody);
        } catch (parseError) {
          console.error('❌ ClientDetailScreen: Could not parse error response');
        }
        throw new Error(errMsg);
      }

      console.log('✅ ClientDetailScreen: Client deleted successfully');
      console.log('🔙 ClientDetailScreen: Navigating back to home');
      router.back();
    } catch (error: any) {
      console.error('❌ ClientDetailScreen: Error deleting client:', error?.message || 'Unknown error');
      console.error('❌ ClientDetailScreen: Full error:', error);
      showError(error?.message || 'Failed to delete client.');
    }
  };

  const handleProgramPress = (programId: string) => {
    console.log('📋 ClientDetailScreen: User tapped program:', programId);
    router.push(`/program/${programId}`);
  };

  if (loading) {
    console.log('⏳ ClientDetailScreen: Showing loading state...');
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Client Details',
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

  if (!client) {
    console.log('❌ ClientDetailScreen: Client not found');
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Client Details',
            headerStyle: {
              backgroundColor: themeColors.background,
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

  console.log('✅ ClientDetailScreen: Rendering client details for:', client.name);

  const clientName = client.name;
  const clientAge = client.age.toString();
  const clientGender = client.gender;
  const clientGoals = client.goals;
  const clientExperience = client.experience;
  const clientHeight = client.height.toString();
  const clientWeight = client.weight.toString();
  const trainingFreq = client.trainingFrequency.toString();
  const sessionDur = client.sessionDuration.toString();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: clientName,
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('🗑️ ClientDetailScreen: Delete button pressed');
                setDeleteModal(true);
              }}
              style={{ marginRight: spacing.sm }}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={isTablet ? 24 : 22}
                color={themeColors.error}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('✅ ClientDetailScreen: Error modal dismissed');
          setErrorModal({ visible: false, message: '' });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: themeColors.error + '20' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={28}
                color={themeColors.error}
              />
            </View>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Error</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>
              {errorModal.message}
            </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('✅ ClientDetailScreen: Error modal dismissed');
                setErrorModal({ visible: false, message: '' });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[themeColors.primary, themeColors.secondary]}
                style={styles.modalButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('❌ ClientDetailScreen: Delete modal cancelled');
          setDeleteModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: themeColors.error + '20' }]}>
              <IconSymbol
                ios_icon_name="trash.fill"
                android_material_icon_name="delete"
                size={28}
                color={themeColors.error}
              />
            </View>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Delete Client</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>
              Are you sure you want to delete {clientName}? This will also delete all associated programs and sessions.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  console.log('❌ ClientDetailScreen: Delete cancelled');
                  setDeleteModal(false);
                }}
                activeOpacity={0.8}
                style={[styles.modalCancelButton, { borderColor: themeColors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: themeColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteClient}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[themeColors.error, '#FF6B6B']}
                  style={styles.modalButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && { paddingHorizontal: spacing.xl, maxWidth: isSplitView ? 1200 : 900, alignSelf: 'center', width: '100%' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={isSplitView && { flexDirection: 'row', gap: spacing.lg }}>
          <View style={isSplitView && { flex: 1 }}>
            <LinearGradient
              colors={[themeColors.card, themeColors.card]}
              style={[styles.card, { borderColor: themeColors.border }]}
            >
              <Text style={[styles.cardTitle, { color: themeColors.text }, isTablet && { fontSize: 24 }]}>
                Client Profile
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Age:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientAge}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Gender:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientGender}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Height:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientHeight} cm
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Weight:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientWeight} kg
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Goals:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientGoals}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Experience:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {clientExperience}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Training Frequency:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {trainingFreq} days/week
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }, isTablet && { fontSize: 17 }]}>
                  Session Duration:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }, isTablet && { fontSize: 17 }]}>
                  {sessionDur} min
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.programsSection, isSplitView && { flex: 1 }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }, isTablet && { fontSize: 24 }]}>
              Workout Programs
            </Text>
            
            {programs.length === 0 ? (
              <LinearGradient
                colors={[themeColors.primary + '15', themeColors.secondary + '10']}
                style={styles.emptyProgramsCard}
              >
                <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '30' }]}>
                  <IconSymbol
                    ios_icon_name="dumbbell"
                    android_material_icon_name="fitness-center"
                    size={isTablet ? 40 : 32}
                    color={themeColors.primary}
                  />
                </View>
                <Text style={[styles.emptyProgramsText, { color: themeColors.text }, isTablet && { fontSize: 22 }]}>
                  No programs yet
                </Text>
                <Text style={[styles.emptyProgramsSubtext, { color: themeColors.textSecondary }, isTablet && { fontSize: 16 }]}>
                  Generate a personalized workout program with AI
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.programsList}>
                {programs.map((program, index) => {
                  const programName = program.program_name;
                  const durationText = `${program.duration_weeks} weeks`;
                  const splitType = program.split_type;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleProgramPress(program.id)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[themeColors.card, themeColors.card]}
                        style={[styles.programCard, { borderColor: themeColors.border }]}
                      >
                        <View style={styles.programHeader}>
                          <Text style={[styles.programName, { color: themeColors.text }, isTablet && { fontSize: 20 }]}>
                            {programName}
                          </Text>
                          <IconSymbol
                            ios_icon_name="chevron.right"
                            android_material_icon_name="chevron-right"
                            size={isTablet ? 24 : 20}
                            color={themeColors.primary}
                          />
                        </View>
                        <View style={styles.programMeta}>
                          <Text style={[styles.programMetaText, { color: themeColors.textSecondary }, isTablet && { fontSize: 15 }]}>
                            {durationText}
                          </Text>
                          <View style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} />
                          <Text style={[styles.programMetaText, { color: themeColors.textSecondary }, isTablet && { fontSize: 15 }]}>
                            {splitType}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
        <View style={[isTablet && { maxWidth: isSplitView ? 1200 : 900, alignSelf: 'center', width: '100%' }]}>
          <TouchableOpacity
            onPress={handleGenerateProgram}
            disabled={generating}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.secondary]}
              style={[styles.generateButton, generating && styles.generateButtonDisabled, isTablet && { height: 64 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {generating ? (
                <React.Fragment>
                  <ActivityIndicator color="#FFFFFF" style={styles.buttonLoader} />
                  <Text style={[styles.generateButtonText, isTablet && { fontSize: 20 }]}>Generating...</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="sparkles"
                    android_material_icon_name="auto-awesome"
                    size={isTablet ? 24 : 20}
                    color="#FFFFFF"
                  />
                  <Text style={[styles.generateButtonText, isTablet && { fontSize: 20 }]}>Generate AI Program</Text>
                </React.Fragment>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 120,
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
    textTransform: 'capitalize',
  },
  programsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  emptyProgramsCard: {
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
  emptyProgramsText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptyProgramsSubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  programsList: {
    gap: spacing.md,
  },
  programCard: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    gap: spacing.sm,
  },
  programMetaText: {
    ...typography.bodySmall,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
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
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonLoader: {
    marginRight: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
