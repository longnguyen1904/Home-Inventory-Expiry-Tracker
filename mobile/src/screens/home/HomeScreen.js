import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import StatusBadge from '../../components/StatusBadge';
import { Colors } from '../../utils/theme';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    dashboardStats,
    refreshAll,
    refreshing,
    consumeItem,
    unreadNotifCount,
    openAddModal,
    openNotifModal,
    openDetailModal
  } = useInventory();

  const summary = dashboardStats?.summary || {
    totalItems: 0,
    expiredCount: 0,
    expiringSoonCount: 0,
    goodCount: 0
  };

  const urgentItems = dashboardStats?.urgentItems || [];

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Xin chào, {user?.fullName || 'Gia đình'} 👋</Text>
          <Text style={styles.dateText}>{todayStr}</Text>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={openNotifModal}
        >
          <Ionicons name="notifications-outline" size={24} color="#0F172A" />
          {unreadNotifCount > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadNotifCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshAll} colors={[Colors.primary]} />
        }
      >
        {/* Urgent Warnings per Spec MOD-04 & MOD-06 */}
        {summary.expiredCount > 0 ? (
          <TouchableOpacity
            style={styles.expiredBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Inventory', { filterStatus: 'EXPIRED' })}
          >
            <View style={styles.bannerIconBoxRed}>
              <Ionicons name="warning" size={24} color="#EF4444" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitleRed}>CẢNH BÁO NGUY HIỂM</Text>
              <Text style={styles.bannerSubtitleRed}>
                Bạn có <Text style={styles.boldRed}>{summary.expiredCount} vật phẩm</Text> đã hết hạn! Vui lòng vứt bỏ ngay.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : null}

        {summary.expiringSoonCount > 0 ? (
          <TouchableOpacity
            style={styles.expiringBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Inventory', { filterStatus: 'EXPIRING_SOON' })}
          >
            <View style={styles.bannerIconBoxOrange}>
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitleOrange}>LƯU Ý HẠN SỬ DỤNG</Text>
              <Text style={styles.bannerSubtitleOrange}>
                Có <Text style={styles.boldOrange}>{summary.expiringSoonCount} vật phẩm</Text> sắp hết hạn trong vòng 30 ngày.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>
        ) : null}

        {/* 4 Quick Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
            <View style={styles.statHeader}>
              <Ionicons name="cube-outline" size={20} color={Colors.primary} />
              <Text style={styles.statLabel}>Tổng vật phẩm</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{summary.totalItems}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.expired }]}>
            <View style={styles.statHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.expired} />
              <Text style={styles.statLabel}>Đã hết hạn</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.expired }]}>{summary.expiredCount}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.expiringSoon }]}>
            <View style={styles.statHeader}>
              <Ionicons name="time-outline" size={20} color={Colors.expiringSoon} />
              <Text style={styles.statLabel}>Sắp hết hạn</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.expiringSoon }]}>{summary.expiringSoonCount}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.good }]}>
            <View style={styles.statHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.good} />
              <Text style={styles.statLabel}>Còn hạn tốt</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.good }]}>{summary.goodCount}</Text>
          </View>
        </View>

        {/* Estimated Total Value bar per Spec MOD-06 */}
        {summary.estimatedTotalValue ? (
          <View style={styles.valueCard}>
            <View style={styles.valueIconBox}>
              <Ionicons name="wallet-outline" size={22} color="#059669" />
            </View>
            <View style={styles.valueTextCol}>
              <Text style={styles.valueTitle}>Ước tính giá trị tủ đồ gia đình</Text>
              <Text style={styles.valueAmount}>{summary.estimatedTotalValue.toLocaleString('vi-VN')} VNĐ</Text>
            </View>
          </View>
        ) : null}

        {/* Quick Action Bar */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Scan')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="barcode-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionText}>Quét mã vạch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={openAddModal}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="add-circle-outline" size={24} color="#059669" />
              </View>
              <Text style={styles.actionText}>Thêm món mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Locations')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="file-tray-stacked-outline" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.actionText}>Tủ lưu trữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Urgent Items List per Spec */}
        <View style={styles.urgentSection}>
          <View style={styles.urgentHeader}>
            <Text style={styles.sectionTitle}>Vật phẩm cần lưu ý nhất</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.seeAllText}>Xem tất cả ({summary.totalItems})</Text>
            </TouchableOpacity>
          </View>

          {urgentItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={48} color={Colors.good} />
              <Text style={styles.emptyTitle}>Kho của bạn đang rất an toàn!</Text>
              <Text style={styles.emptySubtitle}>Không có vật phẩm nào hết hạn hoặc cận date trong 30 ngày tới.</Text>
            </View>
          ) : (
            urgentItems.map((item) => {
              const expFormatted = new Date(item.expiryDate).toLocaleDateString('vi-VN');
              return (
                <TouchableOpacity
                  key={item._id}
                  style={styles.urgentCard}
                  activeOpacity={0.7}
                  onPress={() => openDetailModal(item)}
                >
                  <View style={styles.urgentCardTop}>
                    <View style={styles.urgentCardInfo}>
                      <Text style={styles.urgentCardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.brand ? (
                        <Text style={styles.urgentCardBrand}>{item.brand}</Text>
                      ) : null}
                    </View>
                    <StatusBadge status={item.status} daysRemaining={item.daysRemaining} compact />
                  </View>

                  <View style={styles.urgentMetaRow}>
                    <View style={styles.urgentMetaItem}>
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text style={styles.urgentMetaText}>Hạn: {expFormatted}</Text>
                    </View>
                    <View style={styles.urgentMetaItem}>
                      <Ionicons name="location-outline" size={13} color="#64748B" />
                      <Text style={styles.urgentMetaText}>{item.locationId?.name || 'Vị trí'}</Text>
                    </View>
                    <View style={styles.urgentMetaItem}>
                      <Ionicons name="cube-outline" size={13} color="#64748B" />
                      <Text style={styles.urgentMetaText}>SL: {item.quantity} {item.unit}</Text>
                    </View>
                  </View>

                  <View style={styles.urgentFooter}>
                    <TouchableOpacity
                      style={styles.urgentConsumeBtn}
                      onPress={() => consumeItem(item._id)}
                    >
                      <Ionicons name="remove-circle-outline" size={15} color="#059669" />
                      <Text style={styles.urgentConsumeText}>Dùng bớt 1 {item.unit}</Text>
                    </TouchableOpacity>

                    <Text style={styles.detailLink}>Chi tiết &rsaquo;</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  userInfo: {
    flex: 1
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  scroll: {
    padding: 16,
    paddingBottom: 30
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  bannerIconBoxRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  bannerTextCol: {
    flex: 1
  },
  bannerTitleRed: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B91C1C',
    letterSpacing: 0.5
  },
  bannerSubtitleRed: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 2
  },
  boldRed: {
    fontWeight: '800',
    color: '#DC2626'
  },
  expiringBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  bannerIconBoxOrange: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  bannerTitleOrange: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5
  },
  bannerSubtitleOrange: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2
  },
  boldOrange: {
    fontWeight: '800',
    color: '#B45309'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800'
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20
  },
  valueIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  valueTextCol: {
    flex: 1
  },
  valueTitle: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600'
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
    marginTop: 2
  },
  actionSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center'
  },
  urgentSection: {
    marginBottom: 10
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  seeAllText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4
  },
  urgentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  urgentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  urgentCardInfo: {
    flex: 1,
    paddingRight: 10
  },
  urgentCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  urgentCardBrand: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 1
  },
  urgentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginVertical: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  urgentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  urgentMetaText: {
    fontSize: 12,
    color: '#64748B'
  },
  urgentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  urgentConsumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  urgentConsumeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  detailLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  }
});

export default HomeScreen;

