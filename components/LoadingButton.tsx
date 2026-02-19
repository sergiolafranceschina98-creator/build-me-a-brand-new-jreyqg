
import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface LoadingButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
}

export function LoadingButton({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  loadingColor,
}: LoadingButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = Colors[isDark ? 'dark' : 'light'];
  const isDisabled = disabled || loading;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={loadingColor || (variant === "outline" ? currentColors.primary : "#FFFFFF")}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" ? { color: currentColors.primary } : { color: '#FFFFFF' },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && {
          borderWidth: 2,
          borderColor: currentColors.primary,
          backgroundColor: 'transparent',
        },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'primary' && !isDisabled ? (
        <LinearGradient
          colors={[currentColors.primary, currentColors.secondary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      ) : null}
      {buttonContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
