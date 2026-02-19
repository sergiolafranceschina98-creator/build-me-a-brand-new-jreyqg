
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const BACKEND_URL =
  Constants.expoConfig?.extra?.backendUrl ||
  'https://3v7m36dq7b8b7nhzwcy3b6cud7ap7qwr.app.specular.dev';

interface SessionExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface WorkoutSession {
  id: string;
  week_number: number;
  day_number: number;
  session_name: string;
  exercises: SessionExercise[];
  completed: boolean;
}

interface ProgramDetails {
  id: string;
  client_id: string;
  program_name: string;
  duration_weeks: number;
  split_type: string;
  program_data: any;
  sessions: WorkoutSession[];
  created_at: string;
}

export default function ProgramDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const showError = (message: string) => {
    setErrorModal({ visible: true, message });
  };

  useEffect(() => {
    console.log('ProgramDetailScreen mounted for program:', id);
    loadProgramData();
  }, [id]);

  const loadProgramData = async () => {
    try {
      console.log('[API] GET /api/programs/', id);
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/programs/${id}`);
      if (!response.ok) {
        let errMsg = `Failed to load program (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errMsg;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      const data: ProgramDetails = await response.json();
      console.log('[API] Program loaded:', data.program_name, '- sessions:', data.sessions?.length ?? 0);
      setProgram(data);
    } catch (error: any) {
      console.error('Error loading program:', error);
      showError(error?.message || 'Failed to load program data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async () => {
    setDeleteModal(false);
    try {
      console.log('[API] DELETE /api/programs/', id);
      const response = await fetch(`${BACKEND_URL}/api/programs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let errMsg = `Failed to delete program (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errMsg;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      console.log('Program deleted successfully');
      router.back();
    } catch (error: any) {
      console.error('Error deleting program:', error);
      showError(error?.message || 'Failed to delete program.');
    }
  };

  // Group sessions by week
  const sessionsByWeek = React.useMemo(() => {
    if (!program?.sessions) return {};
    return program.sessions.reduce<Record<number, WorkoutSession[]>>((acc, session) => {
      const week = session.week_number;
      if (!acc[week]) acc[week] = [];
      acc[week].push(session);
      return acc;
    }, {});
  }, [program]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Program Details',
            headerStyle: { backgroundColor: themeColors.background },
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
            headerStyle: { backgroundColor: themeColors.background },
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
  const weekNumbers = Object.keys(sessionsByWeek).map(Number).sort((a, b) => a - b);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: programName,
          headerStyle: { backgroundColor: themeColors.background },
          headerTintColor: themeColors.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setDeleteModal(true)}
              style={{ marginRight: spacing.sm }}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={22}
                color={themeColors.error}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Error Modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
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
              onPress={() => setErrorModal({ visible: false, message: '' })}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal(false)}
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
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Delete Program</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>
              Are you sure you want to delete this program? This will also delete all associated sessions.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setDeleteModal(false)}
                activeOpacity={0.8}
                style={[styles.modalCancelButton, { borderColor: themeColors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: themeColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteProgram} activeOpacity={0.8}>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Program Overview Card */}
        <LinearGradient
          colors={[themeColors.card, themeColors.card]}
          style={[styles.card, { borderColor: themeColors.border }]}
        >
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Program Overview
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Duration:</Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>{durationText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Split:</Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>{splitType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Sessions:</Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {program.sessions?.length ?? 0}
            </Text>
          </View>
        </LinearGradient>

        {/* Workout Sessions by Week */}
        {weekNumbers.length > 0 ? (
          <View style={styles.sessionsSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Workout Sessions
            </Text>
            {weekNumbers.map((week) => {
              const isExpanded = expandedWeek === week;
              const weekSessions = sessionsByWeek[week] || [];
              return (
                <View key={week} style={styles.weekContainer}>
                  <TouchableOpacity
                    onPress={() => setExpandedWeek(isExpanded ? null : week)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isExpanded
                        ? [themeColors.primary + '20', themeColors.secondary + '10']
                        : [themeColors.card, themeColors.card]}
                      style={[styles.weekHeader, { borderColor: isExpanded ? themeColors.primary + '40' : themeColors.border }]}
                    >
                      <View style={styles.weekHeaderLeft}>
                        <View style={[styles.weekBadge, { backgroundColor: themeColors.primary }]}>
                          <Text style={styles.weekBadgeText}>W{week}</Text>
                        </View>
                        <View>
                          <Text style={[styles.weekTitle, { color: themeColors.text }]}>
                            Week {week}
                          </Text>
                          <Text style={[styles.weekSubtitle, { color: themeColors.textSecondary }]}>
                            {weekSessions.length} sessions
                          </Text>
                        </View>
                      </View>
                      <IconSymbol
                        ios_icon_name={isExpanded ? 'chevron.up' : 'chevron.down'}
                        android_material_icon_name={isExpanded ? 'expand-less' : 'expand-more'}
                        size={24}
                        color={themeColors.primary}
                      />
                    </LinearGradient>
                  </TouchableOpacity>

                  {isExpanded && weekSessions.map((session, sIdx) => {
                    const exerciseName = session.session_name;
                    const dayNumber = session.day_number;
                    const exerciseCount = session.exercises?.length ?? 0;
                    const isCompleted = session.completed;

                    return (
                      <View
                        key={sIdx}
                        style={[styles.sessionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                      >
                        <View style={styles.sessionHeader}>
                          <View style={[styles.dayBadge, { backgroundColor: themeColors.secondary + '30' }]}>
                            <Text style={[styles.dayBadgeText, { color: themeColors.secondary }]}>
                              Day {dayNumber}
                            </Text>
                          </View>
                          <Text style={[styles.sessionName, { color: themeColors.text }]}>
                            {exerciseName}
                          </Text>
                          {isCompleted && (
                            <View style={[styles.completedBadge, { backgroundColor: themeColors.success + '20' }]}>
                              <IconSymbol
                                ios_icon_name="checkmark.circle.fill"
                                android_material_icon_name="check-circle"
                                size={16}
                                color={themeColors.success}
                              />
                            </View>
                          )}
                        </View>

                        {Array.isArray(session.exercises) && exerciseCount > 0 ? (
                          <View style={styles.exercisesList}>
                            <Text style={[styles.exercisesHeader, { color: themeColors.textSecondary }]}>
                              Exercises ({exerciseCount})
                            </Text>
                            {session.exercises.map((ex: any, eIdx: number) => {
                              const exName = ex.name || ex.exercise_name || `Exercise ${eIdx + 1}`;
                              const setsText = ex.sets ? `${ex.sets} sets` : '';
                              const repsText = ex.reps ? `${ex.reps} reps` : '';
                              const restText = ex.rest ? `${ex.rest} rest` : '';
                              const notesText = ex.notes || '';

                              return (
                                <View
                                  key={eIdx}
                                  style={[styles.exerciseCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                                >
                                  <View style={styles.exerciseHeader}>
                                    <View style={[styles.exerciseNumber, { backgroundColor: themeColors.primary + '20' }]}>
                                      <Text style={[styles.exerciseNumberText, { color: themeColors.primary }]}>
                                        {eIdx + 1}
                                      </Text>
                                    </View>
                                    <Text style={[styles.exerciseName, { color: themeColors.text }]}>
                                      {exName}
                                    </Text>
                                  </View>
                                  
                                  <View style={styles.exerciseDetails}>
                                    {setsText ? (
                                      <View style={styles.exerciseDetailRow}>
                                        <IconSymbol
                                          ios_icon_name="repeat"
                                          android_material_icon_name="repeat"
                                          size={16}
                                          color={themeColors.primary}
                                        />
                                        <Text style={[styles.exerciseDetailText, { color: themeColors.text }]}>
                                          {setsText}
                                        </Text>
                                      </View>
                                    ) : null}
                                    
                                    {repsText ? (
                                      <View style={styles.exerciseDetailRow}>
                                        <IconSymbol
                                          ios_icon_name="number"
                                          android_material_icon_name="tag"
                                          size={16}
                                          color={themeColors.secondary}
                                        />
                                        <Text style={[styles.exerciseDetailText, { color: themeColors.text }]}>
                                          {repsText}
                                        </Text>
                                      </View>
                                    ) : null}
                                    
                                    {restText ? (
                                      <View style={styles.exerciseDetailRow}>
                                        <IconSymbol
                                          ios_icon_name="timer"
                                          android_material_icon_name="schedule"
                                          size={16}
                                          color={themeColors.success}
                                        />
                                        <Text style={[styles.exerciseDetailText, { color: themeColors.text }]}>
                                          {restText}
                                        </Text>
                                      </View>
                                    ) : null}
                                  </View>

                                  {notesText ? (
                                    <View style={[styles.exerciseNotes, { backgroundColor: themeColors.primary + '10', borderColor: themeColors.primary + '30' }]}>
                                      <IconSymbol
                                        ios_icon_name="note.text"
                                        android_material_icon_name="description"
                                        size={14}
                                        color={themeColors.primary}
                                      />
                                      <Text style={[styles.exerciseNotesText, { color: themeColors.textSecondary }]}>
                                        {notesText}
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <Text style={[styles.noExercisesText, { color: themeColors.textSecondary }]}>
                            No exercises for this session
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ) : (
          <LinearGradient
            colors={[themeColors.primary + '15', themeColors.secondary + '10']}
            style={styles.emptySessionsCard}
          >
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '30' }]}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={32}
                color={themeColors.primary}
              />
            </View>
            <Text style={[styles.emptySessionsText, { color: themeColors.text }]}>
              No Sessions Yet
            </Text>
            <Text style={[styles.emptySessionsSubtext, { color: themeColors.textSecondary }]}>
              Workout sessions will appear here once the program is generated
            </Text>
          </LinearGradient>
        )}
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
    paddingBottom: spacing.xxl,
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
  sessionsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  weekContainer: {
    marginBottom: spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
  },
  weekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  weekTitle: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  weekSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    marginTop: 2,
  },
  sessionCard: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    marginTop: spacing.md,
    marginLeft: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sessionName: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exercisesList: {
    marginTop: spacing.xs,
  },
  exercisesHeader: {
    ...typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseName: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseDetailText: {
    ...typography.bodySmall,
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  exerciseNotesText: {
    ...typography.bodySmall,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  noExercisesText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptySessionsCard: {
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
  emptySessionsText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySessionsSubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  // Modal styles
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
