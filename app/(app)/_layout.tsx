import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { layoutStyles, colors } from '../../src/styles';

export default function AppLayout() {
  const { logout, user, loading } = useAuth();

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: layoutStyles.tabBar,
        tabBarLabelStyle: layoutStyles.tabLabel,
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
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales Entry',
          tabBarLabel: 'Sales',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchase"
        options={{
          title: 'Purchase Entry',
          tabBarLabel: 'Purchase',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: 'Expense Entry',
          tabBarLabel: 'Expense',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transaction History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size - 2} color={color as any} />
          ),
        }}
      />
    </Tabs>
  );
}
