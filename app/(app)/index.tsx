import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { Product, StoreTransaction } from '../../src/types';
import {
  subscribeProducts,
  subscribeTransactions,
  seedSampleProducts,
} from '../../src/storeService';
import {
  computeLedgerSummary,
  formatCurrency,
  getTodayDateString,
} from '../../src/calculations';
import { dashboardStyles, colors } from '../../src/styles';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StoreTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');
  const [seeding, setSeeding] = useState(false);

  const todayStr = getTodayDateString();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubProd = () => {};
    let unsubTx = () => {};

    try {
      unsubProd = subscribeProducts(user.uid, (data) => {
        setProducts(data);
        setLoading(false);
      });

      unsubTx = subscribeTransactions(user.uid, (data) => {
        setTransactions(data);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    return () => {
      unsubProd();
      unsubTx();
    };
  }, [user]);

  const summary = computeLedgerSummary(
    transactions,
    products,
    filterMode === 'today' ? todayStr : undefined
  );

  const handleSeedSamples = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedSampleProducts(user.uid);
      Alert.alert('Success', 'Sample products (Rice, Sugar, Cooking Oil, Biscuits) added successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add sample products.');
    } finally {
      setSeeding(false);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  if (loading) {
    return (
      <View style={dashboardStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={dashboardStyles.container}
      contentContainerStyle={dashboardStyles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
    >
      {/* Welcome & Filter Toggle */}
      <View style={dashboardStyles.headerCard}>
        <View>
          <Text style={dashboardStyles.greeting}>Store Dashboard</Text>
          <Text style={dashboardStyles.userEmail}>{user?.email || 'Store Owner'}</Text>
        </View>
        <View style={dashboardStyles.filterToggle}>
          <TouchableOpacity
            style={[dashboardStyles.filterBtn, filterMode === 'today' && dashboardStyles.filterBtnActive]}
            onPress={() => setFilterMode('today')}
          >
            <Text style={[dashboardStyles.filterBtnText, filterMode === 'today' && dashboardStyles.filterBtnTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dashboardStyles.filterBtn, filterMode === 'all' && dashboardStyles.filterBtnActive]}
            onPress={() => setFilterMode('all')}
          >
            <Text style={[dashboardStyles.filterBtnText, filterMode === 'all' && dashboardStyles.filterBtnTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Profit / Net Balance Banner */}
      <View
        style={[
          dashboardStyles.netProfitCard,
          summary.netProfit >= 0 ? dashboardStyles.profitBg : dashboardStyles.lossBg,
        ]}
      >
        <View>
          <Text style={dashboardStyles.netProfitLabel}>
            {filterMode === 'today' ? "Today's Net Profit" : 'Overall Net Profit'}
          </Text>
          <Text style={dashboardStyles.netProfitValue}>{formatCurrency(summary.netProfit)}</Text>
          <Text style={dashboardStyles.netProfitSub}>
            Gross Profit: {formatCurrency(summary.grossProfit)} (after COGS)
          </Text>
        </View>
        <Ionicons
          name={summary.netProfit >= 0 ? 'trending-up' : 'trending-down'}
          size={38}
          color={summary.netProfit >= 0 ? colors.success : colors.danger}
        />
      </View>

      {/* Financial Metrics 2x2 Grid */}
      <View style={dashboardStyles.metricsGrid}>
        <View style={dashboardStyles.metricCard}>
          <View style={dashboardStyles.metricHeader}>
            <Text style={dashboardStyles.metricLabel}>Total Sales</Text>
            <Ionicons name="cash-outline" size={18} color={colors.success} />
          </View>
          <Text style={[dashboardStyles.metricValue, { color: colors.success }]}>
            {formatCurrency(summary.sales)}
          </Text>
        </View>

        <View style={dashboardStyles.metricCard}>
          <View style={dashboardStyles.metricHeader}>
            <Text style={dashboardStyles.metricLabel}>Total Purchases</Text>
            <Ionicons name="cart-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[dashboardStyles.metricValue, { color: colors.primary }]}>
            {formatCurrency(summary.purchases)}
          </Text>
        </View>

        <View style={dashboardStyles.metricCard}>
          <View style={dashboardStyles.metricHeader}>
            <Text style={dashboardStyles.metricLabel}>Expenses</Text>
            <Ionicons name="wallet-outline" size={18} color={colors.danger} />
          </View>
          <Text style={[dashboardStyles.metricValue, { color: colors.danger }]}>
            {formatCurrency(summary.expenses)}
          </Text>
        </View>

        <View style={dashboardStyles.metricCard}>
          <View style={dashboardStyles.metricHeader}>
            <Text style={dashboardStyles.metricLabel}>Stock Valuation</Text>
            <Ionicons name="cube-outline" size={18} color={colors.warning} />
          </View>
          <Text style={[dashboardStyles.metricValue, { color: colors.warning }]}>
            {formatCurrency(summary.totalStockValue)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={dashboardStyles.sectionTitle}>Quick Actions</Text>
      <View style={dashboardStyles.actionsRow}>
        <TouchableOpacity
          style={[dashboardStyles.actionBtn, { backgroundColor: colors.successLight }]}
          onPress={() => router.push('/sales')}
        >
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={[dashboardStyles.actionBtnText, { color: colors.success }]}>New Sale</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dashboardStyles.actionBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => router.push('/purchase')}
        >
          <Ionicons name="cart" size={24} color={colors.primary} />
          <Text style={[dashboardStyles.actionBtnText, { color: colors.primary }]}>New Purchase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dashboardStyles.actionBtn, { backgroundColor: colors.dangerLight }]}
          onPress={() => router.push('/expense')}
        >
          <Ionicons name="receipt" size={24} color={colors.danger} />
          <Text style={[dashboardStyles.actionBtnText, { color: colors.danger }]}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Low Stock Warning or Empty State */}
      {products.length === 0 ? (
        <View style={dashboardStyles.emptyCard}>
          <Ionicons name="cube-outline" size={44} color={colors.textMuted} />
          <Text style={dashboardStyles.emptyTitle}>No Products Added Yet</Text>
          <Text style={dashboardStyles.emptySub}>
            Quickly get started by loading the sample products (Rice, Sugar, Cooking Oil, Biscuits).
          </Text>
          <TouchableOpacity
            style={dashboardStyles.seedBtn}
            onPress={handleSeedSamples}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={dashboardStyles.seedBtnText}>Load Sample Products</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : lowStockProducts.length > 0 ? (
        <View style={dashboardStyles.warningCard}>
          <View style={dashboardStyles.warningHeader}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={dashboardStyles.warningTitle}>Low Stock Notice ({lowStockProducts.length})</Text>
          </View>
          {lowStockProducts.map((p) => (
            <View key={p.id} style={dashboardStyles.lowStockRow}>
              <Text style={dashboardStyles.lowStockName}>{p.name}</Text>
              <Text
                style={[
                  dashboardStyles.lowStockBadge,
                  p.stock === 0 ? dashboardStyles.outOfStockBadge : dashboardStyles.lowQtyBadge,
                ]}
              >
                {p.stock} {p.unit} remaining
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
