import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
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

type StrengthResult = { label: string; level: 0 | 1 | 2 | 3 };

const getStrength = (pw: string): StrengthResult => {
  if (!pw) return { label: '', level: 0 };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  if (s === 1) return { label: 'Weak', level: 1 };
  if (s === 2) return { label: 'Fair', level: 2 };
  return { label: 'Strong', level: 3 };
};

const strengthBarClass = (level: number, bar: number): string => {
  if (level < bar) return 'bg-muted';
  if (level === 1) return 'bg-destructive';
  if (level === 2) return 'bg-amber-400';
  return 'bg-success';
};

const strengthLabelClass = (level: number): string => {
  if (level === 1) return 'text-destructive';
  if (level === 2) return 'text-amber-500';
  return 'text-success';
};

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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [code, setCode]           = useState('');

  const [touched, setTouched] = useState({
    firstName: false,
    email: false,
    password: false,
  });
  const [showVerify, setShowVerify]   = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const loading = fetchStatus === 'fetching';
  const strength = getStrength(password);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateField = useCallback(
    (field: 'firstName' | 'email' | 'password', errs: typeof fieldErrors) => {
      if (field === 'firstName') {
        if (!firstName.trim()) errs.firstName = 'First name is required.';
        else delete errs.firstName;
      }
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
    [firstName, email, password],
  );

  const handleBlur = (field: 'firstName' | 'email' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = { ...fieldErrors };
    validateField(field, errs);
    setFieldErrors(errs);
  };

  const validate = useCallback(() => {
    const errs: typeof fieldErrors = {};
    validateField('firstName', errs);
    validateField('email', errs);
    validateField('password', errs);
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [validateField]);

  // ── Sign-up submit ──────────────────────────────────────────────────────────

  const handleSignUp = useCallback(async () => {
    setGlobalError('');
    if (!validate()) return;

    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName: firstName.trim(),
    });

    if (error) {
      setGlobalError(
        error.longMessage ?? error.message ?? 'Could not create account. Please try again.',
      );
      return;
    }

    // Send email verification code
    await signUp.verifications.sendEmailCode();
    setShowVerify(true);
  }, [firstName, email, password, signUp, validate]);

  // ── Email code verify ───────────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    setGlobalError('');

    if (!code.trim()) {
      setFieldErrors((p) => ({ ...p, code: 'Enter the 6-digit code.' }));
      return;
    }
    setFieldErrors((p) => ({ ...p, code: undefined }));

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === 'complete') {
      posthog.identify(email.trim(), {
        $set: { email: email.trim(), first_name: firstName.trim() },
        $set_once: { sign_up_date: new Date().toISOString() },
      });
      posthog.capture('user_signed_up', {
        email: email.trim(),
        first_name: firstName.trim(),
      });
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return; // let Clerk handle session tasks
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace(url as any);
        },
      });
    } else {
      setGlobalError('Verification incomplete. Please try again.');
    }
  }, [code, signUp, router, email, firstName, posthog]);

  const handleResend = useCallback(async () => {
    try {
      await signUp.verifications.sendEmailCode();
    } catch {
      setGlobalError('Could not resend code. Try again.');
    }
  }, [signUp]);

  const canSubmit =
    firstName.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    !loading;

  // ── Clerk field-level errors ────────────────────────────────────────────────

  const clerkEmailError    = errors?.fields?.emailAddress?.message;
  const clerkPasswordError = errors?.fields?.password?.message;
  const clerkCodeError     = errors?.fields?.code?.message;

  // ── Email verification view ───────────────────────────────────────────────────

  if (showVerify) {
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
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a 6-digit code to{'\n'}
                  <Text className="font-sans-bold text-primary">
                    {email.trim()}
                  </Text>
                </Text>
              </View>

              {/* Form card */}
              <View className="auth-card">
                <View className="auth-form">

                  <Field
                    label="Verification code"
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    error={fieldErrors.code ?? clerkCodeError}
                  />

                  {globalError ? (
                    <Text className="auth-error auth-error-banner">
                      {globalError}
                    </Text>
                  ) : null}

                  <Pressable
                    className={`auth-button${loading ? ' auth-button-disabled' : ''}`}
                    onPress={handleVerify}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm email and get started"
                  >
                    {loading
                      ? <ActivityIndicator color="#081126" />
                      : <Text className="auth-button-text">Confirm & get started</Text>}
                  </Pressable>

                </View>
              </View>

              <Pressable
                className="auth-secondary-button"
                onPress={handleResend}
                accessibilityRole="button"
              >
                <Text className="auth-secondary-button-text">Resend code</Text>
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Sign-up form view ─────────────────────────────────────────────────────────

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
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Track every subscription, never miss a charge.
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">

                <Field
                  label="First name"
                  value={firstName}
                  onChangeText={(v) => {
                    setFirstName(v);
                    if (touched.firstName) handleBlur('firstName');
                  }}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="Alex"
                  autoCapitalize="words"
                  error={fieldErrors.firstName}
                />

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

                {/* Password + strength meter */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input${(fieldErrors.password ?? clerkPasswordError) ? ' auth-input-error' : ''}`}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (touched.password) handleBlur('password');
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {password.length > 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
                        {([1, 2, 3] as const).map((bar) => (
                          <View
                            key={bar}
                            className={`h-1 flex-1 rounded-full ${strengthBarClass(strength.level, bar)}`}
                          />
                        ))}
                      </View>
                      {strength.label ? (
                        <Text
                          className={`text-xs font-sans-semibold ${strengthLabelClass(strength.level)}`}
                        >
                          {strength.label}
                        </Text>
                      ) : null}
                    </View>
                  )}
                  <FieldError message={fieldErrors.password ?? clerkPasswordError} />
                </View>

                {globalError ? (
                  <Text className="auth-error auth-error-banner">
                    {globalError}
                  </Text>
                ) : null}

                <Pressable
                  className={`auth-button${!canSubmit ? ' auth-button-disabled' : ''}`}
                  onPress={handleSignUp}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="Create Frecurly account"
                >
                  {loading
                    ? <ActivityIndicator color="#081126" />
                    : <Text className="auth-button-text">Create account</Text>}
                </Pressable>

                <Text
                  className="auth-helper"
                  style={{ textAlign: 'center', marginTop: 4 }}
                >
                  By continuing you agree to our{' '}
                  <Text className="font-sans-semibold text-accent">Terms</Text>
                  {' '}and{' '}
                  <Text className="font-sans-semibold text-accent">Privacy Policy</Text>.
                </Text>

              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/Sign-in" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}