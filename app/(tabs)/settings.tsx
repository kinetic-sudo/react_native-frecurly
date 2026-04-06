/**
 * Settings screen
 * 
 * Install required dependency before running:
 *   npx expo install expo-image-picker
 */
import { useClerk, useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RnsafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RnsafeAreaView);

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'account' | 'preferences';

// ─── Avatar ───────────────────────────────────────────────────────────────────

type AvatarProps = {
  uri?: string | null;
  initials: string;
  uploading: boolean;
  onPress: () => void;
};

const Avatar = ({ uri, initials, uploading, onPress }: AvatarProps) => (
  <Pressable
    onPress={onPress}
    disabled={uploading}
    accessibilityRole="button"
    accessibilityLabel="Change profile picture"
    style={{ position: 'relative', alignSelf: 'center' }}
  >
    {/* Image or fallback */}
    {uri ? (
      <Image
        source={{ uri }}
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
        }}
      />
    ) : (
      <View
        style={{ width: 88, height: 88, borderRadius: 44 }}
        className="bg-accent/15 items-center justify-center border-2 border-accent/30"
      >
        <Text className="text-4xl font-sans-bold text-accent">
          {initials}
        </Text>
      </View>
    )}

    {/* Edit badge */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
      }}
      className="bg-accent items-center justify-center border-2 border-background"
    >
      {uploading
        ? <ActivityIndicator size="small" color="#fff9e3" />
        : <Feather name="camera" size={13} color="#fff9e3" />}
    </View>
  </Pressable>
);

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type TabBarProps = {
  active: Tab;
  onChange: (t: Tab) => void;
};

const TabBar = ({ active, onChange }: TabBarProps) => {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'account', label: 'Account' },
    { key: 'preferences', label: 'Preferences' },
  ];
  return (
    <View className="flex-row bg-muted rounded-2xl p-1 mb-6">
      {tabs.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => onChange(t.key)}
          className={`flex-1 py-2.5 rounded-xl items-center${
            active === t.key ? ' bg-background' : ''
          }`}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === t.key }}
        >
          <Text
            className={`text-sm ${
              active === t.key
                ? 'font-sans-bold text-primary'
                : 'font-sans-medium text-muted-foreground'
            }`}
          >
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// ─── Row item ─────────────────────────────────────────────────────────────────

type RowProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  loading?: boolean;
};

