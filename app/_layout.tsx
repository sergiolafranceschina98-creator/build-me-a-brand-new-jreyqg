
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
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);

  console.log('🚀 APP STARTING - RootLayout Initializing');
  console.log('📱 Platform:', Constants.platform);
  console.log('🌐 Backend URL:', Constants.expoConfig?.extra?.backendUrl);

  // Handle font loading errors
  useEffect(() => {
    if (error) {
      console.error('❌ Font loading error:', error);
      // Proceed anyway to prevent blocking
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [error]);

  // Add aggressive timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.warn('⚠️ App initialization timed out (3s). Forcing app to render.');
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 3000); // 3 second timeout - aggressive

    return () => clearTimeout(timeout);
  }, [appReady]);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      console.log('✅ FONTS LOADED - Hiding Splash Screen');
      setAppReady(true);
      SplashScreen.hideAsync().catch((err) => {
        console.error('Error hiding splash:', err);
      });
    }
  }, [loaded]);

  React.useEffect(() => {
    console.log('🌐 Network Connected:', networkState.isConnected);
    console.log('🌐 Internet Reachable:', networkState.isInternetReachable);

    if (!networkState.isConnected && networkState.isInternetReachable === false) {
      console.log('🔌 OFFLINE MODE DETECTED');
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // CRITICAL: Don't block rendering - show app immediately if timeout occurs
  if (!appReady) {
    return null; // Let native splash screen handle this
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
