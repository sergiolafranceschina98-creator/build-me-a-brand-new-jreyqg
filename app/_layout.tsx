
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import Constants from "expo-constants";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isTimeout, setIsTimeout] = useState(false);

  console.log('🚀 APP STARTING - RootLayout Initializing');
  console.log('📱 Platform:', Constants.platform);
  console.log('🌐 Backend URL:', Constants.expoConfig?.extra?.backendUrl);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) {
        console.log('⚠️ FONT LOADING TIMEOUT - Proceeding anyway');
        setIsTimeout(true);
        SplashScreen.hideAsync();
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      console.log('✅ FONTS LOADED - Hiding Splash Screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    console.log('🌐 Network Connected:', networkState.isConnected);
    console.log('🌐 Internet Reachable:', networkState.isInternetReachable);

    if (!networkState.isConnected && networkState.isInternetReachable === false) {
      console.log('🔌 OFFLINE MODE DETECTED');
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Show loading screen with timeout
  if (!loaded && !isTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F00" />
        <Text style={styles.loadingText}>Loading AI Workout Builder...</Text>
      </View>
    );
  }

  // Premium Dark Theme Configuration
  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(255, 127, 0)",
      background: "rgb(10, 10, 15)",
      card: "rgb(26, 26, 36)",
      text: "rgb(255, 255, 255)",
      border: "rgb(42, 42, 58)",
      notification: "rgb(255, 127, 0)",
    },
  };

  const CustomLightTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(255, 127, 0)",
      background: "rgb(245, 245, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(26, 26, 26)",
      border: "rgb(224, 224, 232)",
      notification: "rgb(255, 127, 0)",
    },
  };

  console.log('✅ RENDERING APP');

  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : CustomDarkTheme}>
        <WidgetProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="new-client" options={{ headerShown: false }} />
              <Stack.Screen name="client/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="program/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="help" options={{ headerShown: false }} />
              <Stack.Screen name="privacy" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
            <SystemBars style="light" />
          </GestureHandlerRootView>
        </WidgetProvider>
      </ThemeProvider>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(10, 10, 15)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgb(255, 255, 255)',
    fontWeight: '600',
  },
});
