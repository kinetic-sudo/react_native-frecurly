// app/(auth)/_layout.tsx
// Simplified — no more onboarding check here, that's handled by app/index.tsx
import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}