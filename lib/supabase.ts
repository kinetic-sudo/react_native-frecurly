// src/lib/supabase.ts
import { icons, type IconKey } from "@/constants/icons"; // adjust path as needed
import { useAuth } from "@clerk/expo";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

// Use empty string fallbacks so the module loads fine before .env is configured.
// assertConfigured() throws with a clear message at actual call time instead.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured.\n" +
        "Add these to your .env file:\n" +
        "  EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
        "  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n" +
        "Then restart: npx expo start --clear",
    );
  }
}

function makeClientConfig(getToken: () => Promise<string | null>) {
  return {
    global: {
      fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
        const token = await getToken();
        const headers = new Headers(options.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return fetch(url, { ...options, headers });
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };
}

/**
 * Hook — use inside React components.
 * Returns a Supabase client authenticated with the current Clerk session.
 */
export function useSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();
  return useMemo(() => {
    assertConfigured();
    return createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      makeClientConfig(getToken),
    );
  }, [getToken]);
}

/**
 * Factory — use outside React components (e.g. inside context callbacks).
 * Pass getToken from useAuth().
 */
export function createSupabaseClient(
  getToken: () => Promise<string | null>,
): SupabaseClient {
  assertConfigured();
  return createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    makeClientConfig(getToken),
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  billing: "Monthly" | "Yearly";
  status: "active" | "paused" | "cancelled";
  category: string | null;
  plan: string | null;
  renewal_date: string | null;
  currency: string;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export function rowToSubscription(row: SubscriptionRow): Subscription {
  const iconKey = row.icon as IconKey;
  const localIcon = iconKey && icons[iconKey] ? icons[iconKey] : icons.wallet;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    price: row.price,
    billing: row.billing,
    status: row.status,
    category: row.category ?? undefined,
    plan: row.plan ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    currency: row.currency,
    color: row.color ?? undefined,
    icon: localIcon, // Pass the mapped local image object here!
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Subscription;
}
