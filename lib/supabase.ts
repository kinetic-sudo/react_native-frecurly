// src/lib/supabase.ts
// ─────────────────────────────────────────────────────────────────────────────
// Supabase client that uses Clerk's session token for Row Level Security.
//
// How it works:
//   1. Clerk issues a JWT for the signed-in user (sub = "user_2abc...")
//   2. We pass that token to Supabase as a custom Authorization header
//   3. Supabase RLS reads the "sub" claim via requesting_user_id() and
//      enforces per-user data isolation automatically
//
// Required env vars in your Expo project (.env):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth } from "@clerk/expo";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

/**
 * Returns a Supabase client that is authenticated with the current Clerk
 * session token. Call this hook inside any component or context that needs
 * to talk to Supabase.
 *
 * The client is re-created whenever getToken changes (i.e. on sign-in/out),
 * so you always have a fresh, correctly-authenticated client.
 */
export function useSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();

  const client = useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          // Inject the Clerk JWT into every Supabase request.
          // Supabase uses it to evaluate RLS policies via requesting_user_id().
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken();
            const headers = new Headers(options.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }
            return fetch(url, { ...options, headers });
          },
        },
        auth: {
          // We handle auth via Clerk — disable Supabase's own auth session
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }),
    [getToken],
  );

  return client;
}

/**
 * Standalone (non-hook) Supabase client factory.
 * Use this outside of React components — e.g. in utility functions.
 * You must pass getToken from useAuth().
 */
export function createSupabaseClient(
  getToken: () => Promise<string | null>,
): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken();
        const headers = new Headers(options.headers);
        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// ─── Typed database row ───────────────────────────────────────────────────────
// Mirrors the `subscriptions` table columns exactly.
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

// ─── Mapper: DB row → app Subscription type ───────────────────────────────────
// Your existing app types use camelCase + `renewalDate`.
// This converts snake_case DB columns to match.
export function rowToSubscription(row: SubscriptionRow): Subscription {
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
    icon: row.icon ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Subscription;
}
