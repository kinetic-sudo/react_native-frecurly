import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { formatCurrency } from '@/lib/utils/CurrencyFormating';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView as RnsafeAreaView } from 'react-native-safe-area-context';
import { useSubscriptions } from '../context/SubscriptionsContext';

const SafeAreaView = styled(RnsafeAreaView);

// ─── Design tokens (matching global.css) ─────────────────────────────────────

const COLORS = {
  primary:    '#081126',
  accent:     '#ea7a53',
  background: '#fff9e3',
  card:       '#fff8e7',
  muted:      '#f6eecf',
  border:     'rgba(0,0,0,0.08)',
  mutedFg:    'rgba(0,0,0,0.45)',
};

// ─── Bar chart data ───────────────────────────────────────────────────────────

type BarData = { day: string; value: number };

const WEEK_DATA: BarData[] = [
  { day: 'Mon', value: 35 },
  { day: 'Tue', value: 30 },
  { day: 'Wed', value: 23 },
  { day: 'Thu', value: 40 },   // highlighted by default
  { day: 'Fri', value: 34 },
  { day: 'Sat', value: 18 },
  { day: 'Sun', value: 24 },
];

const Y_LABELS = [45, 35, 25, 5, 0];
const CHART_HEIGHT   = 200;   // px — drawable area height
const BAR_MAX_VALUE  = 45;    // matches top Y label
const BAR_WIDTH      = 26;
const BAR_RADIUS     = 13;

// ─── Single animated bar ──────────────────────────────────────────────────────



