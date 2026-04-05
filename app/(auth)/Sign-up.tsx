import { useSignUp } from '@clerk/expo';
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

const strengthBarColor = (level: number, bar: number) => {
  if (level < bar) return 'bg-muted';
  if (level === 1) return 'bg-destructive';
  if (level === 2) return 'bg-amber-400';
  return 'bg-success';
};

const strengthLabelColor = (level: number) => {
  if (level === 1) return 'text-destructive';
  if (level === 2) return 'text-amber-500';
  return 'text-success';
};

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
  label, value, onChangeText, onBlur,
  placeholder, secureTextEntry,
  keyboardType = 'default', autoCapitalize = 'none', error,
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

// ─── Email verification step ──────────────────────────────────────────────────

type VerifyProps = {
  code: string;
  setCode: (v: string) => void;
  codeError?: string;
  globalError?: string;
  loading: boolean;
  onVerify: () => void;
  onResend: () => void;
  email: string;
};

const VerifyStep = ({
  code, setCode, codeError, globalError,
  loading, onVerify, onResend, email,
}: VerifyProps) => (
  <View style={{ flex: 1, gap: 16 }}>
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
        <Text className="font-sans-bold text-primary">{email}</Text>
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
          accessibilityLabel="Confirm email code and get started"
        >
          {loading
            ? <ActivityIndicator color="#081126" />
            : <Text className="auth-button-text">Confirm & get started</Text>}
        </Pressable>
      </View>
    </View>

    <Pressable
      className="auth-secondary-button"
      onPress={onResend}
      accessibilityRole="button"
    >
      <Text className="auth-secondary-button-text">Resend code</Text>
    </Pressable>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName]         = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [verificationCode, setCode]       = useState('');

  const [touched, setTouched] = useState({
    firstName: false, email: false, password: false,
  });
  const [loading, setLoading]             = useState(false);
  const [showVerify, setShowVerify]       = useState(false);
  const [globalError, setGlobalError]     = useState('');
  const [fieldErrors, setFieldErrors]     = useState<{
    firstName?: string; email?: string; password?: string; code?: string;
  }>({});

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
    [firstName, email, password]
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

  // ── Sign-up ──────────────────────────────────────────────────────────────────

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp.create({
        firstName: firstName.trim(),
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setShowVerify(true);
    } catch (err: any) {
      setGlobalError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Could not create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [isLoaded, firstName, email, password, signUp, validate]);

  // ── Verify ───────────────────────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    setGlobalError('');
    if (!verificationCode.trim()) {
      setFieldErrors((p) => ({ ...p, code: 'Enter the 6-digit code.' }));
      return;
    }
    setFieldErrors((p) => ({ ...p, code: undefined }));
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      if (result.status === 'complete') {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl('/') as Href);
          },
        });
      } else {
        setGlobalError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setFieldErrors((p) => ({
        ...p,
        code:
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Invalid code. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, router]);

  const handleResend = useCallback(async () => {
    if (!isLoaded) return;
    try { await signUp.prepareEmailAddressVerification({ strategy: 'email_code' }); }
    catch { setGlobalError('Could not resend code. Try again.'); }
  }, [isLoaded, signUp]);

  const canSubmit =
    firstName.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    !loading;

  // ── Verify view ───────────────────────────────────────────────────────────────

  if (showVerify) {
    return (
      <SafeAreaView className="auth-screen">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="auth-content">
              <VerifyStep
                code={verificationCode} setCode={setCode}
                codeError={fieldErrors.code} globalError={globalError}
                loading={loading}
                onVerify={handleVerify} onResend={handleResend}
                email={email.trim()}
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
                  onChangeText={(v) => { setFirstName(v); if (touched.firstName) handleBlur('firstName'); }}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="Alex"
                  autoCapitalize="words"
                  error={fieldErrors.firstName}
                />

                <Field
                  label="Email"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setGlobalError(''); if (touched.email) handleBlur('email'); }}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={fieldErrors.email}
                />

                {/* Password with strength meter */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input${fieldErrors.password ? ' auth-input-error' : ''}`}
                    value={password}
                    onChangeText={(v) => { setPassword(v); if (touched.password) handleBlur('password'); }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
                        {[1, 2, 3].map((bar) => (
                          <View
                            key={bar}
                            className={`h-1 flex-1 rounded-full ${strengthBarColor(strength.level, bar)}`}
                          />
                        ))}
                      </View>
                      {strength.label ? (
                        <Text className={`text-xs font-sans-semibold ${strengthLabelColor(strength.level)}`}>
                          {strength.label}
                        </Text>
                      ) : null}
                    </View>
                  )}
                  <FieldError message={fieldErrors.password} />
                </View>

                {globalError ? (
                  <Text className="auth-error auth-error-banner">{globalError}</Text>
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

                <Text className="auth-helper" style={{ textAlign: 'center', marginTop: 4 }}>
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