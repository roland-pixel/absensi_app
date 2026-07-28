// src/app/(dashboard)/jam-kerja/index.tsx
import ClockPicker from '@/components/ClockPicker';
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
import { jamKerjaService } from '../../../services/jam-kerja';
import { JamKerja } from '../../../types/jam-kerja';

export default function JamKerjaScreen() {
  const router = useRouter();

  const [jamKerjaList, setJamKerjaList] = useState<JamKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJamKerja, setSelectedJamKerja] = useState<JamKerja | null>(null);
  const [namaShift, setNamaShift] = useState('');
  const [jamMasuk, setJamMasuk] = useState('08:00');
  const [jamKeluar, setJamKeluar] = useState('17:00');
  const [toleransi, setToleransi] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data
  const fetchJamKerja = useCallback(async () => {
    try {
      const data = await jamKerjaService.getAll();
      setJamKerjaList(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data jam kerja';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJamKerja();
  }, [fetchJamKerja]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJamKerja();
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setSelectedJamKerja(null);
    setNamaShift('');
    setJamMasuk('08:00');
    setJamKeluar('17:00');
    setToleransi('15');
    setModalVisible(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: JamKerja) => {
    setSelectedJamKerja(item);
    setNamaShift(item.nama_shift);
    setJamMasuk(item.jam_masuk);
    setJamKeluar(item.jam_keluar);
    setToleransi(String(item.toleransi_terlambat_menit ?? 15));
    setModalVisible(true);
  };

  // Submit Form (Tambah / Edit)
  const handleSubmit = async () => {
    if (!namaShift.trim() || !jamMasuk.trim() || !jamKeluar.trim()) {
      Alert.alert('Validasi', 'Nama Shift, Jam Masuk, dan Jam Keluar wajib diisi!');
      return;
    }

    const toleransiNum = parseInt(toleransi, 10);
    if (isNaN(toleransiNum) || toleransiNum < 0) {
      Alert.alert('Validasi', 'Toleransi keterlambatan harus berupa angka positif!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_shift: namaShift.trim(),
        jam_masuk: jamMasuk.trim(),
        jam_keluar: jamKeluar.trim(),
        toleransi_terlambat_menit: toleransiNum,
      };

      if (selectedJamKerja) {
        // Mode Update
        await jamKerjaService.update(selectedJamKerja.id, payload);
        Alert.alert('Sukses', 'Shift jam kerja berhasil diperbarui!');
      } else {
        // Mode Create
        await jamKerjaService.create(payload);
        Alert.alert('Sukses', 'Shift jam kerja baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchJamKerja();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan jam kerja';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete
  const handleDelete = (item: JamKerja) => {
    const doDelete = async () => {
      try {
        await jamKerjaService.delete(item.id);
        Alert.alert('Sukses', `Shift "${item.nama_shift}" berhasil dihapus.`);
        fetchJamKerja();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus jam kerja';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus shift "${item.nama_shift}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${item.nama_shift}"?`, [
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
        <Text style={styles.headerTitle}>Kelola Jam Kerja</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jamKerjaList}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada shift jam kerja. Klik "+ Tambah".</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nama_shift}</Text>

                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    ⏰ {item.jam_masuk} - {item.jam_keluar}
                  </Text>
                </View>

                <Text style={styles.toleranceText}>
                  Toleransi terlambat: {item.toleransi_terlambat_menit ?? 15} menit
                </Text>
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
                {selectedJamKerja ? 'Edit Jam Kerja' : 'Tambah Jam Kerja Baru'}
              </Text>

              <Text style={styles.label}>Nama Shift</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Shift Pagi / Normal"
                value={namaShift}
                onChangeText={setNamaShift}
              />

              <View style={styles.rowInput}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Jam Masuk</Text>
                  <ClockPicker value={jamMasuk} onChange={setJamMasuk} />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Jam Pulang</Text>
                  <ClockPicker value={jamKeluar} onChange={setJamKeluar} />
                </View>
              </View>

              <Text style={styles.label}>Toleransi Keterlambatan (Menit)</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                keyboardType="numeric"
                value={toleransi}
                onChangeText={setToleransi}
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
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  timeRow: { marginBottom: 4 },
  timeText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  toleranceText: { fontSize: 12, color: '#64748b' },

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
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, maxHeight: '80%' },
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