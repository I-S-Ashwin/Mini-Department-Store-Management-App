import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { ExpenseCategory } from '../../src/types';
import { recordExpense } from '../../src/storeService';
import { formatCurrency, getTodayDateString } from '../../src/calculations';
import { entryStyles, colors } from '../../src/styles';

const CATEGORIES: { label: ExpenseCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Rent', icon: 'business-outline' },
  { label: 'Electricity', icon: 'flash-outline' },
  { label: 'Salary', icon: 'people-outline' },
  { label: 'Transportation', icon: 'bus-outline' },
  { label: 'Miscellaneous', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ExpenseEntryScreen() {
  const { user } = useAuth();

  // Form Fields
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<ExpenseCategory>('Transportation');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amountNum = parseFloat(amount) || 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (!date.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid date (YYYY-MM-DD).');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter an expense description.');
      return;
    }
    if (amountNum <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await recordExpense(user.uid, {
        date: date.trim(),
        category,
        description: description.trim(),
        amount: amountNum,
      });

      Alert.alert(
        'Expense Logged',
        `Recorded ${category} expense of ${formatCurrency(amountNum)}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDescription('');
              setAmount('');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={entryStyles.container} contentContainerStyle={entryStyles.content}>
      <View style={entryStyles.card}>
        <View style={entryStyles.header}>
          <View style={[entryStyles.iconCircle, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="wallet" size={26} color={colors.danger} />
          </View>
          <View>
            <Text style={entryStyles.title}>New Expense Entry</Text>
            <Text style={entryStyles.subtitle}>Records store operational expenses</Text>
          </View>
        </View>

        {/* Date Field */}
        <Text style={entryStyles.label}>Expense Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={entryStyles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        {/* Category Selector */}
        <Text style={entryStyles.label}>Category *</Text>
        <View style={entryStyles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat.label === category;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[entryStyles.categoryChip, isSelected && entryStyles.categoryChipSelected]}
                onPress={() => setCategory(cat.label)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isSelected ? colors.danger : colors.textSecondary}
                />
                <Text
                  style={[
                    entryStyles.categoryChipText,
                    isSelected && entryStyles.categoryChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description Field */}
        <Text style={entryStyles.label}>Description / Details *</Text>
        <TextInput
          style={entryStyles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Delivery charges, shop rent, staff wages"
          placeholderTextColor={colors.textMuted}
        />

        {/* Amount Field */}
        <Text style={entryStyles.label}>Amount (₹) *</Text>
        <TextInput
          style={entryStyles.input}
          keyboardType="numeric"
          placeholder="e.g. 200"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
        />

        {/* Amount Preview */}
        {amountNum > 0 && (
          <View style={entryStyles.previewBox}>
            <Text style={entryStyles.previewLabel}>Recorded Amount:</Text>
            <Text style={entryStyles.previewValue}>{formatCurrency(amountNum)}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[entryStyles.submitBtnExpense, submitting && entryStyles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={entryStyles.submitBtnText}>Confirm & Log Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
