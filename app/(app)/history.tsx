import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { StoreTransaction, TransactionType } from '../../src/types';
import { subscribeTransactions } from '../../src/storeService';
import { formatCurrency } from '../../src/calculations';
import { historyStyles, colors } from '../../src/styles';

type FilterTab = 'all' | 'sale' | 'purchase' | 'expense';

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<StoreTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeTransactions(user.uid, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filteredList =
    filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  const getBadgeStyle = (type: TransactionType) => {
    switch (type) {
      case 'sale':
        return { bg: colors.successLight, text: colors.success, border: colors.successBorder };
      case 'purchase':
        return { bg: colors.primaryLight, text: colors.primary, border: '#BFDBFE' };
      case 'expense':
        return { bg: colors.dangerLight, text: colors.danger, border: colors.dangerBorder };
    }
  };

  const getIconName = (type: TransactionType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'sale':
        return 'trending-up';
      case 'purchase':
        return 'cart';
      case 'expense':
        return 'wallet';
    }
  };

  return (
    <View style={historyStyles.container}>
      {/* Filter Tabs */}
      <View style={historyStyles.filterBar}>
        {(['all', 'sale', 'purchase', 'expense'] as FilterTab[]).map((tab) => {
          const isSelected = filter === tab;
          const label =
            tab === 'all'
              ? 'All'
              : tab === 'sale'
              ? 'Sales'
              : tab === 'purchase'
              ? 'Purchases'
              : 'Expenses';

          return (
            <TouchableOpacity
              key={tab}
              style={[historyStyles.filterChip, isSelected && historyStyles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  historyStyles.filterChipText,
                  isSelected && historyStyles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={historyStyles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={historyStyles.listContent}
          ListEmptyComponent={
            <View style={historyStyles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <Text style={historyStyles.emptyTitle}>No Transactions Found</Text>
              <Text style={historyStyles.emptyText}>
                {filter === 'all'
                  ? 'No sales, purchases, or expenses recorded yet.'
                  : `No ${filter} transactions found.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getBadgeStyle(item.type);
            const icon = getIconName(item.type);

            return (
              <View style={historyStyles.card}>
                <View style={historyStyles.cardTop}>
                  <View style={historyStyles.typeRow}>
                    <View
                      style={[
                        historyStyles.iconBadge,
                        { backgroundColor: badge.bg, borderColor: badge.border },
                      ]}
                    >
                      <Ionicons name={icon} size={16} color={badge.text} />
                    </View>
                    <View>
                      <Text style={historyStyles.mainTitle}>
                        {item.type === 'expense'
                          ? item.category || 'Expense'
                          : item.productName || 'Product'}
                      </Text>
                      <Text style={historyStyles.dateText}>{item.date}</Text>
                    </View>
                  </View>
                  <Text style={[historyStyles.amountText, { color: badge.text }]}>
                    {item.type === 'sale' ? '+' : '-'} {formatCurrency(item.total)}
                  </Text>
                </View>

                {/* Sub details for Purchases & Sales */}
                {item.type !== 'expense' && item.quantity && item.rate && (
                  <View style={historyStyles.detailRow}>
                    <Text style={historyStyles.detailText}>
                      {item.quantity} {item.unit || ''} × {formatCurrency(item.rate)}
                    </Text>
                    {item.supplierName && (
                      <Text style={historyStyles.supplierText}>Supplier: {item.supplierName}</Text>
                    )}
                  </View>
                )}

                {/* Sub details for Expenses */}
                {item.type === 'expense' && item.description ? (
                  <View style={historyStyles.detailRow}>
                    <Text style={historyStyles.descriptionText}>{item.description}</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
