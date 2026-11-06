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
import { subscribeProducts, recordSale } from '../../src/storeService';
import {
  formatCurrency,
  getTodayDateString,
  roundToTwo,
} from '../../src/calculations';
import { entryStyles, colors } from '../../src/styles';

export default function SalesEntryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [date, setDate] = useState(getTodayDateString());
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

  // Live Calculations & Stock Validation
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const autoTotal = qtyNum > 0 && rateNum > 0 ? roundToTwo(qtyNum * rateNum) : 0;
  const availableStock = selectedProduct ? selectedProduct.stock : 0;
  const isOverStock = selectedProduct ? qtyNum > availableStock : false;

  const handleSubmit = async () => {
    if (!user) return;
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
      Alert.alert('Validation Error', 'Selling rate must be greater than 0.');
      return;
    }
    if (isOverStock) {
      Alert.alert(
        'Sale Rejected',
        `Cannot sell ${qtyNum} ${selectedProduct.unit}. Only ${availableStock} ${selectedProduct.unit} available in stock.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await recordSale(user.uid, {
        date: date.trim(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
        quantity: qtyNum,
        rate: rateNum,
      });

      Alert.alert(
        'Sale Recorded',
        `Successfully sold ${qtyNum} ${selectedProduct.unit} of ${selectedProduct.name} for ${formatCurrency(autoTotal)}. Stock reduced.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setQuantity('');
              setRate('');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.message || 'Could not record sale.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={entryStyles.center}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  return (
    <ScrollView style={entryStyles.container} contentContainerStyle={entryStyles.content}>
      <View style={entryStyles.card}>
        <View style={entryStyles.header}>
          <View style={[entryStyles.iconCircle, { backgroundColor: colors.successLight }]}>
            <Ionicons name="trending-up" size={26} color={colors.success} />
          </View>
          <View>
            <Text style={entryStyles.title}>New Sales Entry</Text>
            <Text style={entryStyles.subtitle}>Records customer sale and reduces stock</Text>
          </View>
        </View>

        {/* Date Field */}
        <Text style={entryStyles.label}>Sale Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={entryStyles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
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
                  style={[entryStyles.productChip, isSelected && entryStyles.productChipSelectedSale]}
                  onPress={() => setSelectedProductId(p.id)}
                >
                  <Text style={[entryStyles.productChipName, isSelected && entryStyles.productChipNameSaleSelected]}>
                    {p.name}
                  </Text>
                  <Text style={[entryStyles.productChipStock, isSelected && entryStyles.productChipStockSaleSelected]}>
                    Stock: {p.stock} {p.unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Selected Product Stock Status */}
        {selectedProduct && (
          <View style={[entryStyles.stockInfo, isOverStock ? entryStyles.stockError : entryStyles.stockOk]}>
            <Ionicons
              name={isOverStock ? 'alert-circle' : 'checkmark-circle'}
              size={18}
              color={isOverStock ? colors.danger : colors.success}
            />
            <Text style={[entryStyles.stockInfoText, { color: isOverStock ? colors.danger : colors.successDark }]}>
              Available Stock: {availableStock} {selectedProduct.unit}
            </Text>
          </View>
        )}

        {/* Quantity Field */}
        <Text style={entryStyles.label}>
          Quantity to Sell {selectedProduct ? `(${selectedProduct.unit})` : ''} *
        </Text>
        <TextInput
          style={[entryStyles.input, isOverStock && entryStyles.inputError]}
          keyboardType="numeric"
          placeholder="e.g. 30"
          placeholderTextColor={colors.textMuted}
          value={quantity}
          onChangeText={setQuantity}
        />
        {isOverStock && (
          <Text style={entryStyles.errorSubText}>
            Rejecting: Requested {qtyNum} exceeds available stock ({availableStock}).
          </Text>
        )}

        {/* Selling Rate Field */}
        <Text style={entryStyles.label}>Unit Selling Rate (₹) *</Text>
        <TextInput
          style={entryStyles.input}
          keyboardType="numeric"
          placeholder="e.g. 65"
          placeholderTextColor={colors.textMuted}
          value={rate}
          onChangeText={setRate}
        />

        {/* Auto Calculated Total Banner */}
        <View style={entryStyles.totalBannerSale}>
          <Text style={entryStyles.totalLabelSale}>Automatically Calculated Total</Text>
          <Text style={entryStyles.totalValueSale}>{formatCurrency(autoTotal)}</Text>
          <Text style={entryStyles.calcFormulaSale}>
            {qtyNum || 0} × {formatCurrency(rateNum || 0)}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            entryStyles.submitBtnSale,
            (isOverStock || submitting || products.length === 0) && entryStyles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isOverStock || submitting || products.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={entryStyles.submitBtnText}>Confirm & Record Sale</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
