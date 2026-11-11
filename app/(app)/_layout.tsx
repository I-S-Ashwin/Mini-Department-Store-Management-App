import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { TouchableOpacity, Alert, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/AuthContext';
import { layoutStyles, colors } from '../../src/styles';

export default function AppLayout() {
  const { logout, user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={layoutStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your store?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout().catch(() => {}),
      },
    ]);
  };

  // Ensure tab bar sits completely clear of Android 3-button system navigation bar (< O |||)
  // On 3-button navigation, insets.bottom is typically 48dp. If unattached or 0 on Android, enforce 48dp.
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 48 : 12);
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: -0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 0,
        },
        headerStyle: layoutStyles.header,
        headerTitleStyle: layoutStyles.headerTitle,
        headerRight: () => (
          <TouchableOpacity
            style={layoutStyles.logoutBtn}
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Store Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={20} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Product Master',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cube-outline" size={20} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales Entry',
          tabBarLabel: 'Sales',
          tabBarIcon: ({ color }) => (
            <Ionicons name="trending-up-outline" size={20} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchase"
        options={{
          title: 'Purchase Entry',
          tabBarLabel: 'Purchase',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" size={20} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: 'Expense Entry',
          tabBarLabel: 'Expense',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={20} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transaction History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={20} color={color as any} />
          ),
        }}
      />
    </Tabs>
  );
}

