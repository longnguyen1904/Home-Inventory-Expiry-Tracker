import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Global UI Modal States
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formPreset, setFormPreset] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const openAddModal = () => {
    setFormPreset(null);
    setFormModalVisible(true);
  };

  const openEditModal = (item) => {
    setFormPreset(item);
    setFormModalVisible(true);
  };

  const openAddWithPreset = (preset) => {
    setFormPreset(preset);
    setFormModalVisible(true);
  };

  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
    setDetailModalVisible(true);
  };

  const openNotifModal = () => {
    setNotifModalVisible(true);
  };

  const closeFormModal = () => setFormModalVisible(false);
  const closeDetailModal = () => setDetailModalVisible(false);
  const closeNotifModal = () => setNotifModalVisible(false);

  const fetchDashboardStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/dashboard/statistics');
      if (res.data.success) {
        setDashboardStats(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching dashboard stats:', err.message);
    }
  }, [isAuthenticated]);

  const fetchLocations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/locations');
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching locations:', err.message);
    }
  }, [isAuthenticated]);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err.message);
    }
  }, [isAuthenticated]);

  const fetchItems = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    try {
      const params = new URLSearchParams();
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const res = await apiClient.get(`/items?${params.toString()}`);
      if (res.data.success) {
        setItems(res.data.data.items);
        return res.data.data.items;
      }
    } catch (err) {
      console.warn('Error fetching items:', err.message);
      return [];
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadNotifCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    }
  }, [isAuthenticated]);

  const fetchActivities = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/activities');
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching activities:', err.message);
    }
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchLocations(),
      fetchCategories(),
      fetchItems(),
      fetchNotifications(),
      fetchActivities()
    ]);
    setRefreshing(false);
  }, [isAuthenticated, fetchDashboardStats, fetchLocations, fetchCategories, fetchItems, fetchNotifications, fetchActivities]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setItems([]);
      setLocations([]);
      setCategories([]);
      setDashboardStats(null);
      setNotifications([]);
      setActivities([]);
      setUnreadNotifCount(0);
      setFormModalVisible(false);
      setDetailModalVisible(false);
      setNotifModalVisible(false);
    }
  }, [isAuthenticated, refreshAll]);

  // Item actions
  const createItem = async (itemData) => {
    try {
      const res = await apiClient.post('/items', itemData);
      if (res.data.success) {
        await refreshAll();
        return { success: true, item: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const res = await apiClient.put(`/items/${id}`, itemData);
      if (res.data.success) {
        await refreshAll();
        return { success: true, item: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteItem = async (id, hardDelete = true) => {
    try {
      const res = await apiClient.delete(`/items/${id}?hardDelete=${hardDelete}`);
      if (res.data.success) {
        await refreshAll();
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const consumeItem = async (id) => {
    try {
      const res = await apiClient.patch(`/items/${id}/consume`);
      if (res.data.success) {
        await refreshAll();
        return { success: true, item: res.data.data, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const restockItem = async (id) => {
    try {
      const res = await apiClient.patch(`/items/${id}/restock`);
      if (res.data.success) {
        await refreshAll();
        return { success: true, item: res.data.data, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Location actions
  const createLocation = async (locationData) => {
    try {
      const res = await apiClient.post('/locations', locationData);
      if (res.data.success) {
        await fetchLocations();
        return { success: true, location: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateLocation = async (id, locationData) => {
    try {
      const res = await apiClient.put(`/locations/${id}`, locationData);
      if (res.data.success) {
        await fetchLocations();
        return { success: true, location: res.data.data };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteLocation = async (id) => {
    try {
      const res = await apiClient.delete(`/locations/${id}`);
      if (res.data.success) {
        await fetchLocations();
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Notification actions
  const markNotificationRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      console.warn('Error marking notification read:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      await fetchNotifications();
    } catch (err) {
      console.warn('Error marking all read:', err.message);
    }
  };

  const triggerCronCheck = async () => {
    try {
      const res = await apiClient.post('/notifications/trigger-cron');
      if (res.data.success) {
        await refreshAll();
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        locations,
        categories,
        dashboardStats,
        notifications,
        activities,
        unreadNotifCount,
        loading,
        refreshing,
        refreshAll,
        fetchItems,
        fetchLocations,
        fetchCategories,
        fetchDashboardStats,
        fetchNotifications,
        fetchActivities,
        createItem,
        updateItem,
        deleteItem,
        consumeItem,
        restockItem,
        createLocation,
        updateLocation,
        deleteLocation,
        markNotificationRead,
        markAllNotificationsRead,
        triggerCronCheck,
        // Modal UI Controls
        formModalVisible,
        formPreset,
        detailModalVisible,
        selectedDetailItem,
        notifModalVisible,
        openAddModal,
        openEditModal,
        openAddWithPreset,
        openDetailModal,
        openNotifModal,
        closeFormModal,
        closeDetailModal,
        closeNotifModal
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
