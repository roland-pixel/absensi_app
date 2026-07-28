// src/app/(dashboard)/users/index.tsx
import NfcInput from '@/components/NfcInput';
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
import { divisiService } from '../../../services/divisi';
import { jabatanService } from '../../../services/jabatan';
import { kantorService } from '../../../services/kantor';
import { userService } from '../../../services/user';
import { Divisi } from '../../../types/divisi';
import { Jabatan } from '../../../types/jabatan';
import { Kantor } from '../../../types/kantor';
import { UpdateUserDto, User, UserRole } from '../../../types/user';

export default function UsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Master Data Dropdown / Selector
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [kantorList, setKantorList] = useState<Kantor[]>([]);

  // State Form Modal (Create & Edit)
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // null = Mode Tambah, User = Mode Edit

  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Hanya untuk mode Create
  const [role, setRole] = useState<UserRole>('PEGAWAI');
  const [nfcCardId, setNfcCardId] = useState('');
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [selectedJabatanId, setSelectedJabatanId] = useState('');
  const [selectedKantorId, setSelectedKantorId] = useState('');

  // State Modal Reset Password
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Fetch Master Data & Users
  const fetchData = useCallback(async () => {
    try {
      const [userData, divData, kantorData] = await Promise.all([
        userService.getAll(),
        divisiService.getAll().catch(() => []),
        kantorService.getAll().catch(() => []),
      ]);
      setUsers(userData);
      setDivisiList(divData);
      setKantorList(kantorData);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengambil data user';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load Jabatan ketika Divisi Terpilih Berubah
  useEffect(() => {
    if (selectedDivisiId) {
      jabatanService
        .getByDivisi(selectedDivisiId)
        .then(setJabatanList)
        .catch(() => setJabatanList([]));
    } else {
      setJabatanList([]);
      setSelectedJabatanId('');
    }
  }, [selectedDivisiId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Open Modal untuk Tambah User
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setNik('');
    setNamaLengkap('');
    setEmail('');
    setPassword('');
    setRole('PEGAWAI');
    setNfcCardId('');
    setSelectedDivisiId('');
    setSelectedJabatanId('');
    setSelectedKantorId('');
    setFormModalVisible(true);
  };

  // Open Modal untuk Edit User
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setNik(user.nik);
    setNamaLengkap(user.nama_lengkap);
    setEmail(user.email);
    setPassword(''); // Password diubah via Reset Password
    setRole(user.role);
    setNfcCardId(user.nfc_card_id || '');
    setSelectedDivisiId(user.divisi_id || user.divisi?.id || '');
    setSelectedJabatanId(user.jabatan_id || user.jabatan?.id || '');
    setSelectedKantorId(user.kantor_id || user.kantor?.id || '');
    setFormModalVisible(true);
  };

  // Submit Form (Create / Edit)
  const handleSubmitForm = async () => {
    if (!nik.trim() || !namaLengkap.trim() || !email.trim()) {
      Alert.alert('Validasi', 'NIK, Nama Lengkap, dan Email wajib diisi!');
      return;
    }

    if (!selectedUser && (!password.trim() || password.length < 6)) {
      Alert.alert('Validasi', 'Password wajib diisi minimal 6 karakter untuk user baru!');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedUser) {
        // Mode UPDATE / EDIT
        const updatePayload: UpdateUserDto = {
          nik: nik.trim(),
          nama_lengkap: namaLengkap.trim(),
          email: email.trim().toLowerCase(),
          role: role,
          nfc_card_id: nfcCardId.trim() || undefined,
          divisi_id: selectedDivisiId || undefined,
          jabatan_id: selectedJabatanId || undefined,
          kantor_id: selectedKantorId || undefined,
        };

        await userService.update(selectedUser.id, updatePayload);
        Alert.alert('Sukses', `Data ${namaLengkap} berhasil diperbarui!`);
      } else {
        // Mode CREATE / TAMBAH
        await userService.create({
          nik: nik.trim(),
          nama_lengkap: namaLengkap.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: role,
          nfc_card_id: nfcCardId.trim() || undefined,
          divisi_id: selectedDivisiId || undefined,
          jabatan_id: selectedJabatanId || undefined,
          kantor_id: selectedKantorId || undefined,
        });
        Alert.alert('Sukses', 'User baru berhasil ditambahkan!');
      }

      setFormModalVisible(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data user';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status Aktif/Non-Aktif Direct Switch
  const handleToggleActive = async (user: User) => {
    try {
      await userService.update(user.id, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (error: any) {
      Alert.alert('Gagal', 'Tidak dapat mengubah status aktif user.');
    }
  };

  // Submit Reset Password
  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Validasi', 'Password baru minimal 6 karakter!');
      return;
    }

    setSubmitting(true);
    try {
      await userService.resetPassword(resetUserId, { new_password: newPassword });
      Alert.alert('Sukses', 'Password user berhasil direset!');
      setResetModalVisible(false);
      setNewPassword('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal reset password';
      Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm & Delete User
  const handleDelete = (user: User) => {
    const doDelete = async () => {
      try {
        await userService.delete(user.id);
        Alert.alert('Sukses', `User ${user.nama_lengkap} telah dihapus.`);
        fetchData();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal menghapus user';
        Alert.alert('Gagal', Array.isArray(msg) ? msg.join(', ') : msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus user "${user.nama_lengkap}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin menghapus "${user.nama_lengkap}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return { bg: '#fee2e2', color: '#dc2626' };
      case 'PIMPINAN':
        return { bg: '#fef3c7', color: '#d97706' };
      default:
        return { bg: '#e0f2fe', color: '#0284c7' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.replace('/(dashboard)/admin')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola User</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ User Baru</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada data user/pegawai. Klik "+ User Baru".</Text>
          }
          renderItem={({ item }) => {
            const roleStyle = getRoleBadgeStyle(item.role);
            return (
              <View style={[styles.card, !item.is_active && styles.cardInactive]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.nama_lengkap}</Text>
                    <Text style={[styles.roleBadge, { backgroundColor: roleStyle.bg, color: roleStyle.color }]}>
                      {item.role}
                    </Text>
                  </View>

                  <Text style={styles.subText}>NIK: {item.nik} | ✉️ {item.email}</Text>

                  {item.nfc_card_id && (
                    <Text style={styles.nfcText}>💳 NFC ID: {item.nfc_card_id}</Text>
                  )}

                  {/* Relasi Info */}
                  <View style={styles.relasiBox}>
                    <Text style={styles.relasiText}>
                      🏢 {item.divisi?.nama_divisi || 'Tanpa Divisi'} • 💼 {item.jabatan?.nama_jabatan || 'Tanpa Jabatan'}
                    </Text>
                    <Text style={styles.relasiText}>📍 {item.kantor?.nama_kantor || 'Tanpa Kantor'}</Text>
                  </View>
                </View>

                {/* Actions Group */}
                <View style={styles.actionCol}>
                  <View style={styles.switchBox}>
                    <Text style={{ fontSize: 10, color: item.is_active ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                      {item.is_active ? 'Aktif' : 'Non-Aktif'}
                    </Text>
                    <Switch
                      value={item.is_active}
                      onValueChange={() => handleToggleActive(item)}
                      trackColor={{ false: '#fca5a5', true: '#86efac' }}
                      thumbColor={item.is_active ? '#16a34a' : '#dc2626'}
                    />
                  </View>

                  <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEditModal(item)}>
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.keyBtn}
                    onPress={() => {
                      setResetUserId(item.id);
                      setNewPassword('');
                      setResetModalVisible(true);
                    }}
                  >
                    <Text style={styles.keyBtnText}>🔑 Reset</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal Form (Create / Edit User) */}
      <Modal visible={formModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {selectedUser ? `Edit User: ${selectedUser.nama_lengkap}` : 'Tambah User Baru'}
              </Text>

              <Text style={styles.label}>NIK *</Text>
              <TextInput style={styles.input} placeholder="1987654321" value={nik} onChangeText={setNik} />

              <Text style={styles.label}>Nama Lengkap *</Text>
              <TextInput style={styles.input} placeholder="Budi Santoso" value={namaLengkap} onChangeText={setNamaLengkap} />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="budi@absensi.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              {/* Input Password hanya muncul saat mode Create */}
              {!selectedUser && (
                <>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimal 6 karakter"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </>
              )}

              <Text style={styles.label}>Role Sistem</Text>
              <View style={styles.rolePickerRow}>
                {(['PEGAWAI', 'PIMPINAN', 'ADMIN'] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>NFC Card ID (Opsional)</Text>
              <NfcInput value={nfcCardId} onChangeText={setNfcCardId} />

              {/* Selector Divisi */}
              <Text style={styles.label}>Divisi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.chip, !selectedDivisiId && styles.chipActive]}
                  onPress={() => setSelectedDivisiId('')}
                >
                  <Text style={!selectedDivisiId ? styles.chipTextActive : styles.chipText}>-- Tanpa Divisi --</Text>
                </TouchableOpacity>
                {divisiList.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, selectedDivisiId === d.id && styles.chipActive]}
                    onPress={() => setSelectedDivisiId(d.id)}
                  >
                    <Text style={selectedDivisiId === d.id ? styles.chipTextActive : styles.chipText}>{d.nama_divisi}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selector Jabatan (Filtered by Divisi) */}
              {selectedDivisiId ? (
                <>
                  <Text style={styles.label}>Jabatan</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.chip, !selectedJabatanId && styles.chipActive]}
                      onPress={() => setSelectedJabatanId('')}
                    >
                      <Text style={!selectedJabatanId ? styles.chipTextActive : styles.chipText}>-- Tanpa Jabatan --</Text>
                    </TouchableOpacity>
                    {jabatanList.map((j) => (
                      <TouchableOpacity
                        key={j.id}
                        style={[styles.chip, selectedJabatanId === j.id && styles.chipActive]}
                        onPress={() => setSelectedJabatanId(j.id)}
                      >
                        <Text style={selectedJabatanId === j.id ? styles.chipTextActive : styles.chipText}>{j.nama_jabatan}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}

              {/* Selector Kantor */}
              <Text style={styles.label}>Lokasi Kantor</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.chip, !selectedKantorId && styles.chipActive]}
                  onPress={() => setSelectedKantorId('')}
                >
                  <Text style={!selectedKantorId ? styles.chipTextActive : styles.chipText}>-- Tanpa Kantor --</Text>
                </TouchableOpacity>
                {kantorList.map((k) => (
                  <TouchableOpacity
                    key={k.id}
                    style={[styles.chip, selectedKantorId === k.id && styles.chipActive]}
                    onPress={() => setSelectedKantorId(k.id)}
                  >
                    <Text style={selectedKantorId === k.id ? styles.chipTextActive : styles.chipText}>{k.nama_kantor}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setFormModalVisible(false)} disabled={submitting}>
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitForm} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Reset Password */}
      <Modal visible={resetModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Password User</Text>
            <Text style={styles.label}>Masukkan Password Baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 Karakter"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResetModalVisible(false)} disabled={submitting}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Password</Text>}
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
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardInactive: { backgroundColor: '#fdf2f2', borderColor: '#fca5a5' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  roleBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  subText: { fontSize: 12, color: '#475569', marginBottom: 4 },
  nfcText: { fontSize: 11, color: '#0284c7', marginBottom: 4, fontWeight: '500' },
  relasiBox: { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  relasiText: { fontSize: 11, color: '#64748b' },

  actionCol: { alignItems: 'flex-end', gap: 6 },
  switchBox: { alignItems: 'center' },
  editBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  editBtnText: { color: '#334155', fontSize: 11, fontWeight: 'bold' },
  keyBtn: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  keyBtnText: { color: '#b45309', fontSize: 11, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  deleteBtnText: { color: '#dc2626', fontSize: 11, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 8, marginBottom: 12, fontSize: 13 },

  rolePickerRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleChip: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, alignItems: 'center' },
  roleChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  roleChipTextActive: { color: '#ffffff' },

  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 16, marginRight: 6 },
  chipActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  chipText: { fontSize: 12, color: '#475569' },
  chipTextActive: { fontSize: 12, color: '#ffffff', fontWeight: 'bold' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, backgroundColor: '#2563eb' },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});