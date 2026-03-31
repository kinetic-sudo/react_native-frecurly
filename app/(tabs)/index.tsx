import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href='/onboarding' className="mt-4 rounded bg-primary text-white p-4">
        Go to onboarding
      </Link>
      <Link href='/(auth)/Sign-in' className="mt-4 rounded bg-primary text-white p-4">
        Go to Sign in
      </Link>
      <Link href='/(auth)/Sign-up' className="mt-4 rounded bg-primary text-white p-4">
        Go to Sign up
      </Link>
      <Link href="/Subscriptions/spotify">
        spotify subscription
      </Link>
      <Link href={{
        pathname: "/Subscriptions/[id]",
        params: { id: "claude" }
      }}>
        Claude Max subscriiption
      </Link>
    </View>
  );
}