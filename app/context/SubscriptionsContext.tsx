import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  /** Pull-to-refresh state — use directly in StyledRefreshControl */
  refreshing: boolean;
  /** Call this in onRefresh prop of StyledRefreshControl */
  handleRefresh: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [refreshing, setRefreshing] = useState(false);

  const addSubscription = useCallback((sub: Subscription) => {
    setSubscriptions((prev) => [sub, ...prev]);
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /**
   * Global refresh handler.
   * Replace the setTimeout with your real API call when ready.
   * Every screen that uses this via context will show the spinner
   * and re-render when data updates — no app restart needed.
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // ── Swap this for your real data fetch ──────────────────────────────
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      // After fetching, update subscriptions:
      // setSubscriptions(freshData);
      // ────────────────────────────────────────────────────────────────────
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        removeSubscription,
        refreshing,
        handleRefresh,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSubscriptions = (): SubscriptionsContextValue => {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error(
      'useSubscriptions must be used inside <SubscriptionsProvider>',
    );
  }
  return ctx;
};