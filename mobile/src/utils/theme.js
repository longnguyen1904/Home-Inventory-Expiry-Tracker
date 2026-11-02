export const Colors = {
  primary: '#2563EB',      // Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  
  // Status Colors (Per Document Specification)
  expired: '#EF4444',       // Red - Expired
  expiredBg: '#FEE2E2',
  expiredBorder: '#FCA5A5',
  
  expiringSoon: '#F59E0B',  // Orange/Yellow - Expiring soon (within 30 days)
  expiringSoonBg: '#FEF3C7',
  expiringSoonBorder: '#FCD34D',
  
  good: '#10B981',          // Green - Safe
  goodBg: '#D1FAE5',
  goodBorder: '#6EE7B7',
  
  // Backgrounds & Neutrals
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  
  // Dark accents
  darkHeader: '#0F172A',
  white: '#FFFFFF'
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'EXPIRED':
      return {
        color: Colors.expired,
        bg: Colors.expiredBg,
        border: Colors.expiredBorder,
        label: 'ĐÃ HẾT HẠN',
        icon: 'alert-circle'
      };
    case 'EXPIRING_SOON':
      return {
        color: Colors.expiringSoon,
        bg: Colors.expiringSoonBg,
        border: Colors.expiringSoonBorder,
        label: 'SẮP HẾT HẠN',
        icon: 'clock-alert'
      };
    case 'GOOD':
    default:
      return {
        color: Colors.good,
        bg: Colors.goodBg,
        border: Colors.goodBorder,
        label: 'CÒN HẠN DÙNG',
        icon: 'check-circle'
      };
  }
};

