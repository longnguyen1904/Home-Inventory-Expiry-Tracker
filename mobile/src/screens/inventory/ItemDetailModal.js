import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { Colors } from '../../utils/theme';

export const ItemDetailModal = ({
  visible,
  item,
  onClose,
  onEdit,
  onConsume,
  onRestock,
  onDelete
}) => {
  if (!item) return null;

  const expiryFormatted = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Không rõ';

  const mfgFormatted = item.mfgDate
    ? new Date(item.mfgDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Chưa cập nhật';

  const handleDelete = () => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa "${item.name}" khỏi tủ đồ?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa ngay',
        style: 'destructive',
        onPress: () => {
          onDelete && onDelete(item._id);
          onClose();
        }
      }
    ]);
  };

  const handleConsume = () => {
    onConsume && onConsume(item._id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết vật phẩm</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Main Item Card banner */}
            <View style={styles.banner}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="medkit" size={44} color={Colors.primary} />
                </View>
              )}
              <View style={styles.bannerInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.brand ? <Text style={styles.itemBrand}>{item.brand}</Text> : null}
                <View style={{ marginTop: 8 }}>
                  <StatusBadge status={item.status} daysRemaining={item.daysRemaining} />
                </View>
              </View>
            </View>

            {/* Key attributes grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <Ionicons name="calendar-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Ngày hết hạn</Text>
                </View>
                <Text style={styles.detailValueBold}>{expiryFormatted}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <Ionicons name="cube-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Số lượng tồn</Text>
                </View>
                <Text style={styles.detailValueBold}>
                  {item.quantity} {item.unit}
                </Text>
              </View>

              {item.price ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelCol}>
                    <Ionicons name="cash-outline" size={16} color="#64748B" />
                    <Text style={styles.detailLabel}>Đơn giá ước tính</Text>
                  </View>
                  <Text style={[styles.detailValueBold, { color: '#059669' }]}>
                    {item.price.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Vị trí lưu trữ</Text>
                </View>
                <Text style={styles.detailValue}>
                  {item.locationId?.name || 'Chưa gán vị trí'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <Ionicons name="pricetag-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Danh mục</Text>
                </View>
                <Text style={styles.detailValue}>
                  {item.categoryId?.name || 'Chưa gán'}
                </Text>
              </View>

              {item.activeIngredient ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelCol}>
                    <Ionicons name="flask-outline" size={16} color="#64748B" />
                    <Text style={styles.detailLabel}>Hoạt chất chính</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.activeIngredient}</Text>
                </View>
              ) : null}

              {item.barcode ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelCol}>
                    <Ionicons name="barcode-outline" size={16} color="#64748B" />
                    <Text style={styles.detailLabel}>Mã vạch</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.barcode}</Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Ngày sản xuất</Text>
                </View>
                <Text style={styles.detailValue}>{mfgFormatted}</Text>
              </View>
            </View>

            {/* Note & dosage */}
            {item.note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>Ghi chú & Liều dùng hướng dẫn:</Text>
                <Text style={styles.noteContent}>{item.note}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.actionFooter}>
            <TouchableOpacity
              style={[styles.consumeFullBtn, { backgroundColor: '#DC2626' }]}
              onPress={handleConsume}
            >
              <Ionicons name="remove-circle-outline" size={17} color="#FFFFFF" />
              <Text style={styles.consumeFullBtnText}>Dùng -1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.consumeFullBtn, { backgroundColor: '#059669' }]}
              onPress={() => onRestock && onRestock(item._id)}
            >
              <Ionicons name="add-circle-outline" size={17} color="#FFFFFF" />
              <Text style={styles.consumeFullBtnText}>Nhập +1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                onClose();
                onEdit && onEdit(item);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#2563EB" />
              <Text style={styles.editBtnText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1
  },
  closeBtn: {
    padding: 4
  },
  scroll: {
    padding: 18
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  bannerInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  itemBrand: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2
  },
  detailsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  detailLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B'
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  noteBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4
  },
  noteContent: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10
  },
  consumeFullBtn: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 46,
    borderRadius: 10,
    gap: 6
  },
  consumeFullBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  editBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    height: 46,
    borderRadius: 10,
    gap: 6
  },
  editBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700'
  },
  deleteBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ItemDetailModal;

