import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';

export const NotificationModal = ({ visible, onClose, onSelectItem }) => {
  const {
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useInventory();

  const handlePressNotif = (notif) => {
    markNotificationRead(notif._id);
    if (notif.itemId) {
      onClose();
      onSelectItem && onSelectItem(notif.itemId);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color="#2563EB" />
              <Text style={styles.headerTitle}>
                Trung tâm thông báo ({notifications.length})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick Mark All as read */}
          {unreadNotifCount > 0 ? (
            <TouchableOpacity
              style={styles.markAllBar}
              onPress={markAllNotificationsRead}
            >
              <Ionicons name="checkmark-done" size={16} color="#2563EB" />
              <Text style={styles.markAllText}>Đánh dấu đã đọc tất cả</Text>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isExpired = item.type === 'EXPIRED';
              const isWarning = item.type === 'EXPIRY_WARNING';
              const sentTimeStr = item.sentAt
                ? new Date(item.sentAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })
                : '';

              return (
                <TouchableOpacity
                  style={[
                    styles.notifCard,
                    !item.isRead && styles.unreadCard
                  ]}
                  onPress={() => handlePressNotif(item)}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconBadge,
                        isExpired && { backgroundColor: '#FEE2E2' },
                        isWarning && { backgroundColor: '#FEF3C7' }
                      ]}
                    >
                      <Ionicons
                        name={
                          isExpired
                            ? 'alert-circle'
                            : isWarning
                            ? 'time'
                            : 'information-circle'
                        }
                        size={18}
                        color={
                          isExpired
                            ? '#EF4444'
                            : isWarning
                            ? '#F59E0B'
                            : '#2563EB'
                        }
                      />
                    </View>

                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    {!item.isRead ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.notifMessage}>{item.message}</Text>
                  <Text style={styles.notifTime}>{sentTimeStr}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
              </View>
            }
          />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  closeBtn: {
    padding: 4
  },
  markAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  list: {
    padding: 16
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB'
  },
  notifMessage: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right'
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8
  }
});

export default NotificationModal;

