// src/app/(dashboard)/pegawai/cuti.tsx
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CutiScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Pengajuan & Acuan Cuti</Text>

        {/* Kuota Cuti Card */}
        <View style={styles.kuotaContainer}>
          <View style={styles.kuotaCard}>
            <Text style={styles.kuotaNumber}>12</Text>
            <Text style={styles.kuotaLabel}>Kuota Tahunan</Text>
          </View>
          <View style={styles.kuotaCard}>
            <Text style={[styles.kuotaNumber, { color: '#16a34a' }]}>8</Text>
            <Text style={styles.kuotaLabel}>Sisa Cuti</Text>
          </View>
          <View style={styles.kuotaCard}>
            <Text style={[styles.kuotaNumber, { color: '#dc2626' }]}>4</Text>
            <Text style={styles.kuotaLabel}>Terpakai</Text>
          </View>
        </View>

        {/* Tombol Buat Pengajuan Cuti */}
        <TouchableOpacity style={styles.addCutiBtn} activeOpacity={0.8}>
          <Text style={styles.addCutiBtnText}>+ Ajukan Cuti / Izin Baru</Text>
        </TouchableOpacity>

        {/* Riwayat Pengajuan Cuti */}
        <Text style={styles.sectionTitle}>Riwayat Pengajuan Cuti</Text>
        <View style={styles.historyList}>
          <View style={styles.historyItem}>
            <View style={styles.historyDetail}>
              <Text style={styles.historyTitle}>Cuti Tahunan (Acara Keluarga)</Text>
              <Text style={styles.historySub}>📅 10 Ags 2026 - 12 Ags 2026 (3 Hari)</Text>
            </View>
            <Text style={styles.statusPending}>Menunggu</Text>
          </View>

          <View style={styles.historyItem}>
            <View style={styles.historyDetail}>
              <Text style={styles.historyTitle}>Cuti Sakit (Surat Dokter)</Text>
              <Text style={styles.historySub}>📅 15 Mei 2026 (1 Hari)</Text>
            </View>
            <Text style={styles.statusApproved}>Disetujui</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  kuotaContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kuotaCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  kuotaNumber: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },
  kuotaLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  addCutiBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  addCutiBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  historyList: { gap: 10 },
  historyItem: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  historyDetail: { flex: 1 },
  historyTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  historySub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  statusPending: { fontSize: 10, fontWeight: 'bold', color: '#d97706', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusApproved: { fontSize: 10, fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});