const Row = ({ icon, label, value, onPress, destructive, loading }: RowProps) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress || loading}
    className="flex-row items-center py-3.5 gap-3"
    accessibilityRole={onPress ? 'button' : 'text'}
  >
    <View
      className={`w-9 h-9 rounded-xl items-center justify-center ${
        destructive ? 'bg-destructive/10' : 'bg-muted'
      }`}
    >
      {loading
        ? <ActivityIndicator size="small" color={destructive ? '#dc2626' : '#081126'} />
        : <Feather
            name={icon}
            size={17}
            color={destructive ? '#dc2626' : '#081126'}
          />}
    </View>
    <Text
      className={`flex-1 text-base font-sans-medium ${
        destructive ? 'text-destructive' : 'text-primary'
      }`}
    >
      {label}
    </Text>
    {value ? (
      <Text className="text-sm font-sans-regular text-muted-foreground" numberOfLines={1}>
        {value}
      </Text>
    ) : null}
    {onPress && !loading && (
      <Feather
        name="chevron-right"
        size={16}
        color={destructive ? '#dc2626' : 'rgba(0,0,0,0.3)'}
      />
    )}
  </Pressable>
);

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = () => (
  <View className="h-px bg-border mx-0" />
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [signingOut, setSigningOut]   = useState(false);
  const [uploading, setUploading]     = useState(false);

  // Derived display values
  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ??
    'Your account';

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || displayName;

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initials = displayName.charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleTabChange = (tab: Tab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
              router.replace('/(auth)/Sign-in');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const handleImageUpload = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library in Settings to change your profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],         // Force square crop
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const asset = result.assets[0];

      // Build a File-like object for Clerk's setProfileImage
      const fileUri = asset.uri;
      const fileName = fileUri.split('/').pop() ?? 'profile.jpg';
      const mimeType = asset.mimeType ?? 'image/jpeg';

      // React Native fetch trick to convert URI → Blob
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: mimeType });

      await user?.setProfileImage({ 
        file: {
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split('/').pop() ?? 'profile.jpg',
        type: asset.mimeType ?? 'image/jpeg',
       } as any 
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Upload failed',
        err?.errors?.[0]?.longMessage ??
        err?.message ??
        'Could not update your profile picture. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  // ── Account tab ─────────────────────────────────────────────────────────────

  const AccountTab = () => (
    <View className="gap-4">

      {/* Profile card */}
      <View className="auth-card items-center gap-3 py-6">
        <Avatar
          uri={user?.imageUrl}
          initials={initials}
          uploading={uploading}
          onPress={handleImageUpload}
        />
        <View className="items-center gap-0.5">
          <Text className="text-xl font-sans-bold text-primary">{fullName}</Text>
          {email ? (
            <Text className="text-sm font-sans-regular text-muted-foreground">
              {email}
            </Text>
          ) : null}
          {memberSince ? (
            <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
              Member since {memberSince}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={handleImageUpload}
          disabled={uploading}
          className="auth-secondary-button w-full mt-1"
        >
          <Text className="auth-secondary-button-text">
            {uploading ? 'Uploading…' : 'Change profile picture'}
          </Text>
        </Pressable>
      </View>

      {/* Account details */}
      <View className="auth-card">
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Account
        </Text>
        <Row icon="user" label="Name" value={fullName} />
        <Divider />
        <Row icon="mail" label="Email" value={email} />
        {memberSince ? (
          <>
            <Divider />
            <Row icon="calendar" label="Member since" value={memberSince} />
          </>
        ) : null}
      </View>

      {/* Sign out */}
      <View className="auth-card">
        <Row
          icon="log-out"
          label="Sign out"
          onPress={handleSignOut}
          loading={signingOut}
          destructive
        />
      </View>

    </View>
  );

  // ── Preferences tab ─────────────────────────────────────────────────────────

  const PreferencesTab = () => (
    <View className="gap-4">

      {/* Notifications */}
      <View className="auth-card">
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Notifications
        </Text>
        <Row
          icon="bell"
          label="Renewal reminders"
          value="3 days before"
          onPress={() =>
            Alert.alert('Coming soon', 'Notification settings are coming in a future update.')
          }
        />
        <Divider />
        <Row
          icon="bell-off"
          label="Spending alerts"
          value="Off"
          onPress={() =>
            Alert.alert('Coming soon', 'Notification settings are coming in a future update.')
          }
        />
      </View>

      {/* Display */}
      <View className="auth-card">
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Display
        </Text>
        <Row
          icon="dollar-sign"
          label="Default currency"
          value="USD"
          onPress={() =>
            Alert.alert('Coming soon', 'Currency settings are coming in a future update.')
          }
        />
        <Divider />
        <Row
          icon="calendar"
          label="Billing cycle start"
          value="1st of month"
          onPress={() =>
            Alert.alert('Coming soon', 'Billing cycle settings are coming in a future update.')
          }
        />
      </View>

      {/* About */}
      <View className="auth-card">
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-widest mb-2">
          About
        </Text>
        <Row icon="info" label="Version" value="1.0.0" />
        <Divider />
        <Row
          icon="shield"
          label="Privacy Policy"
          onPress={() =>
            Alert.alert('Privacy Policy', 'Privacy policy details coming soon.')
          }
        />
        <Divider />
        <Row
          icon="file-text"
          label="Terms of Service"
          onPress={() =>
            Alert.alert('Terms of Service', 'Terms of service details coming soon.')
          }
        />
      </View>

    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="list-title mb-6">Settings</Text>
        <TabBar active={activeTab} onChange={handleTabChange} />
        {activeTab === 'account'
          ? <AccountTab />
          : <PreferencesTab />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;