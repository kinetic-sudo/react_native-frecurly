import ListHeading from "@/components/ListHeading";
import Subscriptions from "@/components/Subscriptions";
import UpcommingSubscription from "@/components/UpcommingSubscription";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils/CurrencyFormating";
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RnsafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";



const SafeAreaView = styled(RnsafeAreaView);
 
export default function App() {

  const insets = useSafeAreaInsets()
  const [expandedSubscriptionId, SetExpandedSubscriptionId] = useState<string | null>(null)

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
        <FlatList 
        ListHeaderComponent={() => (
          <>
          <View className='home-header'>
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
            <Text className='home-user-name'>
              {HOME_USER.name}
            </Text>
        </View>
        <TouchableOpacity className="home-add-btn" accessibilityRole="button">
          <Image source={icons.plus} className="home-add-icon" />
        </TouchableOpacity>
      </View>
      <View className="home-balance-card">
        <Text className="home-balance-label"> 
          Balance 
        </Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            { formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
          </Text>
        </View>
      </View>
      <View className="mb-5">
        <ListHeading title='Upcoming'/>
        <FlatList 
         ListHeaderComponent={<View className="h-4"/>}
         data={UPCOMING_SUBSCRIPTIONS}
         renderItem={({item}) => ( <UpcommingSubscription {...item}/>
          )} 
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet</Text>}
         />
        </View>
        <ListHeading title='All Subscriptions'/>

          </>
        ) }
        data={HOME_SUBSCRIPTIONS} 
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <Subscriptions 
          {...item} 
          expanded={expandedSubscriptionId === item.id}
          onPress={() => SetExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
          />
        )} 
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">
          No subscriptions yet
        </Text>}
        contentContainerClassName="pb-20"
        />       
    </SafeAreaView>
  );
}