const Bar = ({ item, index, selected, onPress }: BarProps) => {
  const targetH = (item.value / BAR_MAX_VALUE) * CHART_HEIGHT;
  const height   = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      index * 60,
      withSpring(targetH, { damping: 14, stiffness: 120 }),
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.day}: $${item.value}`}
      style={{ alignItems: 'center', flex: 1 }}
    >
      {/* Price label above selected bar */}
      <View style={{ height: 28, justifyContent: 'flex-end', marginBottom: 4 }}>
        {selected && (
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'sans-bold',
                color: COLORS.accent,
              }}
            >
              ${item.value}
            </Text>
          </View>
        )}
      </View>

      {/* Bar */}
      <View
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
      >
        <Animated.View
          style={[
            {
              width: BAR_WIDTH,
              borderRadius: BAR_RADIUS,
              backgroundColor: selected ? COLORS.accent : COLORS.primary,
            },
            barStyle,
          ]}
        />
      </View>

      {/* Day label */}
      <Text
        style={{
          marginTop: 8,
          fontSize: 11,
          fontFamily: 'sans-medium',
          color: selected ? COLORS.primary : COLORS.mutedFg,
        }}
      >
        {item.day}
      </Text>
    </Pressable>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────

const BarChart = () => {
  const [selectedIndex, setSelectedIndex] = useState(3); // Thu default

  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        paddingBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Y-axis labels */}
        <View
          style={{
            justifyContent: 'space-between',
            height: CHART_HEIGHT,
            paddingBottom: 0,
            marginRight: 8,
            paddingTop: 32, // offset for label space above bars
          }}
        >
          {Y_LABELS.map((label) => (
            <Text
              key={label}
              style={{
                fontSize: 10,
                fontFamily: 'sans-regular',
                color: COLORS.mutedFg,
                width: 22,
                textAlign: 'right',
              }}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View style={{ flex: 1 }}>
          {/* Dashed grid lines */}
          <View
            style={{
              position: 'absolute',
              top: 32,         // same offset as Y labels
              left: 0,
              right: 0,
              height: CHART_HEIGHT,
              justifyContent: 'space-between',
            }}
            pointerEvents="none"
          >
            {Y_LABELS.map((label) => (
              <View
                key={label}
                style={{
                  height: 1,
                  borderWidth: 0,
                  borderTopWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: COLORS.border,
                }}
              />
            ))}
          </View>

          {/* Bars row */}
          <View
            style={{
              flexDirection: 'row',
              height: CHART_HEIGHT + 32 + 24, // bar area + label space top + day label
              alignItems: 'flex-end',
            }}
          >
            {WEEK_DATA.map((item, i) => (
              <Bar
                key={item.day}
                item={item}
                index={i}
                selected={selectedIndex === i}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Expenses summary card ────────────────────────────────────────────────────

const totalMonthly = HOME_SUBSCRIPTIONS.filter(
  (s) => s.status === 'active',
).reduce(
  (sum, s) => sum + (s.billing === 'Monthly' ? s.price : s.price / 12),
  0,
);

const ExpenseCard = () => (
  <View
    style={{
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <View>
      <Text
        style={{
          fontSize: 17,
          fontFamily: 'sans-bold',
          color: COLORS.primary,
        }}
      >
        Expenses
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: 'sans-medium',
          color: COLORS.mutedFg,
          marginTop: 2,
        }}
      >
        {dayjs().format('MMMM YYYY')}
      </Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text
        style={{
          fontSize: 17,
          fontFamily: 'sans-bold',
          color: COLORS.primary,
        }}
      >
        -{formatCurrency(totalMonthly)}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: 'sans-semibold',
          color: '#16a34a',   // success green
          marginTop: 2,
        }}
      >
        +12%
      </Text>
    </View>
  </View>
);

// ─── History row (subscription card for history section) ──────────────────────


const HistoryRow = ({
  name, renewalDate, price, currency, billing, color, icon,
}: HistoryRowProps) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: color ?? COLORS.card,
      borderRadius: 20,
      padding: 16,
    }}
  >
    {/* Icon */}
    <Animated.Image
      source={icon}
      style={{ width: 52, height: 52, borderRadius: 14, marginRight: 14 }}
      resizeMode="contain"
    />
    {/* Meta */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 17,
          fontFamily: 'sans-bold',
          color: COLORS.primary,
        }}
      >
        {name}
      </Text>
      {renewalDate && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'sans-medium',
            color: COLORS.mutedFg,
            marginTop: 2,
          }}
        >
          {dayjs(renewalDate).format('MMMM D, HH:mm')}
        </Text>
      )}
    </View>
    {/* Price */}
    <View style={{ alignItems: 'flex-end' }}>
      <Text
        style={{
          fontSize: 17,
          fontFamily: 'sans-bold',
          color: COLORS.primary,
        }}
      >
        {formatCurrency(price, currency)}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'sans-medium',
          color: COLORS.mutedFg,
          marginTop: 2,
        }}
      >
        per {billing.toLowerCase() === 'yearly' ? 'year' : 'month'}
      </Text>
    </View>
  </View>
);

// ─── Section heading (matches ListHeading component) ──────────────────────────

const SectionHead = ({ title }: { title: string }) => (
  <View className="list-head">
    <Text className="list-title">{title}</Text>
    <Pressable className="list-action" accessibilityRole="button">
      <Text className="list-action-text">View all</Text>
    </Pressable>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const Insights = () => {
  const mounted = useRef(false);
  const {handleRefresh, refreshing} = useSubscriptions()
  useEffect(() => { mounted.current = true; }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text className="list-title mb-5">Monthly Insights</Text>

        {/* Upcoming heading */}
        <SectionHead title="Upcoming" />

        {/* Bar chart */}
        <View style={{ marginBottom: 16 }}>
          <BarChart />
        </View>

        {/* Expenses summary */}
        <View style={{ marginBottom: 24 }}>
          <ExpenseCard />
        </View>

        {/* History heading */}
        <SectionHead title="History" />

        {/* History list — active subscriptions as history rows */}
        <View style={{ gap: 12 }}>
          {HOME_SUBSCRIPTIONS.map((sub) => (
            <HistoryRow
              key={sub.id}
              name={sub.name}
              renewalDate={sub.renewalDate}
              price={sub.price}
              currency={sub.currency}
              billing={sub.billing}
              color={sub.color}
              icon={sub.icon}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;