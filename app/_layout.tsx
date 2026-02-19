
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
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
// Note: Error logging is auto-initialized via index.ts import

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)", // Ensure any route can link back to `/`
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  console.log('🚀 ============================================');
  console.log('🚀 APP STARTING - RootLayout Initializing');
  console.log('🚀 ============================================');
  console.log('📱 Platform:', Constants.platform);
  console.log('📦 App Version:', Constants.expoConfig?.version);
  console.log('🎨 Color Scheme:', colorScheme);
  console.log('🌐 Backend URL:', Constants.expoConfig?.extra?.backendUrl);
  console.log('🔧 Dev Mode:', __DEV__);

  useEffect(() => {
    if (loaded) {
      console.log('✅ ============================================');
      console.log('✅ FONTS LOADED - Hiding Splash Screen');
      console.log('✅ ============================================');
      SplashScreen.hideAsync();
    } else {
      console.log('⏳ Waiting for fonts to load...');
    }
  }, [loaded]);

  React.useEffect(() => {
    console.log('🌐 ============================================');
    console.log('🌐 NETWORK STATE CHECK');
    console.log('🌐 ============================================');
    console.log('🌐 Connected:', networkState.isConnected);
    console.log('🌐 Internet Reachable:', networkState.isInternetReachable);
    console.log('🌐 Connection Type:', networkState.type);

    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      console.log('🔌 ============================================');
      console.log('🔌 OFFLINE MODE DETECTED');
      console.log('🔌 Changes will sync when back online');
      console.log('🔌 ============================================');
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    console.log('⏳ Fonts not loaded yet, returning null...');
    return null;
  }

  // Premium Dark Theme Configuration
  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(255, 127, 0)", // Vibrant orange
      background: "rgb(10, 10, 15)", // Deep sophisticated dark (#0A0A0F)
      card: "rgb(26, 26, 36)", // Elevated card background (#1A1A24)
      text: "rgb(255, 255, 255)", // Clean white text
      border: "rgb(42, 42, 58)", // Subtle border (#2A2A3A)
      notification: "rgb(255, 127, 0)", // Orange notifications
    },
  };

  const CustomLightTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(255, 127, 0)", // Vibrant orange
      background: "rgb(245, 245, 247)", // Light background
      card: "rgb(255, 255, 255)", // White cards
      text: "rgb(26, 26, 26)", // Dark text
      border: "rgb(224, 224, 232)", // Light border
      notification: "rgb(255, 127, 0)", // Orange notifications
    },
  };

  console.log('✅ ============================================');
  console.log('✅ RENDERING APP WITH THEME');
  console.log('✅ Theme:', colorScheme === "dark" ? "Dark" : "Light");
  console.log('✅ ============================================');

  return (
    <>
      <StatusBar style="light" animated />
        <ThemeProvider
          value={colorScheme === "dark" ? CustomDarkTheme : CustomDarkTheme}
        >
          <WidgetProvider>
            <GestureHandlerRootView>
            <Stack>
              {/* Main app with tabs */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <SystemBars style={"light"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </ThemeProvider>
    </>
  );
}
