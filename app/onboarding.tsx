// app/onboarding.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const C = {
  primary:    '#081126',
  accent:     '#ea7a53',
  background: '#fff9e3',
  muted:      '#f6eecf',
  mutedFg:    'rgba(8,17,38,0.45)',
  card:       '#fff8e7',
};

const ONBOARDING_KEY = 'subtrack_onboarded';

// ─── Graphics ─────────────────────────────────────────────────────────────────

function Graphic1() {
  const rot   = useRef(new Animated.Value(0)).current;
  const rot2  = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot,  { toValue: 1,  duration: 12000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: -1, duration: 8000,  easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const spin  = rot.interpolate({  inputRange: [0, 1],   outputRange: ['0deg', '360deg']   });
  const spin2 = rot2.interpolate({ inputRange: [-1, 0],  outputRange: ['-360deg', '0deg']  });

  return (
    <View style={g.container}>
      <Animated.View style={[g.ring, { width: 220, height: 220, borderRadius: 110, borderColor: C.accent + '30', transform: [{ rotate: spin }] }]}>
        <View style={[g.orbitDot, { backgroundColor: C.accent }]} />
      </Animated.View>
      <Animated.View style={[g.ring, { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderColor: C.primary + '20', transform: [{ rotate: spin2 }] }]}>
        <View style={[g.orbitDot, { backgroundColor: C.primary, width: 8, height: 8, borderRadius: 4, top: -4, left: 76 }]} />
      </Animated.View>
      <Animated.View style={[g.centerCard, { transform: [{ scale: pulse }] }]}>
        <Text style={g.centerEmoji}>💳</Text>
        <Text style={g.centerLabel}>Subscriptions</Text>
      </Animated.View>
      <FloatingPill label="Netflix  $15.99" top={30}  left={-20} delay={0}   color={C.accent} />
      <FloatingPill label="Spotify  $5.99"  top={160} left={200} delay={400} color="#8fd1bd" />
      <FloatingPill label="Figma  $15.00"   top={240} left={-30} delay={800} color="#b8d4e3" />
    </View>
  );
}

function Graphic2() {
  const bars  = [0.4, 0.65, 0.5, 0.85, 0.6, 0.45, 0.75];
  const anims = bars.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(80, anims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 700, delay: i * 80, easing: Easing.out(Easing.back(1.2)), useNativeDriver: false })
    )).start();
  }, []);

  return (
    <View style={g.container}>
      <View style={[g.card, { width: 260, padding: 20 }]}>
        <Text style={[g.cardTitle, { marginBottom: 16 }]}>April 2026</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 }}>
          {bars.map((h, i) => (
            <Animated.View key={i} style={{ flex: 1, height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, h * 100] }), backgroundColor: i === 3 ? C.accent : C.primary + '18', borderRadius: 6 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <Text key={i} style={{ fontSize: 10, fontFamily: 'sans-medium', color: C.mutedFg, flex: 1, textAlign: 'center' }}>{d}</Text>
          ))}
        </View>
      </View>
      <View style={[g.badge, { top: 30, right: 20, backgroundColor: C.accent }]}>
        <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'sans-bold' }}>Due in 2 days</Text>
      </View>
      <FloatingPill label="🔔  Spotify renews Thu" top={220} left={30} delay={600} color={C.primary} textColor="#fff9e3" />
    </View>
  );
}

function Graphic3() {
  const SEGMENTS = [
    { label: 'Design',   pct: 38, color: C.accent },
    { label: 'AI Tools', pct: 26, color: '#8fd1bd' },
    { label: 'Dev',      pct: 20, color: C.primary },
    { label: 'Other',    pct: 16, color: '#f6eecf' },
  ];

  return (
    <View style={g.container}>
      <View style={[g.card, { width: 260, padding: 20, alignItems: 'center' }]}>
        <Text style={[g.cardTitle, { alignSelf: 'flex-start', marginBottom: 16 }]}>Monthly spend</Text>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: C.muted, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 60, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row' }}>
              <View style={{ flex: 38, backgroundColor: C.accent }} />
              <View style={{ flex: 62, backgroundColor: C.muted }} />
            </View>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row' }}>
              <View style={{ flex: 36, backgroundColor: C.primary }} />
              <View style={{ flex: 26, backgroundColor: '#8fd1bd' }} />
              <View style={{ flex: 38, backgroundColor: C.muted }} />
            </View>
          </View>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
            <Text style={{ fontFamily: 'sans-bold', fontSize: 15, color: C.primary }}>$122</Text>
            <Text style={{ fontFamily: 'sans-regular', fontSize: 10, color: C.mutedFg }}>/ month</Text>
          </View>
        </View>
        <View style={{ width: '100%', gap: 6 }}>
          {SEGMENTS.map((s) => (
            <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: s.color }} />
              <Text style={{ flex: 1, fontFamily: 'sans-medium', fontSize: 12, color: C.primary }}>{s.label}</Text>
              <Text style={{ fontFamily: 'sans-bold', fontSize: 12, color: C.primary }}>{s.pct}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function FloatingPill({ label, top, left, delay, color, textColor }: any) {
  const y       = useRef(new Animated.Value(6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(y,       { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0,  duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={[g.pill, { top, left, backgroundColor: color, opacity, transform: [{ translateY: y }] }]}>
      <Text style={{ fontFamily: 'sans-semibold', fontSize: 11, color: textColor ?? '#fff' }}>{label}</Text>
    </Animated.View>
  );
}

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === active ? C.accent : C.primary + '25' }} />
      ))}
    </View>
  );
}

