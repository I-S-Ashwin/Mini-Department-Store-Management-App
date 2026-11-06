import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { Product, Unit } from '../../src/types';
import {
  subscribeProducts,
  addProduct,
  updateProduct,
  seedSampleProducts,
} from '../../src/storeService';
import { formatCurrency } from '../../src/calculations';
import { productStyles, colors } from '../../src/styles';

const UNITS: Unit[] = ['Kg', 'Litre', 'Nos'];

export default function ProductMasterScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('Kg');
  const [openingStock, setOpeningStock] = useState('');
  const [openingRate, setOpeningRate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeProducts(user.uid, (data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setUnit('Kg');
    setOpeningStock('');
    setOpeningRate('');
    setModalVisible(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setUnit(p.unit);
    setOpeningStock(String(p.openingStock));
    setOpeningRate(String(p.openingRate));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return;
    }

    const stockNum = parseFloat(openingStock);
    const rateNum = parseFloat(openingRate);

    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Validation Error', 'Opening stock must be 0 or greater.');
      return;
    }

    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert('Validation Error', 'Opening purchase rate must be greater than 0.');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const delta = stockNum - editingProduct.openingStock;
        await updateProduct(user.uid, editingProduct.id, {
          name,
          unit,
          openingStock: stockNum,
          openingRate: rateNum,
          stockDelta: delta,
        });
      } else {
        await addProduct(user.uid, {
          name,
          unit,
          openingStock: stockNum,
          openingRate: rateNum,
        });
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!user) return;
    try {
      await seedSampleProducts(user.uid);
      Alert.alert('Success', 'Sample products added!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to seed products.');
    }
  };

  return (
    <View style={productStyles.container}>
      {/* Top Action Bar */}
      <View style={productStyles.topBar}>
        <Text style={productStyles.headerSubtitle}>
          {products.length} {products.length === 1 ? 'Product' : 'Products'} in inventory
        </Text>
        <View style={productStyles.topBtnRow}>
          {products.length === 0 && (
            <TouchableOpacity style={productStyles.seedHeaderBtn} onPress={handleSeed}>
              <Text style={productStyles.seedHeaderBtnText}>+ Samples</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={productStyles.addBtn} onPress={openAddModal}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={productStyles.addBtnText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={productStyles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={productStyles.listContent}
          ListEmptyComponent={
            <View style={productStyles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <Text style={productStyles.emptyTitle}>No Products in Inventory</Text>
              <Text style={productStyles.emptyText}>
                Tap 'Add Product' or load the predefined sample products to begin.
              </Text>
              <TouchableOpacity style={productStyles.seedEmptyBtn} onPress={handleSeed}>
                <Text style={productStyles.seedEmptyBtnText}>Load Rice, Sugar, Oil & Biscuits</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={productStyles.productCard}>
              <View style={productStyles.cardHeader}>
                <View>
                  <Text style={productStyles.productName}>{item.name}</Text>
                  <Text style={productStyles.unitBadge}>Unit: {item.unit}</Text>
                </View>
                <TouchableOpacity
                  style={productStyles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={productStyles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={productStyles.divider} />

              <View style={productStyles.cardStats}>
                <View style={productStyles.statCol}>
                  <Text style={productStyles.statLabel}>Current Stock</Text>
                  <Text
                    style={[
                      productStyles.statValue,
                      item.stock === 0 && productStyles.outOfStock,
                    ]}
                  >
                    {item.stock} {item.unit}
                  </Text>
                </View>

                <View style={productStyles.statCol}>
                  <Text style={productStyles.statLabel}>Opening Rate</Text>
                  <Text style={productStyles.statValue}>{formatCurrency(item.openingRate)}</Text>
                </View>

                <View style={productStyles.statCol}>
                  <Text style={productStyles.statLabel}>Stock Valuation</Text>
                  <Text style={productStyles.statValue}>
                    {formatCurrency(item.stock * item.openingRate)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={productStyles.modalOverlay}>
          <View style={productStyles.modalContent}>
            <View style={productStyles.modalHeader}>
              <Text style={productStyles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Product Name */}
            <Text style={productStyles.inputLabel}>Product Name *</Text>
            <TextInput
              style={productStyles.input}
              placeholder="e.g. Rice, Sugar, Cooking Oil"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Unit Selector */}
            <Text style={productStyles.inputLabel}>Measurement Unit *</Text>
            <View style={productStyles.unitSelector}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[productStyles.unitOption, unit === u && productStyles.unitOptionSelected]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      productStyles.unitOptionText,
                      unit === u && productStyles.unitOptionTextSelected,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Opening Stock Quantity */}
            <Text style={productStyles.inputLabel}>Opening Stock Quantity *</Text>
            <TextInput
              style={productStyles.input}
              placeholder="e.g. 100"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={openingStock}
              onChangeText={setOpeningStock}
            />

            {/* Opening Purchase Rate */}
            <Text style={productStyles.inputLabel}>Opening Purchase Rate (₹) *</Text>
            <TextInput
              style={productStyles.input}
              placeholder="e.g. 50"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={openingRate}
              onChangeText={setOpeningRate}
            />

            {/* Modal Action Buttons */}
            <View style={productStyles.modalButtons}>
              <TouchableOpacity
                style={productStyles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={productStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[productStyles.saveBtn, saving && productStyles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={productStyles.saveBtnText}>
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
