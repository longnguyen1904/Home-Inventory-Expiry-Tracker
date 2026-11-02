import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { Colors } from '../../utils/theme';

export const AnalyticsScreen = () => {
  const { user, logout, updateSettings, changePassword } = useAuth();
  const { dashboardStats, triggerCronCheck, activities } = useInventory();

  const [isScanningCron, setIsScanningCron] = useState(false);
  const [alert30, setAlert30] = useState(user?.settings?.alertDays?.includes(30) ?? true);
  const [alert14, setAlert14] = useState(user?.settings?.alertDays?.includes(14) ?? true);
  const [alert7, setAlert7] = useState(user?.settings?.alertDays?.includes(7) ?? true);
  const [alert3, setAlert3] = useState(user?.settings?.alertDays?.includes(3) ?? true);
  const [alert1, setAlert1] = useState(user?.settings?.alertDays?.includes(1) ?? true);

  // Change password modal
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  const categoryDistribution = dashboardStats?.categoryDistribution || [];
  const monthlyProjection = dashboardStats?.monthlyProjection || [];

  const handleToggleAlertDay = async (day, currentVal, setter) => {
    setter(!currentVal);
    const newDays = [];
    if (day === 30 ? !currentVal : alert30) newDays.push(30);
    if (day === 14 ? !currentVal : alert14) newDays.push(14);
    if (day === 7 ? !currentVal : alert7) newDays.push(7);
    if (day === 3 ? !currentVal : alert3) newDays.push(3);
    if (day === 1 ? !currentVal : alert1) newDays.push(1);

    await updateSettings({ alertDays: newDays });
  };

  const handleManualCron = async () => {
    setIsScanningCron(true);
    const res = await triggerCronCheck();
    setIsScanningCron(false);
    if (res.success) {
      Alert.alert('Thành công', 'Đã kích hoạt quét kiểm tra hạn dùng và cập nhật thông báo.');
    } else {
      Alert.alert('Lỗi', res.message || 'Không thể chạy tác vụ');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPw !== confirmNewPw) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsChangingPw(true);
    const res = await changePassword(currentPw, newPw);
    setIsChangingPw(false);

    if (res.success) {
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công');
      setPwModalVisible(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmNewPw('');
    } else {
      Alert.alert('Thất bại', res.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout }
    ]);
  };

  const getActionBadge = (type) => {
    switch (type) {
      case 'CONSUME':
        return { label: 'TIÊU DÙNG', bg: '#FEF3C7', color: '#B45309', icon: 'remove-circle' };
      case 'RESTOCK':
        return { label: 'NHẬP THÊM', bg: '#D1FAE5', color: '#065F46', icon: 'add-circle' };
      case 'CREATE':
        return { label: 'THÊM MỚI', bg: '#DBEAFE', color: '#1E40AF', icon: 'cube' };
      case 'DELETE':
      case 'DISCARD':
        return { label: 'HỦY BỎ', bg: '#FEE2E2', color: '#991B1B', icon: 'trash' };
      default:
        return { label: 'CẬP NHẬT', bg: '#F1F5F9', color: '#475569', icon: 'create' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê & Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Người dùng'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.pwIconBtn} onPress={() => setPwModalVisible(true)}>
              <Ionicons name="key-outline" size={18} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Phân bố theo danh mục</Text>
          </View>

          {categoryDistribution.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu danh mục</Text>
          ) : (
            categoryDistribution.map((cat, idx) => (
              <View key={idx} style={styles.distRow}>
                <View style={styles.distLabelRow}>
                  <Text style={styles.distName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.distValue}>
                    {cat.count} món ({cat.percentage}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, cat.percentage)}%`,
                        backgroundColor: cat.color || '#3B82F6'
                      }
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Monthly Expiry Forecast */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Dự báo hạn dùng 6 tháng tới</Text>
          </View>

          <View style={styles.forecastGrid}>
            {monthlyProjection.map((m, idx) => (
              <View key={idx} style={styles.forecastCol}>
                <View style={styles.forecastBarContainer}>
                  <View
                    style={[
                      styles.forecastBar,
                      {
                        height: Math.max(8, Math.min(80, m.count * 20)),
                        backgroundColor: m.count > 0 ? (m.count >= 2 ? '#EF4444' : '#F59E0B') : '#E2E8F0'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.forecastCount}>{m.count}</Text>
                <Text style={styles.forecastMonth}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Audit Log per Spec MOD-06 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#D97706" />
            <Text style={styles.sectionTitle}>Nhật ký tiêu hao & kho (Audit Log)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Ghi nhận lịch sử thêm, dùng, nhập và hủy vật phẩm:
          </Text>

          {activities.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có ghi nhận hoạt động nào</Text>
          ) : (
            activities.slice(0, 6).map((act) => {
              const badge = getActionBadge(act.actionType);
              const timeStr = act.createdAt
                ? new Date(act.createdAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })
                : '';

              return (
                <View key={act._id} style={styles.activityRow}>
                  <View style={[styles.actBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.actBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <View style={styles.actContent}>
                    <Text style={styles.actDesc}>{act.description}</Text>
                    <Text style={styles.actTime}>{timeStr}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Expiry Threshold Settings (MOD-01 & MOD-05) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-circle-outline" size={22} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Cấu hình ngưỡng thông báo hạn</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Tự động gửi cảnh báo khi vật phẩm chạm các mốc ngày còn lại:
          </Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Trước 30 ngày (1 tháng)</Text>
            <Switch
              value={alert30}
              onValueChange={() => handleToggleAlertDay(30, alert30, setAlert30)}
              trackColor={{ true: '#2563EB', false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Trước 14 ngày (2 tuần)</Text>
            <Switch
              value={alert14}
              onValueChange={() => handleToggleAlertDay(14, alert14, setAlert14)}
              trackColor={{ true: '#2563EB', false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Trước 7 ngày (1 tuần)</Text>
            <Switch
              value={alert7}
              onValueChange={() => handleToggleAlertDay(7, alert7, setAlert7)}
              trackColor={{ true: '#2563EB', false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Trước 3 ngày</Text>
            <Switch
              value={alert3}
              onValueChange={() => handleToggleAlertDay(3, alert3, setAlert3)}
              trackColor={{ true: '#2563EB', false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Trước 1 ngày & Ngày hết hạn</Text>
            <Switch
              value={alert1}
              onValueChange={() => handleToggleAlertDay(1, alert1, setAlert1)}
              trackColor={{ true: '#2563EB', false: '#CBD5E1' }}
            />
          </View>
        </View>

        {/* Background Cron Trigger */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="repeat-outline" size={20} color="#0284C7" />
            <Text style={styles.sectionTitle}>Tác vụ quét ngầm (Cron Job)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Hệ thống tự động chạy lúc 08:00 AM hàng ngày. Bạn có thể kích hoạt thủ công để kiểm tra ngay:
          </Text>

          <TouchableOpacity
            style={styles.cronBtn}
            onPress={handleManualCron}
            disabled={isScanningCron}
          >
            {isScanningCron ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.cronBtnText}>Chạy quét kiểm tra hạn ngay bây giờ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={pwModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setPwModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu hiện tại..."
                  secureTextEntry
                  value={currentPw}
                  onChangeText={setCurrentPw}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới (ít nhất 6 ký tự)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tạo mật khẩu mới..."
                  secureTextEntry
                  value={newPw}
                  onChangeText={setNewPw}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu mới..."
                  secureTextEntry
                  value={confirmNewPw}
                  onChangeText={setConfirmNewPw}
                />
              </View>

              <TouchableOpacity
                style={styles.changePwBtn}
                onPress={handleChangePassword}
                disabled={isChangingPw}
              >
                {isChangingPw ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.changePwBtnText}>Cập nhật mật khẩu</Text>
                )}
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  scroll: {
    padding: 16,
    paddingBottom: 40
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pwIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic'
  },
  distRow: {
    marginBottom: 10
  },
  distLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  distName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1
  },
  distValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10
  },
  forecastCol: {
    alignItems: 'center',
    flex: 1
  },
  forecastBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  forecastBar: {
    width: 20,
    borderRadius: 4
  },
  forecastCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4
  },
  forecastMonth: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 10
  },
  actBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  actBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  actContent: {
    flex: 1
  },
  actDesc: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600'
  },
  actTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  cronBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  cronBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
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
  changePwBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  changePwBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default AnalyticsScreen;
