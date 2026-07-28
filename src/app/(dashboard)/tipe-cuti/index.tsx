// src/app/(dashboard)/tipe-cuti/index.tsx
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
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { tipeCutiService } from '../../../services/tipe-cuti';
import { TipeCuti } from '../../../types/tipe-cuti';

export default function TipeCutiScreen() {
  const router = useRouter();

  const [tipeCutiList, setTipeCutiList] = useState<TipeCuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTipeCuti, setSelectedTipeCuti] = useState<TipeCuti | null>(null);
  const [namaTipe, setNamaTipe] = useState('');
  const [kuota, setKuota] = useState('12');
  const [perluLampiran, setPerluLampiran] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data
  const fetchTipeCuti = useCallback(async () => {
    try {
      const data = await tipeCutiService.getAll();
      setTipeCutiList(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data tipe cuti';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTipeCuti();
  }, [fetchTipeCuti]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTipeCuti();
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setSelectedTipeCuti(null);
    setNamaTipe('');
    setKuota('12');
    setPerluLampiran(false);
    setModalVisible(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: TipeCuti) => {
    setSelectedTipeCuti(item);
    setNamaTipe(item.nama_tipe);
    setKuota(String(item.kuota_per_tahun));
    setPerluLampiran(item.perlu_lampiran);
    setModalVisible(true);
  };

  // Submit Form
  const handleSubmit = async () => {
    if (!namaTipe.trim()) {
      Alert.alert('Validasi', 'Nama Tipe Cuti wajib diisi!');
      return;
    }

    const kuotaNum = parseInt(kuota, 10);
    if (isNaN(kuotaNum) || kuotaNum < 0) {
      Alert.alert('Validasi', 'Kuota cuti per tahun harus berupa angka non-negatif!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_tipe: namaTipe.trim(),
        kuota_per_tahun: kuotaNum,
        perlu_lampiran: perluLampiran,
      };

      if (selectedTipeCuti) {
        // Mode Update
        await tipeCutiService.update(selectedTipeCuti.id, payload);
        Alert.alert('Sukses', 'Tipe cuti berhasil diperbarui!');
      } else {
        // Mode Create
        await tipeCutiService.create(payload);
        Alert.alert('Sukses', 'Tipe cuti baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchTipeCuti();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan tipe cuti';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete
  const handleDelete = (item: TipeCuti) => {
    const doDelete = async () => {
      try {
        await tipeCutiService.delete(item.id);
        Alert.alert('Sukses', `Tipe cuti "${item.nama_tipe}" berhasil dihapus.`);
        fetchTipeCuti();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus tipe cuti';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus tipe cuti "${item.nama_tipe}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${item.nama_tipe}"?`, [
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
        <Text style={styles.headerTitle}>Kelola Tipe Cuti</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tipeCutiList}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada jenis/tipe cuti. Klik "+ Tambah".</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nama_tipe}</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.kuotaBadge}>
                    📅 Kuota: {item.kuota_per_tahun} hari/tahun
                  </Text>
                  
                  {item.perlu_lampiran ? (
                    <Text style={styles.attachmentRequired}>📎 Wajib Surat/Lampiran</Text>
                  ) : (
                    <Text style={styles.attachmentOptional}>📄 Tanpa Lampiran</Text>
                  )}
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
                {selectedTipeCuti ? 'Edit Tipe Cuti' : 'Tambah Tipe Cuti Baru'}
              </Text>

              <Text style={styles.label}>Nama Tipe Cuti</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Cuti Tahunan, Cuti Sakit, Cuti Melahirkan"
                value={namaTipe}
                onChangeText={setNamaTipe}
              />

              <Text style={styles.label}>Kuota per Tahun (Hari)</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                keyboardType="numeric"
                value={kuota}
                onChangeText={setKuota}
              />

              {/* Switch Perlu Lampiran */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.labelSwitch}>Wajibkan Lampiran / Dokumen?</Text>
                  <Text style={styles.subTextSwitch}>
                    Aktifkan jika pengajuan cuti ini wajib melampirkan file/surat dokter.
                  </Text>
                </View>
                <Switch
                  value={perluLampiran}
                  onValueChange={setPerluLampiran}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={perluLampiran ? '#2563eb' : '#f4f3f4'}
                />
              </View>

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
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  kuotaBadge: {
    fontSize: 12,
    color: '#0369a1',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  attachmentRequired: {
    fontSize: 11,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  attachmentOptional: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: '#f1f5f9',
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
  
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  labelSwitch: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  subTextSwitch: { fontSize: 11, color: '#64748b', marginTop: 2 },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, backgroundColor: '#2563eb' },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});