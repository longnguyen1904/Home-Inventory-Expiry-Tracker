import React from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { InventoryProvider } from './src/context/InventoryContext';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Crash Caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A' }}>
          <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Đã xảy ra sự cố</Text>
          <Text style={{ color: '#CBD5E1', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
            {String(this.state.error?.message || this.state.error)}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const appContent = (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <InventoryProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </InventoryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );

  // For Web only: wrap in smartphone mock frame
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webPhoneFrame}>
          {appContent}
        </View>
      </View>
    );
  }

  // For Native (iOS / Android): render direct full screen
  return appContent;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webPhoneFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  }
});
