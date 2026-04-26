// src/context/SubscriptionsContext.tsx
// Drop-in replacement — same interface as before, now backed by Supabase.

import {
  createSupabaseClient,
  rowToSubscription,
  SubscriptionRow,
} from '@/lib/supabase';
import { useAuth, useUser } from '@clerk/expo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateInput = Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Partial<CreateInput>;

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (input: CreateInput) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, patch: UpdateInput) => Promise<void>;
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
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

  const db = useCallback(
    () => createSupabaseClient(getToken),
    [getToken],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSubscriptions = useCallback(async () => {
    if (!isSignedIn) return;

    const { data, error: err } = await db()
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); return; }

    setSubscriptions((data as SubscriptionRow[]).map(rowToSubscription));
    setError(null);
  }, [isSignedIn, db]);

  useEffect(() => {
    setLoading(true);
    fetchSubscriptions().finally(() => setLoading(false));
  }, [fetchSubscriptions]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }, [fetchSubscriptions]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addSubscription = useCallback(
    async (input: CreateInput) => {
      if (!user) throw new Error('Not signed in');

      const row = {
        user_id:      user.id,
        name:         input.name,
        price:        input.price,
        billing:      input.billing as SubscriptionRow['billing'],
        status:       (input.status ?? 'active') as SubscriptionRow['status'],
        category:     input.category ?? null,
        plan:         input.plan ?? null,
        renewal_date: input.renewalDate ?? null,
        currency:     input.currency ?? 'USD',
        color:        input.color ?? null,
        // icon may be an ImageSourcePropType in the app — only store string URLs
        icon:         typeof input.icon === 'string' ? input.icon : null,
      };

      const { data, error: err } = await db()
        .from('subscriptions')
        .insert(row)
        .select()
        .single();

      if (err) throw new Error(err.message);

      setSubscriptions((prev) => [
        rowToSubscription(data as SubscriptionRow),
        ...prev,
      ]);
    },
    [user, db],
  );

  // ── Update ────────────────────────────────────────────────────────────────
  const updateSubscription = useCallback(
    async (id: string, patch: UpdateInput) => {
      // Cast narrow literals explicitly — the app's Subscription type uses
      // `string` for billing/status, but the DB row expects the exact union.
      const dbPatch: Partial<SubscriptionRow> = {
        ...(patch.name        !== undefined && { name:         patch.name }),
        ...(patch.price       !== undefined && { price:        patch.price }),
        ...(patch.billing     !== undefined && { billing:      patch.billing as SubscriptionRow['billing'] }),
        ...(patch.status      !== undefined && { status:       patch.status as SubscriptionRow['status'] }),
        ...(patch.category    !== undefined && { category:     patch.category ?? null }),
        ...(patch.plan        !== undefined && { plan:         patch.plan ?? null }),
        ...(patch.renewalDate !== undefined && { renewal_date: patch.renewalDate ?? null }),
        ...(patch.currency    !== undefined && { currency:     patch.currency }),
        ...(patch.color       !== undefined && { color:        patch.color ?? null }),
        ...(patch.icon        !== undefined && { icon:         typeof patch.icon === 'string' ? patch.icon : null }),
      };

      const { data, error: err } = await db()
        .from('subscriptions')
        .update(dbPatch)
        .eq('id', id)
        .select()
        .single();

      if (err) throw new Error(err.message);

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id ? rowToSubscription(data as SubscriptionRow) : s,
        ),
      );
    },
    [db],
  );

  // ── Remove ────────────────────────────────────────────────────────────────
  const removeSubscription = useCallback(
    async (id: string) => {
      const { error: err } = await db()
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (err) throw new Error(err.message);

      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    },
    [db],
  );

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        removeSubscription,
        updateSubscription,
        refreshing,
        handleRefresh,
        loading,
        error,
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
    throw new Error('useSubscriptions must be used inside <SubscriptionsProvider>');
  }
  return ctx;
};