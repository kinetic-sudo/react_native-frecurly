import { icons } from '@/constants/icons';
import {
  createSupabaseClient,
  SubscriptionRow,
} from '@/lib/supabase';
import { useAuth, useUser } from '@clerk/expo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ImageSourcePropType } from 'react-native';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
type IconKey = keyof typeof icons;

function iconToKey(icon: ImageSourcePropType): string | null {
  const entry = (Object.entries(icons) as [IconKey, ImageSourcePropType][])
    .find(([, src]) => src === icon);
  return entry ? entry[0] : null;
}

function keyToIcon(key: string | null | undefined): ImageSourcePropType {
  if (key && key in icons) return icons[key as IconKey];
  return icons.plus; // fallback
}

// ─── DB row → Subscription ────────────────────────────────────────────────────
function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id:          row.id,
    name:        row.name,
    price:       row.price,
    billing:     row.billing,
    status:      row.status,
    category:    row.category    ?? undefined,
    plan:        row.plan        ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    currency:    row.currency,
    color:       row.color       ?? undefined,
    icon:        keyToIcon(row.icon),   
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CreateInput = Omit<Subscription, 'id'>;
type UpdateInput = Partial<CreateInput>;

type SubscriptionsContextValue = {
  subscriptions:     Subscription[];
  addSubscription:   (input: CreateInput) => Promise<void>;
  removeSubscription:(id: string) => Promise<void>;
  updateSubscription:(id: string, patch: UpdateInput) => Promise<void>;
  refreshing:        boolean;
  handleRefresh:     () => Promise<void>;
  loading:           boolean;
  error:             string | null;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SubscriptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing]       = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Note: We use the function inside the callbacks to avoid dependency cycles
  const getDb = useCallback(() => createSupabaseClient(getToken), [getToken]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSubscriptions = useCallback(async () => {
    if (!isSignedIn) return;

    const { data, error: err } = await getDb()
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); return; }

    setSubscriptions((data as SubscriptionRow[]).map(rowToSubscription));
    setError(null);
  }, [isSignedIn, getDb]);

  // FIX 1: Only run this when isSignedIn changes, not when the function reference changes!
  useEffect(() => {
    if (isSignedIn) {
      setLoading(true);
      fetchSubscriptions().finally(() => setLoading(false));
    }
  }, [isSignedIn]); 

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }, [fetchSubscriptions]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addSubscription = useCallback(async (input: CreateInput) => {
    if (!user) throw new Error('Not signed in');

    const { data, error: err } = await getDb()
      .from('subscriptions')
      .insert({
        user_id:      user.id,
        name:         input.name,
        price:        input.price,
        billing:      input.billing,
        status:       input.status ?? 'active',
        category:     input.category    ?? null,
        plan:         input.plan        ?? null,
        renewal_date: input.renewalDate ?? null,
        currency:     input.currency    ?? 'USD',
        color:        input.color       ?? null,
        icon:         iconToKey(input.icon), 
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    setSubscriptions((prev) => [rowToSubscription(data as SubscriptionRow), ...prev]);
  }, [user, getDb]);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateSubscription = useCallback(async (id: string, patch: UpdateInput) => {
    const dbPatch: Partial<SubscriptionRow> = {
      ...(patch.name        !== undefined && { name:         patch.name }),
      ...(patch.price       !== undefined && { price:        patch.price }),
      ...(patch.billing     !== undefined && { billing:      patch.billing as SubscriptionRow['billing'] }),
      ...(patch.status      !== undefined && { status:       patch.status as SubscriptionRow['status'] }),
      ...(patch.category    !== undefined && { category:     patch.category    ?? null }),
      ...(patch.plan        !== undefined && { plan:         patch.plan        ?? null }),
      ...(patch.renewalDate !== undefined && { renewal_date: patch.renewalDate ?? null }),
      ...(patch.currency    !== undefined && { currency:     patch.currency }),
      ...(patch.color       !== undefined && { color:        patch.color       ?? null }),
      ...(patch.icon        !== undefined && { icon:         iconToKey(patch.icon) }),
    };

    const { data, error: err } = await getDb()
      .from('subscriptions')
      .update(dbPatch)
      .eq('id', id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setSubscriptions((prev) =>
      prev.map((s) => s.id === id ? rowToSubscription(data as SubscriptionRow) : s)
    );
  }, [getDb]);

  // ── Remove ────────────────────────────────────────────────────────────────
  const removeSubscription = useCallback(async (id: string) => {
    const { error: err } = await getDb()
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (err) throw new Error(err.message);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, [getDb]);

  // FIX 2: Memoize the context value so it doesn't force children to re-render constantly
  const value = useMemo(() => ({
    subscriptions,
    addSubscription,
    removeSubscription,
    updateSubscription,
    refreshing,
    handleRefresh,
    loading,
    error,
  }), [
    subscriptions,
    addSubscription,
    removeSubscription,
    updateSubscription,
    refreshing,
    handleRefresh,
    loading,
    error
  ]);

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSubscriptions = (): SubscriptionsContextValue => {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) throw new Error('useSubscriptions must be used inside <SubscriptionsProvider>');
  return ctx;
};