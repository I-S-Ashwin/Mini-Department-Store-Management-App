import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { Product } from '../../src/types';
import { subscribeProducts, recordPurchase } from '../../src/storeService';
import {
  formatCurrency,
  getTodayDateString,
  roundToTwo,
} from '../../src/calculations';
import { entryStyles, colors } from '../../src/styles';

export default function PurchaseEntryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [date, setDate] = useState(getTodayDateString());
  const [supplierName, setSupplierName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeProducts(user.uid, (data) => {
      setProducts(data);
      if (data.length > 0 && !selectedProductId) {
        setSelectedProductId(data[0].id);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Live Auto-Calculation
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const autoTotal = qtyNum > 0 && rateNum > 0 ? roundToTwo(qtyNum * rateNum) : 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (!supplierName.trim()) {
      Alert.alert('Validation Error', 'Please enter supplier name.');
      return;
    }
    if (!selectedProduct) {
      Alert.alert('Validation Error', 'Please select a product.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid date (YYYY-MM-DD).');
      return;
    }
    if (qtyNum <= 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than 0.');
      return;
    }
    if (rateNum <= 0) {
      Alert.alert('Validation Error', 'Purchase rate must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await recordPurchase(user.uid, {
        date: date.trim(),
        supplierName: supplierName.trim(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        quantity: qtyNum,
        rate: rateNum,
      });

      Alert.alert(
        'Purchase Recorded',
        `Successfully purchased ${qtyNum} ${selectedProduct.unit} of ${selectedProduct.name} from ${supplierName} for ${formatCurrency(autoTotal)}. Stock increased.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setQuantity('');
              setRate('');
              setSupplierName('');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.message || 'Could not record purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={entryStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={entryStyles.container} contentContainerStyle={entryStyles.content}>
      <View style={entryStyles.card}>
        <View style={entryStyles.header}>
          <View style={[entryStyles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="cart" size={26} color={colors.primary} />
          </View>
          <View>
            <Text style={entryStyles.title}>New Purchase Entry</Text>
            <Text style={entryStyles.subtitle}>Records stock purchase from supplier</Text>
          </View>
        </View>

        {/* Date Field */}
        <Text style={entryStyles.label}>Purchase Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={entryStyles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        {/* Supplier Name */}
        <Text style={entryStyles.label}>Supplier Name *</Text>
        <TextInput
          style={entryStyles.input}
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="e.g. Metro Wholesalers, Local Distributor"
          placeholderTextColor={colors.textMuted}
        />

        {/* Product Picker */}
        <Text style={entryStyles.label}>Select Product *</Text>
        {products.length === 0 ? (
          <View style={entryStyles.noProductBox}>
            <Text style={entryStyles.noProductText}>No products found.</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={entryStyles.linkText}>Go to Product Master</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={entryStyles.productPicker}>
            {products.map((p) => {
              const isSelected = p.id === selectedProductId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[entryStyles.productChip, isSelected && entryStyles.productChipSelectedPurchase]}
                  onPress={() => setSelectedProductId(p.id)}
                >
                  <Text style={[entryStyles.productChipName, isSelected && entryStyles.productChipNamePurchaseSelected]}>
                    {p.name}
                  </Text>
                  <Text style={[entryStyles.productChipStock, isSelected && entryStyles.productChipStockPurchaseSelected]}>
                    Current: {p.stock} {p.unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Quantity Field */}
        <Text style={entryStyles.label}>
          Quantity Purchased {selectedProduct ? `(${selectedProduct.unit})` : ''} *
        </Text>
        <TextInput
          style={entryStyles.input}
          keyboardType="numeric"
          placeholder="e.g. 100"
          placeholderTextColor={colors.textMuted}
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* Unit Purchase Rate Field */}
        <Text style={entryStyles.label}>Unit Purchase Rate (₹) *</Text>
        <TextInput
          style={entryStyles.input}
          keyboardType="numeric"
          placeholder="e.g. 50"
          placeholderTextColor={colors.textMuted}
          value={rate}
          onChangeText={setRate}
        />

        {/* Auto Calculated Total Banner */}
        <View style={entryStyles.totalBannerPurchase}>
          <Text style={entryStyles.totalLabelPurchase}>Automatically Calculated Total</Text>
          <Text style={entryStyles.totalValuePurchase}>{formatCurrency(autoTotal)}</Text>
          <Text style={entryStyles.calcFormulaPurchase}>
            {qtyNum || 0} × {formatCurrency(rateNum || 0)}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[entryStyles.submitBtnPurchase, (submitting || products.length === 0) && entryStyles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting || products.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={entryStyles.submitBtnText}>Confirm & Record Purchase</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
