import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="category/[slug]" options={{ presentation: 'push' }} />
      </Stack>
    </ThemeProvider>
  );
}