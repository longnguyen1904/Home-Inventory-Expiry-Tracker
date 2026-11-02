import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import ItemCard from '../../components/ItemCard';
import { Colors } from '../../utils/theme';

export const InventoryScreen = ({ route, navigation }) => {
  const {
    items,
    locations,
    categories,
    fetchItems,
    consumeItem,
    restockItem,
    deleteItem,
    refreshing,
    refreshAll,
    openAddModal,
    openEditModal,
    openDetailModal
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('expiryDate'); // 'expiryDate' | 'name' | 'createdAt'

  useEffect(() => {
    if (route.params?.filterStatus) {
      setSelectedStatus(route.params.filterStatus);
    }
    if (route.params?.filterLocationId) {
      setSelectedLocation(route.params.filterLocationId);
    }
  }, [route.params]);

  // Apply filters and search
  const filteredItems = items.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      const matchIngredient = item.activeIngredient?.toLowerCase().includes(q);
      const matchBarcode = item.barcode?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchIngredient && !matchBarcode) {
        return false;
      }
    }

    // Status
    if (selectedStatus !== 'ALL') {
      if (item.status !== selectedStatus) return false;
    }

    // Location
    if (selectedLocation !== 'ALL') {
      const locId = item.locationId?._id || item.locationId;
      if (locId !== selectedLocation) return false;
    }

    // Category
    if (selectedCategory !== 'ALL') {
      const catId = item.categoryId?._id || item.categoryId;
      if (catId !== selectedCategory) return false;
    }

    return true;
  });

  // Apply local sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'expiryDate') {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleDelete = (itemId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa vật phẩm này khỏi danh mục tủ đồ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteItem(itemId);
            if (!res.success) {
              Alert.alert('Lỗi', res.message);
            }
          }
        }
      ]
    );
  };

  const handleConsume = async (itemId) => {
    const res = await consumeItem(itemId);
    if (res.success && res.message) {
      // Consume feedback
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kho vật phẩm ({items.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Thêm món</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, hoạt chất (Paracetamol...), mã vạch..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.statusTabs}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'EXPIRED', label: 'Đã hết hạn', color: Colors.expired },
          { key: 'EXPIRING_SOON', label: 'Sắp hết hạn', color: Colors.expiringSoon },
          { key: 'GOOD', label: 'Còn an toàn', color: Colors.good }
        ].map((tab) => {
          const isSelected = selectedStatus === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.statusTabBtn,
                isSelected && styles.statusTabBtnActive,
                isSelected && tab.color && { backgroundColor: tab.color }
              ]}
              onPress={() => setSelectedStatus(tab.key)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  isSelected && styles.statusTabTextActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Location Filter Chips */}
      <View style={styles.chipRowWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedLocation === 'ALL' && styles.chipActive]}
            onPress={() => setSelectedLocation('ALL')}
          >
            <Text style={[styles.chipText, selectedLocation === 'ALL' && styles.chipTextActive]}>
              Mọi vị trí
            </Text>
          </TouchableOpacity>
          {locations.map((loc) => {
            const isSelected = selectedLocation === loc._id;
            return (
              <TouchableOpacity
                key={loc._id}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: loc.color || Colors.primary, borderColor: loc.color }
                ]}
                onPress={() => setSelectedLocation(isSelected ? 'ALL' : loc._id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive
                  ]}
                >
                  {loc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List of Items */}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshAll} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={openDetailModal}
            onConsume={handleConsume}
            onRestock={restockItem}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={54} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Không tìm thấy vật phẩm nào</Text>
            <Text style={styles.emptySubtitle}>
              {search || selectedStatus !== 'ALL' || selectedLocation !== 'ALL'
                ? 'Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm'
                : 'Nhấn "+ Thêm món" hoặc Quét mã vạch để thêm đồ vào tủ!'}
            </Text>
          </View>
        }
      />
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A'
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 6
  },
  statusTabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  statusTabBtnActive: {
    backgroundColor: '#2563EB'
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  statusTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  chipRowWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8
  },
  chipScroll: {
    paddingHorizontal: 14,
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A'
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6
  }
});

export default InventoryScreen;

