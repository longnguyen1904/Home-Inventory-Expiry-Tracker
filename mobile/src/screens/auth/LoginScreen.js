import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../utils/theme';

export const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }
    const res = await login(email, password);
    if (!res.success && res.message) {
      Alert.alert('Đăng nhập thất bại', res.message);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('password123');
    await login('demo@example.com', 'password123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandBox}>
          <View style={styles.logoIcon}>
            <Ionicons name="medkit" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>SmartBox Mobile</Text>
          <Text style={styles.brandSubtitle}>
            Home Inventory & Expiry Tracker
          </Text>
          <Text style={styles.brandDesc}>
            Hệ thống quản lý tủ thuốc & vật phẩm gia đình thông minh
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>Đăng nhập</Text>

          {error ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={Colors.expired} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn..."
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu..."
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            <Ionicons name="flash" size={18} color="#2563EB" />
            <Text style={styles.demoBtnText}>1-Click Đăng nhập Demo (Dữ liệu mẫu)</Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 2
  },
  brandDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A'
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  demoBtn: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6
  },
  demoBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700'
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18
  },
  promptText: {
    fontSize: 13,
    color: '#64748B'
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB'
  }
});

export default LoginScreen;

