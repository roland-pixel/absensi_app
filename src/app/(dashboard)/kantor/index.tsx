// src/app/(dashboard)/kantor/index.tsx
import MapPicker from '@/components/MapPicker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { kantorService } from '../../../services/kantor';
import { Kantor } from '../../../types/kantor';

export default function KantorScreen() {
  const router = useRouter();

  const [kantorList, setKantorList] = useState<Kantor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKantor, setSelectedKantor] = useState<Kantor | null>(null);
  const [namaKantor, setNamaKantor] = useState('');
  const [alamat, setAlamat] = useState('');
  const [latitude, setLatitude] = useState('-3.318606');
  const [longitude, setLongitude] = useState('114.594378');
  const [radiusMeter, setRadiusMeter] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data Kantor
  const fetchKantor = useCallback(async () => {
    try {
      const data = await kantorService.getAll();
      setKantorList(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data kantor';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKantor();
  }, [fetchKantor]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchKantor();
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setSelectedKantor(null);
    setNamaKantor('');
    setAlamat('');
    setLatitude('-3.318606');
    setLongitude('114.594378');
    setRadiusMeter('50');
    setModalVisible(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: Kantor) => {
    setSelectedKantor(item);
    setNamaKantor(item.nama_kantor);
    setAlamat(item.alamat);
    setLatitude(String(item.latitude));
    setLongitude(String(item.longitude));
    setRadiusMeter(String(item.radius_meter ?? 50));
    setModalVisible(true);
  };

  // Callback saat posisi lokasi dipilih dari Map
  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  };

  // Submit Form
  const handleSubmit = async () => {
    if (!namaKantor.trim() || !alamat.trim() || !latitude.trim() || !longitude.trim()) {
      Alert.alert('Validasi', 'Nama Kantor, Alamat, Latitude, dan Longitude wajib diisi!');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const radiusNum = parseInt(radiusMeter, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      Alert.alert('Validasi', 'Format Latitude dan Longitude harus berupa angka/desimal valid!');
      return;
    }

    if (isNaN(radiusNum) || radiusNum < 1) {
      Alert.alert('Validasi', 'Radius minimal 1 meter!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_kantor: namaKantor.trim(),
        alamat: alamat.trim(),
        latitude: latNum,
        longitude: lngNum,
        radius_meter: radiusNum,
      };

      if (selectedKantor) {
        // Update
        await kantorService.update(selectedKantor.id, payload);
        Alert.alert('Sukses', 'Data kantor berhasil diperbarui!');
      } else {
        // Create
        await kantorService.create(payload);
        Alert.alert('Sukses', 'Kantor baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchKantor();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data kantor';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete
  const handleDelete = (item: Kantor) => {
    const doDelete = async () => {
      try {
        await kantorService.delete(item.id);
        Alert.alert('Sukses', `Kantor "${item.nama_kantor}" berhasil dihapus.`);
        fetchKantor();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus kantor';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus kantor "${item.nama_kantor}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${item.nama_kantor}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.replace('/(dashboard)/admin')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Kantor</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={kantorList}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada data kantor. Klik "+ Tambah".</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.cardTitle}>{item.nama_kantor}</Text>
                <Text style={styles.addressText}>📍 {item.alamat}</Text>

                <View style={styles.coordBox}>
                  <Text style={styles.coordText}>
                    Lat: {item.latitude}, Lng: {item.longitude}
                  </Text>
                  <Text style={styles.radiusBadge}>Radius: {item.radius_meter ?? 50}m</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionGroup}>
                <TouchableOpacity onPress={() => handleOpenEditModal(item)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal Form Create/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {selectedKantor ? 'Edit Lokasi Kantor' : 'Tambah Kantor Baru'}
              </Text>

              <Text style={styles.label}>Nama Kantor</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Kantor Pusat / Cabang Banjarmasin"
                value={namaKantor}
                onChangeText={setNamaShift => setNamaKantor(setNamaShift)}
              />

              <Text style={styles.label}>Alamat Lengkap</Text>
              <TextInput
                style={[styles.input, { height: 50 }]}
                placeholder="Jl. Ahmad Yani KM 5, Banjarmasin"
                value={alamat}
                onChangeText={setAlamat}
                multiline
              />

              {/* Interactive Map Picker */}
              <Text style={styles.label}>Tentukan Lokasi di Peta (Klik / Geser Pin)</Text>
              <MapPicker
                latitude={parseFloat(latitude) || -3.318606}
                longitude={parseFloat(longitude) || 114.594378}
                onLocationSelect={handleLocationSelect}
              />

              <View style={styles.rowInput}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-3.318606"
                    keyboardType="numeric"
                    value={latitude}
                    onChangeText={setLatitude}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="114.594378"
                    keyboardType="numeric"
                    value={longitude}
                    onChangeText={setLongitude}
                  />
                </View>
              </View>

              <Text style={styles.label}>Radius Absensi (Meter)</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                keyboardType="numeric"
                value={radiusMeter}
                onChangeText={setRadiusMeter}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Simpan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { paddingVertical: 6 },
  backButtonText: { color: '#2563eb', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },

  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },

  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#475569', marginBottom: 8 },
  coordBox: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  coordText: { fontSize: 11, color: '#64748b' },
  radiusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  actionGroup: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#334155', fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 14,
  },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, backgroundColor: '#2563eb' },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});