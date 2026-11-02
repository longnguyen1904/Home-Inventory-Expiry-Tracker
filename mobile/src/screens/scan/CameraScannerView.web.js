import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/theme';

export const CameraScannerView = ({
  active,
  flashlight,
  onScan,
  onToggleCamera,
  onError
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const zxingControlsRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      stopWebCamera();
    };
  }, []);

  const startWebCamera = async () => {
    setInternalError(null);

    // Check secure context / mediaDevices support
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isHttp = typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const msg = isHttp
        ? 'Trình duyệt chặn mở camera trực tiếp qua mạng HTTP (cần HTTPS). Vui lòng dùng nút "Chụp ảnh quét mã" bên dưới để chụp trực tiếp từ camera điện thoại!'
        : 'Thiết bị hoặc trình duyệt không hỗ trợ mở camera trực tiếp. Vui lòng thử nút "Chụp ảnh quét mã".';
      setInternalError(msg);
      if (onError) onError(msg);
      return;
    }

    setCameraActive(true);
    if (onToggleCamera) onToggleCamera(true);

    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const codeReader = new BrowserMultiFormatReader();

      setTimeout(async () => {
        try {
          const videoElement = document.getElementById('barcode-web-video');
          if (!videoElement) {
            setInternalError('Không tìm thấy màn hình hiển thị video.');
            return;
          }

          let controls;
          try {
            // First try environment (back) camera
            controls = await codeReader.decodeFromConstraints(
              { video: { facingMode: { ideal: 'environment' } } },
              videoElement,
              handleZxingResult
            );
          } catch (envErr) {
            // Fallback to any available video source
            controls = await codeReader.decodeFromConstraints(
              { video: true },
              videoElement,
              handleZxingResult
            );
          }
          zxingControlsRef.current = controls;
        } catch (camErr) {
          console.error('Camera stream error:', camErr);
          const errMsg = camErr.name === 'NotAllowedError'
            ? 'Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt.'
            : 'Không thể mở Camera: ' + (camErr.message || 'Lỗi thiết bị');
          setInternalError(errMsg);
          if (onError) onError(errMsg);
          setCameraActive(false);
          if (onToggleCamera) onToggleCamera(false);
        }
      }, 300);
    } catch (importErr) {
      setInternalError('Không thể tải thư viện nhận diện mã vạch ZXing.');
    }
  };

  const handleZxingResult = (result, err) => {
    if (result) {
      const text = result.getText();
      const now = Date.now();
      if (text && now - lastScanTimeRef.current > 2500) {
        lastScanTimeRef.current = now;
        if (onScan) onScan(text);
      }
    }
  };

  const stopWebCamera = () => {
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch (e) {}
      zxingControlsRef.current = null;
    }
    setCameraActive(false);
    if (onToggleCamera) onToggleCamera(false);
  };

  // Handle Photo capture or image file pick via ZXing
  const handlePhotoCapture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new window.Image();
      img.onload = async () => {
        try {
          const { BrowserMultiFormatReader } = await import('@zxing/browser');
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromImageElement(img);
          if (result && result.getText()) {
            if (onScan) onScan(result.getText());
          }
        } catch (decErr) {
          Alert.alert(
            'Không nhận diện được',
            'Không tìm thấy mã vạch rõ ràng trong ảnh chụp. Vui lòng chụp gần và đủ sáng hơn, hoặc chọn mã mẫu bên dưới.'
          );
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input value so user can take photo again
    event.target.value = '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {cameraActive ? (
          <video
            id="barcode-web-video"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 16
            }}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <View style={styles.centerPrompt}>
            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.7)" />
            <Text style={styles.promptTitle}>Camera đang tắt</Text>
            <Text style={styles.promptSub}>Mở camera trực tiếp hoặc bấm Chụp ảnh quét mã</Text>
          </View>
        )}

        {/* Viewfinder corner guides */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Animated Laser line */}
        {cameraActive && <View style={styles.laserLine} />}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.controlsRow}>
        {!cameraActive ? (
          <TouchableOpacity style={styles.actionBtn} onPress={startWebCamera}>
            <Ionicons name="videocam" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Bật Webcam/Camera</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} onPress={stopWebCamera}>
            <Ionicons name="stop-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Dừng Camera</Text>
          </TouchableOpacity>
        )}

        {/* Camera photo capture input (Opens phone camera or file picker) */}
        <label style={webStyles.captureLabel}>
          <Ionicons name="camera" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <span style={webStyles.captureSpan}>Chụp ảnh quét mã</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handlePhotoCapture}
          />
        </label>
      </View>

      {internalError ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{internalError}</Text>
        </View>
      ) : null}
    </View>
  );
};

const webStyles = {
  captureLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '13px',
    marginLeft: '8px',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
  },
  captureSpan: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '13px'
  }
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
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    marginHorizontal: 12
  },
  errorText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  }
});

export default CameraScannerView;

