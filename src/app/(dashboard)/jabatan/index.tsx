// src/app/(dashboard)/jabatan/index.tsx
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
import { divisiService } from '../../../services/divisi';
import { jabatanService } from '../../../services/jabatan';
import { Divisi } from '../../../types/divisi';
import { Jabatan } from '../../../types/jabatan';

export default function JabatanScreen() {
  const router = useRouter();

  // State Data
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(null);
  const [namaJabatan, setNamaJabatan] = useState('');
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data Jabatan & Divisi
  const fetchData = useCallback(async () => {
    try {
      const [jabatanData, divisiData] = await Promise.all([
        jabatanService.getAll(),
        divisiService.getAll(),
      ]);
      setJabatanList(jabatanData);
      setDivisiList(divisiData);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data jabatan/divisi';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setSelectedJabatan(null);
    setNamaJabatan('');
    setSelectedDivisiId(divisiList.length > 0 ? divisiList[0].id : '');
    setModalVisible(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (item: Jabatan) => {
    setSelectedJabatan(item);
    setNamaJabatan(item.nama_jabatan);
    setSelectedDivisiId(item.divisi_id);
    setModalVisible(true);
  };

  // Submit Form (Tambah / Edit)
  const handleSubmit = async () => {
    if (!namaJabatan.trim()) {
      Alert.alert('Validasi', 'Nama Jabatan wajib diisi!');
      return;
    }
    if (!selectedDivisiId) {
      Alert.alert('Validasi', 'Silakan pilih Divisi!');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedJabatan) {
        // Edit
        await jabatanService.update(selectedJabatan.id, {
          nama_jabatan: namaJabatan.trim(),
          divisi_id: selectedDivisiId,
        });
        Alert.alert('Sukses', 'Jabatan berhasil diperbarui!');
      } else {
        // Create
        await jabatanService.create({
          nama_jabatan: namaJabatan.trim(),
          divisi_id: selectedDivisiId,
        });
        Alert.alert('Sukses', 'Jabatan baru berhasil ditambahkan!');
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan jabatan';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete Jabatan
  const handleDelete = (item: Jabatan) => {
    const doDelete = async () => {
      try {
        await jabatanService.delete(item.id);
        Alert.alert('Sukses', `Jabatan "${item.nama_jabatan}" berhasil dihapus.`);
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus jabatan';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus jabatan "${item.nama_jabatan}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${item.nama_jabatan}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Helper untuk mencari nama divisi berdasarkan divisi_id
  const getNamaDivisi = (divisiId: string) => {
    const found = divisiList.find((d) => d.id === divisiId);
    return found ? `${found.nama_divisi} (${found.kode_divisi})` : 'Divisi tidak ditemukan';
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.replace('/(dashboard)/admin')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Jabatan</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jabatanList}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada data jabatan. Klik tombol "+ Tambah".</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nama_jabatan}</Text>
                <Text style={styles.divisiBadge}>
                  🏢 {item.divisi?.nama_divisi || getNamaDivisi(item.divisi_id)}
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
            <Text style={styles.modalTitle}>
              {selectedJabatan ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
            </Text>

            <Text style={styles.label}>Nama Jabatan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Senior Software Engineer"
              value={namaJabatan}
              onChangeText={setNamaJabatan}
            />

            <Text style={styles.label}>Pilih Divisi</Text>
            {divisiList.length === 0 ? (
              <Text style={styles.warningText}>
                ⚠️ Belum ada data divisi. Silakan buat Divisi terlebih dahulu di modul Kelola Divisi.
              </Text>
            ) : (
              <ScrollView style={styles.divisiPickerContainer} nestedScrollEnabled>
                {divisiList.map((d) => {
                  const isSelected = selectedDivisiId === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.divisiOption,
                        isSelected && styles.divisiOptionSelected,
                      ]}
                      onPress={() => setSelectedDivisiId(d.id)}
                    >
                      <Text style={[styles.divisiOptionText, isSelected && styles.divisiOptionTextSelected]}>
                        {d.nama_divisi} ({d.kode_divisi})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, divisiList.length === 0 && { backgroundColor: '#94a3b8' }]}
                onPress={handleSubmit}
                disabled={submitting || divisiList.length === 0}
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  divisiBadge: { color: '#64748b', fontSize: 13, fontWeight: '500' },

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
  warningText: { color: '#b45309', backgroundColor: '#fef3c7', padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 14 },

  divisiPickerContainer: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 16,
    padding: 6,
  },
  divisiOption: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#f8fafc',
  },
  divisiOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1,
  },
  divisiOptionText: { color: '#334155', fontSize: 13 },
  divisiOptionTextSelected: { color: '#1d4ed8', fontWeight: 'bold' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, backgroundColor: '#2563eb' },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});