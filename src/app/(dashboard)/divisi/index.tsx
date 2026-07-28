// src/app/(dashboard)/divisi/index.tsx
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { divisiService } from '../../../services/divisi';
import { Divisi } from '../../../types/divisi';

export default function DivisiScreen() {
  const router = useRouter();
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<Divisi | null>(null);
  const [namaDivisi, setNamaDivisi] = useState('');
  const [kodeDivisi, setKodeDivisi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data Divisi
  const fetchDivisi = useCallback(async () => {
    try {
      const data = await divisiService.getAll();
      setDivisiList(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data divisi';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisi();
  }, [fetchDivisi]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDivisi();
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setSelectedDivisi(null);
    setNamaDivisi('');
    setKodeDivisi('');
    setModalVisible(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: Divisi) => {
    setSelectedDivisi(item);
    setNamaDivisi(item.nama_divisi);
    setKodeDivisi(item.kode_divisi);
    setModalVisible(true);
  };

  // Submit Form (Tambah / Edit)
  const handleSubmit = async () => {
    if (!namaDivisi.trim() || !kodeDivisi.trim()) {
      Alert.alert('Validasi', 'Nama Divisi dan Kode Divisi harus diisi!');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedDivisi) {
        // Mode Update
        await divisiService.update(selectedDivisi.id, {
          nama_divisi: namaDivisi.trim(),
          kode_divisi: kodeDivisi.trim(),
        });
        Alert.alert('Sukses', 'Divisi berhasil diperbarui!');
      } else {
        // Mode Create
        await divisiService.create({
          nama_divisi: namaDivisi.trim(),
          kode_divisi: kodeDivisi.trim(),
        });
        Alert.alert('Sukses', 'Divisi baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchDivisi();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data divisi';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete Divisi
  const handleDelete = (item: Divisi) => {
    const doDelete = async () => {
      try {
        await divisiService.delete(item.id);
        Alert.alert('Sukses', `Divisi "${item.nama_divisi}" berhasil dihapus.`);
        fetchDivisi();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus divisi';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus divisi "${item.nama_divisi}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${item.nama_divisi}"?`, [
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
        <Text style={styles.headerTitle}>Kelola Divisi</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={divisiList}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada data divisi. Klik tombol "+ Tambah".</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{item.kode_divisi}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.nama_divisi}</Text>
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
            <Text style={styles.modalTitle}>
              {selectedDivisi ? 'Edit Divisi' : 'Tambah Divisi Baru'}
            </Text>

            <Text style={styles.label}>Kode Divisi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: IT, HRD, FIN"
              value={kodeDivisi}
              onChangeText={setKodeDivisi}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Nama Divisi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Teknologi Informasi"
              value={namaDivisi}
              onChangeText={setNamaDivisi}
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
  codeBadge: {
    backgroundColor: '#e0e7ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  codeBadgeText: { color: '#4338ca', fontSize: 11, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },

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
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, backgroundColor: '#2563eb' },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});