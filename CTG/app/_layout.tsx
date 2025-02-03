// app/_layout.tsx
import { Stack } from "expo-router/stack";
import { ThemeProvider } from "../app/context/ThemeContext";
// Import your TextScaleContext
import { TextScaleProvider } from "../app/context/TextScaleContext";

export default function Layout() {
  return (
    <ThemeProvider>
      <TextScaleProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="Pages/LoginPage" options={{ headerShown: false }} />
          <Stack.Screen name="Pages/RegisterPage" options={{ headerShown: false }}/>
        </Stack>
      </TextScaleProvider>
    </ThemeProvider>
  );
}
