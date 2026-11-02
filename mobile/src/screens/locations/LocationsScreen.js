import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import { Colors } from '../../utils/theme';

const AVAILABLE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'
];

export const LocationsScreen = ({ navigation }) => {
  const {
    locations,
    createLocation,
    updateLocation,
    deleteLocation,
    fetchLocations,
    refreshing
  } = useInventory();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const openAddModal = () => {
    setEditingLoc(null);
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setModalVisible(true);
  };

  const openEditModal = (loc) => {
    setEditingLoc(loc);
    setName(loc.name);
    setDescription(loc.description || '');
    setColor(loc.color || '#3B82F6');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên vị trí không được để trống');
      return;
    }

    if (editingLoc) {
      const res = await updateLocation(editingLoc._id, {
        name: name.trim(),
        description: description.trim(),
        color
      });
      if (res.success) {
        setModalVisible(false);
      } else {
        Alert.alert('Lỗi', res.message);
      }
    } else {
      const res = await createLocation({
        name: name.trim(),
        description: description.trim(),
        color
      });
      if (res.success) {
        setModalVisible(false);
      } else {
        Alert.alert('Lỗi', res.message);
      }
    }
  };

  const handleDelete = (loc) => {
    Alert.alert(
      'Xóa vị trí',
      `Bạn có chắc chắn muốn xóa vị trí "${loc.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteLocation(loc._id);
            if (!res.success) {
              Alert.alert('Không thể xóa', res.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vị trí lưu trữ ({locations.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Thêm vị trí</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchLocations} colors={[Colors.primary]} />
        }
      >
        <Text style={styles.sectionSubtitle}>
          Mô hình hóa các tủ, ngăn chứa thuốc và thực phẩm trong nhà
        </Text>

        <View style={styles.grid}>
          {locations.map((loc) => {
            const hasUrgent = loc.hasUrgentItems;
            return (
              <TouchableOpacity
                key={loc._id}
                style={[styles.card, { borderLeftColor: loc.color || Colors.primary }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Inventory', { filterLocationId: loc._id })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: (loc.color || Colors.primary) + '20' }]}>
                    <Ionicons name="file-tray-full" size={24} color={loc.color || Colors.primary} />
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(loc)} style={styles.actionIcon}>
                      <Ionicons name="create-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(loc)} style={styles.actionIcon}>
                      <Ionicons name="trash-outline" size={18} color={Colors.expired} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.cardName}>{loc.name}</Text>
                {loc.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {loc.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.itemCountBadge}>
                    <Ionicons name="cube-outline" size={14} color="#0F172A" />
                    <Text style={styles.itemCountText}>
                      <Text style={{ fontWeight: '800' }}>{loc.totalItems || 0}</Text> món
                    </Text>
                  </View>

                  {hasUrgent ? (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="alert-circle" size={13} color="#EF4444" />
                      <Text style={styles.urgentBadgeText}>
                        {loc.expiredCount > 0 ? `${loc.expiredCount} hết hạn` : `${loc.expiringSoonCount} sắp hết`}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.safeBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                      <Text style={styles.safeBadgeText}>An toàn</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add / Edit Location Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLoc ? 'Chỉnh sửa vị trí' : 'Thêm vị trí lưu trữ mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên vị trí tủ / ngăn *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Hộp sơ cứu xe hơi, Kệ thuốc phòng khách..."
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả chi tiết</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vị trí trong nhà, điều kiện bảo quản..."
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Màu sắc nhận diện</Text>
                <View style={styles.colorPalette}>
                  {AVAILABLE_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        color === c && styles.colorCircleSelected
                      ]}
                      onPress={() => setColor(c)}
                    >
                      {color === c ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editingLoc ? 'Cập nhật' : 'Tạo mới'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  scroll: {
    padding: 16,
    paddingBottom: 40
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16
  },
  grid: {
    gap: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionIcon: {
    padding: 6
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  itemCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  itemCountText: {
    fontSize: 12,
    color: '#334155'
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444'
  },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  safeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  modalBody: {
    padding: 16
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
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
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A'
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default LocationsScreen;