// ─── Slides config (defined AFTER components so JSX is valid) ─────────────────
const SLIDES = [
  { id: '1', eyebrow: 'Welcome to',    title: 'Frecurly',  subtitle: 'Every subscription you own,\nin one place.',           graphic: <Graphic1 />, accent: C.accent   },
  { id: '2', eyebrow: 'Stay ahead of', title: 'Renewals',  subtitle: "Know exactly what's due\nbefore it hits your card.",   graphic: <Graphic2 />, accent: '#8fd1bd'  },
  { id: '3', eyebrow: 'Understand your',title: 'Spending', subtitle: 'Monthly insights that\nactually make sense.',          graphic: <Graphic3 />, accent: '#b8d4e3'  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const router    = useRouter();
  const { isSignedIn } = useAuth();
  const [index, setIndex] = useState(0);

  const slideX   = useRef(new Animated.Value(0)).current;
  const textY    = useRef(new Animated.Value(20)).current;
  const textOp   = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const slide  = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const animateIn = () => {
    slideX.setValue(40); textY.setValue(20); textOp.setValue(0);
    Animated.parallel([
      Animated.timing(slideX, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(textY,  { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(textOp, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    if (isSignedIn) {
      router.replace('/(tabs)');
      return;
    }
    router.replace('/(auth)/Sign-in');
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      Animated.parallel([
        Animated.timing(textOp, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(textY,  { toValue: -12, duration: 180, useNativeDriver: true }),
      ]).start(() => { setIndex(index + 1); animateIn(); });
    } else {
      finish();
    }
  };

  const handleSkip = () => { finish(); };

  useEffect(() => { animateIn(); }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      {!isLast && (
        <Pressable onPress={handleSkip} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.graphicArea, { transform: [{ translateX: slideX }] }]}>
        {slide.graphic}
      </Animated.View>

      <Animated.View style={[styles.textBlock, { opacity: textOp, transform: [{ translateY: textY }] }]}>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={styles.bottomBar}>
        <Dots total={SLIDES.length} active={index} />
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            onPress={handleNext}
            onPressIn={()  => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start()}
            style={[styles.btn, { backgroundColor: slide.accent }]}
          >
            <Text style={styles.btnText}>{isLast ? 'Get started' : 'Continue'}</Text>
            <Text style={styles.btnArrow}>{isLast ? '✦' : '→'}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const g = StyleSheet.create({
  container:  { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  ring:       { borderWidth: 1.5, alignItems: 'flex-start', justifyContent: 'flex-start' },
  orbitDot:   { width: 10, height: 10, borderRadius: 5, position: 'absolute', top: -5, left: 105 },
  centerCard: { position: 'absolute', backgroundColor: C.card, borderRadius: 20, padding: 20, alignItems: 'center', gap: 6, shadowColor: C.primary, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  centerEmoji:{ fontSize: 32 },
  centerLabel:{ fontFamily: 'sans-semibold', fontSize: 13, color: C.primary },
  pill:       { position: 'absolute', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  card:       { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: C.primary, shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  cardTitle:  { fontFamily: 'sans-bold', fontSize: 15, color: C.primary },
  badge:      { position: 'absolute', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
});

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  skip:       { position: 'absolute', top: 56, right: 24, zIndex: 10, paddingVertical: 6, paddingHorizontal: 4 },
  skipText:   { fontFamily: 'sans-medium', fontSize: 14, color: C.mutedFg },
  graphicArea:{ flex: 1, maxHeight: height * 0.52, marginTop: 24, paddingHorizontal: 20 },
  textBlock:  { paddingHorizontal: 32, paddingBottom: 8 },
  eyebrow:    { fontFamily: 'sans-medium', fontSize: 14, color: C.mutedFg, letterSpacing: 0.4, marginBottom: 4 },
  title:      { fontFamily: 'sans-extrabold', fontSize: 40, color: C.primary, lineHeight: 44, marginBottom: 12 },
  subtitle:   { fontFamily: 'sans-regular', fontSize: 16, color: C.mutedFg, lineHeight: 24 },
  bottomBar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 24 },
  btn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 100, shadowColor: C.primary, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  btnText:    { fontFamily: 'sans-bold', fontSize: 15, color: C.primary },
  btnArrow:   { fontFamily: 'sans-bold', fontSize: 16, color: C.primary },
});