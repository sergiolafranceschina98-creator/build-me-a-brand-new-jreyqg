
import "react-native-reanimated";
import React, { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, View, ActivityIndicator, Platform } from "react-native";
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

// Keep splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('⚠️ Splash screen already hidden or not available');
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [appIsReady, setAppIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  console.log('🚀 APP STARTING - RootLayout Initializing');
  console.log('📱 Platform:', Platform.OS);
  console.log('🌐 Backend URL:', Constants.expoConfig?.extra?.backendUrl);

  // Handle font loading and splash screen
  useEffect(() => {
    async function prepare() {
      try {
        console.log('⏳ Preparing app...');
        console.log('📝 Fonts loaded:', fontsLoaded);
        console.log('❌ Font error:', fontError);

        // Wait for fonts to load or error
        if (fontsLoaded || fontError) {
          console.log('✅ Fonts ready (loaded or error), hiding splash...');
          
          // Give a tiny delay to ensure everything is mounted
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Hide splash screen
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden successfully');
          
          // Mark app as ready
          setAppIsReady(true);
          console.log('✅ App is ready to render');
        }
      } catch (e) {
        console.error('❌ Error in prepare():', e);
        // Even on error, mark app as ready so it doesn't hang
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // CRITICAL: Aggressive timeout to force app to show
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️⚠️⚠️ EMERGENCY TIMEOUT: Forcing app to show after 2 seconds');
      
      SplashScreen.hideAsync().catch((e) => {
        console.log('Splash already hidden or error:', e);
      });
      
      setAppIsReady(true);
      console.log('✅ App forced ready via timeout');
    }, 2000); // 2 second emergency timeout

    return () => clearTimeout(timeout);
  }, []);

  // Log network state
  useEffect(() => {
    console.log('🌐 Network Connected:', networkState.isConnected);
    console.log('🌐 Internet Reachable:', networkState.isInternetReachable);
  }, [networkState.isConnected, networkState.isInternetReachable]);

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

  // CRITICAL: Show loading screen while preparing, but with timeout
  // This prevents returning null which can cause infinite loading
  if (!appIsReady) {
    console.log('⏳ App not ready yet, showing loading screen');
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#0A0A0F', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#FF7F00" />
      </View>
    );
  }

  console.log('✅ RENDERING MAIN APP');

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
