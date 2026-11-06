import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/AuthContext';
import { isFirebaseConfigured } from '../src/firebase';
import { authStyles, colors } from '../src/styles';

export default function LoginScreen() {
  const { user, login, register, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already logged in, navigate straight to the store dashboard
  if (user) {
    return <Redirect href="/(app)" />;
  }

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={authStyles.scroll}>
        <View style={authStyles.card}>
          {/* Header */}
          <View style={authStyles.header}>
            <View style={authStyles.iconCircle}>
              <Ionicons name="storefront" size={36} color={colors.primary} />
            </View>
            <Text style={authStyles.title}>Mini Department Store</Text>
            <Text style={authStyles.subtitle}>
              {isRegister ? 'Create your store account' : 'Sign in to manage your store'}
            </Text>
          </View>

          {/* Mode Switcher */}
          <View style={authStyles.toggleRow}>
            <TouchableOpacity
              style={[authStyles.toggleBtn, !isRegister && authStyles.toggleActive]}
              onPress={() => {
                setIsRegister(false);
                setLocalError(null);
                clearError();
              }}
            >
              <Text style={[authStyles.toggleText, !isRegister && authStyles.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[authStyles.toggleBtn, isRegister && authStyles.toggleActive]}
              onPress={() => {
                setIsRegister(true);
                setLocalError(null);
                clearError();
              }}
            >
              <Text style={[authStyles.toggleText, isRegister && authStyles.toggleTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {activeError ? (
            <View style={authStyles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={authStyles.errorText}>{activeError}</Text>
            </View>
          ) : null}

          {!isFirebaseConfigured && (
            <View style={authStyles.noticeBox}>
              <Ionicons name="information-circle" size={18} color={colors.warning} />
              <Text style={authStyles.noticeText}>
                Note: Configure your Firebase project in .env to sync with your Cloud Firestore.
              </Text>
            </View>
          )}

          {/* Form Inputs */}
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Email Address</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={authStyles.inputIcon} />
              <TextInput
                style={authStyles.input}
                placeholder="storeowner@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Password</Text>
            <View style={authStyles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={authStyles.inputIcon} />
              <TextInput
                style={authStyles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {isRegister && (
            <View style={authStyles.inputGroup}>
              <Text style={authStyles.label}>Confirm Password</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.input}
                  placeholder="Re-type password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[authStyles.primaryButton, loading && authStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={authStyles.primaryButtonText}>
                {isRegister ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
