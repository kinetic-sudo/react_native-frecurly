// src/lib/supabase.ts
import { icons, type IconKey } from "@/constants/icons";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured.\n" +
        "Add to your .env:\n" +
        "  EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
        "  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n" +
        "Then restart: npx expo start --clear",
    );
  }
}

// Single shared client — RLS is off so no per-user JWT needed.
// Security is enforced by always filtering WHERE user_id = <clerk_user_id>
// in every query inside SubscriptionsContext.
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  assertConfigured();
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

// Keep these exports so existing code that imports them doesn't break
export function useSupabaseClient(): SupabaseClient {
  return getSupabaseClient();
}

export function createSupabaseClient(
  _getToken: () => Promise<string | null>,
): SupabaseClient {
  return getSupabaseClient();
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
  const iconKey = row.icon as IconKey | null;
  const localIcon = iconKey && icons[iconKey] ? icons[iconKey] : icons.wallet;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    billing: row.billing,
    status: row.status,
    category: row.category ?? undefined,
    plan: row.plan ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    currency: row.currency,
    color: row.color ?? undefined,
    icon: localIcon,
  } as unknown as Subscription;
}
