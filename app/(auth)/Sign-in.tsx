import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RnSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RnSafeAreaView);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ─── Field error ──────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text className="auth-error">{message}</Text> : null;

// ─── Labelled input ───────────────────────────────────────────────────────────

type InputProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  error?: string;
};

const Field = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}: InputProps) => (
  <View className="auth-field">
    <Text className="auth-label">{label}</Text>
    <TextInput
      className={`auth-input${error ? ' auth-input-error' : ''}`}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor="rgba(0,0,0,0.3)"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
    />
    <FieldError message={error} />
  </View>
);

// ─── MFA step ─────────────────────────────────────────────────────────────────

type MfaProps = {
  code: string;
  setCode: (v: string) => void;
  codeError?: string;
  globalError?: string;
  loading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onReset: () => void;
};

const MfaStep = ({
  code, setCode, codeError, globalError,
  loading, onVerify, onResend, onReset,
}: MfaProps) => (
  <View className="auth-mfa-panel">
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">f</Text>
        </View>
        <View>
          <Text className="auth-wordmark">frecurly</Text>
          <Text className="auth-wordmark-sub">Subscription tracker</Text>
        </View>
      </View>
      <Text className="auth-title">Check your inbox</Text>
      <Text className="auth-subtitle">
        We sent a 6-digit code to your email. Enter it below to continue.
      </Text>
    </View>

    <View className="auth-card">
      <View className="auth-form">
        <Field
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          error={codeError}
        />
        {globalError ? (
          <Text className="auth-error auth-error-banner">{globalError}</Text>
        ) : null}
        <Pressable
          className={`auth-button${loading ? ' auth-button-disabled' : ''}`}
          onPress={onVerify}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Confirm verification code"
        >
          {loading
            ? <ActivityIndicator color="#081126" />
            : <Text className="auth-button-text">Confirm code</Text>}
        </Pressable>
      </View>
    </View>

    <Pressable
      className="auth-secondary-button"
      onPress={onResend}
      accessibilityRole="button"
    >
      <Text className="auth-secondary-button-text">Send a new code</Text>
    </Pressable>

    <View className="auth-link-row">
      <Pressable onPress={onReset} accessibilityRole="button">
        <Text className="auth-link">Start over</Text>
      </Pressable>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode]   = useState('');

  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading]   = useState(false);
  const [showMfa, setShowMfa]   = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string; password?: string; mfaCode?: string;
  }>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateField = useCallback(
    (field: 'email' | 'password', errs: typeof fieldErrors) => {
      if (field === 'email') {
        if (!email.trim()) errs.email = 'Email is required.';
        else if (!isValidEmail(email)) errs.email = 'Enter a valid email.';
        else delete errs.email;
      }
      if (field === 'password') {
        if (!password) errs.password = 'Password is required.';
        else if (password.length < 8) errs.password = 'At least 8 characters.';
        else delete errs.password;
      }
    },
    [email, password]
  );

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = { ...fieldErrors };
    validateField(field, errs);
    setFieldErrors(errs);
  };

  const validate = useCallback(() => {
    const errs: typeof fieldErrors = {};
    validateField('email', errs);
    validateField('password', errs);
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [validateField]);

  // ── Sign-in ──────────────────────────────────────────────────────────────────

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl('/') as Href);
          },
        });
      } else if (
        result.status === 'needs_second_factor' ||
        result.status === 'needs_client_trust'
      ) {
        const emailFactor = result.supportedSecondFactors?.find(
          (f) => f.strategy === 'email_code'
        );
        if (emailFactor) {
          await signIn.prepareSecondFactor({ strategy: 'email_code' });
          setShowMfa(true);
        } else {
          setGlobalError('Unsupported second factor method. Please contact support.');
        }
      }  
    } catch (err: any) {
      setGlobalError(
        err?.errors?.[0]?.longMessage ||
        err?.errelseors?.[0]?.message ||
        'Incorrect email or password.'
      );
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, router, validate]);

  // ── MFA verify ──────────────────────────────────────────────────────────────

  const handleMfaVerify = useCallback(async () => {
    if (!isLoaded) return;
    setGlobalError('');
    if (!mfaCode.trim()) {
      setFieldErrors((p) => ({ ...p, mfaCode: 'Enter the 6-digit code.' }));
      return;
    }
    setFieldErrors((p) => ({ ...p, mfaCode: undefined }));
    setLoading(true);
    try {
      await signIn.attemptSecondFactor({ strategy: 'email_code', code: mfaCode.trim() });
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl('/') as Href);
          },
        });
      } else {
        setGlobalError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setFieldErrors((p) => ({
        ...p,
        mfaCode:
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Invalid code.',
      }));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, mfaCode, signIn, router]);

  const handleResend = useCallback(async () => {
    if (!isLoaded) return;
    try { await signIn.prepareSecondFactor({ strategy: 'email_code' }); }
    catch { setGlobalError('Could not resend code. Try again.'); }
  }, [isLoaded, signIn]);

  const handleReset = useCallback(() => {
    setShowMfa(false); setMfaCode(''); setGlobalError(''); setFieldErrors({});
  }, []);

  const canSubmit = !!email && !!password && !loading;

  // ── MFA view ─────────────────────────────────────────────────────────────────

  if (showMfa) {
    return (
      <SafeAreaView className="auth-screen">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="auth-content">
              <MfaStep
                code={mfaCode} setCode={setMfaCode}
                codeError={fieldErrors.mfaCode} globalError={globalError}
                loading={loading}
                onVerify={handleMfaVerify} onResend={handleResend} onReset={handleReset}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="auth-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="auth-content">

            {/* Brand block */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">f</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">frecurly</Text>
                  <Text className="auth-wordmark-sub">Subscription tracker</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to keep your subscriptions in check.
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">
                <Field
                  label="Email"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setGlobalError(''); if (touched.email) handleBlur('email'); }}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={fieldErrors.email}
                />
                <Field
                  label="Password"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setGlobalError(''); if (touched.password) handleBlur('password'); }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  secureTextEntry
                  error={fieldErrors.password}
                />

                {globalError ? (
                  <Text className="auth-error auth-error-banner">{globalError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button${!canSubmit ? ' auth-button-disabled' : ''}`}
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in to Frecurly"
                >
                  {loading
                    ? <ActivityIndicator color="#081126" />
                    : <Text className="auth-button-text">Sign in</Text>}
                </Pressable>
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account?</Text>
              <Link href="/(auth)/Sign-up" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="auth-link">Create one</Text>
                </Pressable>
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}