import { HOME_BALANCE, HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils/CurrencyFormating";
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RnsafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RnsafeAreaView);
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className='home-header'>
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
            <Text className='home-user-name'>
              {HOME_USER.name}
            </Text>
        </View>
        <Pressable className="home-add-btn" accessibilityRole="button">
          <Image source={icons.plus} className="home-add-icon" />
        </Pressable>
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
    </SafeAreaView>
  );
}