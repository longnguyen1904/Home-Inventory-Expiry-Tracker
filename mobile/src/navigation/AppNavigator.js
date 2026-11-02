import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import ScannerScreen from '../screens/scan/ScannerScreen';
import LocationsScreen from '../screens/locations/LocationsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import ItemFormModal from '../screens/inventory/ItemFormModal';
import ItemDetailModal from '../screens/inventory/ItemDetailModal';
import NotificationModal from '../screens/notifications/NotificationModal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0'
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'barcode' : 'barcode-outline';
          } else if (route.name === 'Locations') {
            iconName = focused ? 'file-tray-stacked' : 'file-tray-stacked-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          if (route.name === 'Scan') {
            return (
              <View style={styles.scanTabIcon}>
                <Ionicons name="barcode" size={24} color="#FFFFFF" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ tabBarLabel: 'Kho đồ' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{ tabBarLabel: 'Quét mã' }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{ tabBarLabel: 'Vị trí' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Thống kê' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const {
    formModalVisible,
    formPreset,
    detailModalVisible,
    selectedDetailItem,
    notifModalVisible,
    closeFormModal,
    closeDetailModal,
    closeNotifModal,
    openEditModal,
    openDetailModal,
    consumeItem,
    restockItem
  } = useInventory();

  return (
    <View style={styles.rootContainer}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Global Modals rendered outside NavigationContainer to avoid crashes */}
      {isAuthenticated && (
        <>
          <ItemFormModal
            visible={formModalVisible}
            initialItem={formPreset}
            onClose={closeFormModal}
          />

          <ItemDetailModal
            visible={detailModalVisible}
            item={selectedDetailItem}
            onClose={closeDetailModal}
            onEdit={openEditModal}
            onConsume={consumeItem}
            onRestock={restockItem}
          />

          <NotificationModal
            visible={notifModalVisible}
            onClose={closeNotifModal}
            onSelectItem={openDetailModal}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  scanTabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  }
});

export default AppNavigator;
