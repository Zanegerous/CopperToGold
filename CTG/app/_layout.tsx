import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="searchResults.tsx" options={{ headerShown: false }} />
      <Stack.Screen name="listing" options={{ headerShown: false }} />
    </Stack>
  );
}
