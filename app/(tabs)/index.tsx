import ListHeading from "@/components/ListHeading";
import Subscriptions from "@/components/Subscriptions";
import UpcommingSubscription from "@/components/UpcommingSubscription";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils/CurrencyFormating";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from 'dayjs';
import { useRouter } from "expo-router";
import { styled } from 'nativewind';
import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RnsafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RnsafeAreaView);

export default function App() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [expandedSubscriptionId, SetExpandedSubscriptionId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/Sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  // Derive display name: prefer firstName, fall back to email prefix
  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ??
    'Hey there';

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* ── Header ── */}
            <View className='home-header'>
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className='home-user-name'>{displayName}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Sign-out button */}
                <TouchableOpacity
                  onPress={handleSignOut}
                  disabled={signingOut}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  className="home-add-btn"
                  style={{ opacity: signingOut ? 0.5 : 1 }}
                >
                  {signingOut
                    ? <ActivityIndicator size="small" color="#081126" />
                    : <Image source={icons.logout} className="home-add-icon" />
                  }
                </TouchableOpacity>

                {/* Existing add button */}
                <TouchableOpacity
                  className="home-add-btn"
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                >
                  <Image source={icons.plus} className="home-add-icon" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Balance card ── */}
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            {/* ── Upcoming ── */}
            <View className="mb-5">
              <ListHeading title='Upcoming' />
              <FlatList
                ListHeaderComponent={<View className="h-4" />}
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcommingSubscription {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">No upcoming renewals yet</Text>
                }
              />
            </View>

            <ListHeading title='All Subscriptions' />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Subscriptions
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              SetExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet</Text>
        }
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
}