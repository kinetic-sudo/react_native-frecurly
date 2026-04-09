import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { createContext, useContext, useState } from "react";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType>({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: () => {},
});

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (sub: Subscription) => {
    setSubscriptions((prev) => [sub, ...prev]);
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export const useSubscriptions = () => useContext(SubscriptionsContext);