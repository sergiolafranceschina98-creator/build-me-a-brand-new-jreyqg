
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function NewClientScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    goals: 'hypertrophy',
    training_frequency: '3',
    equipment: 'commercial gym',
    injuries: '',
    preferred_exercises: '',
    session_duration: '60',
    body_fat_percentage: '',
    squat_1rm: '',
    bench_1rm: '',
    deadlift_1rm: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('User tapped Create Client button');
    console.log('Form data:', formData);

    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      console.log('Validation failed: Missing required fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Backend Integration - POST /api/clients with form data → { id, name, age, ... }
      console.log('Creating client...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Client created successfully (mock)');
      setLoading(false);
      
      // Navigate back to home screen
      router.back();
    } catch (error) {
      console.error('Error creating client:', error);
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

        {renderPicker('Training Frequency (days/week)', 'training_frequency', [
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' },
        ])}

        {renderPicker('Session Duration', 'session_duration', [
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
        {renderInput('Preferred Exercises', 'preferred_exercises', 'e.g., Squats, Deadlifts')}
        {renderInput('Body Fat %', 'body_fat_percentage', '15', 'numeric')}

        {renderSectionHeader('Personal Records (Optional)')}
        <View style={styles.row}>
          <View style={styles.thirdWidth}>
            {renderInput('Squat 1RM', 'squat_1rm', '100', 'numeric')}
          </View>
          <View style={styles.thirdWidth}>
            {renderInput('Bench 1RM', 'bench_1rm', '80', 'numeric')}
          </View>
          <View style={styles.thirdWidth}>
            {renderInput('Deadlift 1RM', 'deadlift_1rm', '120', 'numeric')}
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
});
