import '@/global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useRef } from 'react';
import { SubscriptionsProvider } from '../context/SubscriptionsContext';
import { posthog } from '../src/config/posthog';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — add it to your .env file');
}

// ─── Inner component — has access to Clerk context ───────────────────────────
function AppNavigator() {
  const [fontLoaded] = useFonts({
    'sans-regular':   require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold':      require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-medium':    require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-light':     require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-semibold':  require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  });

  const pathname         = usePathname();
  const params           = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  // Hide splash once fonts are ready
  useEffect(() => {
    if (fontLoaded) SplashScreen.hideAsync();
  }, [fontLoaded]);

  // Screen tracking
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"      options={{ animation: 'none' }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="(auth)"     options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)"     options={{ animation: 'fade' }} />
    </Stack>
  );
}

// ─── Root layout — providers only, no hooks ──────────────────────────────────
export default function RootLayout() {
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SubscriptionsProvider>
          <AppNavigator />
        </SubscriptionsProvider>
      </ClerkProvider>
    </PostHogProvider>
  );
}