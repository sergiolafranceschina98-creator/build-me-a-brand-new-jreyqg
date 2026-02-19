
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const BACKEND_URL =
  Constants.expoConfig?.extra?.backendUrl ||
  'https://3v7m36dq7b8b7nhzwcy3b6cud7ap7qwr.app.specular.dev';

export default function NewClientScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    goals: 'hypertrophy',
    trainingFrequency: '3',
    equipment: 'commercial gym',
    injuries: '',
    preferredExercises: '',
    sessionDuration: '60',
    bodyFatPercentage: '',
    squat1rm: '',
    bench1rm: '',
    deadlift1rm: '',
  });

  const showError = (message: string) => {
    setErrorModal({ visible: true, message });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('User tapped Create Client button');
    console.log('Form data:', formData);

    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      console.log('Validation failed: Missing required fields');
      showError('Please fill in all required fields: Name, Age, Height, and Weight.');
      return;
    }

    try {
      setLoading(true);
      console.log('[API] POST /api/clients - Creating client...');

      const payload = {
        name: formData.name,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        height: parseInt(formData.height, 10),
        weight: parseInt(formData.weight, 10),
        experience: formData.experience,
        goals: formData.goals,
        trainingFrequency: parseInt(formData.trainingFrequency, 10),
        equipment: formData.equipment,
        injuries: formData.injuries || null,
        preferredExercises: formData.preferredExercises || null,
        sessionDuration: parseInt(formData.sessionDuration, 10),
        bodyFatPercentage: formData.bodyFatPercentage
          ? parseFloat(formData.bodyFatPercentage)
          : null,
        squat1rm: formData.squat1rm ? parseFloat(formData.squat1rm) : null,
        bench1rm: formData.bench1rm ? parseFloat(formData.bench1rm) : null,
        deadlift1rm: formData.deadlift1rm ? parseFloat(formData.deadlift1rm) : null,
      };

      console.log('[API] Payload:', JSON.stringify(payload));

      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Failed to create client (${response.status})`;
        try {
          const errBody = await response.json();
          errorMsg = errBody.error || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const newClient = await response.json();
      console.log('Client created successfully:', newClient);

      router.back();
    } catch (error: any) {
      console.error('Error creating client:', error);
      showError(error?.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: themeColors.text }]}>
      {title}
    </Text>
  );

  const renderInput = (
    label: string,
    field: string,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.card,
            color: themeColors.text,
            borderColor: themeColors.border,
          },
        ]}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary + '80'}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderPicker = (label: string, field: string, options: { label: string; value: string }[]) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.pickerContainer}>
        {options.map((option, index) => {
          const isSelected = formData[field as keyof typeof formData] === option.value;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleInputChange(field, option.value)}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[themeColors.primary, themeColors.secondary]}
                  style={styles.pickerOption}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.pickerOptionTextSelected}>
                    {option.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.pickerOptionText, { color: themeColors.text }]}>
                    {option.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Client',
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSectionHeader('Basic Information')}
        {renderInput('Full Name', 'name', 'John Doe')}
        {renderInput('Age', 'age', '25', 'numeric')}
        
        {renderPicker('Gender', 'gender', [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ])}

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderInput('Height (cm)', 'height', '175', 'numeric')}
          </View>
          <View style={styles.halfWidth}>
            {renderInput('Weight (kg)', 'weight', '75', 'numeric')}
          </View>
        </View>

        {renderSectionHeader('Training Profile')}
        
        {renderPicker('Experience Level', 'experience', [
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
        ])}

        {renderPicker('Primary Goal', 'goals', [
          { label: 'Fat Loss', value: 'fat loss' },
          { label: 'Hypertrophy', value: 'hypertrophy' },
          { label: 'Strength', value: 'strength' },
          { label: 'Rehab', value: 'rehab' },
        ])}

        {renderPicker('Training Frequency (days/week)', 'trainingFrequency', [
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' },
        ])}

        {renderPicker('Session Duration', 'sessionDuration', [
          { label: '45 min', value: '45' },
          { label: '60 min', value: '60' },
          { label: '90 min', value: '90' },
        ])}

        {renderPicker('Available Equipment', 'equipment', [
          { label: 'Commercial Gym', value: 'commercial gym' },
          { label: 'Home Gym', value: 'home gym' },
          { label: 'Dumbbells Only', value: 'dumbbells only' },
          { label: 'Bodyweight', value: 'bodyweight' },
        ])}

        {renderSectionHeader('Additional Information (Optional)')}
        {renderInput('Injuries or Limitations', 'injuries', 'e.g., Lower back pain')}
        {renderInput('Preferred Exercises', 'preferredExercises', 'e.g., Squats, Deadlifts')}
        {renderInput('Body Fat %', 'bodyFatPercentage', '15', 'numeric')}

        {renderSectionHeader('Personal Records (Optional)')}
        <View style={styles.row}>
          <View style={styles.thirdWidth}>
            {renderInput('Squat 1RM', 'squat1rm', '100', 'numeric')}
          </View>
          <View style={styles.thirdWidth}>
            {renderInput('Bench 1RM', 'bench1rm', '80', 'numeric')}
          </View>
          <View style={styles.thirdWidth}>
            {renderInput('Deadlift 1RM', 'deadlift1rm', '120', 'numeric')}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[themeColors.primary, themeColors.secondary]}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Client</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  sectionHeader: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  pickerOptionText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  pickerOptionTextSelected: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  modalButton: {
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
