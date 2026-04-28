import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_KEY = 'subtrack_onboarded';

export default function IndexRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let isCancelled = false;
    const readOnboardingState = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!isCancelled) setHasOnboarded(value === 'true');
      } catch {
        if (!isCancelled) setHasOnboarded(false);
      }
    };

    readOnboardingState();
    return () => {
      isCancelled = true;
    };
  }, [isLoaded]);

  if (!isLoaded || hasOnboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff9e3' }}>
        <ActivityIndicator color="#081126" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/Sign-in" />;
}
