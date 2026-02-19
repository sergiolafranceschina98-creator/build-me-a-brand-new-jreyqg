
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '@/styles/commonStyles';
import Constants from 'expo-constants';
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
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, useRouter } from 'expo-router';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl;

export default function NewClientScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  console.log('📝 NewClientScreen: Screen loaded');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    goals: 'hypertrophy',
    trainingFrequency: '',
    equipment: 'commercial_gym',
    injuries: '',
    preferredExercises: '',
    sessionDuration: '',
    bodyFatPercentage: '',
    squat1rm: '',
    bench1rm: '',
    deadlift1rm: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message: string) => {
    console.error('❌ NewClientScreen: Error -', message);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 NewClientScreen: Field "${field}" changed to:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('🚀 NewClientScreen: Submit button pressed');
    console.log('📋 NewClientScreen: Form data:', formData);

    // Validation
    if (!formData.name.trim()) {
      showError('Please enter client name');
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      showError('Please enter a valid age');
      return;
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      showError('Please enter a valid height');
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      showError('Please enter a valid weight');
      return;
    }
    if (!formData.trainingFrequency || parseInt(formData.trainingFrequency) < 1 || parseInt(formData.trainingFrequency) > 7) {
      showError('Training frequency must be between 1 and 7 days per week');
      return;
    }
    if (!formData.sessionDuration || parseInt(formData.sessionDuration) <= 0) {
      showError('Please enter a valid session duration');
      return;
    }

    console.log('✅ NewClientScreen: Validation passed');
    setLoading(true);

    try {
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const payload = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        experience: formData.experience,
        goals: formData.goals,
        trainingFrequency: parseInt(formData.trainingFrequency),
        equipment: formData.equipment,
        injuries: formData.injuries.trim() || undefined,
        preferredExercises: formData.preferredExercises.trim() || undefined,
        sessionDuration: parseInt(formData.sessionDuration),
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        squat1rm: formData.squat1rm ? parseFloat(formData.squat1rm) : undefined,
        bench1rm: formData.bench1rm ? parseFloat(formData.bench1rm) : undefined,
        deadlift1rm: formData.deadlift1rm ? parseFloat(formData.deadlift1rm) : undefined,
      };

      console.log('📤 NewClientScreen: Sending POST request to:', `${BACKEND_URL}/api/clients`);
      console.log('📦 NewClientScreen: Payload:', payload);

      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 NewClientScreen: Response status:', response.status);

      if (!response.ok) {
        let errMsg = `Failed to create client (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errBody.message || errMsg;
          console.error('❌ NewClientScreen: Error response:', errBody);
        } catch (parseError) {
          console.error('❌ NewClientScreen: Could not parse error response');
        }
        throw new Error(errMsg);
      }

      const newClient = await response.json();
      console.log('✅ NewClientScreen: Client created successfully:', newClient);
      console.log('🔙 NewClientScreen: Navigating back to home');
      router.back();
    } catch (error: any) {
      console.error('❌ NewClientScreen: Error creating client:', error?.message || 'Unknown error');
      console.error('❌ NewClientScreen: Full error:', error);
      showError(error?.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 NewClientScreen: Submit process completed');
    }
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: themeColors.text }]}>{title}</Text>
  );

  const renderInput = (
    label: string,
    field: string,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textSecondary + '80'}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderPicker = (label: string, field: string, options: { label: string; value: string }[]) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pickerOption,
              {
                backgroundColor: formData[field as keyof typeof formData] === option.value
                  ? themeColors.primary + '20'
                  : themeColors.card,
                borderColor: formData[field as keyof typeof formData] === option.value
                  ? themeColors.primary
                  : themeColors.border,
              },
            ]}
            onPress={() => {
              console.log(`📝 NewClientScreen: Picker "${field}" selected:`, option.value);
              handleInputChange(field, option.value);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                {
                  color: formData[field as keyof typeof formData] === option.value
                    ? themeColors.primary
                    : themeColors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderSectionHeader('Basic Information')}
        {renderInput('Full Name *', 'name', 'John Doe')}
        {renderInput('Age *', 'age', '25', 'numeric')}
        {renderPicker('Gender', 'gender', [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ])}
        {renderInput('Height (cm) *', 'height', '175', 'numeric')}
        {renderInput('Weight (kg) *', 'weight', '70', 'numeric')}

        {renderSectionHeader('Training Details')}
        {renderPicker('Experience Level', 'experience', [
          { label: 'Beginner', value: 'beginner' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Advanced', value: 'advanced' },
        ])}
        {renderPicker('Primary Goal', 'goals', [
          { label: 'Fat Loss', value: 'fat_loss' },
          { label: 'Muscle Growth', value: 'hypertrophy' },
          { label: 'Strength', value: 'strength' },
          { label: 'Rehabilitation', value: 'rehab' },
          { label: 'Sport-Specific', value: 'sport_specific' },
        ])}
        {renderInput('Training Days/Week *', 'trainingFrequency', '3', 'numeric')}
        {renderInput('Session Duration (min) *', 'sessionDuration', '60', 'numeric')}
        {renderPicker('Available Equipment', 'equipment', [
          { label: 'Commercial Gym', value: 'commercial_gym' },
          { label: 'Home Gym', value: 'home_gym' },
          { label: 'Dumbbells Only', value: 'dumbbells_only' },
          { label: 'Bodyweight Only', value: 'bodyweight_only' },
        ])}

        {renderSectionHeader('Additional Information (Optional)')}
        {renderInput('Injuries/Limitations', 'injuries', 'e.g., Lower back pain')}
        {renderInput('Preferred Exercises', 'preferredExercises', 'e.g., Squats, Deadlifts')}
        {renderInput('Body Fat %', 'bodyFatPercentage', '15', 'numeric')}

        {renderSectionHeader('Personal Records (Optional)')}
        {renderInput('Squat 1RM (kg)', 'squat1rm', '100', 'numeric')}
        {renderInput('Bench Press 1RM (kg)', 'bench1rm', '80', 'numeric')}
        {renderInput('Deadlift 1RM (kg)', 'deadlift1rm', '120', 'numeric')}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading ? [themeColors.border, themeColors.border] : [themeColors.primary, themeColors.secondary]}
            style={styles.submitButtonGradient}
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

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={48}
              color={themeColors.primary}
            />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Error</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                console.log('✅ NewClientScreen: Error modal dismissed');
                setErrorModalVisible(false);
              }}
            >
              <LinearGradient
                colors={[themeColors.primary, themeColors.secondary]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  pickerOptionText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
