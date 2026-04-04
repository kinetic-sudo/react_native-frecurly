import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

/**
 * (auth) route group layout.
 * Signed-in users are immediately bounced to the app.
 * Signed-out users see the Stack (sign-in / sign-up).
 */
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // While Clerk resolves the session, render nothing to avoid a flash.
  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

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