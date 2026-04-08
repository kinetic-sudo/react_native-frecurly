import SubscriptionCard from '@/components/Subscriptions';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { Feather } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RnsafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RnsafeAreaView);

// ─── Filter chips ─────────────────────────────────────────────────────────────

type Filter = 'all' | 'active' | 'paused' | 'cancelled';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'paused',    label: 'Paused'    },
  { key: 'cancelled', label: 'Cancelled' },
];

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const Chip = ({ label, active, onPress }: ChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    className={`mr-2 rounded-full px-4 py-1.5 border ${
      active
        ? 'bg-primary border-primary'
        : 'bg-background border-border'
    }`}
  >
    <Text
      className={`text-sm font-sans-semibold ${
        active ? 'text-background' : 'text-muted-foreground'
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ query }: { query: string }) => (
  <View className="flex-1 items-center justify-center gap-3 pt-20">
    <View className="w-16 h-16 rounded-full bg-muted items-center justify-center">
      <Feather name="search" size={28} color="rgba(0,0,0,0.3)" />
    </View>
    <Text className="text-lg font-sans-bold text-primary">
      No results found
    </Text>
    <Text className="text-sm font-sans-medium text-muted-foreground text-center px-8">
      {query.length > 0
        ? `No subscriptions match "${query}"`
        : 'No subscriptions in this category yet'}
    </Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubscriptionsScreen = () => {
  const [query, setQuery]                       = useState('');
  const [activeFilter, setActiveFilter]         = useState<Filter>('all');
  const [expandedId, setExpandedId]             = useState<string | null>(null);
  const [isFocused, setIsFocused]               = useState(false);

  // Derived filtered + searched list
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HOME_SUBSCRIPTIONS.filter((sub) => {
      // Status filter
      const passesFilter =
        activeFilter === 'all' || sub.status === activeFilter;
      // Search: name, category, plan
      const passesSearch =
        q.length === 0 ||
        sub.name.toLowerCase().includes(q) ||
        sub.category?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q);
      return passesFilter && passesSearch;
    });
  }, [query, activeFilter]);

  // Summary stats
  const totalMonthly = useMemo(
    () =>
      HOME_SUBSCRIPTIONS.filter((s) => s.status === 'active').reduce(
        (sum, s) => sum + (s.billing === 'Monthly' ? s.price : s.price / 12),
        0,
      ),
    [],
  );

  const handleFilterPress = (key: Filter) => {
    setActiveFilter(key);
    setExpandedId(null); // collapse any open card on filter change
  };

  const handleCardPress = (id: string) =>
    setExpandedId((curr) => (curr === id ? null : id));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
        extraData={expandedId}

        // ── Header ────────────────────────────────────────────────────────────
        ListHeaderComponent={
          <View>
            {/* Title row */}
            <View className="list-head mt-2">
              <Text className="list-title">Subscriptions</Text>
              <View className="rounded-full bg-muted px-3 py-1">
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  {HOME_SUBSCRIPTIONS.length} total
                </Text>
              </View>
            </View>

            {/* Summary card */}
            <View className="home-balance-card mb-5">
              <Text className="home-balance-label">Monthly spend</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  ${totalMonthly.toFixed(2)}
                </Text>
                <Text className="home-balance-date">
                  {results.length} shown
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View
              className={`flex-row items-center bg-card rounded-2xl border px-4 h-12 mb-4 ${
                isFocused ? 'border-primary' : 'border-border'
              }`}
            >
              <Feather
                name="search"
                size={17}
                color={isFocused ? '#081126' : 'rgba(0,0,0,0.3)'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                className="flex-1 text-base font-sans-medium text-primary"
                value={query}
                onChangeText={(v) => {
                  setQuery(v);
                  setExpandedId(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search by name, category…"
                placeholderTextColor="rgba(0,0,0,0.3)"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => { setQuery(''); setExpandedId(null); }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  hitSlop={8}
                >
                  <Feather name="x" size={16} color="rgba(0,0,0,0.4)" />
                </Pressable>
              )}
            </View>

            {/* Filter chips — horizontal scroll via FlatList */}
            <FlatList
              data={FILTERS}
              keyExtractor={(f) => f.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Chip
                  label={item.label}
                  active={activeFilter === item.key}
                  onPress={() => handleFilterPress(item.key)}
                />
              )}
              style={{ marginBottom: 20 }}
            />
          </View>
        }

        // ── List items ────────────────────────────────────────────────────────
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() => handleCardPress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}

        // ── Empty state ───────────────────────────────────────────────────────
        ListEmptyComponent={<EmptyState query={query} />}
      />
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;