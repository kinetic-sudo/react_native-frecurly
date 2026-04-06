import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
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

        <View className='flex-row items-center mt-2'>

        {user?.imageUrl ? (
        <Image 
        source={{uri: user.imageUrl}}
        style={{
          width: 64,
          height: 64,
          borderRadius: 34,
          marginBottom: 10
        }}
        />
      ) : null}
      <View className='flex-shrink'>
        <Text className="home-user-name text-lg ">{displayName}</Text>
        
        {email ? (
          <Text className="sub-meta mt-0.5">{email}</Text>
        ) : null}
      </View>
        
        </View>
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