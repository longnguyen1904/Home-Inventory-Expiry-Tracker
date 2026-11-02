import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/theme';

// Safe import expo-camera to prevent native module crashes
let CameraView = null;
let useCameraPermissions = null;
try {
  const ExpoCam = require('expo-camera');
  CameraView = ExpoCam.CameraView;
  useCameraPermissions = ExpoCam.useCameraPermissions;
} catch (e) {
  console.warn('expo-camera module load error:', e);
}

export const CameraScannerView = ({
  active,
  flashlight,
  onScan,
  onToggleCamera,
  onError
}) => {
  // Use camera permission hook safely if available
  let permission = null;
  let requestPermission = null;

  try {
    if (useCameraPermissions) {
      const permResult = useCameraPermissions();
      if (permResult && Array.isArray(permResult)) {
        permission = permResult[0];
        requestPermission = permResult[1];
      }
    }
  } catch (err) {
    console.warn('Error reading camera permissions:', err);
  }

  const [isScanned, setIsScanned] = useState(false);
  const lastScanTimeRef = useRef(0);

  const handleBarcodeScanned = ({ type, data }) => {
    if (!data) return;
    const now = Date.now();
    if (now - lastScanTimeRef.current < 2500) {
      return;
    }
    lastScanTimeRef.current = now;
    setIsScanned(true);
    if (onScan) {
      onScan(data);
    }
    setTimeout(() => {
      setIsScanned(false);
    }, 2500);
  };

  const handleStart = async () => {
    if (requestPermission && (!permission || !permission.granted)) {
      try {
        const res = await requestPermission();
        if (!res.granted) {
          if (onError) onError('Vui lòng cấp quyền truy cập Camera trên điện thoại để quét mã.');
          return;
        }
      } catch (e) {
        console.warn('requestPermission error:', e);
      }
    }
    onToggleCamera(true);
  };

  const handleStop = () => {
    onToggleCamera(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {active ? (
          CameraView && (permission?.granted || !requestPermission) ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={flashlight}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'ean13',
                  'ean8',
                  'upc_a',
                  'upc_e',
                  'qr',
                  'code128',
                  'code39',
                  'code93',
                  'itf14'
                ]
              }}
              onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
            />
          ) : (
            <View style={styles.centerPrompt}>
              <Ionicons name="camera-outline" size={44} color="#CBD5E1" />
              <Text style={styles.promptTitle}>Cần quyền truy cập Camera</Text>
              <TouchableOpacity style={styles.permBtn} onPress={handleStart}>
                <Text style={styles.permBtnText}>Cho phép truy cập Camera</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.centerPrompt}>
            <Ionicons name="barcode-outline" size={48} color="rgba(255,255,255,0.7)" />
            <Text style={styles.promptTitle}>Camera đang tắt</Text>
            <Text style={styles.promptSub}>Nhấn nút bên dưới để mở Camera quét mã vạch thật</Text>
          </View>
        )}

        {/* Viewfinder corner guides */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Animated Laser line */}
        {active && <View style={styles.laserLine} />}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        {!active ? (
          <TouchableOpacity style={styles.actionBtn} onPress={handleStart}>
            <Ionicons name="videocam" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Bật Camera Quét Thật</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} onPress={handleStop}>
            <Ionicons name="stop-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Tắt Camera</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center'
  },
  viewfinder: {
    width: '100%',
    height: 250,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerPrompt: {
    alignItems: 'center',
    paddingHorizontal: 24
  },
  promptTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center'
  },
  promptSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  },
  permBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8
  },
  permBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#38BDF8',
    borderWidth: 3.5
  },
  cornerTL: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  laserLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '50%',
    height: 2.5,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8
  },
  controlsRow: {
    flexDirection: 'row',
    marginTop: 14,
    width: '100%',
    justifyContent: 'center'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  }
});

export default CameraScannerView;
