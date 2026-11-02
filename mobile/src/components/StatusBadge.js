import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusColor } from '../utils/theme';

export const StatusBadge = ({ status, daysRemaining, compact = false }) => {
  const { color, bg, border, label, icon } = getStatusColor(status);

  let countdownText = '';
  if (daysRemaining !== undefined && daysRemaining !== null) {
    if (daysRemaining < 0) {
      countdownText = `Quá hạn ${Math.abs(daysRemaining)} ngày`;
    } else if (daysRemaining === 0) {
      countdownText = 'Hết hạn hôm nay!';
    } else if (daysRemaining === 1) {
      countdownText = 'Hết hạn ngày mai!';
    } else {
      countdownText = `Còn ${daysRemaining} ngày`;
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons
        name={
          status === 'EXPIRED'
            ? 'alert-circle'
            : status === 'EXPIRING_SOON'
            ? 'time'
            : 'checkmark-circle'
        }
        size={compact ? 12 : 14}
        color={color}
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.badgeText, { color, fontSize: compact ? 11 : 12 }]}>
        {compact ? (countdownText || label) : `${label}${countdownText ? ` • ${countdownText}` : ''}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontWeight: '700'
  }
});

export default StatusBadge;

