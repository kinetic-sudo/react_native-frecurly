import "@/global.css";
import { Link } from "expo-router";
import { styled } from 'nativewind';
import { Text } from "react-native";
import { SafeAreaView as RnsafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RnsafeAreaView);
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-extrabold">
        Home
      </Text>
      <Link href='/onboarding' className="mt-4 font-sans-bold rounded bg-primary text-white p-4">
        Go to onboarding
      </Link>
      <Link href='/(auth)/Sign-in' className="mt-4 font-sans-bold rounded bg-primary text-white p-4">
        Go to Sign in
      </Link>
      <Link href='/(auth)/Sign-up' className="mt-4 font-sans-bold rounded bg-primary text-white p-4">
        Go to Sign up
      </Link>
  
    </SafeAreaView>
  );
}