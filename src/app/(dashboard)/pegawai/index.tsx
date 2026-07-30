import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useAuth } from '../../../context/auth-context';
import { absensiService } from '../../../services/absensi';
import { AbsensiData } from '../../../types/absensi';

// Rumus Haversine untuk menghitung jarak antara 2 titik koordinat (dalam meter)
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Hasil dalam meter
}

export default function HomeScreen() {
  const { user } = useAuth();

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [scanningNfc, setScanningNfc] = useState<boolean>(false);

  // Data States
  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiData | null>(null);
  const [historyAbsensi, setHistoryAbsensi] = useState<AbsensiData[]>([]);

  // Location States
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceToOffice, setDistanceToOffice] = useState<number | null>(null);
  const [nfcUid, setNfcUid] = useState<string>('');

  // Fetch data status absensi dari API
  const fetchData = useCallback(async () => {
    try {
      const todayData = await absensiService.getTodayStatus();
      setTodayAbsensi(todayData);

      const now = new Date();
      const historyData = await absensiService.getMyAbsensi(
        now.getMonth() + 1,
        now.getFullYear()
      );
      setHistoryAbsensi(Array.isArray(historyData) ? historyData : []);
    } catch (error: any) {
      console.error('Failed to fetch absensi data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Inisialisasi Lokasi GPS & Scan NFC
  useEffect(() => {
    fetchData();
    getCurrentLocation();

    // Inisialisasi NFC Manager jika didukung
    NfcManager.start().catch(() => {
      console.log('NFC tidak didukung pada perangkat ini / emulator.');
    });

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, [fetchData]);

  // Fungsi Mengambil GPS Asli Perangkat
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin lokasi untuk verifikasi absensi.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);

      // Hitung Jarak ke Kantor Pegawai (jika data kantor ada)
      if (user?.kantor?.latitude && user?.kantor?.longitude) {
        const dist = getDistanceInMeters(
          coords.latitude,
          coords.longitude,
          user.kantor.latitude,
          user.kantor.longitude
        );
        setDistanceToOffice(dist);
      }
    } catch (err) {
      console.error('Gagal mengambil lokasi GPS:', err);
    }
  };

  // Fungsi Scan Kartu NFC Physical (KTP / RFID Card)
  const handleScanNFC = async () => {
    try {
      setScanningNfc(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (tag && tag.id) {
        setNfcUid(tag.id);
        Alert.alert('NFC Terbaca', `Card UID: ${tag.id}`);
      }
    } catch (ex) {
      console.warn('NFC Scan Error/Canceled:', ex);
    } finally {
      setScanningNfc(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getCurrentLocation();
    fetchData();
  };

  // Helper Jam real-time
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler Check In
  const handleCheckIn = async () => {
    if (!currentLocation) {
      Alert.alert('Lokasi Belum Siap', 'Sedang mengambil lokasi GPS. Pastikan GPS HP aktif.');
      await getCurrentLocation();
      return;
    }

    if (!nfcUid.trim()) {
      Alert.alert('NFC Wajib', 'Silakan scan kartu NFC KTP / masukkan UID NFC Anda terlebih dahulu.');
      return;
    }

    // Validasi radius sederhana di Frontend sebelum ke Backend
    const maxRadius = user?.kantor?.radius_meter || 50;
    if (distanceToOffice !== null && distanceToOffice > maxRadius) {
      Alert.alert(
        'Di Luar Radius',
        `Jarak Anda ${distanceToOffice}m dari kantor. Maksimal radius absensi adalah ${maxRadius}m.`
      );
      return;
    }

    try {
      setSubmitting(true);
      const deviceInfo = `${Platform.OS.toUpperCase()} - ${Platform.Version}`;

      await absensiService.checkIn({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        nfc_uid: nfcUid,
        device_info: deviceInfo,
      });

      Alert.alert('Berhasil', 'Check-in berhasil dilakukan!');
      setNfcUid('');
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal melakukan check-in.';
      Alert.alert('Gagal Check-In', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Check Out
  const handleCheckOut = async () => {
    if (!currentLocation) {
      Alert.alert('Lokasi Belum Siap', 'Mendapatkan lokasi GPS terbaru...');
      await getCurrentLocation();
      return;
    }

    try {
      setSubmitting(true);
      const deviceInfo = `${Platform.OS.toUpperCase()} - ${Platform.Version}`;

      await absensiService.checkOut({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        device_info: deviceInfo,
      });

      Alert.alert('Berhasil', 'Check-out berhasil dilakukan!');
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal melakukan check-out.';
      Alert.alert('Gagal Check-Out', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isCheckedIn = !!todayAbsensi?.waktu_masuk;
  const isCheckedOut = !!todayAbsensi?.waktu_keluar;
  const officeRadius = user?.kantor?.radius_meter || 50;
  const isWithinRadius = distanceToOffice !== null ? distanceToOffice <= officeRadius : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Info Pegawai */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>Selamat Datang 👋</Text>
            <Text style={styles.userNameText}>{user?.nama_lengkap || 'Pegawai'}</Text>
            <Text style={styles.userRoleText}>
              {user?.jabatan?.nama_jabatan || 'Jabatan'} • {user?.divisi?.nama_divisi || 'Divisi'}
            </Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(user?.nama_lengkap || 'P').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Info Lokasi Kantor & Radius GPS */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kantor</Text>
            <Text style={styles.infoValue}>📍 {user?.kantor?.nama_kantor || 'Kantor Pusat'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jarak Lokasi Anda</Text>
            <Text
              style={[
                styles.infoValue,
                { color: isWithinRadius ? '#16a34a' : '#dc2626' },
              ]}
            >
              {distanceToOffice !== null ? `${distanceToOffice} Meter` : 'Menghitung...'}
              {` (Max ${officeRadius}m)`}
            </Text>
          </View>
        </View>

        {/* Main Clock Card */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTime}>{currentTime || '00:00:00'}</Text>
          <Text style={styles.clockDate}>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isCheckedIn ? '#22c55e' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusBadgeText}>
              {isCheckedOut
                ? 'Sudah Absen Pulang'
                : isCheckedIn
                ? `Sudah Absen Masuk (${todayAbsensi?.waktu_masuk})`
                : 'Belum Absen Masuk'}
            </Text>
          </View>

          {/* Input & Scan NFC (Hanya saat Belum Check In) */}
          {!isCheckedIn && (
            <View style={styles.nfcContainer}>
              <View style={styles.nfcHeaderRow}>
                <Text style={styles.inputLabel}>NFC UID Card:</Text>
                <TouchableOpacity onPress={handleScanNFC} disabled={scanningNfc}>
                  <Text style={styles.scanNfcText}>
                    {scanningNfc ? 'Scanning...' : '📡 Tap untuk Scan NFC'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.nfcInput}
                placeholder="Hasil Scan / Ketik UID NFC KTP..."
                placeholderTextColor="#94a3b8"
                value={nfcUid}
                onChangeText={setNfcUid}
                autoCapitalize="characters"
              />
            </View>
          )}

          {/* Action Button */}
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
          ) : !isCheckedIn ? (
            <TouchableOpacity
              style={[
                styles.clockButton,
                styles.clockButtonIn,
                (!isWithinRadius || submitting) && styles.buttonDisabled,
              ]}
              onPress={handleCheckIn}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.clockButtonText}>
                  {isWithinRadius ? '🟢 ABSEN MASUK (CHECK-IN)' : '⚠️ DILUAR RADIUS KANTOR'}
                </Text>
              )}
            </TouchableOpacity>
          ) : !isCheckedOut ? (
            <TouchableOpacity
              style={[styles.clockButton, styles.clockButtonOut]}
              onPress={handleCheckOut}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.clockButtonText}>🔴 ABSEN PULANG (CHECK-OUT)</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBox}>
              <Text style={styles.completedText}>✅ Absensi Hari Ini Selesai</Text>
            </View>
          )}
        </View>

        {/* Riwayat Absensi */}
        <Text style={styles.sectionTitle}>Riwayat Absensi Saya</Text>
        {historyAbsensi.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada data riwayat absensi.</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {historyAbsensi.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyDateBox}>
                  <Text style={styles.historyDate}>{item.tanggal}</Text>
                </View>
                <View style={styles.historyDetail}>
                  <Text style={styles.historyTitle}>{item.status_masuk || 'Hadir'}</Text>
                  <Text style={styles.historySub}>
                    Masuk: {item.waktu_masuk || '-'} | Keluar: {item.waktu_keluar || '-'}
                  </Text>
                </View>
                <Text
                  style={
                    item.status_masuk === 'TERLAMBAT'
                      ? styles.badgeWarning
                      : styles.badgeSuccess
                  }
                >
                  {item.status_masuk || 'Hadir'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greetingText: { fontSize: 13, color: '#64748b' },
  userNameText: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  userRoleText: { fontSize: 12, color: '#0284c7', fontWeight: '500', marginTop: 2 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 20 },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValue: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  clockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clockTime: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', letterSpacing: 1 },
  clockDate: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 16 },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusBadgeText: { fontSize: 12, color: '#334155', fontWeight: '500' },
  nfcContainer: { width: '100%', marginBottom: 16 },
  nfcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },
  scanNfcText: { fontSize: 12, color: '#2563eb', fontWeight: 'bold' },
  nfcInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  clockButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockButtonIn: { backgroundColor: '#2563eb' },
  clockButtonOut: { backgroundColor: '#dc2626' },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  clockButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  completedBox: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedText: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  emptyCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: { color: '#94a3b8', fontSize: 13 },
  historyList: { gap: 10 },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  historyDateBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  historyDate: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  historyDetail: { flex: 1 },
  historyTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  historySub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  badgeSuccess: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeWarning: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});