
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen already hidden or unavailable
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide splash screen as soon as fonts are ready OR after 1 second max
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Fonts loaded or errored - hide splash immediately
      SplashScreen.hideAsync().catch(() => {});
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // CRITICAL: Emergency timeout - force app to show after 1 second NO MATTER WHAT
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setAppIsReady(true);
    }, 1000); // 1 second maximum wait

    return () => clearTimeout(emergencyTimeout);
  }, []);

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

  // ALWAYS render the app - never return null or loading screen
  // This prevents any possibility of infinite loading
  return (
    <>
      <StatusBar style="light" animated />
      <ThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : CustomDarkTheme}>
        <WidgetProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
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
