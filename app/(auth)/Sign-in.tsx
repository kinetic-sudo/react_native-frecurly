import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
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

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ─── Field error ──────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text className="auth-error">{message}</Text> : null;

// ─── Labelled input ───────────────────────────────────────────────────────────

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
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const [touched, setTouched] = useState({ email: false, password: false });
  const [showMfa, setShowMfa] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    mfaCode?: string;
  }>({});

  const loading = fetchStatus === 'fetching';

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
    [email, password],
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
    setGlobalError('');
    if (!validate()) return;

    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) {
      setGlobalError(
        error.longMessage ?? error.message ?? 'Incorrect email or password.',
      );
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return; // let Clerk handle session tasks
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace(url as any);
        },
      });
    } else if (signIn.status === 'needs_client_trust') {
      // MFA via email code
      await signIn.mfa.sendEmailCode();
      setShowMfa(true);
    } else {
      setGlobalError('Additional verification required. Please check your email.');
    }
  }, [email, password, signIn, router, validate]);

  // ── MFA verify ──────────────────────────────────────────────────────────────

  const handleMfaVerify = useCallback(async () => {
    setGlobalError('');
    if (!mfaCode.trim()) {
      setFieldErrors((p) => ({ ...p, mfaCode: 'Enter the 6-digit code.' }));
      return;
    }
    setFieldErrors((p) => ({ ...p, mfaCode: undefined }));

    await signIn.mfa.verifyEmailCode({ code: mfaCode.trim() });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace(url as any);
        },
      });
    } else {
      setGlobalError('Verification failed. Please try again.');
    }
  }, [mfaCode, signIn, router]);

  const handleResend = useCallback(async () => {
    try {
      await signIn.mfa.sendEmailCode();
    } catch {
      setGlobalError('Could not resend code. Try again.');
    }
  }, [signIn]);

  const handleReset = useCallback(() => {
    signIn.reset();
    setShowMfa(false);
    setMfaCode('');
    setGlobalError('');
    setFieldErrors({});
  }, [signIn]);

  const canSubmit = !!email && !!password && !loading;

  // ── Clerk field-level errors (surface any remaining ones) ──────────────────

  const clerkEmailError = errors?.fields?.emailAddress?.message
    ?? errors?.fields?.identifier?.message;
  const clerkPasswordError = errors?.fields?.password?.message;

  // ── MFA view ──────────────────────────────────────────────────────────────────

  if (showMfa) {
    return (
      <SafeAreaView className="auth-screen">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              <MfaStep
                code={mfaCode}
                setCode={setMfaCode}
                codeError={fieldErrors.mfaCode ?? errors?.fields?.code?.message}
                globalError={globalError}
                loading={loading}
                onVerify={handleMfaVerify}
                onResend={handleResend}
                onReset={handleReset}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                  onChangeText={(v) => {
                    setEmail(v);
                    setGlobalError('');
                    if (touched.email) handleBlur('email');
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={fieldErrors.email ?? clerkEmailError}
                />

                <Field
                  label="Password"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setGlobalError('');
                    if (touched.password) handleBlur('password');
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  secureTextEntry
                  error={fieldErrors.password ?? clerkPasswordError}
                />

                {globalError ? (
                  <Text className="auth-error auth-error-banner">
                    {globalError}
                  </Text>
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