import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signup } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Captcha from '../components/Captcha';

export default function SignupScreen({ navigation }) {
  const { colors } = useTheme();
  const { loginSession } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [captchaId, setCaptchaId] = useState(null);
  const [captchaText, setCaptchaText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaId(null);
    setCaptchaText('');
    setRefreshKey((k) => k + 1);
  };

  const handleSignup = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!captchaId) {
      setError('Captcha is loading — please wait a second');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        captchaId,
        captchaText,
      });
      await loginSession(res.token, res.user);
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (err) {
      if (err.message.toLowerCase().includes('captcha')) {
        refreshCaptcha();
      }
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header navigation={navigation} showBack title="Sign Up" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Create <Text style={{ color: colors.primary }}>Account</Text>
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Sign up with your email and a password
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <Feather name="alert-circle" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Name *</Text>
              <TextInput
                value={form.name}
                onChangeText={(val) => {
                  setError('');
                  setForm((f) => ({ ...f, name: val }));
                }}
                placeholder="Sourav Kumar"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Email *</Text>
              <TextInput
                value={form.email}
                onChangeText={(val) => {
                  setError('');
                  setForm((f) => ({ ...f, email: val }));
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Password *</Text>
              <TextInput
                value={form.password}
                onChangeText={(val) => {
                  setError('');
                  setForm((f) => ({ ...f, password: val }));
                }}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Confirm Password *</Text>
              <TextInput
                value={form.confirm}
                onChangeText={(val) => {
                  setError('');
                  setForm((f) => ({ ...f, confirm: val }));
                }}
                placeholder="Repeat password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
              />
            </View>

            <Captcha
              value={captchaText}
              onChange={(v) => {
                setError('');
                setCaptchaText(v);
              }}
              onError={setError}
              onLoaded={setCaptchaId}
              refreshKey={refreshKey}
              onRefresh={refreshCaptcha}
            />

            <TouchableOpacity
              onPress={handleSignup}
              disabled={submitting}
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                submitting && { opacity: 0.6 },
              ]}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 12,
  },
  field: {},
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  switchText: {
    fontSize: 13,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
