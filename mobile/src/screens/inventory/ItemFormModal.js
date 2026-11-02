import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import apiClient from '../../api/client';
import { Colors } from '../../utils/theme';

export const ItemFormModal = ({ visible, onClose, initialItem = null }) => {
  const { locations, categories, createItem, updateItem } = useInventory();

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('hộp');
  const [price, setPrice] = useState('');
  const [expiryDateStr, setExpiryDateStr] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setBarcode(initialItem.barcode || '');
      setBrand(initialItem.brand || '');
      setActiveIngredient(initialItem.activeIngredient || '');
      setLocationId(initialItem.locationId?._id || initialItem.locationId || (locations[0]?._id || ''));
      setCategoryId(initialItem.categoryId?._id || initialItem.categoryId || (categories[0]?._id || ''));
      setQuantity(initialItem.quantity || 1);
      setUnit(initialItem.unit || 'hộp');
      setPrice(initialItem.price ? String(initialItem.price) : '');
      setNote(initialItem.note || '');
      setImageUrl(initialItem.imageUrl || '');

      if (initialItem.expiryDate) {
        const d = new Date(initialItem.expiryDate);
        setExpiryDateStr(d.toISOString().split('T')[0]);
      }
    } else {
      // Defaults for new item
      setName('');
      setBarcode('');
      setBrand('');
      setActiveIngredient('');
      setLocationId(locations[0]?._id || '');
      setCategoryId(categories[0]?._id || '');
      setQuantity(1);
      setUnit('hộp');
      setPrice('');
      setNote('');
      setImageUrl('');

      // Default expiry date: 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpiryDateStr(nextYear.toISOString().split('T')[0]);
    }
  }, [initialItem, visible, locations, categories]);

  // Quick preset dates
  const setExpiryOffsetMonths = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setExpiryDateStr(d.toISOString().split('T')[0]);
  };

  // Lookup barcode
  const handleBarcodeLookup = async () => {
    if (!barcode.trim()) {
      Alert.alert('Nhập mã', 'Vui lòng nhập mã vạch cần tra cứu');
      return;
    }
    setIsLookingUp(true);
    try {
      const res = await apiClient.get(`/barcodes/lookup/${barcode.trim()}`);
      if (res.data.success && res.data.data) {
        const item = res.data.data;
        setName(item.name || name);
        setBrand(item.brand || brand);
        setActiveIngredient(item.activeIngredient || activeIngredient);
        setUnit(item.unit || unit);
        if (item.imageUrl) setImageUrl(item.imageUrl);
        Alert.alert('Thành công', `Đã tìm thấy: ${item.name}`);
      }
    } catch (err) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin cho mã vạch này. Bạn có thể nhập thông tin thủ công.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên vật phẩm không được để trống');
      return;
    }
    if (!locationId) {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí lưu trữ');
      return;
    }
    if (!categoryId) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }
    if (!expiryDateStr) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn (YYYY-MM-DD)');
      return;
    }

    const payload = {
      name: name.trim(),
      barcode: barcode.trim(),
      brand: brand.trim(),
      activeIngredient: activeIngredient.trim(),
      locationId,
      categoryId,
      quantity: Number(quantity) || 1,
      unit: unit.trim(),
      price: Number(price) || 0,
      expiryDate: new Date(expiryDateStr).toISOString(),
      note: note.trim(),
      imageUrl: imageUrl.trim()
    };

    setIsSubmitting(true);
    let result;
    if (initialItem && initialItem._id) {
      result = await updateItem(initialItem._id, payload);
    } else {
      result = await createItem(payload);
    }
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      Alert.alert('Lỗi', result.message || 'Không thể lưu vật phẩm');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialItem ? 'Chỉnh sửa vật phẩm' : 'Thêm vật phẩm vào tủ'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Barcode scan / lookup row */}
            <View style={styles.group}>
              <Text style={styles.label}>Mã vạch (Barcode)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Quét hoặc nhập mã vạch..."
                  value={barcode}
                  onChangeText={setBarcode}
                />
                <TouchableOpacity
                  style={styles.lookupBtn}
                  onPress={handleBarcodeLookup}
                  disabled={isLookingUp}
                >
                  {isLookingUp ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="search" size={16} color="#FFFFFF" />
                      <Text style={styles.lookupBtnText}>Tra mã</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Name */}
            <View style={styles.group}>
              <Text style={styles.label}>
                Tên thuốc / Vật phẩm <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Panadol Extra, Efferalgan, Sữa chua..."
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Brand & Active Ingredient */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Hãng / Thương hiệu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: GlaxoSmithKline"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>
              <View style={[styles.group, { flex: 1 }]}>
                <Text style={styles.label}>Hoạt chất chính</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Paracetamol 500mg"
                  value={activeIngredient}
                  onChangeText={setActiveIngredient}
                />
              </View>
            </View>

            {/* Location selector */}
            <View style={styles.group}>
              <Text style={styles.label}>
                Vị trí lưu trữ <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {locations.map((loc) => {
                  const isSelected = locationId === loc._id;
                  return (
                    <TouchableOpacity
                      key={loc._id}
                      style={[
                        styles.chipOption,
                        isSelected && { backgroundColor: loc.color || '#2563EB', borderColor: loc.color }
                      ]}
                      onPress={() => setLocationId(loc._id)}
                    >
                      <Ionicons
                        name="location"
                        size={14}
                        color={isSelected ? '#FFFFFF' : loc.color || '#2563EB'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.chipOptionText, isSelected && { color: '#FFFFFF' }]}>
                        {loc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Category selector */}
            <View style={styles.group}>
              <Text style={styles.label}>
                Danh mục <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {categories.map((cat) => {
                  const isSelected = categoryId === cat._id;
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      style={[
                        styles.chipOption,
                        isSelected && { backgroundColor: '#0F172A', borderColor: '#0F172A' }
                      ]}
                      onPress={() => setCategoryId(cat._id)}
                    >
                      <Text style={[styles.chipOptionText, isSelected && { color: '#FFFFFF' }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quantity, Unit & Price */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1.2, marginRight: 8 }]}>
                <Text style={styles.label}>Số lượng</Text>
                <View style={styles.stepperWrapper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#0F172A" />
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.group, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Đơn vị tính</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vỉ, hộp..."
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>

              <View style={[styles.group, { flex: 1.2 }]}>
                <Text style={styles.label}>Đơn giá (VNĐ)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 50000"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Expiry Date input & quick buttons */}
            <View style={styles.group}>
              <Text style={styles.label}>
                Ngày hết hạn (YYYY-MM-DD) <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="2027-12-31"
                value={expiryDateStr}
                onChangeText={setExpiryDateStr}
              />
              {/* Quick offset buttons */}
              <View style={styles.presetRow}>
                <Text style={styles.presetHint}>Gợi ý nhanh: </Text>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setExpiryOffsetMonths(1)}>
                  <Text style={styles.presetBtnText}>+1 Tháng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setExpiryOffsetMonths(6)}>
                  <Text style={styles.presetBtnText}>+6 Tháng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setExpiryOffsetMonths(12)}>
                  <Text style={styles.presetBtnText}>+1 Năm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetBtn} onPress={() => setExpiryOffsetMonths(24)}>
                  <Text style={styles.presetBtnText}>+2 Năm</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Note / Dosage */}
            <View style={styles.group}>
              <Text style={styles.label}>Ghi chú & Liều dùng</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Ví dụ: Người lớn 1 viên/lần, cách 6 tiếng. Uống sau ăn."
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {initialItem ? 'Cập nhật' : 'Lưu vật phẩm'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  closeBtn: {
    padding: 4
  },
  scroll: {
    padding: 18
  },
  group: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A'
  },
  lookupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4
  },
  lookupBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  selectorScroll: {
    flexDirection: 'row',
    paddingVertical: 4
  },
  chipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8
  },
  chipOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    height: 42
  },
  stepBtn: {
    padding: 8
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6
  },
  presetHint: {
    fontSize: 11,
    color: '#64748B'
  },
  presetBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  presetBtnText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});

export default ItemFormModal;

