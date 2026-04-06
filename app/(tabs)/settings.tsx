import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RnsafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RnsafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ??
    'Your account';

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/Sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      {/* Page title */}
      <Text className="list-title mb-6">Settings</Text>

      {/* Account card */}
      <View className="auth-card mb-4">
        <Text className="auth-label mb-1">Signed in as</Text>
        <Text className="home-user-name text-lg">{displayName}</Text>
        {email ? (
          <Text className="sub-meta mt-0.5">{email}</Text>
        ) : null}
      </View>

      {/* Sign-out button */}
      <Pressable
        onPress={handleSignOut}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out of Frecurly"
        className={`auth-button${signingOut ? ' auth-button-disabled' : ''}`}
      >
        {signingOut
          ? <ActivityIndicator color="#081126" />
          : <Text className="auth-button-text">Sign out</Text>}
      </Pressable>

    </SafeAreaView>
  );
};

export default Settings;