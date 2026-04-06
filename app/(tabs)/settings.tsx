/**
 * Settings screen
 * * Install required dependency before running:
 * npx expo install expo-image-picker
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

// ─── Avatar Component ─────────────────────────────────────────────────────────

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
    className="relative self-center"
  >
    {/* Image or fallback */}
    {uri ? (
      <Image
        source={{ uri }}
        style={{ width: 88, height: 88, borderRadius: 44 }}
      />
    ) : (
      <View
        style={{ width: 88, height: 88, borderRadius: 44 }}
        className="bg-accent/15 items-center justify-center border-2 border-accent/30"
      >
        <Text className="text-4xl font-sans-bold text-accent">{initials}</Text>
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
      {uploading ? (
        <ActivityIndicator size="small" color="#fff9e3" />
      ) : (
        <Feather name="camera" size={13} color="#fff9e3" />
      )}
    </View>
  </Pressable>
);

// ─── Tab Bar Component ───────────────────────────────────────────────────────

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

// ─── Row Item Component ──────────────────────────────────────────────────────

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
  >
    <View
      className={`w-9 h-9 rounded-xl items-center justify-center ${
        destructive ? 'bg-destructive/10' : 'bg-muted'
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={destructive ? '#dc2626' : '#081126'} />
      ) : (
        <Feather
          name={icon}
          size={17}
          color={destructive ? '#dc2626' : '#081126'}
        />
      )}
    </View>
    <Text
      className={`flex-1 text-base font-sans-medium ${
        destructive ? 'text-destructive' : 'text-primary'
      }`}
    >
      {label}
    </Text>
    {value && (
      <Text className="text-sm font-sans-regular text-muted-foreground mr-1">
        {value}
      </Text>
    )}
    {onPress && !loading && (
      <Feather name="chevron-right" size={16} color="rgba(0,0,0,0.2)" />
    )}
  </Pressable>
);

const Divider = () => <View className="h-px bg-border mx-0" />;

// ─── Main Settings Screen ────────────────────────────────────────────────────

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [signingOut, setSigningOut] = useState(false);
  const [uploading, setUploading] = useState(false);

  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ??
    'User';

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

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
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
    ]);
  };

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to update your profile.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // Crucial: Use Base64 to bypass the "Getter only" property error
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (!user) throw new Error('User context not found');

      const asset = result.assets[0];
      if (!asset.base64) throw new Error('Image data is empty');

      // Construct the Data URI string Clerk expects in React Native
      const base64Image = `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;

      await user.setProfileImage({ file: base64Image });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Upload failed', err.message || 'An error occurred.');
    } finally {
      setUploading(false);
    }
  };

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
          <Text className="text-sm font-sans-regular text-muted-foreground">{email}</Text>
          {memberSince && (
            <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
              Member since {memberSince}
            </Text>
          )}
        </View>
        <Pressable
          onPress={handleImageUpload}
          disabled={uploading}
          className="auth-secondary-button w-full mt-1"
        >
          <Text className="auth-secondary-button-text">
            {uploading ? 'Uploading...' : 'Change profile picture'}
          </Text>
        </Pressable>
      </View>

      {/* Details list */}
      <View className="auth-card py-2">
        <Row icon="user" label="Name" value={fullName} />
        <Divider />
        <Row icon="mail" label="Email" value={email} />
        <Divider />
        <Row icon="calendar" label="Member since" value={memberSince ?? ''} />
      </View>

      {/* Sign out - Reduced py and explicit mt to fix card gap */}
      <View className="auth-card py-1 mt-2">
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

  const PreferencesTab = () => (
    <View className="gap-4">
      <View className="auth-card">
        <Text className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-widest mb-2">Notifications</Text>
        <Row icon="bell" label="Renewal reminders" value="On" />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        // High padding bottom (120) prevents the last card from overlapping with the tab bar
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="list-title mb-6">Settings</Text>
        <TabBar active={activeTab} onChange={setActiveTab} />
        {activeTab === 'account' ? <AccountTab /> : <PreferencesTab />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;