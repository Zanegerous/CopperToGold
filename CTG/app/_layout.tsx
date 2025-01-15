import { Stack } from 'expo-router/stack';

import { ThemeProvider } from "../app/context/ThemeContext";


export default function Layout() {
  return (
    <ThemeProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Pages/LoginPage" options={{headerShown: false}} />
      <Stack.Screen name="Pages/RegisterPage" options={{headerShown: false}} />
    </Stack>
    </ThemeProvider>
  );
}
