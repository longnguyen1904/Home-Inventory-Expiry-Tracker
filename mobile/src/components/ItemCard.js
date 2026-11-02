import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { Colors } from '../utils/theme';

export const ItemCard = ({ item, onPress, onConsume, onRestock, onEdit, onDelete }) => {
  const expiryFormatted = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString('vi-VN')
    : 'Không rõ';

  const priceFormatted = item.price ? `${item.price.toLocaleString('vi-VN')} đ` : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.topRow}>
        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          {item.brand ? (
            <Text style={styles.brand} numberOfLines={1}>
              {item.brand}
            </Text>
          ) : null}
          {item.activeIngredient ? (
            <Text style={styles.ingredient} numberOfLines={1}>
              Hoạt chất: {item.activeIngredient}
            </Text>
          ) : null}
        </View>

        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="medkit-outline" size={24} color={Colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge status={item.status} daysRemaining={item.daysRemaining} compact />
        <View style={styles.metaRow}>
          {item.locationId ? (
            <View style={[styles.tag, { borderColor: item.locationId.color || Colors.primary }]}>
              <Ionicons
                name="location-outline"
                size={12}
                color={item.locationId.color || Colors.primary}
              />
              <Text
                style={[styles.tagText, { color: item.locationId.color || Colors.primary }]}
                numberOfLines={1}
              >
                {item.locationId.name}
              </Text>
            </View>
          ) : null}

          {item.categoryId ? (
            <View style={[styles.tag, { borderColor: Colors.textSecondary }]}>
              <Text style={[styles.tagText, { color: Colors.textSecondary }]} numberOfLines={1}>
                {item.categoryId.name}
              </Text>
            </View>
          ) : null}
          {priceFormatted ? (
            <View style={[styles.tag, { borderColor: '#10B981' }]}>
              <Text style={[styles.tagText, { color: '#059669' }]}>{priceFormatted}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Hạn dùng: </Text>
          <Text style={styles.dateValue}>{expiryFormatted}</Text>
        </View>

        <View style={styles.qtyContainer}>
          <Text style={styles.qtyText}>
            SL: <Text style={styles.qtyBold}>{item.quantity}</Text> {item.unit}
          </Text>
        </View>

        <View style={styles.actions}>
          {onConsume && (
            <TouchableOpacity
              style={styles.consumeBtn}
              onPress={() => onConsume(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              title="Dùng bớt 1"
            >
              <Ionicons name="remove" size={14} color="#FFFFFF" />
              <Text style={styles.consumeBtnText}>-1</Text>
            </TouchableOpacity>
          )}

          {onRestock && (
            <TouchableOpacity
              style={styles.restockBtn}
              onPress={() => onRestock(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              title="Nhập thêm 1"
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text style={styles.restockBtnText}>+1</Text>
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onEdit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onDelete(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.expired} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  infoCol: {
    flex: 1,
    paddingRight: 10
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  brand: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 2
  },
  ingredient: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 4
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginVertical: 8
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  qtyContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  qtyText: {
    fontSize: 12,
    color: '#475569'
  },
  qtyBold: {
    fontWeight: '700',
    color: '#0F172A'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  consumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2
  },
  consumeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2
  },
  restockBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  iconBtn: {
    padding: 4
  }
});

export default ItemCard;

