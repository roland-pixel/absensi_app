// src/components/NfcInput.tsx
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface NfcInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function NfcInput({ value, onChangeText }: NfcInputProps) {
  const [scanning, setScanning] = useState(false);

  // 1. SCANNER WEB NFC (Chrome Android)
  const startWebNfc = async () => {
    // Cek apakah browser mendukung Web NFC API
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      Alert.alert(
        'Web NFC Tidak Didukung',
        'Browser ini tidak mendukung Web NFC. Gunakan Google Chrome versi terbaru di Android dengan protokol HTTPS.'
      );
      return;
    }

    try {
      setScanning(true);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      
      // Memulai proses scanning
      await ndef.scan();
      
      Alert.alert('Tempelkan Kartu', 'Silakan tempelkan kartu NFC ke belakang HP Anda...');

      // @ts-ignore
      ndef.addEventListener('reading', ({ serialNumber }: any) => {
        if (serialNumber) {
          // Format serial number (misal: "04:a1:b2" -> "04A1B2")
          const formattedId = serialNumber.replace(/:/g, '').toUpperCase();
          onChangeText(formattedId);
          setScanning(false);
          Alert.alert('Berhasil', `NFC ID Terbaca: ${formattedId}`);
        }
      });

      // @ts-ignore
      ndef.addEventListener('readingerror', () => {
        Alert.alert('Gagal', 'Terjadi kesalahan saat membaca kartu NFC.');
        setScanning(false);
      });

    } catch (error: any) {
      setScanning(false);
      
      if (error.name === 'NotAllowedError') {
        Alert.alert('Izin Ditolak', 'Akses NFC ditolak oleh browser. Pastikan fitur NFC di HP sudah aktif dan izinkan akses NFC saat muncul pop-up.');
      } else if (error.name === 'NotSupportedError') {
        Alert.alert('Tidak Didukung', 'Fitur Web NFC tidak didukung pada jaringan HTTP biasa. Gunakan HTTPS.');
      } else {
        Alert.alert('Error NFC', error.message || 'Gagal mengaktifkan scanner NFC.');
      }
    }
  };

  // 2. SCANNER NATIVE MOBILE (Apk Android / iOS)
  // 2. SCANNER NATIVE MOBILE (Apk Android / iOS)
  const startNativeNfc = async () => {
    let NfcManager: any = null;
    try {
      NfcManager = require('react-native-nfc-manager').default;
      const { NfcTech } = require('react-native-nfc-manager');

      await NfcManager.start();
      const supported = await NfcManager.isSupported();

      if (!supported) {
        Alert.alert('NFC Tidak Didukung', 'Perangkat ini tidak memiliki sensor NFC.');
        return;
      }

      const enabled = await NfcManager.isEnabled();
      if (!enabled) {
        Alert.alert('NFC Matikan', 'Silakan aktifkan fitur NFC di Pengaturan HP Anda.');
        return;
      }

      setScanning(true);

      // Meminta akses membaca NFC Tag
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertGameText: 'Tempelkan KTP / Kartu NFC ke belakang HP',
      });

      const tag = await NfcManager.getTag();
      
      if (tag && tag.id) {
        // Hapus titik dua jika ada dan jadikan huruf kapital (Contoh: "04A1B2C3D4")
        const cleanId = tag.id.replace(/:/g, '').toUpperCase();
        
        // Mengisi nilai ke TextInput secara otomatis!
        onChangeText(cleanId);
        
        Alert.alert('Sukses', `NFC ID Terbaca: ${cleanId}`);
      } else {
        Alert.alert('Gagal', 'Kartu terdeteksi tetapi ID tidak dapat dibaca.');
      }
    } catch (ex: any) {
      // Jika dibatalkan user / timeout, jangan tampilkan error kasar
      console.log('NFC Scan cancelled or error:', ex);
    } finally {
      if (NfcManager) {
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch (e) {}
      }
      setScanning(false);
    }
  };

  const handleScanPress = () => {
    if (Platform.OS === 'web') {
      startWebNfc();
    } else {
      startNativeNfc();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Tap kartu NFC atau scan USB..."
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="characters"
          onSubmitEditing={() => onChangeText(value.trim().toUpperCase())}
        />

        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonActive]}
          onPress={handleScanPress}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.scanButtonText}>📡 Scan NFC</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        💡 *Web Browser:* Memerlukan koneksi HTTPS & Google Chrome di Android.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#ffffff',
  },
  scanButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  scanButtonActive: {
    backgroundColor: '#94a3b8',
  },
  scanButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  helperText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
});