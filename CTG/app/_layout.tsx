import React from "react";
import { Stack } from "expo-router/stack";
import { ThemeProvider } from "../app/context/ThemeContext";
import { TextScaleProvider } from "../app/context/TextScaleContext";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./i18n";

export default function Layout() {
  const [fontsLoaded, error] = useFonts({
    "Lato-Black": require("../assets/fonts/Lato-Black.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
    "Lato-Light": require("../assets/fonts/Lato-Light.ttf"),
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Thin": require("../assets/fonts/Lato-Thin.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <TextScaleProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Pages/LoginPage" options={{ headerShown: false }} />
            <Stack.Screen name="Pages/RegisterPage" options={{ headerShown: false }} />
          </Stack>
        </TextScaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
