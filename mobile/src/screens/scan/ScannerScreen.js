import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import apiClient from '../../api/client';
import { Colors } from '../../utils/theme';
import CameraScannerView from './CameraScannerView';

export const ScannerScreen = () => {
  const { openAddWithPreset } = useInventory();
  const [flashlight, setFlashlight] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [sampleBarcodes, setSampleBarcodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    // Load sample barcodes for easy testing
    const loadSamples = async () => {
      try {
        const res = await apiClient.get('/barcodes/samples');
        if (res.data.success) {
          setSampleBarcodes(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading sample barcodes:', err.message);
      }
    };
    loadSamples();
  }, []);

  // Web Audio Synthesizer Beep Sound on barcode recognized
  const playBeep = () => {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        }
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const handleLookup = async (codeToLookup) => {
    const code = codeToLookup || manualCode;
    if (!code || !code.trim()) {
      Alert.alert('Chưa có mã', 'Vui lòng nhập hoặc chọn một mã vạch để quét');
      return;
    }

    playBeep();
    setIsScanning(true);
    setFoundProduct(null);
    try {
      const res = await apiClient.get(`/barcodes/lookup/${code.trim()}`);
      if (res.data.success && res.data.data) {
        setFoundProduct(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không tìm thấy sản phẩm với mã vạch này';
      Alert.alert(
        'Không tìm thấy',
        `${msg}\nBạn có muốn tự thêm mới sản phẩm này vào kho không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Thêm mới',
            onPress: () => {
              openAddWithPreset({ barcode: code.trim() });
            }
          }
        ]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyFoundProduct = () => {
    if (!foundProduct) return;
    openAddWithPreset({
      name: foundProduct.name,
      barcode: foundProduct.barcode,
      brand: foundProduct.brand,
      activeIngredient: foundProduct.activeIngredient,
      unit: foundProduct.unit || 'hộp',
      imageUrl: foundProduct.imageUrl,
      note: foundProduct.description
    });
    setFoundProduct(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Quét mã vạch sản phẩm</Text>
        <TouchableOpacity
          style={[styles.flashBtn, flashlight && styles.flashBtnActive]}
          onPress={() => setFlashlight(!flashlight)}
        >
          <Ionicons
            name={flashlight ? 'flash' : 'flash-outline'}
            size={20}
            color={flashlight ? '#EAB308' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Camera Viewfinder View (Native CameraView on mobile / ZXing on web) */}
      <View style={styles.scannerViewport}>
        <CameraScannerView
          active={cameraActive}
          flashlight={flashlight}
          onScan={(code) => {
            playBeep();
            setManualCode(code);
            handleLookup(code);
          }}
          onToggleCamera={(isActive) => setCameraActive(isActive)}
          onError={(err) => setCameraError(err)}
        />

        {cameraError ? (
          <Text style={styles.camErrorText}>{cameraError}</Text>
        ) : null}

        {isScanning ? (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text style={styles.scanningText}>Đang nhận diện mã vạch & tra cứu...</Text>
          </View>
        ) : null}
      </View>

      {/* Product preview card if found */}
      {foundProduct ? (
        <View style={styles.foundCard}>
          <View style={styles.foundHeader}>
            <View style={styles.foundBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.foundBadgeText}>ĐÃ NHẬN DIỆN THÀNH CÔNG</Text>
            </View>
            <TouchableOpacity onPress={() => setFoundProduct(null)}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.foundBody}>
            {foundProduct.imageUrl ? (
              <Image source={{ uri: foundProduct.imageUrl }} style={styles.foundImage} />
            ) : (
              <View style={styles.foundImagePlaceholder}>
                <Ionicons name="medkit" size={24} color="#2563EB" />
              </View>
            )}
            <View style={styles.foundTextCol}>
              <Text style={styles.foundName} numberOfLines={2}>
                {foundProduct.name}
              </Text>
              {foundProduct.brand ? (
                <Text style={styles.foundBrand}>{foundProduct.brand}</Text>
              ) : null}
              {foundProduct.activeIngredient ? (
                <Text style={styles.foundIngredient} numberOfLines={1}>
                  {foundProduct.activeIngredient}
                </Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity style={styles.addFoundBtn} onPress={handleApplyFoundProduct}>
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.addFoundBtnText}>Thêm vào tủ đồ ngay</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Manual barcode input */}
      <View style={styles.manualSection}>
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Nhập mã vạch thủ công..."
            placeholderTextColor="#94A3B8"
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={styles.manualScanBtn}
            onPress={() => handleLookup(manualCode)}
          >
            <Text style={styles.manualScanBtnText}>Quét mã</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sample barcodes carousel for instant demonstration */}
      <View style={styles.samplesSection}>
        <Text style={styles.samplesTitle}>Mã vạch mẫu thử nghiệm nhanh (1-Click Quét):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.samplesScroll}>
          {sampleBarcodes.map((item) => (
            <TouchableOpacity
              key={item.barcode}
              style={styles.sampleChip}
              onPress={() => {
                setManualCode(item.barcode);
                handleLookup(item.barcode);
              }}
            >
              <Ionicons name="barcode-outline" size={16} color="#2563EB" />
              <View>
                <Text style={styles.sampleName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.sampleCode}>{item.barcode}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 12
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  flashBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flashBtnActive: {
    backgroundColor: '#374151'
  },
  scannerViewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  camErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center'
  },
  scanningIndicator: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 20,
    borderRadius: 12,
    zIndex: 20
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 10
  },
  foundCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  foundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  foundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4
  },
  foundBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46'
  },
  foundBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  foundImage: {
    width: 50,
    height: 50,
    borderRadius: 8
  },
  foundImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  foundTextCol: {
    flex: 1
  },
  foundName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  foundBrand: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600'
  },
  foundIngredient: {
    fontSize: 11,
    color: '#64748B'
  },
  addFoundBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 10,
    gap: 6
  },
  addFoundBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  manualSection: {
    paddingHorizontal: 16,
    marginBottom: 10
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46
  },
  manualInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14
  },
  manualScanBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8
  },
  manualScanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  samplesSection: {
    paddingBottom: 24
  },
  samplesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 16,
    marginBottom: 8
  },
  samplesScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    maxWidth: 200
  },
  sampleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  sampleCode: {
    fontSize: 10,
    color: '#64748B'
  }
});

export default ScannerScreen;
